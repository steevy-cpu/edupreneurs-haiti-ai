import { useState, useEffect, useRef, useCallback, type FocusEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFeedData } from "@/hooks/useFeedData";
import { useLazyComments } from "@/hooks/useLazyComments";
import { Profile, Post, Comment } from "@/types/feed";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useVisitor } from "@/contexts/VisitorContext";
import { visitorFeedPosts } from "@/data/visitorDemoData";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

/**
 * Core Feed logic hook — owns all state, refs, effects, and handlers.
 * Feed.tsx is left as a pure render shell.
 */
export const useFeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    posts, isLoading, isRefreshing, refreshFeed,
    updatePostOptimistically, removePostOptimistically, addPostOptimistically,
    hasMore, isFetchingMore, fetchMorePosts,
  } = useFeedData();
  const { isSlowConnection, imageQuality } = useNetworkAwareLoading();
  // Fix 3: Use session auth context instead of duplicate supabase.auth.getUser() call
  const { user: sessionUser } = useSessionAuth();
  const currentUser = sessionUser;
  const {
    commentsCache, loadingComments, fetchCommentsForPost,
    addCommentToCache, removeCommentFromCache,
  } = useLazyComments();
  // Plan C Fix 1: Network-aware post entry animations
  const { shouldAnimate } = useNetworkAwareAnimations();
  const { isVisitor } = useVisitor();

  // ── Refs ──────────────────────────────────────────────────────────
  // Track initial load vs paginated — stagger only on first render
  const initialLoadCompleteRef = useRef(false);
  const touchStartY = useRef(0);
  // Refs for infinite scroll and scroll-position tracking
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Per-post debounce lock — prevents spam clicks while a like is in-flight
  const isLikingRef = useRef<Set<string>>(new Set());

  // ── State ─────────────────────────────────────────────────────────
  // Plan C Fix 2: Pull-to-refresh state for mobile
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: string | null }>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});
  const [deleteCommentInfo, setDeleteCommentInfo] = useState<{ commentId: string; postId: string } | null>(null);
  // Keep setDeleteCommentId for backward compat in renderComment — wraps deleteCommentInfo
  const deleteCommentId = deleteCommentInfo?.commentId || null;
  const setDeleteCommentId = (_id: string | null) => setDeleteCommentInfo(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState<Post | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Profile[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [visitorPosts, setVisitorPosts] = useState<Post[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [postToReport, setPostToReport] = useState<Post | null>(null);
  const [isFounder, setIsFounder] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  // Plan B: Queue for realtime posts arriving while user is scrolling
  const [newPostsQueue, setNewPostsQueue] = useState<Post[]>([]);

  // ── Computed ──────────────────────────────────────────────────────
  // Use visitor posts when in visitor mode
  const displayPosts = isVisitor ? visitorPosts : posts;

  // ── Callbacks ─────────────────────────────────────────────────────

  // Mobile keyboard optimization - scroll input into view
  const handleInputFocus = useCallback((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  // Fix 4 + Plan B: Targeted realtime with new-post badge when scrolling
  const subscribeToNewPosts = useCallback(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addPostOptimistically, updatePostOptimistically, removePostOptimistically]);

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

  const handleRefresh = useCallback(() => {
    refreshFeed();
    toast({
      title: "Actualisation...",
      description: "Le fil d'actualité est en cours de mise à jour.",
    });
  }, [refreshFeed, toast]);

  const deletePost = useCallback(async (postId: string) => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le post", variant: "destructive" });
      return;
    }

    toast({ title: "Succès", description: "Post supprimé" });
    setDeletePostId(null);
    refreshFeed();
  }, [toast, refreshFeed]);

  const deleteComment = useCallback(async (commentId: string, postId?: string) => {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le commentaire", variant: "destructive" });
      return;
    }

    toast({ title: "Succès", description: "Commentaire supprimé" });
    setDeleteCommentInfo(null);
    // Fix 2: Remove from local cache instead of full refetch
    if (postId) {
      removeCommentFromCache(postId, commentId);
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePostOptimistically(postId, { commentCount: Math.max(0, (post.commentCount || 0) - 1) });
      }
    }
  }, [toast, posts, removeCommentFromCache, updatePostOptimistically]);

  const toggleLike = useCallback(async (postId: string, isCurrentlyLiked: boolean) => {
    if (isVisitor) {
      toast({ title: "Créez un compte", description: "Inscrivez-vous pour aimer les publications !" });
      return;
    }
    if (!currentUser) return;

    // Per-post spam guard — skip if a like is already in-flight for this post
    if (isLikingRef.current.has(postId)) return;
    isLikingRef.current.add(postId);

    const post = posts.find(p => p.id === postId);
    const currentCount = post?.likes || 0;

    // 1. Optimistic update FIRST — instant UI feedback
    updatePostOptimistically(postId, {
      likes: isCurrentlyLiked ? currentCount - 1 : currentCount + 1,
      isLiked: !isCurrentlyLiked,
    });

    try {
      // 2. DB operation
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: currentUser.id });
        if (error) throw error;

        // 3. Fire-and-forget notification + push (non-blocking)
        if (post && post.user_id !== currentUser.id) {
          supabase.from("notifications").insert({
            user_id: post.user_id,
            actor_id: currentUser.id,
            post_id: postId,
            type: "like",
          }).then(({ error: notifError }) => {
            if (notifError) {
              console.error("❌ Error creating like notification:", notifError);
            } else {
              // Push notification — also fire-and-forget
              supabase.functions.invoke('send-push-notification', {
                body: {
                  recipientUserId: post.user_id,
                  actorId: currentUser.id,
                  type: 'like',
                  entityId: postId,
                  url: '/feed',
                }
              }).catch(pushErr => console.error("❌ Like push error:", pushErr));
            }
          });
        }
      }
    } catch (error) {
      // 4. Rollback on DB failure — restore previous state
      console.error("Error toggling like:", error);
      updatePostOptimistically(postId, { likes: currentCount, isLiked: isCurrentlyLiked });
      toast({ title: "Erreur", description: "Impossible de réagir à cette publication." });
    } finally {
      isLikingRef.current.delete(postId);
    }
  }, [isVisitor, currentUser, posts, updatePostOptimistically, toast]);

  const addComment = useCallback(async (postId: string, parentCommentId: string | null = null) => {
    if (isVisitor) {
      toast({ title: "Créez un compte", description: "Inscrivez-vous pour commenter les publications !" });
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
      toast({ title: "Erreur", description: "Impossible d'ajouter le commentaire", variant: "destructive" });
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
        } catch (pushError) {
          console.error("❌ Error sending push notification:", pushError);
        }
      }
    }

    if (parentCommentId) {
      setReplyInputs(prev => ({ ...prev, [parentCommentId]: "" }));
      setReplyingTo(prev => ({ ...prev, [postId]: null }));
    } else {
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
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

    toast({ title: "Succès", description: "Commentaire ajouté" });
  }, [isVisitor, currentUser, replyInputs, commentInputs, posts, toast, addCommentToCache, updatePostOptimistically]);

  const openShareDialog = useCallback(async (post: Post) => {
    setSelectedPostToShare(post);

    // Fetch users that current user is following
    const { data: followsData, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUser!.id)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching follows:", error);
      return;
    }

    const followingIds = followsData?.map(f => f.following_id) || [];

    if (followingIds.length === 0) {
      toast({ title: "Aucun contact", description: "Vous ne suivez personne pour le moment", variant: "destructive" });
      return;
    }

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", followingIds);

    setFollowingUsers(profilesData || []);
    setShareDialogOpen(true);
  }, [currentUser, toast]);

  // Plan C Fix 4: Single RPC replaces N+1 conversation lookup loop
  const sendPostAsMessage = useCallback(async (recipientUserId: string) => {
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
  }, [currentUser, selectedPostToShare, toast]);

  const toggleShare = useCallback(async (postId: string, isCurrentlyShared: boolean) => {
    if (isVisitor) {
      toast({ title: "Créez un compte", description: "Inscrivez-vous pour partager les publications !" });
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
          } catch (pushError) {
            console.error("❌ Error sending share push notification:", pushError);
          }
        }
      }

      toast({ title: "Succès", description: "Post partagé" });
    }

    // Optimistic update for shares
    updatePostOptimistically(postId, {
      shareCount: isCurrentlyShared
        ? ((posts.find(p => p.id === postId)?.shareCount || 0) - 1)
        : ((posts.find(p => p.id === postId)?.shareCount || 0) + 1),
      isShared: !isCurrentlyShared,
    });
  }, [isVisitor, currentUser, posts, updatePostOptimistically, toast]);

  const handleEmojiSelect = useCallback((emojiData: any, postId: string, commentId?: string) => {
    if (commentId) {
      setReplyInputs(prev => ({
        ...prev,
        [commentId]: (prev[commentId] || "") + emojiData.emoji,
      }));
    } else {
      setCommentInputs(prev => ({
        ...prev,
        [postId]: (prev[postId] || "") + emojiData.emoji,
      }));
    }
  }, []);

  // ── Effects ───────────────────────────────────────────────────────

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

  // Fix 4: Subscribe to targeted realtime updates (not full refetch)
  useEffect(() => {
    if (isVisitor || !currentUser) return;
    const cleanup = subscribeToNewPosts();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisitor, !!currentUser]);

  // Mark feed as visited when page loads (resets unread count)
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

  // Plan C Fix 1: Mark initial load complete after first posts render
  useEffect(() => {
    if (posts.length > 0 && !initialLoadCompleteRef.current) {
      // Small delay to let initial stagger animation play
      const timer = setTimeout(() => { initialLoadCompleteRef.current = true; }, 600);
      return () => clearTimeout(timer);
    }
  }, [posts.length]);

  // ── Return everything the component needs ─────────────────────────
  return {
    // Navigation & toast
    navigate,
    toast,
    // Feed data
    posts,
    isLoading,
    isRefreshing,
    refreshFeed,
    displayPosts,
    pullDistance,
    // Network awareness
    isSlowConnection,
    imageQuality,
    shouldAnimate,
    // Auth & visitor
    currentUser,
    isVisitor,
    isFounder,
    // Comments
    commentsCache,
    loadingComments,
    fetchCommentsForPost,
    commentInputs,
    setCommentInputs,
    replyInputs,
    setReplyInputs,
    showComments,
    setShowComments,
    replyingTo,
    setReplyingTo,
    // Post interactions
    expandedPosts,
    setExpandedPosts,
    newPostsQueue,
    setNewPostsQueue,
    addPostOptimistically,
    // Delete state
    deletePostId,
    setDeletePostId,
    deleteCommentInfo,
    setDeleteCommentInfo,
    deleteCommentId,
    setDeleteCommentId,
    // Share state
    shareDialogOpen,
    setShareDialogOpen,
    selectedPostToShare,
    setSelectedPostToShare,
    followingUsers,
    sendingMessage,
    // Report state
    reportDialogOpen,
    setReportDialogOpen,
    postToReport,
    setPostToReport,
    // Edit state
    editingPost,
    setEditingPost,
    // Refs (exposed for JSX binding)
    sentinelRef,
    scrollContainerRef,
    initialLoadCompleteRef,
    // Pagination
    hasMore,
    isFetchingMore,
    // Handlers
    handleRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleInputFocus,
    handleEmojiSelect,
    deletePost,
    deleteComment,
    toggleLike,
    addComment,
    openShareDialog,
    sendPostAsMessage,
    toggleShare,
  };
};
