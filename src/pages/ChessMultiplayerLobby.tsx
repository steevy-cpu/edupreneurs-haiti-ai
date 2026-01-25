import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  useChessMultiplayer, 
  TimeControl, 
  TIME_CONTROL_LABELS,
  TIME_CONTROL_SECONDS 
} from '@/hooks/useChessMultiplayer';
import { ChessPublicMatches } from '@/components/chess/ChessPublicMatches';

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
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Waiting room view
  if (match && match.status === 'waiting') {
    return (
      <Layout>
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
                <CardDescription>
                  Partagez le code ci-dessous avec votre ami
                </CardDescription>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/chess-game')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <PageHeader
            title="Échecs Multijoueur"
            subtitle="Défiez vos amis ou trouvez un adversaire!"
            icon={<Users className="w-8 h-8 text-primary" />}
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Create/Join Card */}
            <Card>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'join')}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer
                    </TabsTrigger>
                    <TabsTrigger value="join">
                      <Users className="w-4 h-4 mr-2" />
                      Rejoindre
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="create" className="space-y-6 mt-0">
                    {/* Time Control Selection */}
                    <div className="space-y-3">
                      <Label>Contrôle du temps</Label>
                      <RadioGroup 
                        value={timeControl} 
                        onValueChange={(v) => setTimeControl(v as TimeControl)}
                        className="grid grid-cols-2 gap-2"
                      >
                        {(Object.keys(TIME_CONTROL_LABELS) as TimeControl[]).map((tc) => (
                          <div key={tc}>
                            <RadioGroupItem
                              value={tc}
                              id={tc}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={tc}
                              className={cn(
                                "flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                              )}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                {TIME_CONTROL_LABELS[tc]}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {isPublic ? (
                          <Globe className="w-5 h-5 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">
                            {isPublic ? 'Partie publique' : 'Partie privée'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isPublic 
                              ? 'Visible par tous les joueurs' 
                              : 'Accessible uniquement par code'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPublic(!isPublic)}
                      >
                        {isPublic ? 'Rendre privée' : 'Rendre publique'}
                      </Button>
                    </div>

                    {/* Create Button */}
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleCreateMatch}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      Créer la partie
                    </Button>
                  </TabsContent>

                  <TabsContent value="join" className="space-y-6 mt-0">
                    {/* Join Code Input */}
                    <div className="space-y-3">
                      <Label htmlFor="join-code">Code d'invitation</Label>
                      <div className="flex gap-2">
                        <Input
                          id="join-code"
                          placeholder="ABCD12"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="font-mono text-lg tracking-widest uppercase"
                        />
                        <Button 
                          onClick={() => handleJoinWithCode()}
                          disabled={isLoading || joinCode.length !== 6}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Rejoindre'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Entrez le code à 6 caractères partagé par votre ami
                      </p>
                    </div>
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
    </Layout>
  );
};

export default ChessMultiplayerLobby;
