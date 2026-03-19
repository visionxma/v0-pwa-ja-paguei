-- JáPaguei - Functions, Triggers and RLS
-- 002_functions_rls.sql

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Handle new user (create profile and preferences)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Function: Handle new group (add creator as admin)
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

-- Function: Check if user is group member
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = auth.uid()
  );
END;
$$;

-- Function: Generate next recurring bill
CREATE OR REPLACE FUNCTION public.generate_next_recurring_bill()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_due DATE;
BEGIN
  IF OLD.status = 'pendente' AND NEW.status = 'pago' AND NEW.recurrence != 'unica' THEN
    IF NEW.recurrence = 'mensal' THEN
      next_due := COALESCE(NEW.due_date, CURRENT_DATE) + INTERVAL '1 month';
    ELSIF NEW.recurrence = 'anual' THEN
      next_due := COALESCE(NEW.due_date, CURRENT_DATE) + INTERVAL '1 year';
    END IF;

    INSERT INTO public.bills (
      user_id, group_id, description, amount, due_date, start_date,
      category, status, recurrence, notes, responsible_id
    ) VALUES (
      NEW.user_id, NEW.group_id, NEW.description, NEW.amount, next_due, next_due,
      NEW.category, 'pendente', NEW.recurrence, NEW.notes, NEW.responsible_id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Function: Log bill status change
CREATE OR REPLACE FUNCTION public.log_bill_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.payment_logs (bill_id, user_id, action, old_status, new_status)
    VALUES (NEW.id, auth.uid(), 'status_change', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

-- Function: Notify group members about new bill
CREATE OR REPLACE FUNCTION public.notify_group_bill_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.group_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, group_id, bill_id)
    SELECT 
      gm.user_id,
      'group_bill',
      'Nova conta no grupo',
      'Uma nova conta foi adicionada: ' || NEW.description,
      NEW.group_id,
      NEW.id
    FROM public.group_members gm
    WHERE gm.group_id = NEW.group_id AND gm.user_id != NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Function: Notify group members about paid bill
CREATE OR REPLACE FUNCTION public.notify_group_bill_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.group_id IS NOT NULL AND OLD.status = 'pendente' AND NEW.status = 'pago' THEN
    INSERT INTO public.notifications (user_id, type, title, message, group_id, bill_id)
    SELECT 
      gm.user_id,
      'group_payment',
      'Conta paga',
      'A conta "' || NEW.description || '" foi marcada como paga',
      NEW.group_id,
      NEW.id
    FROM public.group_members gm
    WHERE gm.group_id = NEW.group_id AND gm.user_id != auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Function: Notify group members about new member
CREATE OR REPLACE FUNCTION public.notify_group_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_name TEXT;
  group_name TEXT;
BEGIN
  SELECT display_name INTO member_name FROM public.profiles WHERE user_id = NEW.user_id;
  SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;

  INSERT INTO public.notifications (user_id, type, title, message, group_id)
  SELECT 
    gm.user_id,
    'group_member',
    'Novo membro no grupo',
    COALESCE(member_name, 'Alguém') || ' entrou no grupo "' || COALESCE(group_name, 'Grupo') || '"',
    NEW.group_id
  FROM public.group_members gm
  WHERE gm.group_id = NEW.group_id AND gm.user_id != NEW.user_id;

  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Add creator as admin on new group
DROP TRIGGER IF EXISTS on_group_created ON public.groups;
CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_group();

-- Trigger: Generate recurring bill
DROP TRIGGER IF EXISTS on_bill_status_changed ON public.bills;
CREATE TRIGGER on_bill_status_changed
  AFTER UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_next_recurring_bill();

-- Trigger: Log bill status change
DROP TRIGGER IF EXISTS on_bill_status_logged ON public.bills;
CREATE TRIGGER on_bill_status_logged
  AFTER UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.log_bill_status_change();

-- Trigger: Notify on new group bill
DROP TRIGGER IF EXISTS on_group_bill_created ON public.bills;
CREATE TRIGGER on_group_bill_created
  AFTER INSERT ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_bill_created();

-- Trigger: Notify on group bill paid
DROP TRIGGER IF EXISTS on_group_bill_paid ON public.bills;
CREATE TRIGGER on_group_bill_paid
  AFTER UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_bill_paid();

-- Trigger: Notify on new group member
DROP TRIGGER IF EXISTS on_group_member_joined ON public.group_members;
CREATE TRIGGER on_group_member_joined
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_new_member();

-- Triggers: Update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_goals_updated_at ON public.budget_goals;
CREATE TRIGGER update_budget_goals_updated_at
  BEFORE UPDATE ON public.budget_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "prefs_select_own" ON public.user_preferences;
DROP POLICY IF EXISTS "prefs_insert_own" ON public.user_preferences;
DROP POLICY IF EXISTS "prefs_update_own" ON public.user_preferences;
DROP POLICY IF EXISTS "groups_select" ON public.groups;
DROP POLICY IF EXISTS "groups_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_update" ON public.groups;
DROP POLICY IF EXISTS "groups_delete" ON public.groups;
DROP POLICY IF EXISTS "gm_select" ON public.group_members;
DROP POLICY IF EXISTS "gm_insert" ON public.group_members;
DROP POLICY IF EXISTS "gm_delete" ON public.group_members;
DROP POLICY IF EXISTS "gi_select" ON public.group_invites;
DROP POLICY IF EXISTS "gi_insert" ON public.group_invites;
DROP POLICY IF EXISTS "gi_update" ON public.group_invites;
DROP POLICY IF EXISTS "gi_delete" ON public.group_invites;
DROP POLICY IF EXISTS "bills_select" ON public.bills;
DROP POLICY IF EXISTS "bills_insert" ON public.bills;
DROP POLICY IF EXISTS "bills_update" ON public.bills;
DROP POLICY IF EXISTS "bills_delete" ON public.bills;
DROP POLICY IF EXISTS "splits_select" ON public.bill_splits;
DROP POLICY IF EXISTS "splits_insert" ON public.bill_splits;
DROP POLICY IF EXISTS "splits_update" ON public.bill_splits;
DROP POLICY IF EXISTS "splits_delete" ON public.bill_splits;
DROP POLICY IF EXISTS "attach_select" ON public.bill_attachments;
DROP POLICY IF EXISTS "attach_insert" ON public.bill_attachments;
DROP POLICY IF EXISTS "attach_delete" ON public.bill_attachments;
DROP POLICY IF EXISTS "friends_select" ON public.friends;
DROP POLICY IF EXISTS "friends_insert" ON public.friends;
DROP POLICY IF EXISTS "friends_update" ON public.friends;
DROP POLICY IF EXISTS "friends_delete" ON public.friends;
DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "logs_select" ON public.payment_logs;
DROP POLICY IF EXISTS "logs_insert" ON public.payment_logs;
DROP POLICY IF EXISTS "goals_select_own" ON public.budget_goals;
DROP POLICY IF EXISTS "goals_insert_own" ON public.budget_goals;
DROP POLICY IF EXISTS "goals_update_own" ON public.budget_goals;
DROP POLICY IF EXISTS "goals_delete_own" ON public.budget_goals;

-- PROFILES policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- USER_PREFERENCES policies
CREATE POLICY "prefs_select_own" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "prefs_insert_own" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_update_own" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- GROUPS policies
CREATE POLICY "groups_select" ON public.groups FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR 
  public.is_group_member(id) OR 
  invite_code IS NOT NULL
);
CREATE POLICY "groups_insert" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update" ON public.groups FOR UPDATE TO authenticated USING (public.is_group_member(id));
CREATE POLICY "groups_delete" ON public.groups FOR DELETE TO authenticated USING (created_by = auth.uid());

