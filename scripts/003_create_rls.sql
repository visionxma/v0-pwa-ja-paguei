-- JáPaguei - Row Level Security Policies
-- 003_create_rls.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- ============================================
-- GROUPS POLICIES
-- ============================================
DROP POLICY IF EXISTS "groups_select" ON public.groups;
CREATE POLICY "groups_select" ON public.groups 
  FOR SELECT TO authenticated 
  USING (
    created_by = auth.uid() 
    OR public.is_group_member(id)
    OR invite_code IS NOT NULL
  );

DROP POLICY IF EXISTS "groups_insert" ON public.groups;
CREATE POLICY "groups_insert" ON public.groups 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "groups_update" ON public.groups;
CREATE POLICY "groups_update" ON public.groups 
  FOR UPDATE TO authenticated 
  USING (public.is_group_member(id));

DROP POLICY IF EXISTS "groups_delete" ON public.groups;
CREATE POLICY "groups_delete" ON public.groups 
  FOR DELETE TO authenticated 
  USING (auth.uid() = created_by);

-- ============================================
-- GROUP_MEMBERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
CREATE POLICY "group_members_select" ON public.group_members 
  FOR SELECT TO authenticated 
  USING (public.is_group_member(group_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;
CREATE POLICY "group_members_insert" ON public.group_members 
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_group_member(group_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "group_members_update" ON public.group_members;
CREATE POLICY "group_members_update" ON public.group_members 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;
CREATE POLICY "group_members_delete" ON public.group_members 
  FOR DELETE TO authenticated 
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
    )
  );

-- ============================================
-- BILLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "bills_select" ON public.bills;
CREATE POLICY "bills_select" ON public.bills 
  FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() 
    OR (group_id IS NOT NULL AND public.is_group_member(group_id))
  );

DROP POLICY IF EXISTS "bills_insert" ON public.bills;
CREATE POLICY "bills_insert" ON public.bills 
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id 
    AND (group_id IS NULL OR public.is_group_member(group_id))
  );

DROP POLICY IF EXISTS "bills_update" ON public.bills;
CREATE POLICY "bills_update" ON public.bills 
  FOR UPDATE TO authenticated 
  USING (
    user_id = auth.uid() 
    OR (group_id IS NOT NULL AND public.is_group_member(group_id))
  );

DROP POLICY IF EXISTS "bills_delete" ON public.bills;
CREATE POLICY "bills_delete" ON public.bills 
  FOR DELETE TO authenticated 
  USING (
    user_id = auth.uid() 
    OR (group_id IS NOT NULL AND public.is_group_member(group_id))
  );

-- ============================================
-- BILL_SPLITS POLICIES
-- ============================================
DROP POLICY IF EXISTS "bill_splits_select" ON public.bill_splits;
CREATE POLICY "bill_splits_select" ON public.bill_splits 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.bills b 
      WHERE b.id = bill_splits.bill_id 
      AND (b.user_id = auth.uid() OR (b.group_id IS NOT NULL AND public.is_group_member(b.group_id)))
    )
  );

DROP POLICY IF EXISTS "bill_splits_insert" ON public.bill_splits;
CREATE POLICY "bill_splits_insert" ON public.bill_splits 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bills b 
      WHERE b.id = bill_splits.bill_id 
      AND (b.user_id = auth.uid() OR (b.group_id IS NOT NULL AND public.is_group_member(b.group_id)))
    )
  );

DROP POLICY IF EXISTS "bill_splits_update" ON public.bill_splits;
CREATE POLICY "bill_splits_update" ON public.bill_splits 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.bills b 
      WHERE b.id = bill_splits.bill_id 
      AND (b.user_id = auth.uid() OR (b.group_id IS NOT NULL AND public.is_group_member(b.group_id)))
    )
  );

DROP POLICY IF EXISTS "bill_splits_delete" ON public.bill_splits;
CREATE POLICY "bill_splits_delete" ON public.bill_splits 
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.bills b 
      WHERE b.id = bill_splits.bill_id 
      AND (b.user_id = auth.uid() OR (b.group_id IS NOT NULL AND public.is_group_member(b.group_id)))
    )
  );

