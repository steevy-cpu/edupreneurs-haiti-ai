import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  Users, 
  Clock, 
  Copy, 
  ArrowLeft, 
  Loader2,
  Share2,
  Globe,
  Lock,
  Sparkles,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  useChessMultiplayer, 
  TimeControl, 
  TIME_CONTROL_LABELS,
} from '@/hooks/useChessMultiplayer';
import { ChessPublicMatches } from '@/components/chess/ChessPublicMatches';
import { TimeControlSelector } from '@/components/chess/TimeControlSelector';
import { MatchVisibilityToggle } from '@/components/chess/MatchVisibilityToggle';
import { getChessSession, clearChessSession } from '@/chess/store/chessSession.store';

const ChessMultiplayerLobby = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Auth state from context
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSessionAuth();
  const userId = user?.id ?? null;
  
  // Form state
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [timeControl, setTimeControl] = useState<TimeControl>('blitz');
  const [isPublic, setIsPublic] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  // Multiplayer hook
  const {
    match,
    isLoading,
    createMatch,
    joinWithCode,
    cancelMatch,
  } = useChessMultiplayer({ userId, enabled: true });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/auth/login', { state: { returnTo: '/chess-multiplayer' } });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  // Check for active session and prompt rejoin
  useEffect(() => {
    if (!userId) return;
    
    const session = getChessSession();
    if (session) {
      // Verify match still exists and is active
      const checkMatch = async () => {
        const { data } = await supabase
          .from('chess_matches')
          .select('id, status')
          .eq('id', session.matchId)
          .maybeSingle();
        
        if (data && (data.status === 'waiting' || data.status === 'playing')) {
          // Show rejoin toast
          toast({
            title: 'Partie en cours',
            description: 'Vous avez une partie non terminée',
            action: (
              <Button 
                size="sm" 
                onClick={() => navigate(`/chess-multiplayer/game/${session.matchId}`)}
                className="gap-1"
              >
                <PlayCircle className="w-4 h-4" />
                Rejoindre
              </Button>
            ),
            duration: 10000,
          });
        } else {
          // Match no longer active, clear session
          clearChessSession();
        }
      };
      checkMatch();
    }
  }, [userId, navigate, toast]);

  // Handle join code from URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code && userId) {
      setJoinCode(code);
      setActiveTab('join');
      handleJoinWithCode(code);
    }
  }, [searchParams, userId]);

  // Navigate to game when match starts
  useEffect(() => {
    if (match?.status === 'playing') {
      navigate(`/chess-multiplayer/game/${match.id}`);
    }
  }, [match?.status, match?.id, navigate]);

  const handleCreateMatch = async () => {
    const matchId = await createMatch({
      timeControl,
      isPublic,
    });
    
    if (matchId) {
      // Stay on lobby to show invite code
    }
  };

  const handleJoinWithCode = async (code?: string) => {
    const codeToUse = code || joinCode;
    if (!codeToUse || codeToUse.length !== 6) {
      toast({
        title: 'Code invalide',
        description: 'Le code doit contenir 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    const result = await joinWithCode(codeToUse);
    
    if (result.success && result.matchId) {
      navigate(`/chess-multiplayer/game/${result.matchId}`);
    } else if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleCopyCode = () => {
    if (match?.invite_code) {
      navigator.clipboard.writeText(match.invite_code);
      toast({
        title: 'Code copié!',
        description: 'Partagez ce code avec votre ami',
      });
    }
  };

  const handleShareLink = async () => {
    if (!match?.invite_code) return;
    
    const shareUrl = `${window.location.origin}/chess-multiplayer?code=${match.invite_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Partie d\'échecs',
          text: 'Rejoins ma partie d\'échecs!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Lien copié!',
        description: 'Partagez ce lien avec votre ami',
      });
    }
  };

  const handleCancelMatch = async () => {
    await cancelMatch();
  };

  const handleJoinPublicMatch = (matchId: string) => {
    navigate(`/chess-multiplayer/game/${matchId}?join=true`);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Waiting room view
  if (match && match.status === 'waiting') {
    return (
      <main className="min-h-screen bg-background">
          <div className="container max-w-2xl mx-auto px-4 py-8">
            <Button 
              variant="ghost" 
              onClick={handleCancelMatch}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Annuler
            </Button>

            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">En attente d'un adversaire</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Partagez le code ci-dessous avec votre ami
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Invite Code Display */}
                <div className="bg-muted rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Code d'invitation</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-mono font-bold tracking-widest text-primary">
                      {match.invite_code}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Match Settings */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {TIME_CONTROL_LABELS[match.time_control as TimeControl]}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    {match.is_public ? (
                      <>
                        <Globe className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-medium">Publique</p>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-medium">Privée</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Share Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleShareLink}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager le lien
                </Button>

                {/* Loading indicator */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">En attente d'un joueur...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/chess-game')}
          className="mb-4 -ml-2"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Header */}
        <div className="mb-6">
          <PageHeader
            title="Échecs Multijoueur"
            subtitle="Défiez vos amis ou trouvez un adversaire!"
            icon={<Users className="w-8 h-8 text-primary" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Create/Join Card */}
          <Card className="overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'join')}>
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger 
                    value="create" 
                    className="gap-2 active:bg-primary/20 transition-colors data-[state=active]:shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden xs:inline">Créer</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="join"
                    className="gap-2 active:bg-primary/20 transition-colors data-[state=active]:shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden xs:inline">Rejoindre</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-0">
                <TabsContent value="create" className="space-y-4 mt-0">
                  {/* Time Control Selection */}
                  <TimeControlSelector 
                    value={timeControl} 
                    onChange={setTimeControl} 
                  />

                  {/* Visibility Toggle */}
                  <MatchVisibilityToggle 
                    isPublic={isPublic} 
                    onChange={setIsPublic} 
                  />

                  {/* Create Button */}
                  <Button 
                    className="w-full h-12 text-base" 
                    size="lg"
                    onClick={handleCreateMatch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Crown className="w-5 h-5 mr-2" />
                    )}
                    Créer la partie
                  </Button>
                </TabsContent>

                <TabsContent value="join" className="space-y-4 mt-0">
                  {/* Join Code Input */}
                  <div className="space-y-2">
                    <Label htmlFor="join-code" className="text-sm font-medium">
                      Code d'invitation
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="join-code"
                        placeholder="ABCD12"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="font-mono text-lg tracking-widest uppercase h-12 text-center"
                      />
                      <Button 
                        onClick={() => handleJoinWithCode()}
                        disabled={isLoading || joinCode.length !== 6}
                        className="h-12 px-6"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Rejoindre'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entrez le code à 6 caractères partagé par votre ami
                    </p>
                  </div>

                  {/* Visual separator */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  {/* Hint to check public matches */}
                  <p className="text-sm text-center text-muted-foreground">
                    Consultez les parties publiques disponibles ci-dessous
                  </p>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Public Matches */}
          <ChessPublicMatches 
            userId={userId} 
            onJoinMatch={handleJoinPublicMatch}
          />
        </div>
      </div>
    </main>
  );
};

export default ChessMultiplayerLobby;
