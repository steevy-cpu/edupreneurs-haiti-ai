import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuizInvitation {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject_id: string;
  grade_level: string;
  difficulty: 'easy' | 'medium' | 'hard';
  battle_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  sender?: { nickname: string; avatar_url: string | null } | null;
  subject?: { name: string } | null;
}

interface InvitationConfig {
  subjectId: string;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UseQuizInvitationsOptions {
  userId: string | null;
  enabled?: boolean;
}

export const useQuizInvitations = ({ userId, enabled = true }: UseQuizInvitationsOptions) => {
  const [pendingInvitations, setPendingInvitations] = useState<QuizInvitation[]>([]);
  const [sentInvitation, setSentInvitation] = useState<QuizInvitation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Server-side cleanup of stale/orphaned games — replaces fragmented client logic
  const cleanupStaleBattles = useCallback(async (): Promise<void> => {
    if (!userId) return;
    try {
      await supabase.rpc('cleanup_stale_games');
      console.log('[QuizInvitations] Server-side stale games cleanup completed');
    } catch (err) {
      console.error('[QuizInvitations] Cleanup RPC failed:', err);
    }
  }, [userId]);

  // Batched fetch: 3 queries total instead of 2N+1 (profiles + subjects fetched via .in())
  const fetchPendingInvitations = useCallback(async () => {
    if (!userId || !enabled) return;

    const { data, error } = await supabase
      .from('quiz_battle_invitations')
      .select('*')
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching invitations:', error); return; }
    if (!data || data.length === 0) { setPendingInvitations([]); return; }

    // Collect unique IDs for batch lookup
    const senderIds = [...new Set(data.map(inv => inv.sender_id))];
    const subjectIds = [...new Set(data.map(inv => inv.subject_id))];

    // Batch fetch all needed profiles and subjects in 2 queries
    const [profilesRes, subjectsRes] = await Promise.all([
      supabase.from('profiles').select('user_id, nickname, avatar_url').in('user_id', senderIds),
      supabase.from('subjects').select('id, name').in('id', subjectIds),
    ]);

    // Build lookup maps for O(1) access
    const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
    const subjectMap = new Map((subjectsRes.data || []).map(s => [s.id, s]));

    // Map results back — no extra queries needed
    const invitationsWithDetails = data.map(inv => ({
      ...inv,
      sender: profileMap.get(inv.sender_id) || null,
      subject: subjectMap.get(inv.subject_id) || null,
    }));
    setPendingInvitations(invitationsWithDetails as QuizInvitation[]);

  }, [userId, enabled]);

  const fetchSentInvitation = useCallback(async () => {
    if (!userId || !enabled) return;

    const { data, error } = await supabase
      .from('quiz_battle_invitations')
      .select('*')
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) { console.error('Error fetching sent invitation:', error); return; }
    setSentInvitation(data as QuizInvitation | null);
  }, [userId, enabled]);

  useEffect(() => {
    if (!userId || !enabled) return;
    fetchPendingInvitations();
    fetchSentInvitation();

    const channel = supabase
      .channel('quiz-invitations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_battle_invitations', filter: `recipient_id=eq.${userId}` }, () => fetchPendingInvitations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_battle_invitations', filter: `sender_id=eq.${userId}` }, (payload) => {
        const newData = payload.new as QuizInvitation;
        if (newData?.status === 'accepted') { toast.success('Invitation acceptée!'); setSentInvitation(newData); }
        else if (newData?.status === 'declined') { toast.info('Invitation refusée'); setSentInvitation(null); }
        else if (newData?.status === 'expired') { toast.info('Invitation expirée'); setSentInvitation(null); }
        else fetchSentInvitation();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, enabled, fetchPendingInvitations, fetchSentInvitation]);

  const sendInvitation = useCallback(async (recipientId: string, recipientNickname: string, config: InvitationConfig): Promise<QuizInvitation | null> => {
    if (!userId) { toast.error('Vous devez être connecté'); return null; }
    setIsSending(true);

    try {
      const { data: existing } = await supabase.from('quiz_battle_invitations').select('id').eq('sender_id', userId).eq('recipient_id', recipientId).eq('status', 'pending').maybeSingle();
      if (existing) { toast.error('Invitation déjà en attente'); setIsSending(false); return null; }

      // Check for active battle
      let { data: hasActive } = await supabase.rpc('user_has_active_battle', { p_user_id: userId });
      
      if (hasActive) { 
        // Try cleanup of stale battles first
        await cleanupStaleBattles();
        
        // Re-check after cleanup
        const { data: stillActive } = await supabase.rpc('user_has_active_battle', { p_user_id: userId });
        if (stillActive) {
          toast.error('Vous êtes déjà en partie'); 
          setIsSending(false); 
          return null; 
        }
      }

      const { data: invitation, error } = await supabase.from('quiz_battle_invitations').insert({ sender_id: userId, recipient_id: recipientId, subject_id: config.subjectId, grade_level: config.gradeLevel, difficulty: config.difficulty }).select().single();
      if (error) { toast.error('Erreur d\'envoi'); setIsSending(false); return null; }

      await supabase.from('notifications').insert({ user_id: recipientId, actor_id: userId, type: 'quiz_invite', content: invitation.id, read: false });

      // Fire-and-forget push notification — body auto-generated by edge function from actorId
      supabase.functions.invoke('send-push-notification', {
        body: {
          recipientUserId: recipientId,
          title: 'Défi Quiz reçu! 🧠',
          type: 'quiz_invite',
          url: '/quiz-battle',
          actorId: userId,
        },
      }).catch(err => console.error('[QuizInvitations] Push notify failed:', err));

      // Cast to QuizInvitation — DB returns string for difficulty but our type uses union
      setSentInvitation(invitation as unknown as QuizInvitation);
      toast.success(`Invitation envoyée à ${recipientNickname}!`);
      setIsSending(false);
      return invitation as unknown as QuizInvitation;
    } catch { toast.error('Erreur'); setIsSending(false); return null; }
  }, [userId]);

  const acceptInvitation = useCallback(async (invitationId: string): Promise<string | null> => {
    if (!userId) return null;
    setIsAccepting(true);
    try {
      const { data: battleId, error } = await supabase.rpc('accept_quiz_invitation', { p_invitation_id: invitationId });
      if (error) { toast.error(error.message); setIsAccepting(false); return null; }
      toast.success('Invitation acceptée!');
      setIsAccepting(false);
      return battleId;
    } catch (err: any) { toast.error(err.message); setIsAccepting(false); return null; }
  }, [userId]);

  const declineInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!userId) return false;
    const { error } = await supabase.from('quiz_battle_invitations').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', invitationId).eq('recipient_id', userId);
    if (error) { toast.error('Erreur'); return false; }
    setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.info('Invitation refusée');
    return true;
  }, [userId]);

  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!userId) return false;
    const { error } = await supabase.from('quiz_battle_invitations').update({ status: 'cancelled' }).eq('id', invitationId).eq('sender_id', userId);
    if (error) { toast.error('Erreur'); return false; }
    setSentInvitation(null);
    toast.info('Invitation annulée');
    return true;
  }, [userId]);

  return { pendingInvitations, sentInvitation, isSending, isAccepting, sendInvitation, acceptInvitation, declineInvitation, cancelInvitation, refreshInvitations: fetchPendingInvitations, cleanupStaleBattles };
};
