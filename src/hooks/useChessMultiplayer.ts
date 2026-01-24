import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export type ChessMatchStatus = 'waiting' | 'playing' | 'completed' | 'cancelled' | 'abandoned';
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classic' | 'untimed';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ChessMatch {
  id: string;
  status: ChessMatchStatus;
  difficulty: Difficulty | null;
  time_control: TimeControl;
  time_per_player: number | null;
  white_player_id: string;
  black_player_id: string | null;
  created_by: string;
  winner_id: string | null;
  invite_code: string | null;
  is_public: boolean;
  current_fen: string;
  current_turn: 'w' | 'b';
  move_history: MoveRecord[];
  last_move_at: string | null;
  white_time_remaining: number | null;
  black_time_remaining: number | null;
  result: string | null;
  result_reason: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoveRecord {
  from: string;
  to: string;
  promotion: string | null;
  fen: string;
  player_id: string;
  timestamp: string;
}

export interface PlayerInfo {
  id: string;
  nickname: string;
  avatar_url: string | null;
}

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: PlayerInfo;
}

// Time control presets in seconds
export const TIME_CONTROL_SECONDS: Record<TimeControl, number | null> = {
  bullet: 60,      // 1 minute
  blitz: 300,      // 5 minutes
  rapid: 600,      // 10 minutes
  classic: 1800,   // 30 minutes
  untimed: null,
};

export const TIME_CONTROL_LABELS: Record<TimeControl, string> = {
  bullet: 'Bullet (1 min)',
  blitz: 'Blitz (5 min)',
  rapid: 'Rapide (10 min)',
  classic: 'Classique (30 min)',
  untimed: 'Sans limite',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert',
};

// Generate invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface UseChessMultiplayerOptions {
  userId: string | null;
  enabled?: boolean;
}

interface UseChessMultiplayerReturn {
  // State
  match: ChessMatch | null;
  opponent: PlayerInfo | null;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Match actions
  createMatch: (options: CreateMatchOptions) => Promise<string | null>;
  joinMatch: (matchId: string) => Promise<boolean>;
  joinWithCode: (code: string) => Promise<{ success: boolean; matchId?: string; error?: string }>;
  cancelMatch: () => Promise<void>;
  resignMatch: () => Promise<void>;
  
  // Game actions
  submitMove: (from: string, to: string, newFen: string, promotion?: string, timeRemaining?: number) => Promise<boolean>;
  endMatch: (winnerId: string | null, result: string, reason: string) => Promise<void>;
  
  // Chat actions
  sendMessage: (message: string) => Promise<void>;
  
  // Utilities
  isMyTurn: boolean;
  myColor: 'w' | 'b' | null;
  refreshMatch: () => Promise<void>;
}

interface CreateMatchOptions {
  timeControl: TimeControl;
  difficulty?: Difficulty;
  isPublic?: boolean;
}

