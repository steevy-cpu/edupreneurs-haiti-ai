import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubjectDifficultySelector } from '@/components/quiz-battle/SubjectDifficultySelector';
import { OnlinePlayersBrowser } from '@/components/quiz-battle/OnlinePlayersBrowser';
import { SendInvitationDialog } from '@/components/quiz-battle/SendInvitationDialog';
import { useMultiplayerBattle, LobbyPhase } from '@/hooks/useMultiplayerBattle';
import { useQuizBattleSounds } from '@/hooks/useQuizBattleSounds';
import { OnlinePlayer } from '@/hooks/useOnlinePlayers';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Copy, 
  Users, 
  Loader2, 
  Check, 
  Swords,
  Clock,
  UserPlus,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LobbyStep = 'config' | 'waiting' | 'join-code' | 'browse-players';

const QuizBattleLobby = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') || 'friend') as 'friend' | 'random';
  const invitationId = searchParams.get('invitation');
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState<string | null>(null);
  const [step, setStep] = useState<LobbyStep>(mode === 'random' ? 'browse-players' : 'config');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Selected config
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // For random mode - invitation dialog
  const [selectedPlayer, setSelectedPlayer] = useState<OnlinePlayer | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // For revanche/invitation waiting mode
  const [isWaitingForInvitation, setIsWaitingForInvitation] = useState(!!invitationId);
  const [invitationRecipient, setInvitationRecipient] = useState<string | null>(null);
  const [invitationExpiresAt, setInvitationExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('academic_grade')
        .eq('user_id', user.id)
        .single();

      if (profile?.academic_grade) {
        setUserGrade(profile.academic_grade);
        setSelectedGrade(profile.academic_grade);
      }
    };

    checkAuth();
  }, [navigate]);

  // Multiplayer hook
  const multiplayer = useMultiplayerBattle({
    mode,
    userId: userId || '',
    gradeLevel: selectedGrade || '',
    subjectId: selectedSubject || '',
    difficulty: selectedDifficulty,
    enabled: !!userId && !!selectedSubject && step === 'waiting',
  });

  // Sounds hook for lobby music
  const { startLobbyMusic, stopLobbyMusic, isLobbyMusicPlaying, isMuted, toggleMute } = useQuizBattleSounds();

  // Start/stop lobby music based on waiting phase
  useEffect(() => {
    if (step === 'waiting' && (multiplayer.phase === 'waiting' || multiplayer.phase === 'matched')) {
      startLobbyMusic();
    } else {
      stopLobbyMusic();
    }
    
    return () => {
      stopLobbyMusic();
    };
  }, [step, multiplayer.phase, startLobbyMusic, stopLobbyMusic]);

  // Handle revanche/invitation waiting mode
  useEffect(() => {
    if (!invitationId || !userId) return;
    
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const fetchAndSubscribe = async () => {
      // Fetch invitation to get recipient name
      const { data: invitation, error } = await supabase
        .from('quiz_battle_invitations')
        .select('*, recipient:profiles!quiz_battle_invitations_recipient_id_fkey(nickname)')
        .eq('id', invitationId)
        .single();
      
      if (error || !invitation) {
        toast.error('Invitation introuvable');
        navigate('/quiz-battle');
        return;
      }
      
      // Set recipient name and expiry
      setInvitationRecipient((invitation.recipient as any)?.nickname || 'Adversaire');
      setInvitationExpiresAt(new Date(invitation.expires_at));
      
      // Check if already accepted
      if (invitation.status === 'accepted' && invitation.battle_id) {
        toast.success('Invitation acceptée!');
        navigate(`/quiz-battle/multiplayer/${invitation.battle_id}`);
        return;
      }
      
      // Check if expired or declined
      if (invitation.status === 'declined') {
        toast.error('Invitation refusée');
        navigate('/quiz-battle');
        return;
      }
      
      if (invitation.status === 'expired') {
        toast.error('Invitation expirée');
        navigate('/quiz-battle');
        return;
      }
      
      // Subscribe to invitation changes
      channel = supabase
        .channel(`invitation-sender-${invitationId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_battle_invitations',
          filter: `id=eq.${invitationId}`,
        }, (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'accepted' && updated.battle_id) {
            toast.success('Invitation acceptée!');
            navigate(`/quiz-battle/multiplayer/${updated.battle_id}`);
          } else if (updated.status === 'declined') {
            toast.error('Invitation refusée');
            navigate('/quiz-battle');
          } else if (updated.status === 'expired') {
            toast.error('Invitation expirée');
            navigate('/quiz-battle');
          }
        })
        .subscribe();
    };
    
    fetchAndSubscribe();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [invitationId, userId, navigate]);
  
  // Countdown timer for invitation expiry
  useEffect(() => {
    if (!invitationExpiresAt || !isWaitingForInvitation) return;
    
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((invitationExpiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);
      
      if (diff <= 0) {
        toast.error('Invitation expirée');
        navigate('/quiz-battle');
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [invitationExpiresAt, isWaitingForInvitation, navigate]);

  // Navigate to game when starting
  useEffect(() => {
    if (multiplayer.phase === 'starting' && multiplayer.battleId) {
      stopLobbyMusic();
      navigate(`/quiz-battle/multiplayer/${multiplayer.battleId}`);
    }
  }, [multiplayer.phase, multiplayer.battleId, navigate]);

  const handleStartSearch = async (subjectId: string, gradeLevel: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedSubject(subjectId);
    setSelectedGrade(gradeLevel);
    setSelectedDifficulty(difficulty);
    setStep('waiting');

    // Small delay to ensure state is set before hook activates
    setTimeout(() => {
      if (mode === 'random') {
        multiplayer.joinMatchmaking();
      } else {
        multiplayer.createPrivateBattle();
      }
    }, 100);
  };

  const handleJoinWithCode = async () => {
    if (joinCodeInput.length !== 6) {
      toast.error('Le code doit contenir 6 caractères');
      return;
    }

    const success = await multiplayer.joinWithCode(joinCodeInput);
    if (success) {
      setStep('waiting');
    }
  };

  const copyInviteCode = () => {
    if (multiplayer.inviteCode) {
      navigator.clipboard.writeText(multiplayer.inviteCode);
      setCopied(true);
      toast.success('Code copié!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    if (isWaitingForInvitation) {
      // Cancel the invitation if going back
      if (invitationId) {
        supabase
          .from('quiz_battle_invitations')
          .update({ status: 'cancelled' })
          .eq('id', invitationId)
          .then(() => {});
      }
      setIsWaitingForInvitation(false);
      navigate('/quiz-battle');
    } else if (step === 'waiting') {
      multiplayer.cancelBattle();
      setStep('config');
    } else if (step === 'join-code') {
      setStep('config');
    } else if (step === 'browse-players') {
      navigate('/quiz-battle');
    } else {
      navigate('/quiz-battle');
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectPlayer = (player: OnlinePlayer) => {
    setSelectedPlayer(player);
    setShowInviteDialog(true);
  };

  // Render different views based on step and mode
  const renderContent = () => {
    // Waiting for invitation response (Revanche mode)
    if (isWaitingForInvitation && invitationId) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Revanche envoyée</h1>
                <p className="text-muted-foreground">En attente de réponse</p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <div className="relative inline-block">
                <Loader2 className="w-20 h-20 animate-spin text-primary mx-auto" />
                <Swords className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">En attente de réponse</h3>
                <p className="text-muted-foreground">
                  Invitation envoyée à <span className="font-semibold text-foreground">{invitationRecipient || 'Adversaire'}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  La partie démarrera automatiquement dès qu'il accepte
                </p>
              </div>
              
              {/* Countdown timer */}
              {timeLeft > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                  <Clock className="w-4 h-4" />
                  <span>Expire dans: {formatTimeLeft(timeLeft)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleBack}
          >
            Annuler l'invitation
          </Button>
        </div>
      );
    }
    
    // Join code input screen
    if (step === 'join-code') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Rejoindre une partie</h1>
              <p className="text-muted-foreground">Entre le code d'invitation</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="XXXXXX"
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>
              <Button 
                className="w-full" 
                disabled={joinCodeInput.length !== 6}
                onClick={handleJoinWithCode}
              >
                Rejoindre
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Config/Setup screen
    if (step === 'config') {
      return (
        <div className="space-y-6">
          {mode === 'friend' && (
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate('/quiz-battle')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Mode Ami</h1>
                <p className="text-muted-foreground">Créer ou rejoindre une partie</p>
              </div>
            </div>
          )}

          {mode === 'friend' && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={() => setStep('join-code')}
                  >
                    <UserPlus className="w-8 h-8" />
                    <span>Rejoindre</span>
                  </Button>
                  <Button
                    className="h-24 flex flex-col gap-2"
                    onClick={() => {/* Continue to config below */}}
                    disabled
                  >
                    <Swords className="w-8 h-8" />
                    <span>Créer ↓</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <SubjectDifficultySelector
            defaultGrade={userGrade}
            onStart={handleStartSearch}
            onBack={() => navigate('/quiz-battle')}
          />
        </div>
      );
    }

    // Waiting screen
    if (step === 'waiting') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {mode === 'random' ? 'Recherche en cours' : 'En attente'}
                </h1>
                <p className="text-muted-foreground">
                  {multiplayer.phase === 'matched' || multiplayer.phase === 'ready'
                    ? 'Adversaire trouvé!'
                    : mode === 'random' 
                      ? 'Recherche d\'un adversaire...'
                      : 'Partage le code avec ton ami'}
                </p>
              </div>
            </div>
            {/* Mute button for lobby music */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          {/* Invite code for friend mode */}
          {mode === 'friend' && multiplayer.inviteCode && multiplayer.phase === 'waiting' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Code d'invitation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg cursor-pointer"
                  onClick={copyInviteCode}
                >
                  <span className="text-3xl font-mono tracking-widest">
                    {multiplayer.inviteCode}
                  </span>
                  <Button variant="ghost" size="icon">
                    {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Partage ce code avec ton ami pour qu'il puisse te rejoindre
                </p>
              </CardContent>
            </Card>
          )}

          {/* Waiting animation */}
          {(multiplayer.phase === 'waiting') && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="relative inline-block">
                  <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                  <Users className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <p className="mt-4 text-muted-foreground">
                  {mode === 'random' 
                    ? 'Recherche d\'un adversaire de même niveau...' 
                    : 'En attente de ton ami...'}
                </p>
                {mode === 'random' && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Timeout: 60s</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Opponent found */}
          {multiplayer.opponent && (multiplayer.phase === 'matched' || multiplayer.phase === 'ready') && (
            <Card className="border-success/50">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-success">
                      <AvatarImage src={multiplayer.opponent.avatar_url || undefined} />
                      <AvatarFallback>
                        {multiplayer.opponent.nickname?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg">{multiplayer.opponent.nickname}</p>
                      <p className="text-sm text-success">Adversaire trouvé!</p>
                    </div>
                  </div>
                  <Swords className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ready button */}
          {multiplayer.phase === 'matched' && (
            <Button 
              size="lg" 
              className="w-full"
              onClick={multiplayer.setReady}
            >
              <Check className="w-5 h-5 mr-2" />
              Je suis prêt!
            </Button>
          )}

          {/* Countdown */}
          {multiplayer.phase === 'ready' && (
            <Card className="bg-primary/10 border-primary">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">La partie commence dans</p>
                <div className="text-6xl font-bold text-primary animate-pulse">
                  {multiplayer.countdown}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancel button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleBack}
          >
            Annuler
          </Button>
        </div>
      );
    }

    // Browse online players screen (for random mode)
    if (step === 'browse-players') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Joueur Aléatoire</h1>
              <p className="text-muted-foreground">Choisis un adversaire en ligne</p>
            </div>
          </div>

          <OnlinePlayersBrowser
            currentUserId={userId}
            onSelectPlayer={handleSelectPlayer}
            selectedPlayerId={selectedPlayer?.user_id}
          />

          {/* Fallback option */}
          <Card className="border-dashed">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Pas de joueurs en ligne? Invite un ami!
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/quiz-battle/lobby?mode=friend')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter un ami
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  if (!userId) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {renderContent()}
      </div>

      {/* Send Invitation Dialog for random mode */}
      {userId && userGrade && (
        <SendInvitationDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          player={selectedPlayer}
          userId={userId}
          userGrade={userGrade}
        />
      )}
    </Layout>
  );
};

export default QuizBattleLobby;
