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

interface UseMultiplayerBattleReturn {
  battleId: string | null;
  inviteCode: string | null;
  opponent: OpponentInfo | null;
  phase: LobbyPhase;
  isHost: boolean;
  bothReady: boolean;
  countdown: number;
  
  createPrivateBattle: (options?: CreateBattleOptions) => Promise<void>;
  joinWithCode: (code: string) => Promise<boolean>;
  joinMatchmaking: (options?: CreateBattleOptions) => Promise<void>;
  leaveMatchmaking: () => void;
  setReady: () => Promise<void>;
  cancelBattle: () => Promise<void>;
}

// Generate a 6-character invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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
  const [isHost, setIsHost] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const matchmakingIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Subscribe to battle player changes when we have a battle
  useRealtimeSubscription({
    table: 'quiz_battle_players',
    event: '*',
    filter: battleId ? `battle_id=eq.${battleId}` : undefined,
    callback: async (payload) => {
      console.log('[Multiplayer] Player update:', payload);
      
      if (payload.eventType === 'INSERT' && payload.new.user_id !== userId) {
        // Opponent joined
        await fetchOpponentInfo(payload.new.user_id);
        setPhase('matched');
      }
      
      if (payload.eventType === 'UPDATE') {
        const player = payload.new as any;
        if (player.user_id === userId) {
          setMyReady(player.is_ready);
        } else {
          setOpponentReady(player.is_ready);
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
      console.log('[Multiplayer] Matchmaking update:', payload);
      const record = payload.new as any;
      
      if (record.matched_with && record.battle_id) {
        setBattleId(record.battle_id);
        await fetchOpponentInfo(record.matched_with);
        setPhase('matched');
        setIsHost(false);
      }
    },
    enabled: enabled && mode === 'random' && !!matchmakingIdRef.current,
  });

  // Check if both players are ready
  useEffect(() => {
    if (myReady && opponentReady && phase === 'matched') {
      setBothReady(true);
      setPhase('ready');
    }
  }, [myReady, opponentReady, phase]);

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
        setPhase('starting');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const fetchOpponentInfo = async (opponentId: string) => {
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
  };

  const createPrivateBattle = useCallback(async (options?: { subjectId?: string; gradeLevel?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => {
    const subj = options?.subjectId || subjectId;
    const grade = options?.gradeLevel || gradeLevel;
    const diff = options?.difficulty || difficulty;
    
    if (!userId || !subj) {
      console.error('[Multiplayer] Missing userId or subjectId', { userId, subj });
      return;
    }
    
    setPhase('waiting');
    setIsHost(true);
    
    try {
      const code = generateInviteCode();
      
      // Create battle
      const { data: battle, error } = await supabase
        .from('quiz_battles')
        .insert({
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
      console.log('[Multiplayer] Created private battle:', battle.id, 'Code:', code);
    } catch (error) {
      console.error('Error creating private battle:', error);
      toast.error('Erreur lors de la création de la partie');
      setPhase('error');
    }
  }, [userId, subjectId, gradeLevel, difficulty]);

  const joinWithCode = useCallback(async (code: string): Promise<boolean> => {
    if (!userId) return false;
    
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
        return false;
      }

      // Check if already full
      const { data: players } = await supabase
        .from('quiz_battle_players')
        .select('id')
        .eq('battle_id', battle.id);

      if (players && players.length >= 2) {
        toast.error('Cette partie est déjà complète');
        return false;
      }

      // Join as second player
      await supabase
        .from('quiz_battle_players')
        .insert({
          battle_id: battle.id,
          user_id: userId,
          is_ready: false,
        });

      // Fetch host info
      await fetchOpponentInfo(battle.created_by);

      setBattleId(battle.id);
      setInviteCode(code);
      setIsHost(false);
      setPhase('matched');
      
      console.log('[Multiplayer] Joined battle:', battle.id);
      return true;
    } catch (error) {
      console.error('Error joining with code:', error);
      toast.error('Erreur lors de la connexion à la partie');
      return false;
    }
  }, [userId]);

  const joinMatchmaking = useCallback(async (options?: CreateBattleOptions) => {
    const subj = options?.subjectId || subjectId;
    const grade = options?.gradeLevel || gradeLevel;
    const diff = options?.difficulty || difficulty;
    
    if (!userId || !subj) {
      console.error('[Multiplayer] Missing userId or subjectId', { userId, subj });
      return;
    }
    
    setPhase('waiting');
    
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      // 1. Cleanup stale 'waiting' battles (>5min)
      const { data: staleWaiting } = await supabase
        .from('quiz_battle_players')
        .select('battle_id, quiz_battles!inner(status, created_at, questions)')
        .eq('user_id', userId)
        .eq('quiz_battles.status', 'waiting')
        .lt('quiz_battles.created_at', fiveMinutesAgo);
      
      const staleWaitingIds = (staleWaiting || []).map((b: any) => b.battle_id);
      
      // 2. Cleanup stale 'in_progress' battles (>10min with no recent activity)
      const { data: staleInProgress } = await supabase
        .from('quiz_battle_players')
        .select('battle_id, quiz_battles!inner(status, created_at, round_started_at)')
        .eq('user_id', userId)
        .eq('quiz_battles.status', 'in_progress')
        .lt('quiz_battles.created_at', tenMinutesAgo);
      
      const stuckInProgressIds = (staleInProgress || [])
        .filter((b: any) => {
          const roundStarted = b.quiz_battles?.round_started_at;
          return !roundStarted || new Date(roundStarted) < new Date(fiveMinutesAgo);
        })
        .map((b: any) => b.battle_id);
      
      // 3. Check for orphaned battles (only 1 player left)
      const { data: orphanedBattles } = await supabase
        .from('quiz_battles')
        .select('id, status, created_at, quiz_battle_players(user_id)')
        .eq('status', 'in_progress')
        .lt('created_at', fiveMinutesAgo);
      
      const orphanedIds = (orphanedBattles || [])
        .filter((b: any) => 
          b.quiz_battle_players?.length === 1 && 
          b.quiz_battle_players[0].user_id === userId
        )
        .map((b: any) => b.id);
      
      // Combine and dedupe all stale IDs
      const allStaleIds = [...new Set([...staleWaitingIds, ...stuckInProgressIds, ...orphanedIds])];
      
      if (allStaleIds.length > 0) {
        await supabase
          .from('quiz_battles')
          .update({ status: 'cancelled', ended_at: new Date().toISOString() })
          .in('id', allStaleIds);
        console.log('[Multiplayer] Cleaned up stale battles before matchmaking:', allStaleIds);
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
        console.log('[Multiplayer] Found existing match:', existingMatch.user_id);
        
        const { data: battle, error: battleError } = await supabase
          .from('quiz_battles')
          .insert({
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
        setPhase('matched');
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
        console.log('[Multiplayer] Added to matchmaking queue:', queueEntry.id);
        
        // Set timeout for expiry
        cleanupRef.current = () => {
          if (matchmakingIdRef.current) {
            supabase
              .from('quiz_battle_matchmaking')
              .delete()
              .eq('id', matchmakingIdRef.current)
              .then(() => console.log('[Multiplayer] Cleaned up matchmaking entry'));
          }
        };
        
        setTimeout(() => {
          if (phase === 'waiting') {
            toast.info('Aucun adversaire trouvé. Réessaye ou joue en solo!');
            leaveMatchmaking();
            setPhase('setup');
          }
        }, 60000);
      }
    } catch (error) {
      console.error('Error joining matchmaking:', error);
      toast.error('Erreur lors de la recherche d\'adversaire');
      setPhase('error');
    }
  }, [userId, subjectId, gradeLevel, difficulty, phase]);

  const leaveMatchmaking = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    matchmakingIdRef.current = null;
    setPhase('setup');
  }, []);

  const setReady = useCallback(async () => {
    if (!battleId || !userId) return;
    
    try {
      await supabase
        .from('quiz_battle_players')
        .update({ is_ready: true })
        .eq('battle_id', battleId)
        .eq('user_id', userId);
      
      setMyReady(true);
      console.log('[Multiplayer] Set ready');
    } catch (error) {
      console.error('Error setting ready:', error);
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
    setPhase('setup');
    setMyReady(false);
    setOpponentReady(false);
    matchmakingIdRef.current = null;
  }, [battleId]);

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
