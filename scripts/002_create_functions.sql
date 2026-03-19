-- JáPaguei - Database Functions and Triggers
-- 002_create_functions.sql

-- ============================================
-- FUNCTION: Update updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Handle new user (create profile)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'name',
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Handle new group (add creator as admin)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (group_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Generate next recurring bill
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_next_recurring_bill()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_due_date DATE;
BEGIN
  IF OLD.status = 'pendente' AND NEW.status = 'pago' AND NEW.recurrence != 'unica' THEN
    IF NEW.recurrence = 'mensal' THEN
      next_due_date := COALESCE(NEW.due_date, CURRENT_DATE) + INTERVAL '1 month';
    ELSIF NEW.recurrence = 'anual' THEN
      next_due_date := COALESCE(NEW.due_date, CURRENT_DATE) + INTERVAL '1 year';
    ELSE
      RETURN NEW;
    END IF;
    
    INSERT INTO public.bills (
      user_id, group_id, description, amount, due_date, start_date,
      category, status, recurrence, notes, responsible_id
    )
    VALUES (
      NEW.user_id, NEW.group_id, NEW.description, NEW.amount, next_due_date, NEW.start_date,
      NEW.category, 'pendente', NEW.recurrence, NEW.notes, NEW.responsible_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Log bill status change
-- ============================================
CREATE OR REPLACE FUNCTION public.log_bill_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.payment_logs (bill_id, user_id, action, old_status, new_status)
    VALUES (NEW.id, NEW.user_id, 'status_change', OLD.status, NEW.status);
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Notify group bill created
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_group_bill_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  group_name TEXT;
BEGIN
  IF NEW.group_id IS NOT NULL THEN
    SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;
    
    FOR member_record IN 
      SELECT user_id FROM public.group_members 
      WHERE group_id = NEW.group_id AND user_id != NEW.user_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, group_id, bill_id)
      VALUES (
        member_record.user_id,
        'bill_created',
        'Nova conta no grupo',
        'Uma nova conta "' || NEW.description || '" foi criada no grupo "' || group_name || '"',
        NEW.group_id,
        NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Notify group bill paid
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_group_bill_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  group_name TEXT;
BEGIN
  IF NEW.group_id IS NOT NULL AND OLD.status = 'pendente' AND NEW.status = 'pago' THEN
    SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;
    
    FOR member_record IN 
      SELECT user_id FROM public.group_members 
      WHERE group_id = NEW.group_id AND user_id != NEW.user_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, group_id, bill_id)
      VALUES (
        member_record.user_id,
        'bill_paid',
        'Conta paga',
        'A conta "' || NEW.description || '" foi marcada como paga no grupo "' || group_name || '"',
        NEW.group_id,
        NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Notify group new member
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_group_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  group_name TEXT;
  new_member_name TEXT;
BEGIN
  SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;
  SELECT display_name INTO new_member_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  FOR member_record IN 
    SELECT user_id FROM public.group_members 
    WHERE group_id = NEW.group_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, group_id)
    VALUES (
      member_record.user_id,
      'new_member',
      'Novo membro',
      COALESCE(new_member_name, 'Alguém') || ' entrou no grupo "' || group_name || '"',
      NEW.group_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION: Check if user is group member
-- ============================================
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = _group_id AND user_id = auth.uid()
  );
$$;

-- ============================================
-- TRIGGERS
-- ============================================

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

-- Trigger: Generate next recurring bill
DROP TRIGGER IF EXISTS on_bill_paid_recurring ON public.bills;
CREATE TRIGGER on_bill_paid_recurring
  AFTER UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_next_recurring_bill();

-- Trigger: Log bill status change
DROP TRIGGER IF EXISTS on_bill_status_change ON public.bills;
CREATE TRIGGER on_bill_status_change
  AFTER UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.log_bill_status_change();

-- Trigger: Notify group bill created
DROP TRIGGER IF EXISTS on_group_bill_created ON public.bills;
CREATE TRIGGER on_group_bill_created
  AFTER INSERT ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_bill_created();

-- Trigger: Notify group bill paid
DROP TRIGGER IF EXISTS on_group_bill_paid ON public.bills;
CREATE TRIGGER on_group_bill_paid
  AFTER UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_bill_paid();

-- Trigger: Notify group new member
DROP TRIGGER IF EXISTS on_group_new_member ON public.group_members;
CREATE TRIGGER on_group_new_member
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_new_member();

-- Trigger: Update updated_at for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update updated_at for groups
DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update updated_at for bills
DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update updated_at for budget_goals
DROP TRIGGER IF EXISTS update_budget_goals_updated_at ON public.budget_goals;
CREATE TRIGGER update_budget_goals_updated_at
  BEFORE UPDATE ON public.budget_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update updated_at for user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
