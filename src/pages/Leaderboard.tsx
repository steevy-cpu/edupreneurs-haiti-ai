import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useVisitor } from "@/contexts/VisitorContext";
import { toast } from "sonner";
import { useLeaderboardData } from "@/hooks/useLeaderboardData";
import { cn } from "@/lib/utils";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Use the optimized hook with caching
  const { leaderboard, currentUserRank, isLoading } = useLeaderboardData(currentUserId);

  useEffect(() => {
    // Skip auth check for visitors but still fetch leaderboard
    if (!isVisitor) {
      checkAuth();
    }
  }, [isVisitor]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth/login");
      return;
    }
    setCurrentUserId(user.id);
  };

  /** Rank-based styling for list rows — gradient bg + border color */
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <Crown className="w-6 h-6 text-yellow-500" />,
          bg: 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent border-yellow-500/30',
          textColor: 'text-yellow-600 dark:text-yellow-400',
        };
      case 2:
        return {
          icon: <Medal className="w-6 h-6 text-gray-400" />,
          bg: 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-transparent border-gray-400/30',
          textColor: 'text-gray-600 dark:text-gray-300',
        };
      case 3:
        return {
          icon: <Medal className="w-6 h-6 text-amber-600" />,
          bg: 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-amber-500/30',
          textColor: 'text-amber-700 dark:text-amber-400',
        };
      default:
        return {
          icon: null,
          bg: 'bg-muted/30 border-transparent',
          textColor: 'text-muted-foreground',
        };
    }
  };

  const handleUserClick = (userId: string) => {
    if (isVisitor) {
      toast.info("Créez un compte pour voir les profils des autres utilisateurs");
      return;
    }
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 pt-14 sm:pt-16">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Trophy size={24} className="sm:w-8 sm:h-8" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Classement</h1>
            </div>
            <p className="text-xs sm:text-sm lg:text-base opacity-90 leading-relaxed">
              Les meilleurs apprenants de la plateforme
            </p>
            {!isVisitor && currentUserRank && (
              <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-xs sm:text-sm font-medium">Votre rang:</span>
                <span className="text-base sm:text-lg font-bold">#{currentUserRank}</span>
              </div>
            )}
            {isVisitor && (
              <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-xs sm:text-sm font-medium">Classement en temps réel 📊</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How to earn gold hint */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gagnez du gold en complétant des leçons et des quiz!
          </p>
        </div>
      </div>

      {/* Top-3 Podium — only when 3+ users loaded */}
      {!isLoading && leaderboard.length >= 3 && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4">
          <div className="flex justify-center items-end gap-2 sm:gap-3 py-4">
            {/* 2nd place — left */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleUserClick(leaderboard[1].user_id)}>
              <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-gray-400">
                <AvatarImage src={getAvatarUrl(leaderboard[1].avatar_url)} loading="lazy" />
                <AvatarFallback className="text-sm">{leaderboard[1].nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="bg-gray-400 text-white rounded-t-lg px-4 sm:px-6 py-1.5 sm:py-2 mt-2 text-center">
                <Medal className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-[10px] sm:text-xs font-medium truncate max-w-[75px] sm:max-w-[80px]">{leaderboard[1].nickname || leaderboard[1].full_name}</p>
                <p className="text-xs sm:text-sm font-bold">{leaderboard[1].gold_earned} 🏆</p>
              </div>
              <div className="bg-gray-400/80 w-full h-14 sm:h-20 rounded-b-lg"></div>
            </div>

            {/* 1st place — center, tallest */}
            <div className="flex flex-col items-center -mt-4 cursor-pointer" onClick={() => handleUserClick(leaderboard[0].user_id)}>
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-yellow-500 ring-2 ring-yellow-300">
                <AvatarImage src={getAvatarUrl(leaderboard[0].avatar_url)} loading="lazy" />
                <AvatarFallback className="text-sm sm:text-base">{leaderboard[0].nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="bg-yellow-500 text-white rounded-t-lg px-4 sm:px-8 py-1.5 sm:py-2 mt-2 text-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-[80px]">{leaderboard[0].nickname || leaderboard[0].full_name}</p>
                <p className="text-xs sm:text-sm font-bold">{leaderboard[0].gold_earned} 🏆</p>
              </div>
              <div className="bg-yellow-500/80 w-full h-24 sm:h-32 rounded-b-lg"></div>
            </div>

            {/* 3rd place — right */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleUserClick(leaderboard[2].user_id)}>
              <Avatar className="h-9 w-9 sm:h-12 sm:w-12 border-2 border-amber-600">
                <AvatarImage src={getAvatarUrl(leaderboard[2].avatar_url)} loading="lazy" />
                <AvatarFallback className="text-xs sm:text-sm">{leaderboard[2].nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="bg-amber-600 text-white rounded-t-lg px-3 sm:px-5 py-1.5 sm:py-2 mt-2 text-center">
                <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-[10px] sm:text-xs font-medium truncate max-w-[70px] sm:max-w-[70px]">{leaderboard[2].nickname || leaderboard[2].full_name}</p>
                <p className="text-xs sm:text-sm font-bold">{leaderboard[2].gold_earned} 🏆</p>
              </div>
              <div className="bg-amber-600/80 w-full h-10 sm:h-14 rounded-b-lg"></div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6" data-tour="leaderboard-list">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="border-none rounded-xl shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun utilisateur dans le classement pour le moment
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Complétez des leçons pour apparaître ici!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-2">
              {leaderboard.map((user) => {
                const rankStyle = getRankStyle(user.rank);
                const isCurrentUser = user.user_id === currentUserId;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.user_id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.01]",
                      rankStyle.bg,
                      isCurrentUser && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {/* Rank indicator */}
                    <div className={cn(
                      "flex items-center justify-center w-10 font-bold text-lg",
                      rankStyle.textColor
                    )}>
                      {rankStyle.icon || `#${user.rank}`}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(user.avatar_url)} loading="lazy" />
                      <AvatarFallback className="text-sm">
                        {user.nickname?.[0]?.toUpperCase() || user.full_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        isCurrentUser && "text-primary"
                      )}>
                        {user.nickname || user.full_name} {isCurrentUser && '(vous)'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.academic_grade ?? '-'}
                      </p>
                    </div>

                    {/* Gold count */}
                    <div className="text-right">
                      <div className="font-bold text-amber-500">{user.gold_earned}</div>
                      <div className="text-xs text-muted-foreground">🏆 gold</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
