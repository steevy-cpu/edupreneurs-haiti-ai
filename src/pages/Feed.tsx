import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Send, Plus, Image, Share2, Trash2, Smile, Reply, BadgeCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { optimizeMediaFile, formatFileSize } from "@/utils/mediaOptimization";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id: string | null;
  profile: Profile;
  replies?: Comment[];
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
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
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: string | null }>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState<Post | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Profile[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const fetchPosts = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      setIsRefreshing(false);
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
      
      // Organize comments with replies
      const postComments = commentsData?.filter(c => c.post_id === post.id).map(comment => ({
        ...comment,
        profile: commentProfilesData?.find(p => p.user_id === comment.user_id) as Profile
      })) || [];

      // Build nested comment structure
      const topLevelComments = postComments.filter(c => !c.parent_comment_id);
      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: postComments.filter(c => c.parent_comment_id === comment.id)
      }));

      const postShares = sharesData?.filter(s => s.post_id === post.id) || [];
      const isShared = postShares.some(s => s.user_id === user.id);
      
      return {
        ...post,
        profile,
        likes: postLikes.length,
        isLiked,
        comments: commentsWithReplies,
        commentCount: postComments.length,
        shareCount: postShares.length,
        isShared
      };
    }) || [];

    setPosts(enrichedPosts);
    
    if (showToast) {
      setIsRefreshing(false);
      toast({
        title: "Actualisation réussie",
        description: "Le fil d'actualité a été mis à jour.",
      });
    }
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: "Optimisation...",
        description: "Compression de l'image en cours...",
      });

      const { file: optimizedFile, originalSize, optimizedSize, savings } = await optimizeMediaFile(file, 'image');
      
      setSelectedImage(optimizedFile);
      setSelectedVideo(null);
      setVideoPreview(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(optimizedFile);

      if (savings > 10) {
        toast({
          title: "Image optimisée!",
          description: `Taille réduite de ${savings.toFixed(0)}% (${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)})`,
        });
      }
    } catch (error) {
      console.error('Error optimizing image:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'optimiser l'image",
        variant: "destructive",
      });
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file: validatedFile } = await optimizeMediaFile(file, 'video');
      
      setSelectedVideo(validatedFile);
      setSelectedImage(null);
      setImagePreview(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(validatedFile);

      const sizeInMB = validatedFile.size / (1024 * 1024);
      if (sizeInMB > 10) {
        toast({
          title: "Vidéo volumineuse",
          description: `Taille: ${formatFileSize(validatedFile.size)}. Envisagez de compresser pour économiser de l'espace.`,
        });
      }
    } catch (error: any) {
      console.error('Error validating video:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger la vidéo",
        variant: "destructive",
      });
      e.target.value = ''; // Reset input
    }
  };

  const createPost = async () => {
    if ((!newPostContent.trim() && !selectedImage && !selectedVideo) || !currentUser) return;

    setIsCreatingPost(true);
    let imageUrl = null;
    let videoUrl = null;

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

    if (selectedVideo) {
      const fileExt = selectedVideo.name.split('.').pop();
      const fileName = `${currentUser.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, selectedVideo);

      if (uploadError) {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger la vidéo",
          variant: "destructive",
        });
        setIsCreatingPost(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);
      
      videoUrl = publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: currentUser.id,
      content: newPostContent.trim(),
      image_url: imageUrl,
      video_url: videoUrl,
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

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Post supprimé",
    });
    setDeletePostId(null);
    await fetchPosts();
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Commentaire supprimé",
    });
    setDeleteCommentId(null);
    await fetchPosts();
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

  const addComment = async (postId: string, parentCommentId: string | null = null) => {
    if (!currentUser) return;

    const commentContent = parentCommentId 
      ? replyInputs[parentCommentId]?.trim() 
      : commentInputs[postId]?.trim();
    
    if (!commentContent) return;

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: commentContent,
        parent_comment_id: parentCommentId,
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
    
    if (post && post.user_id !== currentUser.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: currentUser.id,
        post_id: postId,
        type: "comment",
        content: commentContent,
      });
    }

    if (parentCommentId) {
      setReplyInputs({ ...replyInputs, [parentCommentId]: "" });
      setReplyingTo({ ...replyingTo, [postId]: null });
    } else {
      setCommentInputs({ ...commentInputs, [postId]: "" });
    }
    
    await fetchPosts();
    toast({
      title: "Succès",
      description: "Commentaire ajouté",
    });
  };

  const openShareDialog = async (post: Post) => {
    setSelectedPostToShare(post);
    
    // Fetch users that current user is following
    const { data: followsData, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUser.id)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching follows:", error);
      return;
    }

    const followingIds = followsData?.map(f => f.following_id) || [];
    
    if (followingIds.length === 0) {
      toast({
        title: "Aucun contact",
        description: "Vous ne suivez personne pour le moment",
        variant: "destructive"
      });
      return;
    }

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", followingIds);

    setFollowingUsers(profilesData || []);
    setShareDialogOpen(true);
  };

  const sendPostAsMessage = async (recipientUserId: string) => {
    if (!currentUser || !selectedPostToShare) return;

    setSendingMessage(true);

    try {
      // Find existing conversation or create new one
      const { data: existingConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUser.id);

      let conversationId: string | null = null;

      if (existingConversations) {
        for (const conv of existingConversations) {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.conversation_id);

          const userIds = participants?.map(p => p.user_id) || [];
          if (userIds.length === 2 && userIds.includes(recipientUserId)) {
            conversationId = conv.conversation_id;
            break;
          }
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .rpc("create_conversation");

        if (convError) throw convError;
        conversationId = newConv;

        // Add participants
        await supabase.from("conversation_participants").insert([
          { conversation_id: conversationId, user_id: currentUser.id },
          { conversation_id: conversationId, user_id: recipientUserId }
        ]);
      }

      // Send message with reference to the shared post
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: "📝 Post partagé",
          shared_post_id: selectedPostToShare.id
        });

      if (messageError) throw messageError;

      // Record the share
      await supabase
        .from("post_shares")
        .insert({ post_id: selectedPostToShare.id, user_id: currentUser.id });

      toast({
        title: "Succès",
        description: "Post envoyé en message"
      });

      setShareDialogOpen(false);
      setSelectedPostToShare(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
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

  const handleEmojiSelect = (emojiData: any, postId: string, commentId?: string) => {
    if (commentId) {
      setReplyInputs({
        ...replyInputs,
        [commentId]: (replyInputs[commentId] || "") + emojiData.emoji
      });
    } else {
      setCommentInputs({
        ...commentInputs,
        [postId]: (commentInputs[postId] || "") + emojiData.emoji
      });
    }
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

  const renderComment = (comment: Comment, postId: string, isReply: boolean = false) => (
    <div key={comment.id} className={`flex gap-2 ${isReply ? "ml-8" : ""}`}>
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarImage src={getAvatarUrl(comment.profile?.avatar_url)} />
        <AvatarFallback className="text-xs">
          {comment.profile?.nickname?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-xs">
              {comment.profile?.nickname || "Utilisateur"}
            </p>
            {comment.profile?.verified && (
              <BadgeCheck className="w-3 h-3 text-primary fill-primary/20" />
            )}
          </div>
          <p className="text-sm break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.created_at)}
          </p>
          {!isReply && (
            <button
              onClick={() => setReplyingTo({ ...replyingTo, [postId]: comment.id })}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Reply size={12} />
              Répondre
            </button>
          )}
          {comment.user_id === currentUser?.id && (
            <button
              onClick={() => setDeleteCommentId(comment.id)}
              className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
            >
              <Trash2 size={12} />
              Supprimer
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo[postId] === comment.id && (
          <div className="flex gap-2 mt-2">
            <Input
              value={replyInputs[comment.id] || ""}
              onChange={(e) =>
                setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
              }
              placeholder="Écrire une réponse..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addComment(postId, comment.id);
                }
              }}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Smile size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <EmojiPicker
                  onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, postId, comment.id)}
                  width="100%"
                />
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              onClick={() => addComment(postId, comment.id)}
              disabled={!replyInputs[comment.id]?.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, postId, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Notification Permission Banner */}
      {currentUser && <NotificationPermissionBanner userId={currentUser.id} />}
      
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Fil d'actualité</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fetchPosts(true)}
              disabled={isRefreshing}
              className="hover:bg-accent/50"
              title="Actualiser"
            >
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
            <ThemeToggle />
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
                    <img src={imagePreview} alt="Preview" className="w-full max-h-96 object-contain rounded-lg bg-muted/20" />
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

                {videoPreview && (
                  <div className="relative">
                    <video src={videoPreview} controls className="w-full max-h-96 rounded-lg bg-muted/20" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedVideo(null);
                        setVideoPreview(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}

                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      title="Ajouter une image"
                    >
                      <Image size={20} />
                    </Button>
                    
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => document.getElementById('video-upload')?.click()}
                      title="Ajouter une vidéo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    </Button>
                  </div>
                  
                  <Button
                    onClick={createPost}
                    disabled={(!newPostContent.trim() && !selectedImage && !selectedVideo) || isCreatingPost}
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
                    <AvatarImage src={getAvatarUrl(post.profile?.avatar_url)} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground">
                      {post.profile?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm">
                        {post.profile?.full_name || "Utilisateur"}
                      </p>
                      {post.profile?.verified && (
                        <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                  {post.user_id === currentUser?.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletePostId(post.id)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  )}
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
                      className="mt-3 w-full rounded-lg object-contain bg-muted/20"
                    />
                  )}
                  {post.video_url && (
                    <video 
                      src={post.video_url} 
                      controls 
                      className="mt-3 w-full rounded-lg bg-muted/20"
                      preload="metadata"
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
                    onClick={() => openShareDialog(post)}
                    className="flex items-center gap-2 group ml-auto"
                  >
                    <Share2
                      size={20}
                      className="text-foreground group-hover:text-primary transition-colors"
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
                    {post.comments && post.comments.map((comment) => renderComment(comment, post.id))}

                    {/* Add Comment Input */}
                    <div className="flex gap-2 pt-2">
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Smile size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="end">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, post.id)}
                            width="100%"
                          />
                        </PopoverContent>
                      </Popover>
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

      {/* Delete Post Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le post</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && deletePost(deletePostId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Dialog */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le commentaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && deleteComment(deleteCommentId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Post Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Partager le post</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {followingUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => sendPostAsMessage(user.user_id)}
                  disabled={sendingMessage}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Avatar>
                    <AvatarImage src={getAvatarUrl(user.avatar_url)} />
                    <AvatarFallback>
                      {user.nickname?.[0] || user.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{user.nickname || user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.full_name}</p>
                  </div>
                  <Send size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feed;
