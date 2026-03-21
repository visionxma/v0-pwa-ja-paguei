import { offlineDB, stripSyncMeta, type SyncOperation } from './db'
import { createClient } from '@/lib/supabase/client'

const MAX_RETRIES = 3

export interface SyncState {
  isSyncing: boolean
  pendingCount: number
  failedCount: number
  lastSyncAt: Date | null
}

// ─── Pub/sub de estado para o hook useSyncStatus ───────────────────────────

const listeners = new Set<(state: SyncState) => void>()

let state: SyncState = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncAt: null,
}

export function subscribeSyncState(cb: (state: SyncState) => void): () => void {
  listeners.add(cb)
  cb(state)
  return () => { listeners.delete(cb) }
}

async function refreshCounts() {
  const [pending, failed] = await Promise.all([
    offlineDB.syncQueue.where('status').equals('pending').count(),
    offlineDB.syncQueue.where('status').equals('failed').count(),
  ])
  state = { ...state, pendingCount: pending, failedCount: failed }
  listeners.forEach(cb => cb(state))
}

// ─── Executa uma operação no Supabase ──────────────────────────────────────

async function execute(op: SyncOperation) {
  const supabase = createClient()
  const data = stripSyncMeta(op.payload as any)

  if (op.operation === 'INSERT') {
    const { error } = await supabase.from(op.entity).insert(data)
    if (error) throw error

  } else if (op.operation === 'UPDATE') {
    const { id, ...updates } = data as any
    const { error } = await supabase.from(op.entity).update(updates).eq('id', id)
    if (error) throw error

  } else if (op.operation === 'DELETE') {
    const { error } = await supabase.from(op.entity).delete().eq('id', (data as any).id)
    if (error) throw error
  }
}

// ─── Processa toda a fila pendente ────────────────────────────────────────

export async function processSyncQueue(): Promise<void> {
  if (state.isSyncing) return
  if (typeof navigator !== 'undefined' && !navigator.onLine) return

  const pending = await offlineDB.syncQueue.where('status').equals('pending').toArray()
  if (pending.length === 0) return

  state = { ...state, isSyncing: true }
  listeners.forEach(cb => cb(state))

  for (const op of pending) {
    try {
      await execute(op)

      // Marca o registro local como sincronizado
      try {
        const table = (offlineDB as any)[op.entity]
        if (table) {
          const cached = await table.get(op.localId)
          if (cached) await table.put({ ...cached, _syncStatus: 'synced' })
        }
      } catch {}

      await offlineDB.syncQueue.delete(op._id!)

    } catch {
      const retries = (op.retries ?? 0) + 1
      const newStatus = retries >= MAX_RETRIES ? 'failed' : 'pending'
      await offlineDB.syncQueue.update(op._id!, { retries, status: newStatus })
    }
  }

  state = { ...state, isSyncing: false, lastSyncAt: new Date() }
  await refreshCounts()
}

// ─── Inicializa os listeners de conectividade (chamado 1x no layout) ──────

let initialized = false

export function initSyncManager() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  // Sincroniza ao voltar online
  window.addEventListener('online', () => processSyncQueue())

  // Polling a cada 30s enquanto o app está aberto
  setInterval(() => {
    if (navigator.onLine) processSyncQueue()
  }, 30_000)

  // Ouve mensagem do service worker (Background Sync)
  navigator.serviceWorker?.addEventListener('message', (e) => {
    if (e.data?.type === 'SW_SYNC') processSyncQueue()
  })

  refreshCounts()
  if (navigator.onLine) processSyncQueue()
}
