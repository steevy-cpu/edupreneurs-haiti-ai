-- Drop the problematic policies
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;

-- Create a security definer function to check if user is a group admin
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

-- Create a security definer function to check if user is a group member
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

-- Recreate policies using the security definer functions
CREATE POLICY "Users can view group members of their groups"
ON public.group_members
FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Group creators can add initial members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if this is the creator (admin) being added
  (role = 'admin' AND user_id = auth.uid())
  OR
  -- Allow if the current user is already an admin of the group
  public.is_group_admin(auth.uid(), group_id)
);

CREATE POLICY "Group admins can remove members"
ON public.group_members
FOR DELETE
TO authenticated
USING (public.is_group_admin(auth.uid(), group_id));

CREATE POLICY "Members can leave groups"
ON public.group_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());