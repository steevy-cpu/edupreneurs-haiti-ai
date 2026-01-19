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
  sender?: { nickname: string; avatar_url: string | null };
  subject?: { name: string };
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

// Helper to access the new table (types will auto-update after migration sync)
const invitationsTable = () => (supabase as any).from('quiz_battle_invitations');

export const useQuizInvitations = ({ userId, enabled = true }: UseQuizInvitationsOptions) => {
  const [pendingInvitations, setPendingInvitations] = useState<QuizInvitation[]>([]);
  const [sentInvitation, setSentInvitation] = useState<QuizInvitation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchPendingInvitations = useCallback(async () => {
    if (!userId || !enabled) return;

    const { data, error } = await invitationsTable()
      .select('*, sender:profiles!quiz_battle_invitations_sender_id_fkey(nickname, avatar_url), subject:subjects!quiz_battle_invitations_subject_id_fkey(name)')
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching invitations:', error); return; }

    const invitations = (data || []).map((inv: any) => ({
      ...inv,
      sender: Array.isArray(inv.sender) ? inv.sender[0] : inv.sender,
      subject: Array.isArray(inv.subject) ? inv.subject[0] : inv.subject,
    }));
    setPendingInvitations(invitations);
  }, [userId, enabled]);

  const fetchSentInvitation = useCallback(async () => {
    if (!userId || !enabled) return;

    const { data, error } = await invitationsTable()
      .select('*')
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) { console.error('Error fetching sent invitation:', error); return; }
    setSentInvitation(data);
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
      const { data: existing } = await invitationsTable().select('id').eq('sender_id', userId).eq('recipient_id', recipientId).eq('status', 'pending').maybeSingle();
      if (existing) { toast.error('Invitation déjà en attente'); setIsSending(false); return null; }

      const { data: hasActive } = await supabase.rpc('user_has_active_battle', { p_user_id: userId });
      if (hasActive) { toast.error('Vous êtes déjà en partie'); setIsSending(false); return null; }

      const { data: invitation, error } = await invitationsTable().insert({ sender_id: userId, recipient_id: recipientId, subject_id: config.subjectId, grade_level: config.gradeLevel, difficulty: config.difficulty }).select().single();
      if (error) { toast.error('Erreur d\'envoi'); setIsSending(false); return null; }

      await supabase.from('notifications').insert({ user_id: recipientId, actor_id: userId, type: 'quiz_invite', content: invitation.id, read: false });

      setSentInvitation(invitation);
      toast.success(`Invitation envoyée à ${recipientNickname}!`);
      setIsSending(false);
      return invitation;
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
    const { error } = await invitationsTable().update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', invitationId).eq('recipient_id', userId);
    if (error) { toast.error('Erreur'); return false; }
    setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.info('Invitation refusée');
    return true;
  }, [userId]);

  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!userId) return false;
    const { error } = await invitationsTable().update({ status: 'cancelled' }).eq('id', invitationId).eq('sender_id', userId);
    if (error) { toast.error('Erreur'); return false; }
    setSentInvitation(null);
    toast.info('Invitation annulée');
    return true;
  }, [userId]);

  return { pendingInvitations, sentInvitation, isSending, isAccepting, sendInvitation, acceptInvitation, declineInvitation, cancelInvitation, refreshInvitations: fetchPendingInvitations };
};
