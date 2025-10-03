import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Send, Plus, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    nickname: string;
  };
  likes_count?: number;
  is_liked?: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchPosts();
    subscribeToNewPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch posts from users you follow and your own posts
    const { data: postsData, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching posts:", error);
      return;
    }

    // Fetch profiles and like counts for each post
    const enrichedPosts = await Promise.all(
      (postsData || []).map(async (post) => {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, nickname")
          .eq("user_id", post.user_id)
          .maybeSingle();

        // Fetch like count
        const { count } = await supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        // Check if user liked this post
        const { data: userLike } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .maybeSingle();

        return {
          ...post,
          profiles: profile || { full_name: "Utilisateur", nickname: "user" },
          likes_count: count || 0,
          is_liked: !!userLike,
        };
      })
    );

    setPosts(enrichedPosts);
  };

  const subscribeToNewPosts = () => {
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createPost = async () => {
    if (!newPostContent.trim() || !currentUser) return;

    setIsLoading(true);
    const { error } = await supabase.from("posts").insert({
      user_id: currentUser.id,
      content: newPostContent.trim(),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la publication",
        variant: "destructive",
      });
    } else {
      setNewPostContent("");
      setIsCreatePostOpen(false);
      fetchPosts();
      toast({
        title: "Succès",
        description: "Publication créée",
      });
    }
    setIsLoading(false);
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUser) return;

    if (isLiked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error unliking post:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: currentUser.id,
      });

      if (error) {
        console.error("Error liking post:", error);
        return;
      }
    }

    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-accent/50"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-semibold">Fil d'actualité</h1>
          <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-accent/50"
              >
                <Plus size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle publication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Quoi de neuf ?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <Button
                  onClick={createPost}
                  disabled={!newPostContent.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-primary to-success"
                >
                  {isLoading ? "Publication..." : "Publier"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="h-[calc(100vh-57px)]">
        <div className="max-w-2xl mx-auto py-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
              <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-light mb-2">Aucune publication</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Commencez à suivre des amis pour voir leurs publications ici
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-card border border-border/50 rounded-lg overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground">
                        {post.profiles?.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {post.profiles?.full_name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full object-cover"
                    />
                  )}

                  {/* Post Content */}
                  <div className="px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="px-4 py-2 flex items-center gap-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id, post.is_liked || false)}
                      className="gap-2 hover:bg-transparent"
                    >
                      <Heart
                        size={20}
                        className={
                          post.is_liked
                            ? "fill-red-500 text-red-500"
                            : "text-foreground"
                        }
                      />
                      <span className="text-sm">{post.likes_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-transparent"
                    >
                      <MessageCircle size={20} />
                      <span className="text-sm">0</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Feed;