-- ============================================
-- BILL_ATTACHMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "bill_attachments_select" ON public.bill_attachments;
CREATE POLICY "bill_attachments_select" ON public.bill_attachments 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.bills b 
      WHERE b.id = bill_attachments.bill_id 
      AND (b.user_id = auth.uid() OR (b.group_id IS NOT NULL AND public.is_group_member(b.group_id)))
    )
  );

DROP POLICY IF EXISTS "bill_attachments_insert" ON public.bill_attachments;
CREATE POLICY "bill_attachments_insert" ON public.bill_attachments 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "bill_attachments_delete" ON public.bill_attachments;
CREATE POLICY "bill_attachments_delete" ON public.bill_attachments 
  FOR DELETE TO authenticated 
  USING (auth.uid() = uploaded_by);

-- ============================================
-- GROUP_INVITES POLICIES
-- ============================================
DROP POLICY IF EXISTS "group_invites_select" ON public.group_invites;
CREATE POLICY "group_invites_select" ON public.group_invites 
  FOR SELECT TO authenticated 
  USING (public.is_group_member(group_id));

DROP POLICY IF EXISTS "group_invites_insert" ON public.group_invites;
CREATE POLICY "group_invites_insert" ON public.group_invites 
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_group_member(group_id));

DROP POLICY IF EXISTS "group_invites_update" ON public.group_invites;
CREATE POLICY "group_invites_update" ON public.group_invites 
  FOR UPDATE TO authenticated 
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "group_invites_delete" ON public.group_invites;
CREATE POLICY "group_invites_delete" ON public.group_invites 
  FOR DELETE TO authenticated 
  USING (public.is_group_member(group_id));

-- ============================================
-- FRIENDS POLICIES
-- ============================================
DROP POLICY IF EXISTS "friends_select" ON public.friends;
CREATE POLICY "friends_select" ON public.friends 
  FOR SELECT TO authenticated 
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "friends_insert" ON public.friends;
CREATE POLICY "friends_insert" ON public.friends 
  FOR INSERT TO authenticated 
  WITH CHECK (requester_id = auth.uid() AND requester_id != receiver_id);

DROP POLICY IF EXISTS "friends_update" ON public.friends;
CREATE POLICY "friends_update" ON public.friends 
  FOR UPDATE TO authenticated 
  USING (receiver_id = auth.uid());

DROP POLICY IF EXISTS "friends_delete" ON public.friends;
CREATE POLICY "friends_delete" ON public.friends 
  FOR DELETE TO authenticated 
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete" ON public.notifications 
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());

-- ============================================
-- PAYMENT_LOGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "payment_logs_select" ON public.payment_logs;
CREATE POLICY "payment_logs_select" ON public.payment_logs 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.bills b 
      WHERE b.id = payment_logs.bill_id 
      AND (b.user_id = auth.uid() OR (b.group_id IS NOT NULL AND public.is_group_member(b.group_id)))
    )
  );

DROP POLICY IF EXISTS "payment_logs_insert" ON public.payment_logs;
CREATE POLICY "payment_logs_insert" ON public.payment_logs 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- BUDGET_GOALS POLICIES
-- ============================================
DROP POLICY IF EXISTS "budget_goals_select" ON public.budget_goals;
CREATE POLICY "budget_goals_select" ON public.budget_goals 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "budget_goals_insert" ON public.budget_goals;
CREATE POLICY "budget_goals_insert" ON public.budget_goals 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "budget_goals_update" ON public.budget_goals;
CREATE POLICY "budget_goals_update" ON public.budget_goals 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "budget_goals_delete" ON public.budget_goals;
CREATE POLICY "budget_goals_delete" ON public.budget_goals 
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());

-- ============================================
-- USER_PREFERENCES POLICIES
-- ============================================
DROP POLICY IF EXISTS "user_preferences_select" ON public.user_preferences;
CREATE POLICY "user_preferences_select" ON public.user_preferences 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_preferences_insert" ON public.user_preferences;
CREATE POLICY "user_preferences_insert" ON public.user_preferences 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_preferences_update" ON public.user_preferences;
CREATE POLICY "user_preferences_update" ON public.user_preferences 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());
