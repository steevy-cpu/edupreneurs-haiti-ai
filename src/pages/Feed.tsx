import { useState, useCallback, type FocusEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Share2, Trash2, Smile, Reply, BadgeCheck, ArrowLeft, RefreshCw, Globe, MoreHorizontal, Flag, Pencil, ArrowUp, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

import { formatTimeAgo } from "@/utils/dateUtils";
import { Comment } from "@/types/feed";
import { LockedOverlay } from "@/components/visitor";
import { Skeleton } from "@/components/ui/skeleton";
import { VisitorFeedOverlay } from "@/components/feed/VisitorFeedOverlay";
import { EmptyState } from "@/components/shared/EmptyState";
import { NetworkAwareImage, NetworkAwareVideo } from "@/components/feed/NetworkAwareMedia";
import { useFeed } from "@/hooks/useFeed";

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
  const {
    navigate,
    toast,
    posts,
    isLoading,
    isRefreshing,
    refreshFeed,
    displayPosts,
    isSlowConnection,
    imageQuality,
    shouldAnimate,
    currentUser,
    isVisitor,
    isFounder,
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
    expandedPosts,
    setExpandedPosts,
    newPostsQueue,
    setNewPostsQueue,
    addPostOptimistically,
    pullDistance,
    deletePostId,
    setDeletePostId,
    deleteCommentInfo,
    setDeleteCommentInfo,
    deleteCommentId,
    setDeleteCommentId,
    shareDialogOpen,
    setShareDialogOpen,
    selectedPostToShare,
    setSelectedPostToShare,
    followingUsers,
    sendingMessage,
    reportDialogOpen,
    setReportDialogOpen,
    postToReport,
    setPostToReport,
    editingPost,
    setEditingPost,
    sentinelRef,
    scrollContainerRef,
    initialLoadCompleteRef,
    hasMore,
    isFetchingMore,
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
  } = useFeed();

  // ── Loading states for button feedback (Fix 4) ──
  const [submittingComments, setSubmittingComments] = useState<Set<string>>(new Set());
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Wrapped addComment with loading feedback — preserves original logic
  const handleAddComment = useCallback(async (postId: string, parentCommentId?: string) => {
    const key = parentCommentId || postId;
    setSubmittingComments(prev => new Set(prev).add(key));
    try {
      await addComment(postId, parentCommentId);
    } finally {
      setSubmittingComments(prev => { const next = new Set(prev); next.delete(key); return next; });
    }
  }, [addComment]);

  // Wrapped deletePost with loading feedback — preserves original logic
  const handleDeletePost = useCallback(async (postId: string) => {
    setIsDeletingPost(true);
    try {
      await deletePost(postId);
    } finally {
      setIsDeletingPost(false);
    }
  }, [deletePost]);

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
                  handleAddComment(postId, comment.id);
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
              onClick={() => handleAddComment(postId, comment.id)}
              disabled={!replyInputs[comment.id]?.trim() || submittingComments.has(comment.id)}
              className="h-8 w-8 shrink-0"
            >
              {submittingComments.has(comment.id) ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
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
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim() || submittingComments.has(post.id)}
                        className="h-9 w-9 shrink-0"
                      >
                        {submittingComments.has(post.id) ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Infinite scroll sentinel — triggers fetchMorePosts */}
            <div ref={sentinelRef} className="h-1" />
            {isFetchingMore && (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!hasMore && displayPosts.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Vous avez tout vu 🎉
              </p>
            )}
            </div>
          )}
        </div>
      </section>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDeletePost(deletePostId)}
              disabled={isDeletingPost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingPost ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!deleteCommentInfo} onOpenChange={() => setDeleteCommentInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce commentaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentInfo && deleteComment(deleteCommentInfo.commentId, deleteCommentInfo.postId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Partager avec...</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {followingUsers.map((user) => (
              <button
                key={user.user_id}
                onClick={() => sendPostAsMessage(user.user_id)}
                disabled={sendingMessage}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl(user.avatar_url)} />
                  <AvatarFallback>{user.nickname?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium text-sm">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{user.nickname}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      {postToReport && (
        <ReportDialog
          isOpen={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          postId={postToReport.id}
          reportedUserId={postToReport.user_id}
        />
      )}

      {/* Edit Post Dialog */}
      {editingPost && (
        <EditPostDialog
          post={editingPost}
          isOpen={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          onPostUpdated={refreshFeed}
        />
      )}
    </main>
  );
};

export default Feed;
