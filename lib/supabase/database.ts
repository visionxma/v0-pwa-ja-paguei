import { createClient } from './client'
import { offlineDB, enqueue, stripSyncMeta, type Cached } from '@/lib/offline/db'

// ─── Helpers ───────────────────────────────────────────────────────────────

function newId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

/** Tenta executar online; se falhar, executa o fallback offline */
async function withOfflineFallback<T>(
  onlineOp: () => Promise<T>,
  offlineFallback: () => Promise<T>,
): Promise<T> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return offlineFallback()
  }
  try {
    return await onlineOp()
  } catch {
    return offlineFallback()
  }
}

// ─── BILLS ─────────────────────────────────────────────────────────────────

export async function fetchBills(userId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bills')
        .select('*, groups(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Atualiza o cache com os dados do servidor
      const toCache = (data || []).map(b => ({ ...b, _syncStatus: 'synced' as const }))
      if (toCache.length > 0) await offlineDB.bills.bulkPut(toCache)

      // Mescla com registros locais ainda pendentes (criados offline)
      const localPending = await offlineDB.bills
        .where('user_id').equals(userId)
        .filter(b => b._syncStatus === 'pending')
        .toArray()

      const serverIds = new Set(toCache.map(b => b.id as string))
      const merged = [
        ...localPending.filter(b => !serverIds.has(b.id as string)),
        ...toCache,
      ]
      return merged.sort((a, b) =>
        new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
      )
    },
    async () => {
      const cached = await offlineDB.bills.where('user_id').equals(userId).toArray()
      return cached
        .filter(b => b._syncStatus !== 'failed')
        .sort((a, b) =>
          new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
        )
    },
  )
}

export async function fetchRecentBills(userId: string, limit = 5) {
  const all = await fetchBills(userId)
  return all.slice(0, limit)
}

export async function createBill(bill: {
  user_id: string
  description: string
  amount: number
  group_id?: string | null
  due_date?: string | null
  category?: string
  notes?: string
  recurrence?: string
}) {
  const id = newId()
  const timestamp = now()
  const payload = {
    id,
    ...bill,
    group_id: bill.group_id || null,
    status: 'pendente',
    created_at: timestamp,
    updated_at: timestamp,
    paid_at: null,
  }

  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('bills').insert(payload).select().single()
      if (error) throw error
      await offlineDB.bills.put({ ...data, _syncStatus: 'synced' })
      return data
    },
    async () => {
      const local: Cached = { ...payload, _syncStatus: 'pending' }
      await offlineDB.bills.put(local)
      await enqueue({ entity: 'bills', operation: 'INSERT', payload, localId: id })
      return local as any
    },
  )
}

export async function updateBillStatus(billId: string, status: string) {
  const updates = {
    id: billId,
    status,
    paid_at: status === 'pago' ? now() : null,
    updated_at: now(),
  }

  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('bills')
        .update({ status: updates.status, paid_at: updates.paid_at, updated_at: updates.updated_at })
        .eq('id', billId)
      if (error) throw error
      const cached = await offlineDB.bills.get(billId)
      if (cached) await offlineDB.bills.put({ ...cached, ...updates, _syncStatus: 'synced' })
    },
    async () => {
      const cached = await offlineDB.bills.get(billId)
      if (cached) await offlineDB.bills.put({ ...cached, ...updates, _syncStatus: 'pending' })
      await enqueue({ entity: 'bills', operation: 'UPDATE', payload: updates, localId: billId })
    },
  )
}

export async function deleteBill(billId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from('bills').delete().eq('id', billId)
      if (error) throw error
      await offlineDB.bills.delete(billId)
    },
    async () => {
      // Remove da visualização local imediatamente
      await offlineDB.bills.delete(billId)
      await enqueue({ entity: 'bills', operation: 'DELETE', payload: { id: billId }, localId: billId })
    },
  )
}

// ─── GROUPS ────────────────────────────────────────────────────────────────