export const useChessMultiplayer = ({
  userId,
  enabled = true,
}: UseChessMultiplayerOptions): UseChessMultiplayerReturn => {
  const { toast } = useToast();
  
  // State
  const [match, setMatch] = useState<ChessMatch | null>(null);
  const [opponent, setOpponent] = useState<PlayerInfo | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for stable callbacks
  const matchRef = useRef(match);
  matchRef.current = match;
  
  // Derived state
  const myColor = match 
    ? (match.white_player_id === userId ? 'w' : match.black_player_id === userId ? 'b' : null)
    : null;
  const isMyTurn = match?.status === 'playing' && match.current_turn === myColor;

  // Fetch opponent profile
  const fetchOpponent = useCallback(async (opponentId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .eq('user_id', opponentId)
        .single();
      
      if (data) {
        setOpponent({
          id: data.user_id,
          nickname: data.nickname || 'Joueur',
          avatar_url: data.avatar_url,
        });
      }
    } catch (err) {
      console.error('Failed to fetch opponent:', err);
    }
  }, []);

  // Fetch chat messages
  const fetchChatMessages = useCallback(async (matchId: string) => {
    try {
      const { data } = await supabase
        .from('chess_match_chat')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (data) {
        setChatMessages(data as ChatMessage[]);
      }
    } catch (err) {
      console.error('Failed to fetch chat:', err);
    }
  }, []);

  // Refresh match data
  const refreshMatch = useCallback(async () => {
    if (!match?.id) return;
    
    try {
      const { data } = await supabase
        .from('chess_matches')
        .select('*')
        .eq('id', match.id)
        .single();
      
      if (data) {
        const typedMatch = data as unknown as ChessMatch;
        setMatch(typedMatch);
        
        // Fetch opponent if we have one
        const opponentId = userId === typedMatch.white_player_id 
          ? typedMatch.black_player_id 
          : typedMatch.white_player_id;
        if (opponentId && !opponent) {
          fetchOpponent(opponentId);
        }
      }
    } catch (err) {
      console.error('Failed to refresh match:', err);
    }
  }, [match?.id, userId, opponent, fetchOpponent]);

  // Subscribe to match updates
  useEffect(() => {
    if (!match?.id || !enabled) return;

    const channel = supabase
      .channel(`chess-match-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chess_matches',
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          const updatedMatch = payload.new as unknown as ChessMatch;
          setMatch(updatedMatch);
          
          // Check if opponent just joined
          if (updatedMatch.black_player_id && !opponent) {
            const opponentId = userId === updatedMatch.white_player_id 
              ? updatedMatch.black_player_id 
              : updatedMatch.white_player_id;
            if (opponentId) {
              fetchOpponent(opponentId);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chess_match_chat',
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setChatMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Fetch initial chat
    fetchChatMessages(match.id);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id, enabled, userId, opponent, fetchOpponent, fetchChatMessages]);

  // Create a new match
  const createMatch = useCallback(async (options: CreateMatchOptions): Promise<string | null> => {
    if (!userId) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inviteCode = generateInviteCode();
      const timePerPlayer = TIME_CONTROL_SECONDS[options.timeControl];

      const { data, error: insertError } = await supabase
        .from('chess_matches')
        .insert({
          white_player_id: userId,
          created_by: userId,
          time_control: options.timeControl,
          time_per_player: timePerPlayer,
          difficulty: options.difficulty || null,
          is_public: options.isPublic || false,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const typedMatch = data as unknown as ChessMatch;
      setMatch(typedMatch);
      
      toast({
        title: 'Partie créée!',
        description: `Code d'invitation: ${inviteCode}`,
      });

      return typedMatch.id;
    } catch (err: any) {
      const message = err?.message || 'Failed to create match';
      setError(message);
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Join match by ID
  const joinMatch = useCallback(async (matchId: string): Promise<boolean> => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('join_chess_match', {
        p_match_id: matchId,
        p_user_id: userId,
      });

      if (rpcError) throw rpcError;

      const result = data as { status: string; message: string; match_id?: string };
      
      if (result.status === 'error') {
        throw new Error(result.message);
      }

      // Fetch the updated match
      const { data: matchData } = await supabase
        .from('chess_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchData) {
        const typedMatch = matchData as unknown as ChessMatch;
        setMatch(typedMatch);
        
        // Fetch host profile
        if (typedMatch.white_player_id !== userId) {
          fetchOpponent(typedMatch.white_player_id);
        }
      }

      toast({
        title: 'Partie rejointe!',
        description: 'La partie commence!',
      });

      return true;
    } catch (err: any) {
      const message = err?.message || 'Failed to join match';
      setError(message);
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast, fetchOpponent]);

  // Join with invite code
  const joinWithCode = useCallback(async (code: string): Promise<{ success: boolean; matchId?: string; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find match by code
      const { data: matchData, error: findError } = await supabase
        .from('chess_matches')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (findError || !matchData) {
        return { success: false, error: 'Code invalide ou partie non disponible' };
      }

      const foundMatch = matchData as unknown as ChessMatch;

      if (foundMatch.white_player_id === userId) {
        return { success: false, error: 'Vous ne pouvez pas rejoindre votre propre partie' };
      }

      // Join the match
      const success = await joinMatch(foundMatch.id);
      
      if (success) {
        return { success: true, matchId: foundMatch.id };
      } else {
        return { success: false, error: 'Impossible de rejoindre la partie' };
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to join with code';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, joinMatch]);

  // Submit a move
  const submitMove = useCallback(async (
    from: string, 
    to: string, 
    newFen: string, 
    promotion?: string,
    timeRemaining?: number
  ): Promise<boolean> => {
    if (!match?.id || !userId) return false;

    try {
      const { data, error: rpcError } = await supabase.rpc('submit_chess_move', {
        p_match_id: match.id,
        p_user_id: userId,
        p_from_square: from,
        p_to_square: to,
        p_new_fen: newFen,
        p_promotion: promotion || null,
        p_time_remaining: timeRemaining ?? null,
      });

      if (rpcError) throw rpcError;

      const result = data as { status: string; message?: string };
      
      if (result.status === 'error') {
        toast({
          title: 'Coup invalide',
          description: result.message,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Failed to submit move:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de jouer ce coup',
        variant: 'destructive',
      });
      return false;
    }
  }, [match?.id, userId, toast]);

  // End the match
  const endMatch = useCallback(async (
    winnerId: string | null,
    result: string,
    reason: string
  ): Promise<void> => {
    if (!match?.id) return;

    try {
      await supabase.rpc('end_chess_match', {
        p_match_id: match.id,
        p_winner_id: winnerId,
        p_result: result,
        p_result_reason: reason,
      });
    } catch (err) {
      console.error('Failed to end match:', err);
    }
  }, [match?.id]);

  // Cancel match (before opponent joins)
  const cancelMatch = useCallback(async (): Promise<void> => {
    if (!match?.id) return;

    try {
      await supabase
        .from('chess_matches')
        .update({ status: 'cancelled' })
        .eq('id', match.id);
      
      setMatch(null);
      setOpponent(null);
      setChatMessages([]);
      
      toast({
        title: 'Partie annulée',
      });
    } catch (err) {
      console.error('Failed to cancel match:', err);
    }
  }, [match?.id, toast]);

  // Resign from match
  const resignMatch = useCallback(async (): Promise<void> => {
    if (!match?.id || !userId) return;

    const winnerId = userId === match.white_player_id 
      ? match.black_player_id 
      : match.white_player_id;
    const result = userId === match.white_player_id 
      ? 'black_wins' 
      : 'white_wins';

    await endMatch(winnerId, result, 'resignation');
    
    toast({
      title: 'Vous avez abandonné',
      description: 'La partie est terminée.',
    });
  }, [match?.id, match?.white_player_id, match?.black_player_id, userId, endMatch, toast]);

  // Send chat message
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!match?.id || !userId || !message.trim()) return;

    try {
      await supabase
        .from('chess_match_chat')
        .insert({
          match_id: match.id,
          sender_id: userId,
          message: message.trim(),
        });
    } catch (err) {
      console.error('Failed to send message:', err);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
        variant: 'destructive',
      });
    }
  }, [match?.id, userId, toast]);

  return {
    match,
    opponent,
    chatMessages,
    isLoading,
    error,
    createMatch,
    joinMatch,
    joinWithCode,
    cancelMatch,
    resignMatch,
    submitMove,
    endMatch,
    sendMessage,
    isMyTurn,
    myColor,
    refreshMatch,
  };
};
