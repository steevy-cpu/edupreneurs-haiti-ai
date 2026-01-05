import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Send, Plus, Image, Share2, Trash2, Smile, Reply, BadgeCheck, ArrowLeft, RefreshCw, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
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
import { useFeedData } from "@/hooks/useFeedData";
import { formatTimeAgo } from "@/utils/dateUtils";
import { Profile, Post, Comment } from "@/types/feed";

// Function to render content with clickable links
const renderContentWithLinks = (content: string) => {
  // Match internal routes (starting with /) and external URLs
  const linkRegex = /(\/[a-zA-Z0-9\-_/]+|https?:\/\/[^\s]+)/g;
  const parts = content.split(linkRegex);
  
  return parts.map((part, index) => {
    // Check if this part is an internal route
    if (part.startsWith('/') && part.length > 1) {
      return (
        <Link 
          key={index} 
          to={part} 
          className="text-primary hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    // Check if this part is an external URL
    if (part.match(/^https?:\/\//)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { posts, isLoading, isRefreshing, refreshFeed, updatePostOptimistically, removePostOptimistically } = useFeedData();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPublicPost, setIsPublicPost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: string | null }>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState<Post | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Profile[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
    const cleanup = subscribeToNewPosts();
    return cleanup;
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const handleRefresh = () => {
    refreshFeed();
    toast({
      title: "Actualisation...",
      description: "Le fil d'actualité est en cours de mise à jour.",
    });
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
          refreshFeed();
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
      is_public: isPublicPost,
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
    setSelectedVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    setIsPublicPost(false);
    setIsCreatingPost(false);
    toast({
      title: "Succès",
      description: isPublicPost ? "Post public créé avec succès" : "Post créé avec succès",
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
    refreshFeed();
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
    refreshFeed();
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

      // Create notification for post owner
      if (post && post.user_id !== currentUser.id) {
        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: currentUser.id,
          post_id: postId,
          type: "like",
        });

        if (notifError) {
          console.error("❌ Error creating like notification:", notifError);
        } else {
          console.log("✅ Like notification created");
          
          // Send push notification
          try {
            await supabase.functions.invoke('send-push-notification', {
              body: {
                recipientUserId: post.user_id,
                actorId: currentUser.id,
                type: 'like',
                entityId: postId,
                url: '/feed',
              }
            });
            console.log("✅ Like push notification sent");
          } catch (pushError) {
            console.error("❌ Error sending like push notification:", pushError);
          }
        }
      }
    }

    // Optimistic update for likes
    updatePostOptimistically(postId, {
      likes: isCurrentlyLiked ? ((posts.find(p => p.id === postId)?.likes || 0) - 1) : ((posts.find(p => p.id === postId)?.likes || 0) + 1),
      isLiked: !isCurrentlyLiked
    });
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
    
    // Create notification for post owner
    if (post && post.user_id !== currentUser.id) {
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: currentUser.id,
        post_id: postId,
        type: "comment",
        content: commentContent,
      });

      if (notifError) {
        console.error("❌ Error creating notification:", notifError);
      } else {
        console.log("✅ Notification created successfully");
        
        // Send push notification via edge function
        try {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              recipientUserId: post.user_id,
              actorId: currentUser.id,
              type: 'comment',
              entityId: postId,
              url: '/feed',
            }
          });
          console.log("✅ Push notification sent");
        } catch (pushError) {
          console.error("❌ Error sending push notification:", pushError);
        }
      }
    }

    if (parentCommentId) {
      setReplyInputs({ ...replyInputs, [parentCommentId]: "" });
      setReplyingTo({ ...replyingTo, [postId]: null });
    } else {
      setCommentInputs({ ...commentInputs, [postId]: "" });
    }
    
    refreshFeed();
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

      // Create notification for post owner
      if (post && post.user_id !== currentUser.id) {
        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: currentUser.id,
          post_id: postId,
          type: "share",
        });

        if (notifError) {
          console.error("❌ Error creating share notification:", notifError);
        } else {
          console.log("✅ Share notification created");
          
          // Send push notification
          try {
            await supabase.functions.invoke('send-push-notification', {
              body: {
                recipientUserId: post.user_id,
                actorId: currentUser.id,
                type: 'share',
                entityId: postId,
                url: '/feed',
              }
            });
            console.log("✅ Share push notification sent");
          } catch (pushError) {
            console.error("❌ Error sending share push notification:", pushError);
          }
        }
      }

      toast({
        title: "Succès",
        description: "Post partagé",
      });
    }

    // Optimistic update for shares
    updatePostOptimistically(postId, {
      shareCount: isCurrentlyShared ? ((posts.find(p => p.id === postId)?.shareCount || 0) - 1) : ((posts.find(p => p.id === postId)?.shareCount || 0) + 1),
      isShared: !isCurrentlyShared
    });
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

  const renderComment = (comment: Comment, postId: string, isReply: boolean = false) => (
    <div key={comment.id} className={`flex gap-2.5 ${isReply ? "ml-8 mt-2" : ""}`}>
      <Avatar 
        className="h-8 w-8 flex-shrink-0 ring-1 ring-border cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(`/profile/${comment.user_id}`)}
      >
        <AvatarImage src={getAvatarUrl(comment.profile?.avatar_url)} />
        <AvatarFallback className="text-xs font-medium">
          {comment.profile?.nickname?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-background rounded-xl px-3 py-2 shadow-sm border border-border/30">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p 
              className="font-semibold text-xs cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${comment.user_id}`)}
            >
              {comment.profile?.nickname || "Utilisateur"}
            </p>
            {comment.profile?.verified && (
              <BadgeCheck className="w-3 h-3 text-primary fill-primary/20" />
            )}
            <span className="text-[10px] text-muted-foreground">
              · {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm break-words leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1.5 px-2">
          {!isReply && (
            <button
              onClick={() => setReplyingTo({ ...replyingTo, [postId]: comment.id })}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <Reply size={12} />
              Répondre
            </button>
          )}
          {comment.user_id === currentUser?.id && (
            <button
              onClick={() => setDeleteCommentId(comment.id)}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
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
              className="flex-1 h-8 text-sm"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
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
              size="icon"
              onClick={() => addComment(postId, comment.id)}
              disabled={!replyInputs[comment.id]?.trim()}
              className="h-8 w-8 shrink-0"
            >
              <Send size={14} />
            </Button>
          </div>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => renderComment(reply, postId, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      {/* Notification Permission Banner */}
      {currentUser && <NotificationPermissionBanner userId={currentUser.id} />}
      
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 safe-area-top">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="h-9 w-9"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">Fil d'actualité</h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 w-9 hover:bg-accent/50"
              title="Actualiser"
            >
              <RefreshCw size={18} className={`sm:w-5 sm:h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <ThemeToggle />
            <CreatePostDialog currentUser={currentUser} onPostCreated={refreshFeed} />
          </div>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="h-[calc(100dvh-56px)]">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            // Loading skeleton - show while data is being fetched
            <div className="space-y-3 px-3 sm:px-4 pt-3 sm:pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border/30 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 rounded-full bg-muted/50" />
                    <div className="flex-1">
                      <div className="h-4 w-28 bg-muted/50 rounded mb-1.5" />
                      <div className="h-3 w-16 bg-muted/30 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/40 rounded" />
                    <div className="h-4 w-3/4 bg-muted/40 rounded" />
                  </div>
                  <div className="flex gap-6 mt-4 pt-3 border-t border-border/30">
                    <div className="h-8 w-16 bg-muted/30 rounded-full" />
                    <div className="h-8 w-16 bg-muted/30 rounded-full" />
                    <div className="h-8 w-16 bg-muted/30 rounded-full ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium mb-2">Aucun post pour le moment</h3>
              <p className="text-sm text-muted-foreground max-w-[200px] mb-4">
                Suivez des personnes pour voir leurs posts ici
              </p>
              <Button onClick={() => navigate('/user-search')} variant="outline" className="gap-2">
                Rechercher des utilisateurs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 px-3 sm:px-4 pt-3 sm:pt-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-card rounded-xl shadow-sm border border-border/30 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar 
                    className="h-11 w-11 ring-2 ring-background shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    <AvatarImage src={getAvatarUrl(post.profile?.avatar_url)} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground font-medium">
                      {post.profile?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p 
                        className="font-semibold text-sm cursor-pointer hover:underline truncate"
                        onClick={() => navigate(`/profile/${post.user_id}`)}
                      >
                        {post.profile?.full_name || "Utilisateur"}
                      </p>
                      {post.profile?.verified && (
                        <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                      )}
                      {post.is_public && (
                        <span title="Post public" className="shrink-0">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                  {post.user_id === currentUser?.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletePostId(post.id)}
                      className="h-8 w-8 shrink-0"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  )}
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {renderContentWithLinks(post.content.length > 150 && !expandedPosts[post.id] 
                      ? post.content.slice(0, 150) 
                      : post.content)}
                    {post.content.length > 150 && !expandedPosts[post.id] && (
                      <button 
                        onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: true }))}
                        className="text-muted-foreground hover:text-foreground ml-1 font-medium"
                      >
                        ...voir plus
                      </button>
                    )}
                    {post.content.length > 150 && expandedPosts[post.id] && (
                      <button 
                        onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: false }))}
                        className="text-muted-foreground hover:text-foreground ml-1 font-medium block mt-1"
                      >
                        voir moins
                      </button>
                    )}
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
                <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border/30">
                  <button
                    onClick={() => toggleLike(post.id, post.isLiked || false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                      post.isLiked 
                        ? "bg-red-500/10 text-red-500" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={18}
                      className={post.isLiked ? "fill-current" : ""}
                    />
                    {post.likes ? (
                      <span className="text-sm font-medium">
                        {post.likes}
                      </span>
                    ) : null}
                  </button>
                  
                  <button 
                    onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                      showComments[post.id]
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <MessageCircle size={18} />
                    {post.commentCount ? (
                      <span className="text-sm font-medium">
                        {post.commentCount}
                      </span>
                    ) : null}
                  </button>

                  <button 
                    onClick={() => openShareDialog(post)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all duration-200 ml-auto"
                  >
                    <Share2 size={18} />
                    {post.shareCount ? (
                      <span className="text-sm font-medium">
                        {post.shareCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="px-4 pb-4 pt-3 space-y-3 bg-muted/20">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => renderComment(comment, post.id))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">Aucun commentaire</p>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex gap-2 pt-2 border-t border-border/30">
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
                        className="flex-1 h-9 text-sm"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0">
                            <Smile size={18} />
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
                        size="icon"
                        onClick={() => addComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="h-9 w-9 shrink-0"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
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
