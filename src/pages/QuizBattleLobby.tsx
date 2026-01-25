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
  VolumeX,
  Link,
  Share2,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Social media icons
const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

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
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  
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
  
  // For friend mode timer (5 minutes)
  const [friendModeTimeLeft, setFriendModeTimeLeft] = useState<number>(300);
  const [friendModeExpiresAt, setFriendModeExpiresAt] = useState<Date | null>(null);
  
  // For link sharing
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Get joinCode from URL params for auto-join
  const joinCodeFromUrl = searchParams.get('joinCode');

  // Check auth - preserve current URL for redirect after login
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Preserve the full URL including query params (joinCode, mode, etc.)
        const currentUrl = window.location.pathname + window.location.search;
        // Save to sessionStorage to survive page refresh during auth flow
        sessionStorage.setItem('quiz_battle_return_url', currentUrl);
        navigate('/auth/login', { state: { returnTo: currentUrl } });
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

  // Multiplayer hook - enable subscription earlier for join-code step to catch INSERT events
  const multiplayer = useMultiplayerBattle({
    mode,
    userId: userId || '',
    gradeLevel: selectedGrade || '',
    subjectId: selectedSubject || '',
    difficulty: selectedDifficulty,
    enabled: !!userId && (step === 'waiting' || step === 'join-code'),
  });

  // Sounds hook for lobby music
  const { startLobbyMusic, stopLobbyMusic, transitionToGame, isLobbyMusicPlaying, isMuted, toggleMute } = useQuizBattleSounds();

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
      // Fetch invitation
      const { data: invitation, error } = await supabase
        .from('quiz_battle_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();
      
      if (error || !invitation) {
        console.error('[QuizBattleLobby] Invitation not found:', error);
        toast.error('Invitation introuvable');
        navigate('/quiz-battle');
        return;
      }
      
      console.log('[QuizBattleLobby] Loaded invitation:', invitation.id, 'status:', invitation.status);
      
      // Fetch recipient name separately
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', invitation.recipient_id)
        .single();
      
      // Set recipient name and expiry
      setInvitationRecipient(recipientProfile?.nickname || 'Adversaire');
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
      console.log('[QuizBattleLobby] Subscribing to invitation updates:', invitationId);
      channel = supabase
        .channel(`invitation-sender-${invitationId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_battle_invitations',
          filter: `id=eq.${invitationId}`,
        }, (payload) => {
          console.log('[QuizBattleLobby] Received invitation update:', payload.new);
          const updated = payload.new as any;
          if (updated.status === 'accepted' && updated.battle_id) {
            console.log('[QuizBattleLobby] Invitation accepted! Navigating to battle:', updated.battle_id);
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
        .subscribe((status) => {
          console.log('[QuizBattleLobby] Subscription status:', status);
        });
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

  // Navigate to game when starting with smooth transition
  useEffect(() => {
    if (multiplayer.phase === 'starting' && multiplayer.battleId) {
      transitionToGame().then(() => {
        navigate(`/quiz-battle/multiplayer/${multiplayer.battleId}`);
      });
    }
  }, [multiplayer.phase, multiplayer.battleId, navigate, transitionToGame]);

  // Auto-join when user is authenticated and joinCode is in URL
  useEffect(() => {
    if (joinCodeFromUrl && mode === 'friend' && userId && !autoJoinAttempted) {
      setAutoJoinAttempted(true);
      setJoinCodeInput(joinCodeFromUrl.toUpperCase());
      
      // Automatically attempt to join the battle
      const autoJoin = async () => {
        const result = await multiplayer.joinWithCode(joinCodeFromUrl.toUpperCase());
        if (result.success) {
          // Set battle config so realtime subscription works properly
          if (result.subjectId) setSelectedSubject(result.subjectId);
          if (result.gradeLevel) setSelectedGrade(result.gradeLevel);
          if (result.difficulty) setSelectedDifficulty(result.difficulty);
          setStep('waiting');
        } else {
          // If auto-join fails, show the join-code step so user can retry
          setStep('join-code');
        }
      };
      
      autoJoin();
    }
  }, [joinCodeFromUrl, mode, userId, autoJoinAttempted, multiplayer]);

  // Set friend mode expiry when entering waiting phase
  useEffect(() => {
    if (mode === 'friend' && step === 'waiting' && multiplayer.phase === 'waiting' && !friendModeExpiresAt) {
      setFriendModeExpiresAt(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
    }
  }, [mode, step, multiplayer.phase, friendModeExpiresAt]);

  // Friend mode countdown timer
  useEffect(() => {
    if (!friendModeExpiresAt || mode !== 'friend' || step !== 'waiting') return;
    
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((friendModeExpiresAt.getTime() - now.getTime()) / 1000));
      setFriendModeTimeLeft(diff);
      
      if (diff <= 0) {
        toast.info('Temps écoulé. Personne n\'a rejoint.');
        multiplayer.cancelBattle();
        setStep('config');
        setFriendModeExpiresAt(null);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [friendModeExpiresAt, mode, step, multiplayer]);

  const handleStartSearch = async (subjectId: string, gradeLevel: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedSubject(subjectId);
    setSelectedGrade(gradeLevel);
    setSelectedDifficulty(difficulty);
    setStep('waiting');

    // Pass parameters directly to avoid stale closure issues
    if (mode === 'random') {
      multiplayer.joinMatchmaking({ subjectId, gradeLevel, difficulty });
    } else {
      multiplayer.createPrivateBattle({ subjectId, gradeLevel, difficulty });
    }
  };

  const handleJoinWithCode = async () => {
    if (joinCodeInput.length !== 6) {
      toast.error('Le code doit contenir 6 caractères');
      return;
    }

    const result = await multiplayer.joinWithCode(joinCodeInput);
    if (result.success) {
      // Set battle config so realtime subscription works properly
      if (result.subjectId) setSelectedSubject(result.subjectId);
      if (result.gradeLevel) setSelectedGrade(result.gradeLevel);
      if (result.difficulty) setSelectedDifficulty(result.difficulty);
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

  // Get shareable link for friend mode
  const getShareableLink = () => {
    if (!multiplayer.inviteCode) return '';
    return `${window.location.origin}/quiz-battle/lobby?mode=friend&joinCode=${multiplayer.inviteCode}`;
  };

  // Copy full shareable link
  const copyShareableLink = () => {
    const link = getShareableLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setLinkCopied(true);
      toast.success('Lien copié!');
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const link = getShareableLink();
    const message = encodeURIComponent(
      `🎮 Je te défie à un Quiz Battle sur EDUPRENEURS! Clique ici pour me rejoindre: ${link}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Share to Facebook
  const shareToFacebook = () => {
    const link = getShareableLink();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // Share to Instagram (copy link + instruction)
  const shareToInstagram = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    toast.info('Lien copié! Colle-le dans ta story ou message Instagram');
  };

  // Native share API (mobile)
  const handleNativeShare = async () => {
    const link = getShareableLink();
    try {
      await navigator.share({
        title: 'Quiz Battle - EDUPRENEURS',
        text: '🎮 Rejoins mon Quiz Battle!',
        url: link,
      });
    } catch (err) {
      // User cancelled or not supported - fallback to copy
      copyShareableLink();
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
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Revanche envoyée</h1>
                <p className="text-sm text-muted-foreground">En attente de réponse</p>
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
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Rejoindre une partie</h1>
              <p className="text-sm text-muted-foreground">Entre le code d'invitation</p>
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
            <div className="flex items-center gap-3 sm:gap-4 mb-6 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate('/quiz-battle')} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Mode Ami</h1>
                <p className="text-sm text-muted-foreground">Créer ou rejoindre une partie</p>
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
                    className="h-24 flex flex-col gap-2 bg-primary/10 hover:bg-primary/20 border-2 border-primary text-primary"
                    variant="outline"
                    onClick={() => {
                      document.getElementById('create-battle-config')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Swords className="w-8 h-8" />
                    <span className="font-medium">Créer ↓</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div id="create-battle-config">
            <SubjectDifficultySelector
              defaultGrade={userGrade}
              onStart={handleStartSearch}
              onBack={() => navigate('/quiz-battle')}
              hideHeader={mode === 'friend'}
              title={mode === 'friend' ? 'Créer une partie' : 'Mode Solo'}
              subtitle={mode === 'friend' ? 'Configure le quiz pour ton ami' : 'Configure ton quiz'}
            />
          </div>
        </div>
      );
    }

    // Waiting screen
    if (step === 'waiting') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">
                  {mode === 'random' ? 'Recherche en cours' : 'En attente'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
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
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          {/* Invite link for friend mode */}
          {mode === 'friend' && multiplayer.inviteCode && multiplayer.phase === 'waiting' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Lien d'invitation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Code display */}
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
                
                {/* Copy Link Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={copyShareableLink}
                >
                  {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {linkCopied ? 'Lien copié!' : 'Copier le lien'}
                </Button>
                
                {/* Social Share Buttons */}
                <div className="flex justify-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={shareToWhatsApp}
                    className="rounded-full bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                    title="Partager sur WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={shareToFacebook}
                    className="rounded-full bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
                    title="Partager sur Facebook"
                  >
                    <FacebookIcon />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={shareToInstagram}
                    className="rounded-full bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30"
                    title="Partager sur Instagram"
                  >
                    <InstagramIcon />
                  </Button>
                  {/* Native Share (mobile) */}
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleNativeShare}
                      className="rounded-full"
                      title="Partager"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                
                {/* Timer display */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Expire dans: {formatTimeLeft(friendModeTimeLeft)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Partage ce lien avec ton ami pour qu'il puisse te rejoindre
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
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Joueur Aléatoire</h1>
              <p className="text-sm text-muted-foreground">Choisis un adversaire en ligne</p>
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
