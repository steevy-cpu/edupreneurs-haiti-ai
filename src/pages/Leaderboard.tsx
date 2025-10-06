import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ericCelebrating from "@/assets/eric-celebrating.png";

interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  gold_earned: number;
  academic_grade: string;
  rank: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchLeaderboard();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch top 10 users by gold earned
    const { data: topUsers, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, nickname, gold_earned, academic_grade")
      .order("gold_earned", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
      return;
    }

    // Add rank to each user
    const rankedUsers = topUsers?.map((user, index) => ({
      ...user,
      rank: index + 1,
    })) || [];

    setLeaderboard(rankedUsers);

    // Find current user's rank
    if (user) {
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("user_id, gold_earned")
        .order("gold_earned", { ascending: false });

      const userRank = allUsers?.findIndex(u => u.user_id === user.id);
      if (userRank !== undefined && userRank !== -1) {
        setCurrentUserRank(userRank + 1);
      }
    }

    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} className="text-yellow-500" />;
      case 2:
        return <Medal size={24} className="text-gray-400" />;
      case 3:
        return <Award size={24} className="text-amber-600" />;
      default:
        return <Trophy size={20} className="text-muted-foreground" />;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-slate-400/20 border-gray-400/30";
      case 3:
        return "from-amber-600/20 to-orange-600/20 border-amber-600/30";
      default:
        return "from-muted/50 to-muted/30 border-border/50";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 pt-14 sm:pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Trophy size={24} className="sm:w-8 sm:h-8" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Classement</h1>
              </div>
              <p className="text-xs sm:text-sm lg:text-base opacity-90 leading-relaxed">
                Les meilleurs apprenants de la plateforme
              </p>
              {currentUserRank && (
                <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <span className="text-xs sm:text-sm font-medium">Votre rang:</span>
                  <span className="text-base sm:text-lg font-bold">#{currentUserRank}</span>
                </div>
              )}
            </div>
            <img 
              src={ericCelebrating} 
              alt="Eric célèbre votre succès" 
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-[float_3s_ease-in-out_infinite] hidden sm:block"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="border-none rounded-[20px] shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((user) => {
              const isCurrentUser = user.user_id === currentUser?.id;
              
              return (
                <Card
                  key={user.id}
                  className={`border-none rounded-xl sm:rounded-2xl lg:rounded-[20px] shadow-md transition-all hover:scale-[1.01] sm:hover:scale-[1.02] ${
                    isCurrentUser ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardContent
                    className={`p-3 sm:p-4 bg-gradient-to-r ${getRankBgColor(user.rank)} border`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center min-w-[32px] sm:min-w-[40px] lg:min-w-[48px]">
                        {getRankIcon(user.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 font-semibold text-xs sm:text-base">
                          {user.nickname?.[0] || user.full_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <p className="font-semibold truncate text-sm sm:text-base">
                            {user.nickname || user.full_name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] sm:text-xs bg-primary text-primary-foreground px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                              Vous
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {user.academic_grade}
                        </p>
                      </div>

                      {/* Gold Count */}
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 text-amber-500 font-bold text-base sm:text-lg">
                          <span className="text-lg sm:text-xl lg:text-2xl">🏆</span>
                          <span className="text-sm sm:text-base lg:text-lg">{user.gold_earned}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          gold
                        </p>
                      </div>

                      {/* Rank Number */}
                      <div className="min-w-[32px] sm:min-w-[40px] text-center">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-muted-foreground">
                          #{user.rank}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <Card className="border-none rounded-[20px] shadow-md">
            <CardContent className="p-12 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun utilisateur dans le classement pour le moment
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;