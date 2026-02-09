import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, FileText, Crown, Medal, Award, ArrowRight } from "lucide-react";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeaderboardSkeleton, NotesListSkeleton } from "@/components/shared/SkeletonLoaders";

interface Note {
  id: string;
  lesson_id: string;
  notes: string | null;
  updated_at: string;
  lesson_slug?: string;
  lesson_title?: string;
  subject_slug?: string;
  subject_name?: string;
}

interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  gold_earned: number;
  academic_grade: string;
  rank: number;
}

interface FeatureState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export interface CommunityTabProps {
  leaderboardFeature: FeatureState<LeaderboardUser[]>;
  notesFeature: FeatureState<Note[]>;
  onRetryLeaderboard: () => void;
  onRetryNotes: () => void;
  formatDate: (dateString: string) => string;
  topicInfo: Record<string, { title: string; icon: string }>;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2: return <Medal className="w-5 h-5 text-gray-400" />;
    case 3: return <Award className="w-5 h-5 text-amber-600" />;
    default: return <Trophy className="w-4 h-4 text-muted-foreground" />;
  }
};

const getRankBgColor = (rank: number) => {
  switch (rank) {
    case 1: return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
    case 2: return "from-gray-400/20 to-slate-400/20 border-gray-400/30";
    case 3: return "from-amber-600/20 to-orange-600/20 border-amber-600/30";
    default: return "from-muted/50 to-muted/30 border-border/50";
  }
};

export const CommunityTab = ({
  leaderboardFeature,
  notesFeature,
  onRetryLeaderboard,
  onRetryNotes,
  formatDate,
  topicInfo,
}: CommunityTabProps) => {
  const navigate = useNavigate();
  const { shouldAnimate } = useNetworkAwareAnimations();

  return (
    <>
      {/* Leaderboard */}
      <Card data-tour="leaderboard-section" className="border-none rounded-[20px] shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold tracking-tight text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Classement
          </CardTitle>
          <button
            onClick={() => navigate("/leaderboard")}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Voir tout →
          </button>
        </CardHeader>
        <CardContent>
          {leaderboardFeature.loading ? (
            <LeaderboardSkeleton count={5} />
          ) : leaderboardFeature.error ? (
            <ErrorState
              message="Impossible de charger le classement"
              onRetry={onRetryLeaderboard}
              compact
            />
          ) : leaderboardFeature.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun utilisateur dans le classement pour le moment
            </p>
          ) : (
            <div className="space-y-3">
              {leaderboardFeature.data.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gradient-to-br ${getRankBgColor(user.rank)} border tap-highlight-none ${
                    shouldAnimate ? 'transition-all hover:scale-[1.02]' : ''
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                    <AvatarImage
                      src={user.avatar_url ? getAvatarUrl(user.avatar_url) : undefined}
                      loading="lazy"
                      decoding="async"
                    />
                    <AvatarFallback>{user.nickname?.[0] || user.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{user.nickname || user.full_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{user.academic_grade}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base sm:text-lg text-yellow-600">{user.gold_earned}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Gold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notes */}
      <Card className="border-none rounded-[20px] shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notesFeature.loading ? (
            <NotesListSkeleton count={3} />
          ) : notesFeature.error ? (
            <ErrorState
              message="Impossible de charger vos notes"
              onRetry={onRetryNotes}
              compact
            />
          ) : notesFeature.data.length === 0 ? (
            <EmptyState
              illustration="no-notes"
              title="Aucune note"
              description="Commence une leçon et prends des notes pour les retrouver ici"
              ctaLabel="Explorer les matières"
              ctaAction={() => navigate("/matieres")}
              compact
            />
          ) : (
            <div className="space-y-3">
              {notesFeature.data.map((note) => {
                const isClickable = !!(note.subject_slug && note.lesson_slug);
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      if (isClickable) {
                        navigate(`/course/${note.subject_slug}/${note.lesson_slug}`);
                      }
                    }}
                    className={`p-4 bg-muted/50 rounded-lg transition-colors ${
                      isClickable
                        ? 'hover:bg-muted cursor-pointer hover:shadow-sm'
                        : 'opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                          {topicInfo[note.lesson_id]?.icon}
                          {note.lesson_title || topicInfo[note.lesson_id]?.title || note.lesson_id}
                          {isClickable && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </h4>
                        {note.subject_name && (
                          <p className="text-xs text-primary mb-1">{note.subject_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.notes || 'Note vide'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
