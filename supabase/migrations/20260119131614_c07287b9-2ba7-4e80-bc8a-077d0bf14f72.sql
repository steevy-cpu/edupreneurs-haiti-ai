-- Fix the accept_quiz_invitation function - remove is_host column reference that doesn't exist
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
  
  -- Create the battle using 'friend' mode with explicit difficulty cast
  INSERT INTO quiz_battles (
    mode, status, subject_id, grade_level, difficulty, created_by
  ) VALUES (
    'friend', 
    'waiting'::quiz_battle_status, 
    v_invitation.subject_id, 
    v_invitation.grade_level, 
    v_invitation.difficulty::quiz_difficulty,
    v_invitation.sender_id
  )
  RETURNING id INTO v_battle_id;
  
  -- Add both players WITHOUT is_host column (it doesn't exist)
  INSERT INTO quiz_battle_players (battle_id, user_id)
  VALUES 
    (v_battle_id, v_invitation.sender_id),
    (v_battle_id, v_invitation.recipient_id);
  
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