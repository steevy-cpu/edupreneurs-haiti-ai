-- =============================================
-- MULTIPLAYER CHESS SYSTEM
-- =============================================

-- Create enum for match status
CREATE TYPE public.chess_match_status AS ENUM ('waiting', 'playing', 'completed', 'cancelled', 'abandoned');

-- =============================================
-- TABLE: chess_matches (Live Multiplayer Games)
-- =============================================
CREATE TABLE public.chess_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Match configuration
  status chess_match_status NOT NULL DEFAULT 'waiting',
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  time_control TEXT NOT NULL DEFAULT 'untimed', -- 'bullet', 'blitz', 'rapid', 'classic', 'untimed'
  time_per_player INTEGER, -- seconds (null = untimed)
  
  -- Players
  white_player_id UUID NOT NULL,
  black_player_id UUID,
  created_by UUID NOT NULL,
  winner_id UUID,
  
  -- Match visibility
  invite_code TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  
  -- Game state (authoritative)
  current_fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  current_turn TEXT NOT NULL DEFAULT 'w', -- 'w' or 'b'
  move_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_move_at TIMESTAMPTZ,
  
  -- Time tracking
  white_time_remaining INTEGER, -- seconds
  black_time_remaining INTEGER, -- seconds
  
  -- Result
  result TEXT, -- 'white_wins', 'black_wins', 'draw', 'white_timeout', 'black_timeout', 'white_resigned', 'black_resigned'
  result_reason TEXT, -- 'checkmate', 'stalemate', 'timeout', 'resignation', 'abandonment', 'agreement'
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for chess_matches
CREATE INDEX idx_chess_matches_status_public ON public.chess_matches(status, is_public) WHERE status = 'waiting';
CREATE INDEX idx_chess_matches_invite_code ON public.chess_matches(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX idx_chess_matches_white_player ON public.chess_matches(white_player_id);
CREATE INDEX idx_chess_matches_black_player ON public.chess_matches(black_player_id);

-- =============================================
-- TABLE: chess_match_chat (In-Game Messages)
-- =============================================
CREATE TABLE public.chess_match_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.chess_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chess_match_chat_match ON public.chess_match_chat(match_id, created_at);

-- =============================================
-- UPDATE: chess_games (Add multiplayer columns)
-- =============================================
ALTER TABLE public.chess_games 
  ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES public.chess_matches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS opponent_id UUID,
  ADD COLUMN IF NOT EXISTS is_multiplayer BOOLEAN DEFAULT false;

-- =============================================
-- FUNCTION: Check if user is match participant
-- =============================================
CREATE OR REPLACE FUNCTION public.is_chess_match_participant(match_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chess_matches
    WHERE id = match_uuid
    AND (white_player_id = user_uuid OR black_player_id = user_uuid)
  )
$$;

-- =============================================
-- FUNCTION: Generate invite code
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_chess_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- =============================================
-- FUNCTION: Submit chess move (atomic, race-safe)
-- =============================================
CREATE OR REPLACE FUNCTION public.submit_chess_move(
  p_match_id UUID,
  p_user_id UUID,
  p_from_square TEXT,
  p_to_square TEXT,
  p_new_fen TEXT,
  p_promotion TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
  v_is_white_turn BOOLEAN;
  v_is_player_white BOOLEAN;
  v_new_move JSONB;
  v_new_history JSONB;
  v_new_turn TEXT;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_match 
  FROM chess_matches 
  WHERE id = p_match_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  IF v_match.status != 'playing' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not active');
  END IF;
  
  -- Verify it's this player's turn
  v_is_white_turn := v_match.current_turn = 'w';
  v_is_player_white := v_match.white_player_id = p_user_id;
  
  IF v_is_white_turn != v_is_player_white THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not your turn');
  END IF;
  
  -- Determine next turn
  v_new_turn := CASE WHEN v_match.current_turn = 'w' THEN 'b' ELSE 'w' END;
  
  -- Record the move
  v_new_move := jsonb_build_object(
    'from', p_from_square,
    'to', p_to_square,
    'promotion', p_promotion,
    'fen', p_new_fen,
    'player_id', p_user_id::text,
    'timestamp', now()::text
  );
  
  v_new_history := v_match.move_history || v_new_move;
  
  -- Update match with new state
  UPDATE chess_matches SET
    move_history = v_new_history,
    current_fen = p_new_fen,
    current_turn = v_new_turn,
    last_move_at = now(),
    updated_at = now()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'move', v_new_move,
    'next_turn', v_new_turn,
    'new_fen', p_new_fen
  );
END;
$$;

-- =============================================
-- FUNCTION: Join chess match
-- =============================================
CREATE OR REPLACE FUNCTION public.join_chess_match(
  p_match_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
BEGIN
  -- Lock the row
  SELECT * INTO v_match 
  FROM chess_matches 
  WHERE id = p_match_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  IF v_match.status != 'waiting' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match no longer available');
  END IF;
  
  IF v_match.white_player_id = p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Cannot join your own match');
  END IF;
  
  IF v_match.black_player_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match already full');
  END IF;
  
  -- Join as black player and start the match
  UPDATE chess_matches SET
    black_player_id = p_user_id,
    status = 'playing',
    started_at = now(),
    white_time_remaining = time_per_player,
    black_time_remaining = time_per_player,
    updated_at = now()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Joined match successfully',
    'match_id', p_match_id
  );
END;
$$;

-- =============================================
-- FUNCTION: End chess match
-- =============================================
CREATE OR REPLACE FUNCTION public.end_chess_match(
  p_match_id UUID,
  p_winner_id UUID,
  p_result TEXT,
  p_result_reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
BEGIN
  SELECT * INTO v_match 
  FROM chess_matches 
  WHERE id = p_match_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  IF v_match.status = 'completed' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match already completed');
  END IF;
  
  -- Update match as completed
  UPDATE chess_matches SET
    status = 'completed',
    winner_id = p_winner_id,
    result = p_result,
    result_reason = p_result_reason,
    ended_at = now(),
    updated_at = now()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Match ended',
    'winner_id', p_winner_id
  );
END;
$$;

-- =============================================
-- TRIGGER: Update timestamp
-- =============================================
CREATE TRIGGER update_chess_matches_updated_at
  BEFORE UPDATE ON public.chess_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.chess_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_match_chat ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: chess_matches
-- =============================================

-- Anyone can see public waiting matches (for browsing)
CREATE POLICY "Public can view open matches"
ON public.chess_matches FOR SELECT
USING (status = 'waiting' AND is_public = true);

-- Participants can view their matches
CREATE POLICY "Participants can view their matches"
ON public.chess_matches FOR SELECT
TO authenticated
USING (public.is_chess_match_participant(id, auth.uid()));

-- Authenticated users can create matches
CREATE POLICY "Users can create matches"
ON public.chess_matches FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid() AND white_player_id = auth.uid());

-- Only participants can update (via RPC for moves)
CREATE POLICY "Participants can update matches"
ON public.chess_matches FOR UPDATE
TO authenticated
USING (public.is_chess_match_participant(id, auth.uid()));

-- =============================================
-- RLS POLICIES: chess_match_chat
-- =============================================

-- Only match participants can view chat
CREATE POLICY "Participants can view match chat"
ON public.chess_match_chat FOR SELECT
TO authenticated
USING (public.is_chess_match_participant(match_id, auth.uid()));

-- Only participants can send messages
CREATE POLICY "Participants can send messages"
ON public.chess_match_chat FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  public.is_chess_match_participant(match_id, auth.uid())
);

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_match_chat;