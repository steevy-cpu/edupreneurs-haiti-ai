import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Send, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profile?: Profile;
  likes?: number;
  isLiked?: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

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

    // Fetch posts from followed users and own posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return;
    }

    // Fetch profiles for post authors
    const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    // Fetch likes for all posts
    const postIds = postsData?.map(p => p.id) || [];
    const { data: likesData } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    // Combine data
    const enrichedPosts = postsData?.map(post => {
      const profile = profilesData?.find(p => p.user_id === post.user_id);
      const postLikes = likesData?.filter(l => l.post_id === post.id) || [];
      const isLiked = postLikes.some(l => l.user_id === user.id);
      
      return {
        ...post,
        profile,
        likes: postLikes.length,
        isLiked
      };
    }) || [];

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

    setIsCreatingPost(true);
    const { error } = await supabase.from("posts").insert({
      user_id: currentUser.id,
      content: newPostContent.trim(),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive",
      });
      setIsCreatingPost(false);
      return;
    }

    setNewPostContent("");
    setIsCreatingPost(false);
    toast({
      title: "Succès",
      description: "Post créé avec succès",
    });
  };

  const toggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!currentUser) return;

    if (isCurrentlyLiked) {
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
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
        });

      if (error) {
        console.error("Error liking post:", error);
        return;
      }
    }

    // Update local state
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isCurrentlyLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
          isLiked: !isCurrentlyLiked
        };
      }
      return post;
    }));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    return postDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Fil d'actualité</h1>
          
          {/* Create Post Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="hover:bg-accent/50">
                <Plus size={24} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  placeholder="Quoi de neuf ?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[120px] resize-none border-none bg-muted/30 focus-visible:ring-1"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={createPost}
                    disabled={!newPostContent.trim() || isCreatingPost}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isCreatingPost ? "Publication..." : "Publier"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="max-w-2xl mx-auto pb-20">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Aucun post pour le moment</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Suivez des personnes pour voir leurs posts ici
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="border-b border-border/50 bg-background"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground">
                      {post.profile?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {post.profile?.full_name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 px-4 py-2">
                  <button
                    onClick={() => toggleLike(post.id, post.isLiked || false)}
                    className="flex items-center gap-2 group"
                  >
                    <Heart
                      size={20}
                      className={`transition-colors ${
                        post.isLiked
                          ? "fill-red-500 text-red-500"
                          : "text-foreground group-hover:text-red-500"
                      }`}
                    />
                    {post.likes ? (
                      <span className="text-sm text-muted-foreground">
                        {post.likes}
                      </span>
                    ) : null}
                  </button>
                  
                  <button className="flex items-center gap-2 group">
                    <MessageCircle
                      size={20}
                      className="text-foreground group-hover:text-primary transition-colors"
                    />
                  </button>

                  <button className="flex items-center gap-2 group ml-auto">
                    <Send
                      size={20}
                      className="text-foreground group-hover:text-primary transition-colors"
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Feed;