export async function fetchGroups(userId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, role, groups(id, name, description, created_by, invite_code, created_at)')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })

      if (error) throw error

      const groups = (data || []).map((gm: any) => ({ ...gm.groups, role: gm.role }))
      const toCache = groups.map(g => ({ ...g, _syncStatus: 'synced' as const }))
      if (toCache.length > 0) await offlineDB.groups.bulkPut(toCache)

      const localPending = await offlineDB.groups
        .filter(g => g._syncStatus === 'pending')
        .toArray()
      const serverIds = new Set(toCache.map(g => g.id as string))
      return [...localPending.filter(g => !serverIds.has(g.id as string)), ...toCache]
    },
    async () => {
      const cached = await offlineDB.groups.toArray()
      return cached.filter(g => g._syncStatus !== 'failed')
    },
  )
}

export async function createGroup(group: {
  name: string
  description?: string
  created_by: string
}) {
  const id = newId()
  const timestamp = now()
  const payload = { id, ...group, created_at: timestamp, updated_at: timestamp }

  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('groups').insert(payload).select().single()
      if (error) throw error
      await offlineDB.groups.put({ ...data, _syncStatus: 'synced' })
      return data
    },
    async () => {
      const local: Cached = { ...payload, _syncStatus: 'pending' }
      await offlineDB.groups.put(local)
      await enqueue({ entity: 'groups', operation: 'INSERT', payload, localId: id })
      return local as any
    },
  )
}

export async function deleteGroup(groupId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from('groups').delete().eq('id', groupId)
      if (error) throw error
      await offlineDB.groups.delete(groupId)
    },
    async () => {
      await offlineDB.groups.delete(groupId)
      await enqueue({ entity: 'groups', operation: 'DELETE', payload: { id: groupId }, localId: groupId })
    },
  )
}

export async function fetchGroupMembers(groupId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(display_name, email, avatar_url)')
    .eq('group_id', groupId)

  if (error) throw error
  return data || []
}

// ─── FRIENDS ───────────────────────────────────────────────────────────────

export async function fetchFriends(userId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id, status, created_at,
          requester:profiles!friends_requester_id_fkey(user_id, display_name, email, avatar_url),
          receiver:profiles!friends_receiver_id_fkey(user_id, display_name, email, avatar_url)
        `)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

      if (error) throw error

      const friends = (data || []).map((f: any) => {
        const isRequester = f.requester?.user_id === userId
        return {
          id: f.id,
          status: f.status,
          created_at: f.created_at,
          isRequester,
          friend: isRequester ? f.receiver : f.requester,
        }
      })

      const toCache = friends.map(f => ({ ...f, _syncStatus: 'synced' as const }))
      if (toCache.length > 0) await offlineDB.friends.bulkPut(toCache)
      return friends
    },
    async () => {
      return offlineDB.friends.toArray()
    },
  )
}

// addFriend requer consulta ao servidor (lookup por email) — não funciona offline
export async function addFriend(requesterId: string, receiverEmail: string) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Adicionar amigos requer conexão com a internet')
  }

  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', receiverEmail)
    .single()

  if (profileError || !profile) throw new Error('Usuário não encontrado com esse email')
  if (profile.user_id === requesterId) throw new Error('Você não pode adicionar a si mesmo')

  const { data: existing } = await supabase
    .from('friends')
    .select('id, status')
    .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${profile.user_id}),and(requester_id.eq.${profile.user_id},receiver_id.eq.${requesterId})`)
    .limit(1)

  if (existing && existing.length > 0) {
    const s = existing[0].status
    if (s === 'accepted') throw new Error('Vocês já são amigos')
    if (s === 'pending') throw new Error('Já existe um convite pendente')
  }

  const { error } = await supabase.from('friends').insert({
    requester_id: requesterId,
    receiver_id: profile.user_id,
    status: 'pending',
  })
  if (error) throw error
}

