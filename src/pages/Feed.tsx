import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Send, Plus, Image, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: Profile;
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
  comments?: Comment[];
  commentCount?: number;
  shareCount?: number;
  isShared?: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return;
    }

    const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    const postIds = postsData?.map(p => p.id) || [];
    const { data: likesData } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    const { data: commentsData } = await supabase
      .from("post_comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    const commentUserIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
    const { data: commentProfilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", commentUserIds);

    const { data: sharesData } = await supabase
      .from("post_shares")
      .select("post_id, user_id")
      .in("post_id", postIds);

    const enrichedPosts = postsData?.map(post => {
      const profile = profilesData?.find(p => p.user_id === post.user_id);
      const postLikes = likesData?.filter(l => l.post_id === post.id) || [];
      const isLiked = postLikes.some(l => l.user_id === user.id);
      
      const postComments = commentsData?.filter(c => c.post_id === post.id).map(comment => ({
        ...comment,
        profile: commentProfilesData?.find(p => p.user_id === comment.user_id) as Profile
      })) || [];

      const postShares = sharesData?.filter(s => s.post_id === post.id) || [];
      const isShared = postShares.some(s => s.user_id === user.id);
      
      return {
        ...post,
        profile,
        likes: postLikes.length,
        isLiked,
        comments: postComments,
        commentCount: postComments.length,
        shareCount: postShares.length,
        isShared
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if ((!newPostContent.trim() && !selectedImage) || !currentUser) return;

    setIsCreatingPost(true);
    let imageUrl = null;

    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${currentUser.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, selectedImage);

      if (uploadError) {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image",
          variant: "destructive",
        });
        setIsCreatingPost(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: currentUser.id,
      content: newPostContent.trim(),
      image_url: imageUrl,
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
    setSelectedImage(null);
    setImagePreview(null);
    setIsCreatingPost(false);
    toast({
      title: "Succès",
      description: "Post créé avec succès",
    });
  };

  const toggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!currentUser) return;

    const post = posts.find(p => p.id === postId);

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

      // Create notification
      if (post && post.user_id !== currentUser.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: currentUser.id,
          post_id: postId,
          type: "like",
        });
      }
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: isCurrentlyLiked ? (p.likes || 0) - 1 : (p.likes || 0) + 1,
          isLiked: !isCurrentlyLiked
        };
      }
      return p;
    }));
  };

  const addComment = async (postId: string) => {
    if (!currentUser) return;

    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) return;

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: commentContent,
      });

    if (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    
    // Create notification
    if (post && post.user_id !== currentUser.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: currentUser.id,
        post_id: postId,
        type: "comment",
        content: commentContent,
      });
    }

    setCommentInputs({ ...commentInputs, [postId]: "" });
    await fetchPosts();
    toast({
      title: "Succès",
      description: "Commentaire ajouté",
    });
  };

  const toggleShare = async (postId: string, isCurrentlyShared: boolean) => {
    if (!currentUser) return;

    const post = posts.find(p => p.id === postId);

    if (isCurrentlyShared) {
      const { error } = await supabase
        .from("post_shares")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error unsharing post:", error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("post_shares")
        .insert({ post_id: postId, user_id: currentUser.id });

      if (error) {
        console.error("Error sharing post:", error);
        return;
      }

      // Create notification
      if (post && post.user_id !== currentUser.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: currentUser.id,
          post_id: postId,
          type: "share",
        });
      }

      toast({
        title: "Succès",
        description: "Post partagé",
      });
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          shareCount: isCurrentlyShared ? (p.shareCount || 0) - 1 : (p.shareCount || 0) + 1,
          isShared: !isCurrentlyShared
        };
      }
      return p;
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
                
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}

                <div className="flex justify-between items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image size={20} />
                  </Button>
                  
                  <Button
                    onClick={createPost}
                    disabled={(!newPostContent.trim() && !selectedImage) || isCreatingPost}
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
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="mt-3 w-full rounded-lg object-cover max-h-96"
                    />
                  )}
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
                  
                  <button 
                    onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                    className="flex items-center gap-2 group"
                  >
                    <MessageCircle
                      size={20}
                      className="text-foreground group-hover:text-primary transition-colors"
                    />
                    {post.commentCount ? (
                      <span className="text-sm text-muted-foreground">
                        {post.commentCount}
                      </span>
                    ) : null}
                  </button>

                  <button 
                    onClick={() => toggleShare(post.id, post.isShared || false)}
                    className="flex items-center gap-2 group ml-auto"
                  >
                    <Share2
                      size={20}
                      className={`transition-colors ${
                        post.isShared
                          ? "fill-primary text-primary"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    />
                    {post.shareCount ? (
                      <span className="text-sm text-muted-foreground">
                        {post.shareCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="px-4 pb-3 pt-2 space-y-3 border-t border-border/50">
                    {post.comments && post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {comment.profile?.nickname?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/30 rounded-lg px-3 py-2">
                            <p className="font-semibold text-xs">
                              {comment.profile?.nickname || "Utilisateur"}
                            </p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-1">
                            {formatTimeAgo(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <Input
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        placeholder="Ajouter un commentaire..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addComment(post.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => addComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Feed;