-- GROUP_MEMBERS policies
CREATE POLICY "gm_select" ON public.group_members FOR SELECT TO authenticated USING (public.is_group_member(group_id));
CREATE POLICY "gm_insert" ON public.group_members FOR INSERT TO authenticated WITH CHECK (
  public.is_group_member(group_id) OR user_id = auth.uid()
);
CREATE POLICY "gm_delete" ON public.group_members FOR DELETE TO authenticated USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.group_members gm2 WHERE gm2.group_id = group_members.group_id AND gm2.user_id = auth.uid() AND gm2.role = 'admin')
);

-- GROUP_INVITES policies
CREATE POLICY "gi_select" ON public.group_invites FOR SELECT TO authenticated USING (public.is_group_member(group_id));
CREATE POLICY "gi_insert" ON public.group_invites FOR INSERT TO authenticated WITH CHECK (public.is_group_member(group_id));
CREATE POLICY "gi_update" ON public.group_invites FOR UPDATE TO authenticated USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
CREATE POLICY "gi_delete" ON public.group_invites FOR DELETE TO authenticated USING (public.is_group_member(group_id));

-- BILLS policies
CREATE POLICY "bills_select" ON public.bills FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  (group_id IS NOT NULL AND public.is_group_member(group_id))
);
CREATE POLICY "bills_insert" ON public.bills FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND 
  (group_id IS NULL OR public.is_group_member(group_id))
);
CREATE POLICY "bills_update" ON public.bills FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR 
  (group_id IS NOT NULL AND public.is_group_member(group_id))
);
CREATE POLICY "bills_delete" ON public.bills FOR DELETE TO authenticated USING (
  user_id = auth.uid() OR 
  (group_id IS NOT NULL AND public.is_group_member(group_id))
);

