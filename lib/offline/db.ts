import Dexie, { type Table } from 'dexie'

// Marca o status de sincronização de cada registro local
export type SyncStatus = 'synced' | 'pending' | 'failed'

// Operação pendente na fila de sincronização
export interface SyncOperation {
  _id?: number
  entity: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  payload: Record<string, unknown>
  localId: string
  timestamp: number
  status: 'pending' | 'failed'
  retries: number
}

// Adiciona _syncStatus a qualquer tipo de dado cacheado
export type Cached<T = Record<string, unknown>> = T & { _syncStatus: SyncStatus }

class JaPagueiDB extends Dexie {
  bills!: Table<Cached, string>
  groups!: Table<Cached, string>
  friends!: Table<Cached, string>
  notifications!: Table<Cached, string>
  syncQueue!: Table<SyncOperation, number>

  constructor() {
    super('ja-paguei-v1')
    this.version(1).stores({
      bills:         'id, user_id, created_at, status, _syncStatus',
      groups:        'id, created_by, _syncStatus',
      friends:       'id, _syncStatus',
      notifications: 'id, user_id, read, _syncStatus',
      syncQueue:     '++_id, entity, status, timestamp',
    })
  }
}

export const offlineDB = new JaPagueiDB()

// Remove campo interno antes de enviar ao Supabase
export function stripSyncMeta<T extends { _syncStatus?: unknown }>(obj: T): Omit<T, '_syncStatus'> {
  const { _syncStatus: _, ...rest } = obj
  return rest as Omit<T, '_syncStatus'>
}

// Enfileira uma operação para sync e registra o Background Sync (se suportado)
export async function enqueue(op: Omit<SyncOperation, '_id' | 'timestamp' | 'status' | 'retries'>) {
  await offlineDB.syncQueue.add({
    ...op,
    timestamp: Date.now(),
    status: 'pending',
    retries: 0,
  })

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready
      await (reg as any).sync.register('ja-paguei-sync')
    } catch {}
  }
}

export async function getPendingCount(): Promise<number> {
  return offlineDB.syncQueue.where('status').equals('pending').count()
}

export async function getFailedCount(): Promise<number> {
  return offlineDB.syncQueue.where('status').equals('failed').count()
}
