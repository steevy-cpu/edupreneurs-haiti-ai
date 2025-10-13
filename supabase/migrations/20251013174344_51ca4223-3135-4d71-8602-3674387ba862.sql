-- Create group_chats table
CREATE TABLE public.group_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  avatar_url text,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add is_group column to conversations table
ALTER TABLE public.conversations
ADD COLUMN is_group boolean NOT NULL DEFAULT false,
ADD COLUMN group_id uuid REFERENCES public.group_chats(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_chats
CREATE POLICY "Users can create groups"
ON public.group_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view groups they're members of"
ON public.group_chats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_chats.id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can update groups"
ON public.group_chats
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_chats.id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

CREATE POLICY "Group admins can delete groups"
ON public.group_chats
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- RLS Policies for group_members
CREATE POLICY "Users can view group members of their groups"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can add members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_members.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

CREATE POLICY "Group admins can remove members"
ON public.group_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_members.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

CREATE POLICY "Members can leave groups"
ON public.group_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Update conversations policies for group chats
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON public.conversations;

CREATE POLICY "Users can view conversations they're part of"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  (NOT is_group AND EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  ))
  OR
  (is_group AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = conversations.group_id
    AND group_members.user_id = auth.uid()
  ))
);

-- Trigger to update updated_at
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for group avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-avatars', 'group-avatars', true)
ON CONFLICT DO NOTHING;

-- Storage policies for group avatars
CREATE POLICY "Group avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'group-avatars');

CREATE POLICY "Authenticated users can upload group avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'group-avatars');

CREATE POLICY "Users can update their group avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'group-avatars')
WITH CHECK (bucket_id = 'group-avatars');

CREATE POLICY "Users can delete their group avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'group-avatars');