-- BILL_SPLITS policies
CREATE POLICY "splits_select" ON public.bill_splits FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bills WHERE id = bill_id AND (user_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_member(group_id))))
);
CREATE POLICY "splits_insert" ON public.bill_splits FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.bills WHERE id = bill_id AND (user_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_member(group_id))))
);
CREATE POLICY "splits_update" ON public.bill_splits FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bills WHERE id = bill_id AND (user_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_member(group_id))))
);
CREATE POLICY "splits_delete" ON public.bill_splits FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bills WHERE id = bill_id AND (user_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_member(group_id))))
);

-- BILL_ATTACHMENTS policies
CREATE POLICY "attach_select" ON public.bill_attachments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bills WHERE id = bill_id AND (user_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_member(group_id))))
);
CREATE POLICY "attach_insert" ON public.bill_attachments FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "attach_delete" ON public.bill_attachments FOR DELETE TO authenticated USING (uploaded_by = auth.uid());

-- FRIENDS policies
CREATE POLICY "friends_select" ON public.friends FOR SELECT TO authenticated USING (
  requester_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "friends_insert" ON public.friends FOR INSERT TO authenticated WITH CHECK (
  requester_id = auth.uid() AND requester_id != receiver_id
);
CREATE POLICY "friends_update" ON public.friends FOR UPDATE TO authenticated USING (receiver_id = auth.uid());
CREATE POLICY "friends_delete" ON public.friends FOR DELETE TO authenticated USING (
  requester_id = auth.uid() OR receiver_id = auth.uid()
);

-- NOTIFICATIONS policies
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert_own" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- PAYMENT_LOGS policies
CREATE POLICY "logs_select" ON public.payment_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bills WHERE id = bill_id AND (user_id = auth.uid() OR (group_id IS NOT NULL AND public.is_group_member(group_id))))
);
CREATE POLICY "logs_insert" ON public.payment_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- BUDGET_GOALS policies
CREATE POLICY "goals_select_own" ON public.budget_goals FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "goals_insert_own" ON public.budget_goals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "goals_update_own" ON public.budget_goals FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "goals_delete_own" ON public.budget_goals FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop existing first)
DROP POLICY IF EXISTS "attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_delete" ON storage.objects;

CREATE POLICY "attachments_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'attachments');
CREATE POLICY "attachments_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "attachments_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'attachments');
