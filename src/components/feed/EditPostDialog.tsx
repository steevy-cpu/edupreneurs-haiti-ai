import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Post } from "@/types/feed";
import { NetworkAwareImage, NetworkAwareVideo } from "./NetworkAwareMedia";
import { Loader2 } from "lucide-react";

const MAX_CONTENT_LENGTH = 2000;

interface EditPostDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated: () => void;
}

export function EditPostDialog({
  post,
  isOpen,
  onOpenChange,
  onPostUpdated,
}: EditPostDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Le contenu ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Post modifié avec succès",
      });

      onPostUpdated();
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le post",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = content.trim() !== post.content;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Editor */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contenu du post..."
              className="min-h-[150px] resize-none"
              maxLength={MAX_CONTENT_LENGTH}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${content.length > MAX_CONTENT_LENGTH * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          {/* Media Preview (read-only) */}
          {(post.image_url || post.video_url) && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Média (non modifiable)
              </p>
              {post.image_url && (
                <NetworkAwareImage 
                  src={post.image_url} 
                  alt="Post media" 
                  className="w-full rounded-lg object-contain max-h-[200px] opacity-75"
                />
              )}
              {post.video_url && (
                <NetworkAwareVideo 
                  src={post.video_url} 
                  className="w-full rounded-lg max-h-[200px] opacity-75"
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !hasChanges || !content.trim()}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
