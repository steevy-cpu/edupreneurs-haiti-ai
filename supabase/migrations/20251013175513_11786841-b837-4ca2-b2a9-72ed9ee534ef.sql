-- Drop ALL policies completely
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'group_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.policyname);
    END LOOP;
END $$;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
      AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
  )
$$;

-- Create new policies with security definer functions
CREATE POLICY "gm_select_if_member"
ON public.group_members
FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "gm_insert_if_admin_or_self"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  (role = 'admin' AND user_id = auth.uid())
  OR public.is_group_admin(auth.uid(), group_id)
);

CREATE POLICY "gm_delete_if_admin"
ON public.group_members
FOR DELETE
TO authenticated
USING (public.is_group_admin(auth.uid(), group_id) OR user_id = auth.uid());