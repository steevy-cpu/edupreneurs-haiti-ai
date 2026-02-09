import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LessonFeedbackProps {
  lessonId: string;
}

export const LessonFeedback = ({ lessonId }: LessonFeedbackProps) => {
  const { user } = useSessionAuth();
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load existing feedback
  useEffect(() => {
    if (!user?.id || !lessonId) return;
    
    const loadFeedback = async () => {
      try {
        const { data } = await supabase
          .from("lesson_feedback")
          .select("rating, comment")
          .eq("lesson_id", lessonId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setRating(data.rating as "up" | "down");
          setComment(data.comment || "");
          setHasSubmitted(true);
        }
      } catch (error) {
        console.error("Error loading feedback:", error);
      }
    };

    loadFeedback();
  }, [user?.id, lessonId]);

  const upsertRating = useCallback(async (newRating: "up" | "down") => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("lesson_feedback")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            rating: newRating,
            comment: comment || null,
          },
          { onConflict: "user_id,lesson_id" }
        );

      if (error) throw error;

      setRating(newRating);
      setHasSubmitted(true);

      if (newRating === "down") {
        setShowCommentDialog(true);
      } else {
        toast.success("Merci pour votre retour.");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, lessonId, comment]);

  const submitComment = useCallback(async () => {
    if (!user?.id || !comment.trim()) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("lesson_feedback")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            rating: rating || "down",
            comment: comment.trim(),
          },
          { onConflict: "user_id,lesson_id" }
        );

      if (error) throw error;

      setShowCommentDialog(false);
      toast.success("Merci pour vos commentaires.");
    } catch (error) {
      console.error("Error saving comment:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, lessonId, rating, comment]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Card className="border-l-4 border-l-primary border-border/30 bg-primary/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-sm text-foreground font-medium">
                Votre avis compte — cette leçon vous a-t-elle été utile?
              </p>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <Button
                variant={rating === "up" ? "default" : "outline"}
                size="sm"
                disabled={isSaving}
                onClick={() => upsertRating("up")}
                className={cn(
                  "gap-2 transition-all ease-out hover:scale-[1.02]",
                  rating === "up" && "bg-green-600 hover:bg-green-700 text-white border-green-600"
                )}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="hidden sm:inline">Utile</span>
              </Button>
              <Button
                variant={rating === "down" ? "default" : "outline"}
                size="sm"
                disabled={isSaving}
                onClick={() => upsertRating("down")}
                className={cn(
                  "gap-2 transition-all ease-out hover:scale-[1.02]",
                  rating === "down" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive"
                )}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="hidden sm:inline">Pas utile</span>
              </Button>
            </div>
          </div>
          {hasSubmitted && (
            <p className="text-xs text-muted-foreground mt-3 text-center sm:text-right">
              Merci pour votre retour!
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aidez-nous à nous améliorer</DialogTitle>
            <DialogDescription>
              Qu'est-ce qui pourrait être amélioré dans cette leçon?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Le contenu est trop difficile, les exemples ne sont pas clairs..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {comment.length}/500
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentDialog(false)}
                >
                  Passer
                </Button>
                <Button
                  size="sm"
                  disabled={!comment.trim() || isSaving}
                  onClick={submitComment}
                  className="gap-2"
                >
                  <Send className="h-3 w-3" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
