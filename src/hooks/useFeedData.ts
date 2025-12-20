import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Post, Comment } from "@/types/feed";

const fetchFeedPosts = async (): Promise<Post[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    return [];
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

  return enrichedPosts;
};

export const useFeedData = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["feed-posts"],
    queryFn: fetchFeedPosts,
    staleTime: 1000 * 60 * 2, // Feed stays fresh for 2 minutes
    gcTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  const refreshFeed = () => {
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
  };
};

// Hook for prefetching adjacent pages
export const usePrefetchNavigation = () => {
  const queryClient = useQueryClient();

  const prefetchFeed = () => {
    queryClient.prefetchQuery({
      queryKey: ["feed-posts"],
      queryFn: fetchFeedPosts,
      staleTime: 1000 * 60 * 2,
    });
  };

  return { prefetchFeed };
};
