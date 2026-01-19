-- Phase 1: Update Notifications CHECK Constraint to include all existing + quiz_invite
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'like', 'comment', 'share', 'follow', 'follow_request', 
  'follow_accepted', 'mention', 'new_post', 'group_deleted', 
  'lesson_comment', 'group_invitation', 'announcement', 'quiz_invite'
));

-- Phase 2: Create Quiz Battle Invitations Table
CREATE TABLE public.quiz_battle_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade_level TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  battle_id UUID REFERENCES public.quiz_battles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  
  CONSTRAINT no_self_invitation CHECK (sender_id != recipient_id)
);

-- Partial unique index: only one pending invitation per sender-recipient pair
CREATE UNIQUE INDEX idx_unique_pending_invitation 
ON public.quiz_battle_invitations (sender_id, recipient_id) 
WHERE status = 'pending';

-- Indexes for fast lookups
CREATE INDEX idx_invitations_recipient_status ON public.quiz_battle_invitations(recipient_id, status);
CREATE INDEX idx_invitations_sender_status ON public.quiz_battle_invitations(sender_id, status);
CREATE INDEX idx_invitations_expires ON public.quiz_battle_invitations(expires_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.quiz_battle_invitations ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battle_invitations;

-- Phase 3: RLS Policies for Invitations
CREATE POLICY "Users can view own invitations"
ON public.quiz_battle_invitations FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send invitations"
ON public.quiz_battle_invitations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can cancel invitations"
ON public.quiz_battle_invitations FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id AND status = 'pending')
WITH CHECK (status = 'cancelled');

CREATE POLICY "Recipients can respond to invitations"
ON public.quiz_battle_invitations FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id AND status = 'pending')
WITH CHECK (status IN ('accepted', 'declined'));

-- Phase 4: Helper function to check if user has active battle (using correct enum values)
CREATE OR REPLACE FUNCTION public.user_has_active_battle(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM quiz_battle_players qbp
    JOIN quiz_battles qb ON qb.id = qbp.battle_id
    WHERE qbp.user_id = p_user_id
    AND qb.status IN ('waiting'::quiz_battle_status, 'in_progress'::quiz_battle_status)
  )
$$;

-- Phase 5: Security Definer Function for Accepting Invitations
CREATE OR REPLACE FUNCTION public.accept_quiz_invitation(p_invitation_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_battle_id UUID;
BEGIN
  -- Get and lock the invitation
  SELECT * INTO v_invitation
  FROM quiz_battle_invitations
  WHERE id = p_invitation_id
  FOR UPDATE;
  
  -- Validate invitation exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  
  -- Validate recipient is current user
  IF v_invitation.recipient_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to accept this invitation';
  END IF;
  
  -- Validate status is pending
  IF v_invitation.status != 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer pending (status: %)', v_invitation.status;
  END IF;
  
  -- Check if expired
  IF v_invitation.expires_at < now() THEN
    UPDATE quiz_battle_invitations SET status = 'expired' WHERE id = p_invitation_id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  
  -- Check if either user is already in an active battle
  IF user_has_active_battle(v_invitation.sender_id) OR user_has_active_battle(v_invitation.recipient_id) THEN
    RAISE EXCEPTION 'One of the players is already in an active battle';
  END IF;
  
  -- Create the battle (created_by = sender) - use 'waiting' status
  INSERT INTO quiz_battles (
    mode, status, subject_id, grade_level, difficulty, created_by
  ) VALUES (
    'multiplayer', 'waiting'::quiz_battle_status, v_invitation.subject_id, 
    v_invitation.grade_level, v_invitation.difficulty, v_invitation.sender_id
  )
  RETURNING id INTO v_battle_id;
  
  -- Add both players
  INSERT INTO quiz_battle_players (battle_id, user_id, is_host)
  VALUES 
    (v_battle_id, v_invitation.sender_id, true),
    (v_battle_id, v_invitation.recipient_id, false);
  
  -- Update invitation
  UPDATE quiz_battle_invitations
  SET 
    status = 'accepted',
    battle_id = v_battle_id,
    responded_at = now()
  WHERE id = p_invitation_id;
  
  RETURN v_battle_id;
END;
$$;

-- Phase 6: Auto-Expire Invitations Function and Trigger
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark expired invitations
  UPDATE quiz_battle_invitations
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();
  
  RETURN NEW;
END;
$$;

-- Run on each insert to clean up old invitations
CREATE TRIGGER trigger_expire_invitations
AFTER INSERT ON quiz_battle_invitations
EXECUTE FUNCTION expire_old_invitations();