export async function acceptFriend(friendshipId: string) {
  const updates = { id: friendshipId, status: 'accepted' }
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendshipId)
      if (error) throw error
      const cached = await offlineDB.friends.get(friendshipId)
      if (cached) await offlineDB.friends.put({ ...cached, status: 'accepted', _syncStatus: 'synced' })
    },
    async () => {
      const cached = await offlineDB.friends.get(friendshipId)
      if (cached) await offlineDB.friends.put({ ...cached, status: 'accepted', _syncStatus: 'pending' })
      await enqueue({ entity: 'friends', operation: 'UPDATE', payload: updates, localId: friendshipId })
    },
  )
}

export async function removeFriend(friendshipId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from('friends').delete().eq('id', friendshipId)
      if (error) throw error
      await offlineDB.friends.delete(friendshipId)
    },
    async () => {
      await offlineDB.friends.delete(friendshipId)
      await enqueue({ entity: 'friends', operation: 'DELETE', payload: { id: friendshipId }, localId: friendshipId })
    },
  )
}

// ─── PROFILE ───────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: { display_name?: string; avatar_url?: string }) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', userId)
      if (error) throw error
    },
    async () => {
      await enqueue({ entity: 'profiles', operation: 'UPDATE', payload: { id: userId, ...updates }, localId: userId })
    },
  )
}

// ─── USER PREFERENCES ──────────────────────────────────────────────────────

export async function fetchPreferences(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updatePreferences(userId: string, updates: Record<string, any>) {
  const supabase = createClient()
  const { error } = await supabase.from('user_preferences').update(updates).eq('user_id', userId)
  if (error) throw error
}

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────

export async function fetchDashboardStats(userId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const [billsRes, groupsRes] = await Promise.all([
        supabase.from('bills').select('amount, status').eq('user_id', userId),
        supabase.from('group_members').select('group_id').eq('user_id', userId),
      ])

      const bills = billsRes.data || []
      const totalExpenses = bills.reduce((sum, b) => sum + Number(b.amount), 0)
      const pendingPayments = bills.filter(b => b.status === 'pendente').reduce((sum, b) => sum + Number(b.amount), 0)
      const totalGroupsParticipating = groupsRes.data?.length || 0
      return { totalExpenses, pendingPayments, totalGroupsParticipating }
    },
    async () => {
      const [bills, groups] = await Promise.all([
        offlineDB.bills.where('user_id').equals(userId).toArray(),
        offlineDB.groups.toArray(),
      ])
      const totalExpenses = bills.reduce((sum, b) => sum + Number(b.amount ?? 0), 0)
      const pendingPayments = bills.filter(b => b.status === 'pendente').reduce((sum, b) => sum + Number(b.amount ?? 0), 0)
      return { totalExpenses, pendingPayments, totalGroupsParticipating: groups.length }
    },
  )
}

// ─── HISTORY ───────────────────────────────────────────────────────────────

export async function fetchHistory(userId: string, filter?: 'all' | 'paid' | 'pending') {
  const all = await fetchBills(userId)
  if (filter === 'paid') return all.filter((b: any) => b.status === 'pago')
  if (filter === 'pending') return all.filter((b: any) => b.status === 'pendente')
  return all
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      const toCache = (data || []).map(n => ({ ...n, _syncStatus: 'synced' as const }))
      if (toCache.length > 0) await offlineDB.notifications.bulkPut(toCache)
      return data || []
    },
    async () => {
      return offlineDB.notifications.where('user_id').equals(userId).reverse().sortBy('created_at')
    },
  )
}

export async function markNotificationRead(notificationId: string) {
  return withOfflineFallback(
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
      if (error) throw error
      const cached = await offlineDB.notifications.get(notificationId)
      if (cached) await offlineDB.notifications.put({ ...cached, read: true, _syncStatus: 'synced' })
    },
    async () => {
      const cached = await offlineDB.notifications.get(notificationId)
      if (cached) await offlineDB.notifications.put({ ...cached, read: true, _syncStatus: 'pending' })
      await enqueue({ entity: 'notifications', operation: 'UPDATE', payload: { id: notificationId, read: true }, localId: notificationId })
    },
  )
}

// ─── PASSWORD / ACCOUNT ────────────────────────────────────────────────────

export async function changePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function deleteAccount() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
