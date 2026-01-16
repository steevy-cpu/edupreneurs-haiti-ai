import { useState, useEffect } from "react";
import { Send, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEbookComments, useCreateEbookComment, useDeleteEbookComment } from "@/hooks/useEbooks";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getAvatarUrl } from "@/lib/avatarMap";

interface EbookCommentsProps {
  ebookId: string;
}

export function EbookComments({ ebookId }: EbookCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { data: comments, isLoading } = useEbookComments(ebookId);
  const createComment = useCreateEbookComment();
  const deleteComment = useDeleteEbookComment();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    createComment.mutate(
      { ebookId, comment: newComment.trim(), rating: rating || undefined },
      {
        onSuccess: () => {
          setNewComment("");
          setRating(0);
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce commentaire?")) {
      deleteComment.mutate({ commentId, ebookId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {currentUserId && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <Textarea
            placeholder="Partagez votre avis sur ce livre..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          
          {/* Rating */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="mr-2 text-sm text-muted-foreground">Note:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || createComment.isPending}
            >
              {createComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Aucun commentaire pour le moment. Soyez le premier à partager votre avis!
          </p>
        )}

        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3 rounded-lg border p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getAvatarUrl(comment.profile?.avatar_url || '')} />
              <AvatarFallback>
                {(comment.profile?.nickname || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium">
                    {comment.profile?.nickname || 'Utilisateur'}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>

                {comment.user_id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteComment.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Rating Display */}
              {comment.rating && (
                <div className="mt-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= comment.rating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              )}

              <p className="mt-2 text-sm text-foreground">{comment.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
