import { useState, useEffect, useRef, useCallback, type FocusEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Send, Plus, Image, Share2, Trash2, Smile, Reply, BadgeCheck, ArrowLeft, RefreshCw, Globe, MoreHorizontal, Flag, Pencil, ArrowUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { EditPostDialog } from "@/components/feed/EditPostDialog";
import { JUDE_USER_ID } from "@/types/community";
import { isFounder as isFounderUser } from "@/lib/founderConstants";
// Founders and Jude (AI assistant) — suppress grade tags and public globe icon
const isSpecialAccount = (userId: string) => isFounderUser(userId) || userId === JUDE_USER_ID;
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
import { LazyEmojiPicker } from "@/components/LazyEmojiPicker";
import { getAvatarUrl } from "@/lib/avatarMap";

import { useFeedData } from "@/hooks/useFeedData";
import { useLazyComments } from "@/hooks/useLazyComments";
import { formatTimeAgo } from "@/utils/dateUtils";
import { Profile, Post, Comment } from "@/types/feed";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useVisitor } from "@/contexts/VisitorContext";
import { LockedOverlay } from "@/components/visitor";
import { visitorFeedPosts } from "@/data/visitorDemoData";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";

// Plan C Fix 5: Increased truncation for educational content (was 150)
const MAX_CONTENT_PREVIEW = 280;

// Grade badge color map for academic level display on post cards (Fix 5)
const GRADE_COLORS: Record<string, string> = {
  '7AF': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '8AF': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  '9AF': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'NS1': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'NS2': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'NS3': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'NS4': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'UNIV': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};
import { VisitorFeedOverlay } from "@/components/feed/VisitorFeedOverlay";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { NetworkAwareImage, NetworkAwareVideo } from "@/components/feed/NetworkAwareMedia";

