import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, RefreshCw, Globe } from 'lucide-react';
import { TIME_CONTROL_LABELS, TimeControl } from '@/hooks/useChessMultiplayer';
import { cn } from '@/lib/utils';

interface PublicMatch {
  id: string;
  time_control: string;
  created_at: string;
  white_player: {
    user_id: string;
    nickname: string;
    avatar_url: string | null;
  } | null;
}

interface ChessPublicMatchesProps {
  userId: string | null;
  onJoinMatch: (matchId: string) => void;
}

export const ChessPublicMatches = ({ userId, onJoinMatch }: ChessPublicMatchesProps) => {
  const [matches, setMatches] = useState<PublicMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      // Fetch public waiting matches
      const { data: matchesData, error } = await supabase
        .from('chess_matches')
        .select('id, time_control, created_at, white_player_id')
        .eq('status', 'waiting')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        return;
      }

      // Fetch player profiles
      const playerIds = matchesData.map(m => m.white_player_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', playerIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      const enrichedMatches: PublicMatch[] = matchesData.map(m => ({
        id: m.id,
        time_control: m.time_control,
        created_at: m.created_at,
        white_player: profilesMap.get(m.white_player_id) || null,
      }));

      setMatches(enrichedMatches);
    } catch (err) {
      console.error('Failed to fetch public matches:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to new matches
    const channel = supabase
      .channel('public-chess-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chess_matches',
          filter: 'is_public=eq.true', // Skip private match events — status filtering handled by fetchMatches()
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMatches();
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Il y a ${hours}h`;
  };

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-avatars/${avatarUrl}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Parties publiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Parties publiques
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aucune partie disponible</p>
            <p className="text-sm">Créez une partie ou attendez qu'un joueur en crée une</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const isOwnMatch = match.white_player?.user_id === userId;
              
              return (
                <div
                  key={match.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isOwnMatch 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-muted/50 border-transparent hover:border-primary/20"
                  )}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getAvatarUrl(match.white_player?.avatar_url || null)} />
                    <AvatarFallback>
                      {match.white_player?.nickname?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {match.white_player?.nickname || 'Joueur'}
                      {isOwnMatch && <span className="text-primary ml-1">(vous)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{TIME_CONTROL_LABELS[match.time_control as TimeControl] || match.time_control}</span>
                      <span>•</span>
                      <span>{getTimeAgo(match.created_at)}</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isOwnMatch ? "outline" : "default"}
                    onClick={() => !isOwnMatch && onJoinMatch(match.id)}
                    disabled={isOwnMatch}
                  >
                    {isOwnMatch ? 'Votre partie' : 'Rejoindre'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
