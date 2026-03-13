import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, FileText, ArrowRight } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeaderboardSkeleton, NotesListSkeleton } from "@/components/shared/SkeletonLoaders";
import type { FeatureState, Note, LeaderboardUser } from "@/types/dashboard.types";

export interface CommunityTabProps {
  leaderboardFeature: FeatureState<LeaderboardUser[]>;
  notesFeature: FeatureState<Note[]>;
  onRetryLeaderboard: () => void;
  onRetryNotes: () => void;
  formatDate: (dateString: string) => string;
  topicInfo: Record<string, { title: string; icon: string }>;
}

export const CommunityTab = ({
  leaderboardFeature,
  notesFeature,
  onRetryLeaderboard,
  onRetryNotes,
  formatDate,
  topicInfo,
}: CommunityTabProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Leaderboard */}
      <Card data-tour="leaderboard-section" className="border-none rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
          <CardTitle className="font-semibold text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Classement
          </CardTitle>
          <button
            onClick={() => navigate("/leaderboard")}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Voir tout →
          </button>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {leaderboardFeature.loading ? (
            <LeaderboardSkeleton count={5} />
          ) : leaderboardFeature.error ? (
            <ErrorState
              message="Impossible de charger le classement"
              onRetry={onRetryLeaderboard}
              compact
            />
          ) : leaderboardFeature.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              Aucun utilisateur dans le classement
            </p>
          ) : (
            <div className="space-y-1">
              {leaderboardFeature.data.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Rank number */}
                  <span className={`w-6 text-center text-xs font-bold ${
                    user.rank === 1 ? 'text-yellow-500' :
                    user.rank === 2 ? 'text-gray-400' :
                    user.rank === 3 ? 'text-amber-600' :
                    'text-muted-foreground'
                  }`}>
                    #{user.rank}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user.avatar_url ? getAvatarUrl(user.avatar_url) : undefined}
                      loading="lazy"
                      decoding="async"
                    />
                    <AvatarFallback className="text-xs">{user.nickname?.[0] || user.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{user.nickname || user.full_name}</p>
                  </div>
                  <span className="font-bold text-sm text-yellow-600 flex-shrink-0">{user.gold_earned} <span className="text-[10px] font-normal text-muted-foreground">Gold</span></span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notes */}
      <Card className="border-none rounded-xl shadow-sm">
        <CardHeader className="px-4 pb-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="w-5 h-5" />
            Notes récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
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
            <div className="space-y-2">
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
                    className={`p-3 bg-muted/40 rounded-lg transition-colors ${
                      isClickable
                        ? 'hover:bg-muted cursor-pointer'
                        : 'opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm mb-0.5 flex items-center gap-1.5 truncate">
                          {topicInfo[note.lesson_id]?.icon}
                          {note.lesson_title || topicInfo[note.lesson_id]?.title || note.lesson_id}
                          {isClickable && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                        </h4>
                        {note.subject_name && (
                          <p className="text-[10px] text-primary mb-0.5">{note.subject_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {note.notes || 'Note vide'}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
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