// Function to render content with clickable links, @mentions, and plain domains
const renderContentWithLinks = (content: string) => {
  // Match:
  // 1. @mentions (@username)
  // 2. Full URLs (https://example.com or http://example.com)
  // 3. Plain domains (example.com, sub.example.com)
  // 4. Internal routes (/path/to/page)
  const combinedRegex = /(@\w+|https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:com|org|net|io|dev|co|edu|gov|app|ht|fr|info|biz|me|tv|us|uk|ca|au|de|jp|cn|in|br|mx|es|it|nl|be|ch|at|se|no|dk|fi|pl|cz|ru|kr|tw|hk|sg|my|th|ph|vn|id|za|ng|ke|gh|eg|ma|tn|dz)[^\s]*|\/[a-zA-Z0-9\-_/]+)/gi;
  
  const parts = content.split(combinedRegex);
  
  return parts.map((part, index) => {
    if (!part) return null;
    
    // 1. @mentions - styled as clickable text with primary color
    if (part.startsWith('@')) {
      const nickname = part.slice(1);
      return (
        <span 
          key={index} 
          className="text-primary font-semibold hover:underline cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation();
            // Lookup user_id by nickname and navigate
            const { supabase } = await import("@/integrations/supabase/client");
            const { data } = await supabase
              .from('profiles')
              .select('user_id')
              .ilike('nickname', nickname)
              .single();
            if (data?.user_id) {
              window.location.href = `/profile/${data.user_id}`;
            }
          }}
        >
          {part}
        </span>
      );
    }
    
    // 2. Full URLs with http/https
    if (part.match(/^https?:\/\//i)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    
    // 3. Plain domains (add https:// for the href)
    if (part.match(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:com|org|net|io|dev|co|edu|gov|app|ht|fr|info|biz|me|tv|us|uk|ca|au|de|jp|cn|in|br|mx|es|it|nl|be|ch|at|se|no|dk|fi|pl|cz|ru|kr|tw|hk|sg|my|th|ph|vn|id|za|ng|ke|gh|eg|ma|tn|dz)/i)) {
      return (
        <a 
          key={index} 
          href={`https://${part}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    
    // 4. Internal routes
    if (part.startsWith('/') && part.length > 1) {
      return (
        <Link 
          key={index} 
          to={part} 
          className="text-primary hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    
    return part;
  });
};

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { posts, isLoading, isRefreshing, refreshFeed, updatePostOptimistically, removePostOptimistically, addPostOptimistically, hasMore, isFetchingMore, fetchMorePosts } = useFeedData();
  const { isSlowConnection, imageQuality } = useNetworkAwareLoading();
  // Fix 3: Use session auth context instead of duplicate supabase.auth.getUser() call
  const { user: sessionUser } = useSessionAuth();
  const currentUser = sessionUser;
  const { commentsCache, loadingComments, fetchCommentsForPost, addCommentToCache, removeCommentFromCache } = useLazyComments();
  // Plan C Fix 1: Network-aware post entry animations
  const { shouldAnimate } = useNetworkAwareAnimations();
  // Track initial load vs paginated — stagger only on first render
  const initialLoadCompleteRef = useRef(false);

  // Plan C Fix 2: Pull-to-refresh state for mobile
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: string | null }>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});
  const [deleteCommentInfo, setDeleteCommentInfo] = useState<{ commentId: string; postId: string } | null>(null);
  // Keep setDeleteCommentId for backward compat in renderComment — wraps deleteCommentInfo
  const deleteCommentId = deleteCommentInfo?.commentId || null;
  const setDeleteCommentId = (id: string | null) => setDeleteCommentInfo(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState<Post | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Profile[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { isVisitor } = useVisitor();
  const [visitorPosts, setVisitorPosts] = useState<Post[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [postToReport, setPostToReport] = useState<Post | null>(null);
  const [isFounder, setIsFounder] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  // Plan B: Queue for realtime posts arriving while user is scrolling
  const [newPostsQueue, setNewPostsQueue] = useState<Post[]>([]);
  // Refs for infinite scroll and scroll-position tracking
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mobile keyboard optimization - scroll input into view
  const handleInputFocus = useCallback((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);


  // Transform demo data for visitors
  useEffect(() => {
    if (isVisitor) {
      const demoPosts: Post[] = visitorFeedPosts.map((post, index) => ({
        id: post.id,
        user_id: `demo-user-${index}`,
        content: post.content,
        image_url: null,
        video_url: null,
        created_at: post.created_at,
        is_public: true,
        profile: {
          id: `demo-profile-${index}`,
          user_id: `demo-user-${index}`,
          full_name: post.author.nickname,
          nickname: post.author.nickname,
          avatar_url: post.author.avatar_url,
          verified: index === 0,
        },
        likes: post.likes_count,
        isLiked: false,
        comments: [],
        commentCount: post.comments_count,
        shareCount: Math.floor(Math.random() * 5),
        isShared: false,
      }));
      setVisitorPosts(demoPosts);
    }
  }, [isVisitor]);

  // Fix 3: Auth now comes from useSessionAuth — no separate checkAuth needed
  // Fix 4: Subscribe to targeted realtime updates (not full refetch)
  useEffect(() => {
    if (isVisitor || !currentUser) return;
    const cleanup = subscribeToNewPosts();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisitor, !!currentUser]);

  // Mark feed as visited when page loads (resets unread count)
  // Uses sessionAuth user to avoid extra auth call
  useEffect(() => {
    if (!isVisitor && currentUser) {
      supabase
        .from('profiles')
        .update({ last_feed_visit: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .then(() => {
          window.dispatchEvent(new CustomEvent('feed-visited'));
        });
    }
  }, [isVisitor, currentUser]);

  // Check if current user is a founder
  useEffect(() => {
    const checkFounderStatus = async () => {
      if (!currentUser) return;
      
      const { data, error } = await supabase.rpc('is_founder');
      
      if (!error && data) {
        setIsFounder(true);
      }
    };
    
    checkFounderStatus();
  }, [currentUser]);

  // Use visitor posts when in visitor mode
  const displayPosts = isVisitor ? visitorPosts : posts;

  const handleRefresh = () => {
    refreshFeed();
    toast({
      title: "Actualisation...",
      description: "Le fil d'actualité est en cours de mise à jour.",
    });
  };

  // Plan B: IntersectionObserver for infinite scroll — triggers fetchMorePosts
  useEffect(() => {
    if (!sentinelRef.current || isVisitor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          fetchMorePosts();
        }
      },
      { rootMargin: '200px' } // Pre-fetch 200px before reaching bottom
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isVisitor, fetchMorePosts]);

  // Fix 4 + Plan B: Targeted realtime with new-post badge when scrolling
  const subscribeToNewPosts = () => {
    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "posts",
      }, async (payload) => {
        // Fetch only the new post's author profile (1 query, not full refetch)
        const newPost = payload.new as any;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, nickname, avatar_url, verified, academic_grade")
          .eq("user_id", newPost.user_id)
          .single();

        const enrichedPost: Post = {
          ...newPost,
          profile: profile as Profile,
          likes: 0, isLiked: false,
          comments: [], commentCount: 0,
          shareCount: 0, isShared: false,
        };

        // Check scroll position to decide: prepend or queue for badge
        const scrollContainer = scrollContainerRef.current;
        const isAtTop = scrollContainer ? scrollContainer.scrollTop < 100 : true;

        if (isAtTop) {
          // User is at top — prepend directly (no scroll jump)
          addPostOptimistically(enrichedPost);
        } else {
          // User is scrolling — queue for "Nouveau post" badge
          setNewPostsQueue(prev => [enrichedPost, ...prev]);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "posts",
      }, (payload) => {
        // Patch only the changed post in cache
        updatePostOptimistically(payload.new.id as string, payload.new as Partial<Post>);
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "posts",
      }, (payload) => {
        // Remove from cache — no fetch needed
        removePostOptimistically((payload.old as any).id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Plan C Fix 2: Pull-to-refresh touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only activate when scrolled to top
    if (scrollContainerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      // Resistance factor: indicator moves slower than finger
      setPullDistance(deltaY * 0.4);
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60 && !isRefreshing && !isFetchingMore) {
      refreshFeed();
      toast({ title: "Actualisation...", description: "Le fil d'actualité est en cours de mise à jour." });
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, isRefreshing, isFetchingMore, refreshFeed, toast]);

  // Plan C Fix 1: Mark initial load complete after first posts render
  useEffect(() => {
    if (posts.length > 0 && !initialLoadCompleteRef.current) {
      // Small delay to let initial stagger animation play
      const timer = setTimeout(() => { initialLoadCompleteRef.current = true; }, 600);
      return () => clearTimeout(timer);
    }
  }, [posts.length]);

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

  const deleteComment = async (commentId: string, postId?: string) => {
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
    setDeleteCommentInfo(null);
    // Fix 2: Remove from local cache instead of full refetch
    if (postId) {
      removeCommentFromCache(postId, commentId);
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePostOptimistically(postId, { commentCount: Math.max(0, (post.commentCount || 0) - 1) });
      }
    }
  };

  const toggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (isVisitor) {
      toast({
        title: "Créez un compte",
        description: "Inscrivez-vous pour aimer les publications !",
      });
      return;
    }
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
    if (isVisitor) {
      toast({
        title: "Créez un compte",
        description: "Inscrivez-vous pour commenter les publications !",
      });
      return;
    }
    if (!currentUser) return;

    const commentContent = parentCommentId 
      ? replyInputs[parentCommentId]?.trim() 
      : commentInputs[postId]?.trim();
    
    if (!commentContent) return;

    const { data: newCommentData, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: commentContent,
        parent_comment_id: parentCommentId,
      })
      .select()
      .single();

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
    
    // Fix 2: Append comment to local cache instead of full refetch
    if (newCommentData) {
      // Build profile for the new comment from current user session
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, nickname, avatar_url, verified, academic_grade")
        .eq("user_id", currentUser.id)
        .single();

      const newComment: Comment = {
        ...newCommentData,
        profile: myProfile as Profile,
        replies: [],
      };
      addCommentToCache(postId, newComment);
      // Increment comment count in feed cache
      updatePostOptimistically(postId, { commentCount: (post?.commentCount || 0) + 1 });
    }

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

  // Plan C Fix 4: Single RPC replaces N+1 conversation lookup loop
  const sendPostAsMessage = async (recipientUserId: string) => {
    if (!currentUser || !selectedPostToShare) return;
    setSendingMessage(true);

    try {
      // Single RPC call finds or creates DM conversation atomically
      const { data: conversationId, error: convError } = await supabase
        .rpc("start_direct_conversation", { other_user_id: recipientUserId });

      if (convError) throw convError;

      // Send the shared post message
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: "📝 Post partagé",
          shared_post_id: selectedPostToShare.id,
        });

      if (messageError) throw messageError;

      // Record the share
      await supabase
        .from("post_shares")
        .insert({ post_id: selectedPostToShare.id, user_id: currentUser.id });

      toast({ title: "Succès", description: "Post envoyé en message" });
      setShareDialogOpen(false);
      setSelectedPostToShare(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Erreur", description: "Impossible d'envoyer le message", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleShare = async (postId: string, isCurrentlyShared: boolean) => {
    if (isVisitor) {
      toast({
        title: "Créez un compte",
        description: "Inscrivez-vous pour partager les publications !",
      });
      return;
    }
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
        <AvatarImage src={getAvatarUrl(comment.profile?.avatar_url)} loading="lazy" decoding="async" />
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
              {comment.profile?.nickname ?? comment.profile?.full_name ?? 'Étudiant'}
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
              onClick={() => setDeleteCommentInfo({ commentId: comment.id, postId })}
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
                              onFocus={handleInputFocus}
                              className="flex-1 h-8 text-sm mobile-input tap-highlight-none"
                              autoCapitalize="sentences"
                              autoCorrect="on"
                              spellCheck={false}
                              enterKeyHint="send"
                              inputMode="text"
                            />
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                  <Smile size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <LazyEmojiPicker
                  onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, postId, comment.id)}
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
    <main className="relative h-dvh bg-background flex flex-col overflow-hidden">
      {/* Visitor Overlay */}
      {isVisitor && <VisitorFeedOverlay />}
      
      {/* Header */}
      <header className="shrink-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 safe-area-top">
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
              disabled={isRefreshing || isVisitor}
              className="h-9 w-9 hover:bg-accent/50"
              title="Actualiser"
            >
              <RefreshCw size={18} className={`sm:w-5 sm:h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <ThemeToggle />
            {!isVisitor && currentUser && (
              <CreatePostDialog currentUser={currentUser} onPostCreated={refreshFeed} />
            )}
          </div>
        </div>
      </header>

      {/* Feed — scroll-anchoring + pull-to-refresh touch handlers */}
      <section
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain pb-20 lg:pb-6"
        style={{ overflowAnchor: 'auto' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Plan C Fix 2: Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="flex justify-center py-2 transition-transform"
            style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
          >
            <RefreshCw className={`h-5 w-5 text-muted-foreground ${pullDistance > 60 ? 'text-primary animate-spin' : ''}`} />
          </div>
        )}
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
          ) : displayPosts.length === 0 ? (
            <div className="py-8 px-4">
              <EmptyState
                illustration="empty-feed"
                title="Aucun post pour le moment"
                description="Suivez des personnes pour voir leurs posts ici"
                ctaLabel="Rechercher des utilisateurs"
                ctaAction={() => navigate('/user-search')}
              />
            </div>
          ) : (
            <div className="space-y-3 px-3 sm:px-4 pt-3 sm:pt-4" data-tour="feed-content">
            {/* Plan B: New posts badge — appears when posts arrive while user scrolls */}
            <AnimatePresence>
              {newPostsQueue.length > 0 && (
                <motion.button
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  onClick={() => {
                    // Prepend all queued posts and scroll to top
                    newPostsQueue.forEach(p => addPostOptimistically(p));
                    setNewPostsQueue([]);
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="sticky top-2 z-30 mx-auto flex items-center gap-1.5 px-3 py-1.5 
                             bg-primary text-primary-foreground rounded-full shadow-lg text-sm font-medium
                             hover:bg-primary/90 transition-colors"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  {newPostsQueue.length} nouveau{newPostsQueue.length > 1 ? 'x' : ''} post{newPostsQueue.length > 1 ? 's' : ''}
                </motion.button>
              )}
            </AnimatePresence>
            {displayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldAnimate ? {
                  duration: 0.25,
                  ease: "easeOut",
                  // Stagger only on initial load, capped at 0.3s
                  delay: !initialLoadCompleteRef.current ? Math.min(index * 0.05, 0.3) : 0,
                } : { duration: 0 }}
                className="bg-card rounded-xl shadow-sm border border-border/30 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar 
                    className="h-11 w-11 ring-2 ring-background shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    <AvatarImage src={getAvatarUrl(post.profile?.avatar_url)} loading="lazy" decoding="async" />
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
                        {post.profile?.full_name ?? post.profile?.nickname ?? 'Étudiant'}
                      </p>
                      {post.profile?.verified && (
                        <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                      )}
                      {post.is_public && !isSpecialAccount(post.user_id) && (
                        <span title="Post public" className="shrink-0">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        </span>
                      )}
                      {/* Fix 5: Grade tag badge — informational, no filtering */}
                      {post.profile?.academic_grade && 
                       post.profile.academic_grade !== 'NONE' && 
                       !isSpecialAccount(post.user_id) &&
                       GRADE_COLORS[post.profile.academic_grade] && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${GRADE_COLORS[post.profile.academic_grade]}`}>
                          {post.profile.academic_grade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                  {currentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border z-50">
                        {/* Edit option - shown for own posts OR founders on Jude's posts */}
                        {(post.user_id === currentUser?.id || (isFounder && post.user_id === JUDE_USER_ID)) && (
                          <DropdownMenuItem onClick={() => setEditingPost(post)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        )}
                        
                        {/* Delete option - shown for own posts OR founders on Jude's posts */}
                        {(post.user_id === currentUser?.id || (isFounder && post.user_id === JUDE_USER_ID)) && (
                          <DropdownMenuItem 
                            onClick={() => setDeletePostId(post.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                        
                        {/* Separator - only when founder viewing Jude's post */}
                        {isFounder && post.user_id === JUDE_USER_ID && (
                          <DropdownMenuSeparator />
                        )}
                        
                        {/* Report option - shown for other users' posts */}
                        {post.user_id !== currentUser?.id && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setPostToReport(post);
                              setReportDialogOpen(true);
                            }}
                            className="text-amber-600 focus:text-amber-600"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Signaler
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {renderContentWithLinks(post.content.length > MAX_CONTENT_PREVIEW && !expandedPosts[post.id] 
                      ? post.content.slice(0, MAX_CONTENT_PREVIEW) 
                      : post.content)}
                    {post.content.length > MAX_CONTENT_PREVIEW && !expandedPosts[post.id] && (
                      <button 
                        onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: true }))}
                        className="text-muted-foreground hover:text-foreground ml-1 font-medium"
                      >
                        ...voir plus
                      </button>
                    )}
                    {post.content.length > MAX_CONTENT_PREVIEW && expandedPosts[post.id] && (
                      <button 
                        onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: false }))}
                        className="text-muted-foreground hover:text-foreground ml-1 font-medium block mt-1"
                      >
                        voir moins
                      </button>
                    )}
                  </p>
                  {post.image_url && (
                    <NetworkAwareImage 
                      src={post.image_url} 
                      alt="Post" 
                      className="mt-3 w-full rounded-lg object-contain max-h-[500px]"
                    />
                  )}
                  {post.video_url && (
                    <NetworkAwareVideo 
                      src={post.video_url} 
                      className="mt-3 w-full rounded-lg max-h-[500px]"
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
                    onClick={() => {
                      const isOpening = !showComments[post.id];
                      setShowComments({ ...showComments, [post.id]: isOpening });
                      // Fix 2: Lazy-load comments only when opening and count > 0
                      if (isOpening && (post.commentCount ?? 0) > 0) {
                        fetchCommentsForPost(post.id);
                      }
                    }}
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

                {/* Comments Section — Fix 2: lazy-loaded from commentsCache */}
                {showComments[post.id] && (
                  <div className="px-4 pb-4 pt-3 space-y-3 bg-muted/20">
                    {loadingComments[post.id] ? (
                      /* Skeleton while comments are being fetched */
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-2.5">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : commentsCache[post.id] && commentsCache[post.id].length > 0 ? (
                      commentsCache[post.id].map((comment) => renderComment(comment, post.id))
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
                        onFocus={handleInputFocus}
                        className="flex-1 h-9 text-sm mobile-input tap-highlight-none"
                        autoCapitalize="sentences"
                        autoCorrect="on"
                        spellCheck={false}
                        enterKeyHint="send"
                        inputMode="text"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0">
                            <Smile size={18} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="end">
                          <LazyEmojiPicker
                            onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, post.id)}
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
              </motion.div>
            ))}

            {/* Plan B: Loading spinner while fetching next page */}
            {isFetchingMore && (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Plan B: End-of-feed message */}
            {!hasMore && displayPosts.length > 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Tu as tout vu! 🎉
              </div>
            )}

            {/* Plan B: Invisible sentinel for IntersectionObserver */}
            <div ref={sentinelRef} className="h-1" />
            </div>
          )}
        </div>
      </section>

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
      <AlertDialog open={!!deleteCommentInfo} onOpenChange={() => setDeleteCommentInfo(null)}>
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
              onClick={() => deleteCommentInfo && deleteComment(deleteCommentInfo.commentId, deleteCommentInfo.postId)}
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

      {/* Report Post Dialog */}
      {reportDialogOpen && postToReport && (
        <ReportDialog
          isOpen={reportDialogOpen}
          onClose={() => {
            setReportDialogOpen(false);
            setPostToReport(null);
          }}
          postId={postToReport.id}
          reportedUserId={postToReport.user_id}
          reportedUserName={postToReport.profile?.full_name || postToReport.profile?.nickname}
        />
      )}

      {/* Edit Post Dialog */}
      {editingPost && (
        <EditPostDialog
          post={editingPost}
          isOpen={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          onPostUpdated={() => {
            setEditingPost(null);
            refreshFeed();
          }}
        />
      )}
    </main>
  );
};

export default Feed;
