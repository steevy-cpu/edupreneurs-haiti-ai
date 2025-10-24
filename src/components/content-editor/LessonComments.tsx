import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  };
}

interface LessonCommentsProps {
  lesson: any;
}

export const LessonComments = ({ lesson }: LessonCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    if (lesson) {
      loadComments();
      getCurrentUser();
    }
  }, [lesson]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadComments = async () => {
    try {
      // First get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('lesson_comments')
        .select('id, comment, created_at, user_id')
        .eq('lesson_id', lesson.id)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Then get the profiles for each comment
      if (commentsData && commentsData.length > 0) {
        const userIds = commentsData.map(c => c.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, nickname, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        const combinedData = commentsData.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id) || {
            nickname: 'Utilisateur',
            avatar_url: null
          }
        }));

        setComments(combinedData);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error("Erreur lors du chargement des commentaires");
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('lesson_comments')
        .insert({
          lesson_id: lesson.id,
          user_id: user.id,
          comment: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      toast.success("Commentaire ajouté");
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success("Commentaire supprimé");
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour voir les commentaires</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] max-h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
        <div className="flex-1 overflow-auto space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun commentaire pour le moment
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.profiles?.nickname?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.profiles?.nickname}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      {currentUserId === comment.user_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(comment.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {comment.comment}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-shrink-0 space-y-2 border-t pt-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            rows={3}
            className="resize-none"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !newComment.trim()}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            Envoyer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
