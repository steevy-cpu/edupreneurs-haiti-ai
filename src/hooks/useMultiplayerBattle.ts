import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from 'sonner';

export type LobbyPhase = 'setup' | 'waiting' | 'matched' | 'ready' | 'starting' | 'error';

interface OpponentInfo {
  id: string;
  nickname: string;
  avatar_url: string | null;
}

interface UseMultiplayerBattleOptions {
  mode: 'friend' | 'random';
  userId: string;
  gradeLevel: string;
  subjectId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  enabled?: boolean;
}

interface CreateBattleOptions {
  subjectId?: string;
  gradeLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface JoinWithCodeResult {
  success: boolean;
  subjectId?: string;
  gradeLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface UseMultiplayerBattleReturn {
  battleId: string | null;
  inviteCode: string | null;
  opponent: OpponentInfo | null;
  phase: LobbyPhase;
  isHost: boolean;
  bothReady: boolean;
  countdown: number;
  
  createPrivateBattle: (options?: CreateBattleOptions) => Promise<void>;
  joinWithCode: (code: string) => Promise<JoinWithCodeResult>;
  joinMatchmaking: (options?: CreateBattleOptions) => Promise<void>;
  leaveMatchmaking: () => void;
  setReady: () => Promise<void>;
  cancelBattle: () => Promise<void>;
}

// Client-side invite code generation removed — now uses DB RPC for uniqueness guarantees

export const useMultiplayerBattle = ({
  mode,
  userId,
  gradeLevel,
  subjectId,
  difficulty,
  enabled = true,
}: UseMultiplayerBattleOptions): UseMultiplayerBattleReturn => {
  const [battleId, setBattleId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<OpponentInfo | null>(null);
  const [phase, setPhase] = useState<LobbyPhase>('setup');
  const phaseRef = useRef<LobbyPhase>('setup');
  const [isHost, setIsHost] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const matchmakingIdRef = useRef<string | null>(null);
  const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Helper to update phase consistently (prevents stale closures in timeouts)
  const updatePhase = useCallback((newPhase: LobbyPhase) => {
    phaseRef.current = newPhase;
    setPhase(newPhase);
  }, []);

  // Subscribe to battle player changes when we have a battle
  useRealtimeSubscription({
    table: 'quiz_battle_players',
    event: '*',
    filter: battleId ? `battle_id=eq.${battleId}` : undefined,
    callback: async (payload) => {
      
      if (payload.eventType === 'INSERT' && payload.new.user_id !== userId) {
        // Opponent joined
        await fetchOpponentInfo(payload.new.user_id);
        updatePhase('matched');
      }
      
      if (payload.eventType === 'UPDATE') {
        const player = payload.new as any;
        if (player.user_id === userId) {
          setMyReady(player.is_ready);
        } else {
          setOpponentReady(player.is_ready);
          // Handle missed INSERT: if we get UPDATE but don't have opponent info, fetch it
          if (!opponent) {
            await fetchOpponentInfo(player.user_id);
            updatePhase('matched');
          }
        }
      }
    },
    enabled: enabled && !!battleId,
  });

  // Subscribe to matchmaking changes for random mode
  useRealtimeSubscription({
    table: 'quiz_battle_matchmaking',
    event: 'UPDATE',
    filter: matchmakingIdRef.current ? `id=eq.${matchmakingIdRef.current}` : undefined,
    callback: async (payload) => {
      const record = payload.new as any;
      
      if (record.matched_with && record.battle_id) {
        setBattleId(record.battle_id);
        await fetchOpponentInfo(record.matched_with);
        updatePhase('matched');
        setIsHost(false);
      }
    },
    enabled: enabled && mode === 'random' && !!matchmakingIdRef.current,
  });

  // Check if both players are ready - allow transition from 'waiting' or 'matched'
  useEffect(() => {
    if (myReady && opponentReady && (phase === 'matched' || phase === 'waiting')) {
      setBothReady(true);
      updatePhase('ready');
    }
  }, [myReady, opponentReady, phase, updatePhase]);

  // Countdown when both ready
  useEffect(() => {
    if (phase !== 'ready') return;
    
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(interval);
        updatePhase('starting');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const fetchOpponentInfo = useCallback(async (opponentId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, nickname, avatar_url')
      .eq('user_id', opponentId)
      .single();

    if (profile) {
      setOpponent({
        id: profile.user_id,
        nickname: profile.nickname,
        avatar_url: profile.avatar_url,
      });
    }
  }, []);

  // Sync player states from database - fallback for missed realtime events
  const syncPlayerStates = useCallback(async () => {
    if (!battleId || !userId) return;
    
    const { data: players } = await supabase
      .from('quiz_battle_players')
      .select('user_id, is_ready')
      .eq('battle_id', battleId);
    
    if (players) {
      for (const player of players) {
        if (player.user_id === userId) {
          setMyReady(player.is_ready);
        } else {
          setOpponentReady(player.is_ready);
          // Also fetch opponent info if not already set
          if (!opponent) {
            await fetchOpponentInfo(player.user_id);
            updatePhase('matched');
          }
        }
      }
    }
  }, [battleId, userId, opponent, fetchOpponentInfo]);

  // Sync player states when battleId changes
  useEffect(() => {
    if (battleId) {
      syncPlayerStates();
    }
  }, [battleId, syncPlayerStates]);

  // Polling fallback for ready state - catches missed realtime events on slow 3G connections
  useEffect(() => {
    if (!battleId || phase === 'setup' || phase === 'starting' || phase === 'error') return;
    
    // Poll every 3 seconds as fallback for missed realtime events
    const pollInterval = setInterval(() => {
      syncPlayerStates();
    }, 3000);
    
    return () => clearInterval(pollInterval);
  }, [battleId, phase, syncPlayerStates]);

  const createPrivateBattle = useCallback(async (options?: { subjectId?: string; gradeLevel?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => {
    const subj = options?.subjectId || subjectId;
    const grade = options?.gradeLevel || gradeLevel;
    const diff = options?.difficulty || difficulty;
    
    if (!userId || !subj) {
      console.error('[Multiplayer] Missing userId or subjectId', { userId, subj });
      return;
    }
    
    updatePhase('waiting');
    setIsHost(true);
    
    try {
      // Generate invite code server-side for uniqueness guarantees
      const { data: code } = await supabase.rpc('generate_invite_code');
      
      // Create battle
      const { data: battle, error } = await supabase
        .from('quiz_battles')
        .insert({
          mode: 'friend',
          status: 'waiting',
          subject_id: subj,
          grade_level: grade,
          difficulty: diff,
          created_by: userId,
          invite_code: code,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Add host as player
      await supabase
        .from('quiz_battle_players')
        .insert({
          battle_id: battle.id,
          user_id: userId,
          is_ready: false,
        });

      setBattleId(battle.id);
      setInviteCode(code);
    } catch (error) {
      console.error('Error creating private battle:', error);
      toast.error('Erreur lors de la création de la partie');
      updatePhase('error');
    }
  }, [userId, subjectId, gradeLevel, difficulty]);

  const joinWithCode = useCallback(async (code: string): Promise<JoinWithCodeResult> => {
    if (!userId) return { success: false };
    
    try {
      // Find battle with this code
      const { data: battle, error } = await supabase
        .from('quiz_battles')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (error || !battle) {
        toast.error('Code invalide ou partie introuvable');
        return { success: false };
      }

      // Prevent user from joining their own battle
      if (battle.created_by === userId) {
        toast.error('Tu ne peux pas rejoindre ta propre partie. Utilise un autre compte.');
        return { success: false };
      }

      // Check if already full
      const { data: players } = await supabase
        .from('quiz_battle_players')
        .select('id')
        .eq('battle_id', battle.id);

      if (players && players.length >= 2) {
        toast.error('Cette partie est déjà complète');
        return { success: false };
      }

      // Join as second player - use .select() to confirm insertion immediately
      const { data: insertedPlayer, error: insertError } = await supabase
        .from('quiz_battle_players')
        .insert({
          battle_id: battle.id,
          user_id: userId,
          is_ready: false,
        })
        .select('id')
        .single();

      if (insertError) {
        // Handle duplicate key error - user might have already joined this battle
        if (insertError.code === '23505') {
          // Double-check if this is the host trying to join (shouldn't happen with above check)
          if (battle.created_by === userId) {
            toast.error('Tu ne peux pas rejoindre ta propre partie');
            return { success: false };
          }
        } else {
          console.error('[Multiplayer] Failed to join battle:', insertError);
          toast.error('Erreur de connexion. Réessaye.');
          return { success: false };
        }
      }

      // Check if INSERT actually returned data (3G safety net)
      if (!insertError && !insertedPlayer) {
        console.error('[Multiplayer] INSERT returned no data - silent failure, retrying...');
        // Retry insertion once
        const { data: retryPlayer, error: retryError } = await supabase
          .from('quiz_battle_players')
          .insert({
            battle_id: battle.id,
            user_id: userId,
            is_ready: false,
          })
          .select('id')
          .single();
          
        if (retryError && retryError.code !== '23505') {
          console.error('[Multiplayer] Retry INSERT also failed:', retryError);
          toast.error('Erreur de connexion. Réessaye.');
          return { success: false };
        }
      }

      // Verify the player exists in the battle (either just inserted or already there)
      const { data: verifyPlayer, error: verifyError } = await supabase
        .from('quiz_battle_players')
        .select('id')
        .eq('battle_id', battle.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (verifyError || !verifyPlayer) {
        console.error('[Multiplayer] Player verification failed:', verifyError);
        toast.error('Erreur de connexion. Réessaye.');
        return { success: false };
      }


      // Fetch host info
      await fetchOpponentInfo(battle.created_by);

      setBattleId(battle.id);
      setInviteCode(code);
      setIsHost(false);
      updatePhase('matched');
      
      
      // Force sync after a short delay to catch any missed realtime events
      setTimeout(() => {
        syncPlayerStates();
      }, 1000);
      return {
        success: true,
        subjectId: battle.subject_id,
        gradeLevel: battle.grade_level,
        difficulty: battle.difficulty as 'easy' | 'medium' | 'hard',
      };
    } catch (error) {
      console.error('Error joining with code:', error);
      toast.error('Erreur lors de la connexion à la partie');
      return { success: false };
    }
  }, [userId, fetchOpponentInfo]);

  const leaveMatchmaking = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    matchmakingIdRef.current = null;
    updatePhase('setup');
  }, [updatePhase]);

  const joinMatchmaking = useCallback(async (options?: CreateBattleOptions) => {
    const subj = options?.subjectId || subjectId;
    const grade = options?.gradeLevel || gradeLevel;
    const diff = options?.difficulty || difficulty;
    
    if (!userId || !subj) {
      console.error('[Multiplayer] Missing userId or subjectId', { userId, subj });
      return;
    }
    
    updatePhase('waiting');
    
    try {
      // Server-side cleanup of stale/orphaned games before matchmaking — fire-and-forget
      try { await supabase.rpc('cleanup_stale_games'); } catch (err) {
        console.error('[Multiplayer] Cleanup RPC failed:', err);
      }

      // Check for existing opponent waiting
      const { data: existingMatch } = await supabase
        .from('quiz_battle_matchmaking')
        .select('*')
        .eq('grade_level', grade)
        .eq('subject_id', subj)
        .eq('difficulty', diff)
        .is('matched_with', null)
        .neq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existingMatch) {
        // Found a match! Create battle and link both players
        
        const { data: battle, error: battleError } = await supabase
          .from('quiz_battles')
          .insert({
            mode: 'random',
            status: 'waiting',
            subject_id: subj,
            grade_level: grade,
            difficulty: diff,
            created_by: existingMatch.user_id,
          } as any)
          .select()
          .single();

        if (battleError) throw battleError;

        // Add both players
        await supabase
          .from('quiz_battle_players')
          .insert([
            { battle_id: battle.id, user_id: existingMatch.user_id, is_ready: false },
            { battle_id: battle.id, user_id: userId, is_ready: false },
          ]);

        // Update matchmaking record for opponent
        await supabase
          .from('quiz_battle_matchmaking')
          .update({
            matched_with: userId,
            battle_id: battle.id,
          })
          .eq('id', existingMatch.id);

        setBattleId(battle.id);
        await fetchOpponentInfo(existingMatch.user_id);
        updatePhase('matched');
        setIsHost(false);
      } else {
        // No match found, add to queue
        const expiresAt = new Date(Date.now() + 60000); // 60 seconds
        
        const { data: queueEntry, error } = await supabase
          .from('quiz_battle_matchmaking')
          .insert({
            user_id: userId,
            grade_level: grade,
            subject_id: subj,
            difficulty: diff,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        matchmakingIdRef.current = queueEntry.id;
        
        // Set timeout for expiry
        cleanupRef.current = () => {
          if (matchmakingTimeoutRef.current) {
            clearTimeout(matchmakingTimeoutRef.current);
            matchmakingTimeoutRef.current = null;
          }
          if (matchmakingIdRef.current) {
            supabase
              .from('quiz_battle_matchmaking')
              .delete()
              .eq('id', matchmakingIdRef.current)
              .then(() => {});
          }
        };
        
        matchmakingTimeoutRef.current = setTimeout(() => {
          // Use ref to check current phase, not stale closure value
          if (phaseRef.current === 'waiting') {
            toast.info('Aucun adversaire trouvé. Réessaye ou joue en solo!');
            leaveMatchmaking();
            updatePhase('setup');
          }
        }, 60000);
      }
    } catch (error) {
      console.error('Error joining matchmaking:', error);
      toast.error('Erreur lors de la recherche d\'adversaire');
      updatePhase('error');
    }
  }, [userId, subjectId, gradeLevel, difficulty, updatePhase, leaveMatchmaking, fetchOpponentInfo]);


  const setReady = useCallback(async () => {
    if (!battleId || !userId) return;
    
    try {
      const { error } = await supabase
        .from('quiz_battle_players')
        .update({ is_ready: true })
        .eq('battle_id', battleId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('[Multiplayer] Error setting ready:', error);
        toast.error('Erreur de connexion. Réessaye.');
        return;
      }
      
      // Verify the update worked (3G safety net)
      const { data: verifyReady, error: verifyError } = await supabase
        .from('quiz_battle_players')
        .select('is_ready')
        .eq('battle_id', battleId)
        .eq('user_id', userId)
        .single();
      
      if (verifyError || !verifyReady?.is_ready) {
        console.error('[Multiplayer] Ready verification failed');
        toast.error('Erreur de connexion. Réessaye.');
        return;
      }
      
      setMyReady(true);
    } catch (error) {
      console.error('Error setting ready:', error);
      toast.error('Erreur de connexion. Réessaye.');
    }
  }, [battleId, userId]);

  const cancelBattle = useCallback(async () => {
    if (matchmakingIdRef.current) {
      await supabase
        .from('quiz_battle_matchmaking')
        .delete()
        .eq('id', matchmakingIdRef.current);
    }
    
    if (battleId) {
      await supabase
        .from('quiz_battles')
        .update({ status: 'cancelled' })
        .eq('id', battleId);
    }
    
    setBattleId(null);
    setInviteCode(null);
    setOpponent(null);
    updatePhase('setup');
    setMyReady(false);
    setOpponentReady(false);
    matchmakingIdRef.current = null;
  }, [battleId, updatePhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    battleId,
    inviteCode,
    opponent,
    phase,
    isHost,
    bothReady,
    countdown,
    createPrivateBattle,
    joinWithCode,
    joinMatchmaking,
    leaveMatchmaking,
    setReady,
    cancelBattle,
  };
};
