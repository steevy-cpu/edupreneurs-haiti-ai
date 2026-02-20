import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Comment } from "@/types/feed";

/**
 * Hook for on-demand comment loading with per-post caching.
 * Comments are NOT fetched during initial feed load (Fix 2).
 * Instead, they are fetched only when the user opens a post's comment section.
 */
export const useLazyComments = () => {
  const [commentsCache, setCommentsCache] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  const fetchCommentsForPost = useCallback(async (postId: string) => {
    // Skip if already cached — subsequent opens use cached data
    if (commentsCache[postId]) return;

    setLoadingComments(prev => ({ ...prev, [postId]: true }));

    try {
      // Fetch comments and commenter profiles in parallel
      const [commentsRes, _] = await Promise.all([
        supabase
          .from("post_comments")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: true }),
        // Pre-warm: we'll fetch profiles after we know commenter IDs
        Promise.resolve(),
      ]);

      const commentsData = commentsRes.data || [];

      if (commentsData.length === 0) {
        setCommentsCache(prev => ({ ...prev, [postId]: [] }));
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
        return;
      }

      // Fetch commenter profiles in a single batch
      const commentUserIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, nickname, avatar_url, verified, academic_grade")
        .in("user_id", commentUserIds);

      // Build nested comment structure (top-level + replies)
      const allComments: Comment[] = commentsData.map(comment => ({
        ...comment,
        profile: (profilesData?.find(p => p.user_id === comment.user_id) as Profile) || {
          id: "", user_id: comment.user_id, full_name: "Étudiant",
          nickname: "Étudiant", avatar_url: null, verified: false,
        },
      }));

      const topLevel = allComments.filter(c => !c.parent_comment_id);
      const withReplies = topLevel.map(comment => ({
        ...comment,
        replies: allComments.filter(c => c.parent_comment_id === comment.id),
      }));

      setCommentsCache(prev => ({ ...prev, [postId]: withReplies }));
    } catch (error) {
      console.error("Error fetching comments for post:", postId, error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  }, [commentsCache]);

  /** Append a locally-created comment to the cache without refetching */
  const addCommentToCache = useCallback((postId: string, comment: Comment) => {
    setCommentsCache(prev => {
      const existing = prev[postId] || [];
      if (comment.parent_comment_id) {
        // Add as reply to parent comment
        return {
          ...prev,
          [postId]: existing.map(c =>
            c.id === comment.parent_comment_id
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          ),
        };
      }
      // Add as top-level comment
      return { ...prev, [postId]: [...existing, { ...comment, replies: [] }] };
    });
  }, []);

  /** Remove a comment from local cache after deletion */
  const removeCommentFromCache = useCallback((postId: string, commentId: string) => {
    setCommentsCache(prev => {
      const existing = prev[postId];
      if (!existing) return prev;
      return {
        ...prev,
        [postId]: existing
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: c.replies?.filter(r => r.id !== commentId),
          })),
      };
    });
  }, []);

  /** Invalidate cache for a specific post — forces refetch on next open */
  const invalidatePostComments = useCallback((postId: string) => {
    setCommentsCache(prev => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  }, []);

  return {
    commentsCache,
    loadingComments,
    fetchCommentsForPost,
    addCommentToCache,
    removeCommentFromCache,
    invalidatePostComments,
  };
};
