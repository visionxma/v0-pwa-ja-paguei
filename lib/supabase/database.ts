import { createClient } from './client'

// ============================================
// BILLS
// ============================================

export async function fetchBills(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bills')
    .select('*, groups(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchRecentBills(userId: string, limit = 5) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bills')
    .select('*, groups(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
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
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bills')
    .insert({
      ...bill,
      group_id: bill.group_id || null,
      status: 'pendente',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBillStatus(billId: string, status: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('bills')
    .update({
      status,
      paid_at: status === 'pago' ? new Date().toISOString() : null,
    })
    .eq('id', billId)

  if (error) throw error
}

export async function deleteBill(billId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('bills').delete().eq('id', billId)
  if (error) throw error
}

// ============================================
// GROUPS
// ============================================

export async function fetchGroups(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, role, groups(id, name, description, created_by, invite_code, created_at)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return (data || []).map((gm: any) => ({
    ...gm.groups,
    role: gm.role,
  }))
}

export async function createGroup(group: {
  name: string
  description?: string
  created_by: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('groups')
    .insert(group)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGroup(groupId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('groups').delete().eq('id', groupId)
  if (error) throw error
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

// ============================================
// FRIENDS
// ============================================

export async function fetchFriends(userId: string) {
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
  return (data || []).map((f: any) => {
    const isRequester = f.requester?.user_id === userId
    const friend = isRequester ? f.receiver : f.requester
    return {
      id: f.id,
      status: f.status,
      created_at: f.created_at,
      isRequester,
      friend,
    }
  })
}

export async function addFriend(requesterId: string, receiverEmail: string) {
  const supabase = createClient()

  // Find user by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', receiverEmail)
    .single()

  if (profileError || !profile) {
    throw new Error('Usuário não encontrado com esse email')
  }

  if (profile.user_id === requesterId) {
    throw new Error('Você não pode adicionar a si mesmo')
  }

  // Check if already friends
  const { data: existing } = await supabase
    .from('friends')
    .select('id, status')
    .or(
      `and(requester_id.eq.${requesterId},receiver_id.eq.${profile.user_id}),and(requester_id.eq.${profile.user_id},receiver_id.eq.${requesterId})`
    )
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
  const supabase = createClient()
  const { error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)

  if (error) throw error
}

export async function removeFriend(friendshipId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('friends').delete().eq('id', friendshipId)
  if (error) throw error
}

// ============================================
// PROFILE
// ============================================

export async function fetchProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: {
  display_name?: string
  avatar_url?: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)

  if (error) throw error
}

// ============================================
// USER PREFERENCES
// ============================================

export async function fetchPreferences(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updatePreferences(userId: string, updates: Record<string, any>) {
  const supabase = createClient()
  const { error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)

  if (error) throw error
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function fetchDashboardStats(userId: string) {
  const supabase = createClient()

  const [billsRes, groupsRes] = await Promise.all([
    supabase
      .from('bills')
      .select('amount, status')
      .eq('user_id', userId),
    supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId),
  ])

  const bills = billsRes.data || []
  const totalExpenses = bills.reduce((sum, b) => sum + Number(b.amount), 0)
  const pendingPayments = bills
    .filter((b) => b.status === 'pendente')
    .reduce((sum, b) => sum + Number(b.amount), 0)
  const totalGroupsParticipating = groupsRes.data?.length || 0

  return { totalExpenses, pendingPayments, totalGroupsParticipating }
}

// ============================================
// HISTORY / PAYMENT LOGS
// ============================================

export async function fetchHistory(userId: string, filter?: 'all' | 'paid' | 'pending') {
  const supabase = createClient()
  let query = supabase
    .from('bills')
    .select('*, groups(name)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (filter === 'paid') {
    query = query.eq('status', 'pago')
  } else if (filter === 'pending') {
    query = query.eq('status', 'pendente')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function fetchNotifications(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data || []
}

export async function markNotificationRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// ============================================
// PASSWORD
// ============================================

export async function changePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

// ============================================
// DELETE ACCOUNT
// ============================================

export async function deleteAccount() {
  const supabase = createClient()
  // Sign out (actual deletion requires admin/edge function)
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
