import { useState } from 'react';
import { useOnlinePlayers, OnlinePlayer } from '@/hooks/useOnlinePlayers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, UserPlus, Wifi, WifiOff } from 'lucide-react';
import { getAvatarUrl } from '@/lib/avatarMap';

interface OnlinePlayersBrowserProps {
  currentUserId: string;
  onSelectPlayer: (player: OnlinePlayer) => void;
  selectedPlayerId?: string | null;
}

export const OnlinePlayersBrowser = ({
  currentUserId,
  onSelectPlayer,
  selectedPlayerId,
}: OnlinePlayersBrowserProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { players, totalOnline, isLoading } = useOnlinePlayers({
    excludeUserId: currentUserId,
    searchQuery,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Joueurs en ligne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Joueurs en ligne
          </span>
          <span className="flex items-center gap-1.5 text-sm font-normal text-success">
            <Wifi className="w-4 h-4" />
            {totalOnline}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un joueur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Players List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {players.length === 0 ? (
            <div className="text-center py-8">
              <WifiOff className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Aucun joueur trouvé' 
                  : 'Aucun joueur en ligne pour le moment'}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Invite un ami via le mode "Inviter un ami"!
              </p>
            </div>
          ) : (
            players.map((player) => (
              <div
                key={player.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  selectedPlayerId === player.user_id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                {/* Avatar with online indicator */}
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-success/30">
                    <AvatarImage 
                      src={player.avatar_url ? getAvatarUrl(player.avatar_url) : undefined} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {player.nickname?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background" />
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{player.nickname}</p>
                  {player.academic_grade && (
                    <p className="text-xs text-muted-foreground">
                      {player.academic_grade}
                    </p>
                  )}
                </div>

                {/* Invite Button */}
                <Button
                  size="sm"
                  variant={selectedPlayerId === player.user_id ? "default" : "outline"}
                  onClick={() => onSelectPlayer(player)}
                  className="shrink-0"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Inviter
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
