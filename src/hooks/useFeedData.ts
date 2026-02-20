import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Post } from "@/types/feed";
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  clearPersistedCache,
  CACHE_KEYS 
} from "@/utils/queryPersistence";

// Page size for cursor-based pagination (Plan B)
const PAGE_SIZE = 20;

// Stored during fetch so Feed.tsx can read without a second auth call
let _lastFetchedUserId: string | null = null;

/**
 * Fetch a page of posts with optional cursor for pagination.
 * Enriches with profiles, likes, comment counts, and shares in parallel.
 */
const fetchFeedPosts = async (cursor?: string): Promise<Post[]> => {
  // Hop 1: auth — single round trip
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  _lastFetchedUserId = user.id;

  // Hop 2: posts via RLS with optional cursor for pagination
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  // Apply cursor filter for subsequent pages
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: postsData, error: postsError } = await query;

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    return [];
  }

  if (!postsData || postsData.length === 0) return [];

  const userIds = [...new Set(postsData.map(p => p.user_id))];
  const postIds = postsData.map(p => p.id);

  // Hop 3: all enrichment queries in parallel — profiles, likes, comment counts, shares
  const [profilesRes, likesRes, commentCountsRes, sharesRes] = await Promise.all([
    // Fetch author profiles with academic_grade for grade tags
    supabase
      .from("profiles")
      .select("id, user_id, full_name, nickname, avatar_url, verified, academic_grade")
      .in("user_id", userIds),
    // Fetch likes to compute count + isLiked
    supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds),
    // Fetch only comment counts per post — full comments loaded lazily on click
    supabase
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds),
    // Fetch shares to compute count + isShared
    supabase
      .from("post_shares")
      .select("post_id, user_id")
      .in("post_id", postIds),
  ]);

  const profilesData = profilesRes.data;
  const likesData = likesRes.data;
  const commentsRaw = commentCountsRes.data;
  const sharesData = sharesRes.data;

  // Build comment count map from raw rows (grouped client-side)
  const commentCountMap: Record<string, number> = {};
  commentsRaw?.forEach(c => {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
  });

  // Enrich each post with profile, counts, and user-specific flags
  const enrichedPosts = postsData.map(post => {
    const profile = profilesData?.find(p => p.user_id === post.user_id) as Profile | undefined;
    const postLikes = likesData?.filter(l => l.post_id === post.id) || [];
    const isLiked = postLikes.some(l => l.user_id === user.id);
    const postShares = sharesData?.filter(s => s.post_id === post.id) || [];
    const isShared = postShares.some(s => s.user_id === user.id);

    return {
      ...post,
      profile,
      likes: postLikes.length,
      isLiked,
      comments: [], // Empty — loaded lazily per post via useLazyComments
      commentCount: commentCountMap[post.id] || 0,
      shareCount: postShares.length,
      isShared,
    };
  });

  return enrichedPosts;
};

export const useFeedData = () => {
  const queryClient = useQueryClient();
  // Pagination state — tracks whether more pages exist and loading status
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const fetchingMoreRef = useRef(false); // Prevent double-triggers from IntersectionObserver

  const query = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const posts = await fetchFeedPosts();
      // Determine if more pages exist based on returned count
      setHasMore(posts.length >= PAGE_SIZE);
      // Persist only the first page for instant loading next time
      persistQueryData(CACHE_KEYS.FEED_POSTS, posts);
      return posts;
    },
    staleTime: 1000 * 60 * 2, // Feed stays fresh for 2 minutes
    gcTime: 1000 * 60 * 15, // Cache for 15 minutes
    // Initialize with persisted data for instant loading
    initialData: () => getPersistedQueryData<Post[]>(CACHE_KEYS.FEED_POSTS) || undefined,
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.FEED_POSTS),
  });

  /**
   * Fetch the next page of posts using the last post's created_at as cursor.
   * Appends results to the existing TanStack Query cache.
   */
  const fetchMorePosts = useCallback(async () => {
    // Guard against concurrent fetches (IntersectionObserver can fire multiple times)
    if (fetchingMoreRef.current || !hasMore) return;
    fetchingMoreRef.current = true;
    setIsFetchingMore(true);

    try {
      const currentPosts = queryClient.getQueryData<Post[]>(["feed-posts"]);
      if (!currentPosts || currentPosts.length === 0) return;

      // Use the last post's timestamp as the pagination cursor
      const lastPost = currentPosts[currentPosts.length - 1];
      const cursor = lastPost.created_at;

      const nextPage = await fetchFeedPosts(cursor);

      // Fewer than PAGE_SIZE means we've reached the end
      setHasMore(nextPage.length >= PAGE_SIZE);

      if (nextPage.length > 0) {
        // Append new page to existing cache (don't replace)
        queryClient.setQueryData<Post[]>(["feed-posts"], (old) => {
          if (!old) return nextPage;
          return [...old, ...nextPage];
        });
      }
    } catch (err) {
      console.error("Error fetching more posts:", err);
    } finally {
      setIsFetchingMore(false);
      fetchingMoreRef.current = false;
    }
  }, [hasMore, queryClient]);

  const refreshFeed = () => {
    // Reset pagination state on refresh
    setHasMore(true);
    // Clear persisted cache to force fresh data fetch
    clearPersistedCache(CACHE_KEYS.FEED_POSTS);
    queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  };

  const updatePostOptimistically = (postId: string, updates: Partial<Post>) => {
    queryClient.setQueryData<Post[]>(["feed-posts"], (old) => {
      if (!old) return old;
      return old.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      );
    });
  };

  const removePostOptimistically = (postId: string) => {
    queryClient.setQueryData<Post[]>(["feed-posts"], (old) => {
      if (!old) return old;
      return old.filter(post => post.id !== postId);
    });
  };

  const addPostOptimistically = (newPost: Post) => {
    queryClient.setQueryData<Post[]>(["feed-posts"], (old) => {
      if (!old) return [newPost];
      return [newPost, ...old];
    });
  };

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refreshFeed,
    updatePostOptimistically,
    removePostOptimistically,
    addPostOptimistically,
    refetch: query.refetch,
    // Expose user ID captured during fetch — eliminates duplicate auth call in Feed.tsx
    currentUserId: _lastFetchedUserId,
    // Pagination state for infinite scroll (Plan B)
    hasMore,
    isFetchingMore,
    fetchMorePosts,
  };
};

// Hook for prefetching adjacent pages
export const usePrefetchNavigation = () => {
  const queryClient = useQueryClient();

  const prefetchFeed = () => {
    queryClient.prefetchQuery({
      queryKey: ["feed-posts"],
      queryFn: () => fetchFeedPosts(),
      staleTime: 1000 * 60 * 2,
    });
  };

  return { prefetchFeed };
};
