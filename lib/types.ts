export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  phone?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  currency: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface Bill {
  id: string
  group_id?: string
  description: string
  amount: number
  currency: string
  paid_by: string
  created_at: string
  updated_at: string
  status: 'pending' | 'settled'
}

export interface BillSplit {
  id: string
  bill_id: string
  user_id: string
  amount: number
  status: 'pending' | 'paid'
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface BudgetGoal {
  id: string
  user_id: string
  group_id?: string
  name: string
  limit: number
  spent: number
  currency: string
  period: 'monthly' | 'yearly'
  created_at: string
  updated_at: string
}

export interface BillAttachment {
  id: string
  bill_id: string
  uploaded_by: string
  file_url: string
  file_name: string
  file_type: string | null
  created_at: string
}

export interface UserPreference {
  id: string
  user_id: string
  key: string
  value: string
}
