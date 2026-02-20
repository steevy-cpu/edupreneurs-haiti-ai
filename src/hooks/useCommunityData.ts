import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Profile, GroupChat } from "@/types/community";
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  CACHE_KEYS 
} from "@/utils/queryPersistence";

// Extended Conversation type for the hook
interface ConversationWithDetails extends Omit<Conversation, 'otherUser' | 'lastMessage' | 'lastMessageTime'> {
  participants: {
    user_id: string;
    profile: Profile;
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount?: number;
  group?: GroupChat;
}

const fetchConversations = async (): Promise<ConversationWithDetails[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch conversations the user is part of
  const { data: participations, error: partError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (partError || !participations?.length) {
    return [];
  }

  const conversationIds = participations.map(p => p.conversation_id);

  // Fetch conversation details
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select(`
      id,
      is_group,
      group_id,
      created_at,
      updated_at
    `)
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (convError || !conversations) {
    return [];
  }

  // Fetch all participants for these conversations
  const { data: allParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", conversationIds);

  // Get all user IDs to fetch profiles
  const allUserIds = [...new Set(allParticipants?.map(p => p.user_id) || [])];
  
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, nickname, avatar_url, verified, last_seen")
    .in("user_id", allUserIds);

  // Fetch conversation previews via optimized DB function (replaces fetch-all-messages)
  const { data: previews } = await supabase.rpc('get_conversation_previews', {
    p_user_id: user.id
  });

  // Build preview lookup map for O(1) access
  const previewMap = new Map<string, any>();
  previews?.forEach((p: any) => previewMap.set(p.conversation_id, p));

  // Fetch group details
  const groupIds = conversations.filter(c => c.group_id).map(c => c.group_id!);
  const { data: groups } = groupIds.length > 0 
    ? await supabase
        .from("group_chats")
        .select("id, name, avatar_url, description")
        .in("id", groupIds)
    : { data: [] };

  // Enrich conversations
  const enrichedConversations: ConversationWithDetails[] = conversations.map(conv => {
    const participants = allParticipants
      ?.filter(p => p.conversation_id === conv.id && p.user_id !== user.id)
      .map(p => ({
        user_id: p.user_id,
        profile: profiles?.find(pr => pr.user_id === p.user_id) || {
          id: p.user_id,
          user_id: p.user_id,
          full_name: "Étudiant",
          nickname: "user",
          avatar_url: null,
          verified: false,
          last_seen: null,
        }
      })) || [];

    // Get preview data from the optimized DB function
    const preview = previewMap.get(conv.id);
    const lastMessage = preview?.last_message_id ? {
      content: preview.last_message_content,
      created_at: preview.last_message_at,
      sender_id: preview.last_message_sender_id,
    } : undefined;

    // Get unread count from preview
    const unreadCount = Number(preview?.unread_count || 0);

    // Get group info if applicable
    const group = conv.group_id 
      ? groups?.find(g => g.id === conv.group_id) 
      : undefined;

    return {
      ...conv,
      participants,
      lastMessage,
      unreadCount,
      group,
    };
  });

  // Persist to localStorage for instant loading
  persistQueryData(CACHE_KEYS.CONVERSATIONS, enrichedConversations);

  return enrichedConversations;
};

export const useCommunityData = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 1000 * 60 * 1, // Conversations stay fresh for 1 minute
    gcTime: 1000 * 60 * 10, // Cache for 10 minutes
    // Initialize with persisted data for instant loading
    initialData: () => getPersistedQueryData<ConversationWithDetails[]>(CACHE_KEYS.CONVERSATIONS) || undefined,
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.CONVERSATIONS),
  });

  const refreshConversations = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return {
    conversations: query.data || [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refreshConversations,
    refetch: query.refetch,
  };
};

// Prefetch hook
export const usePrefetchCommunity = () => {
  const queryClient = useQueryClient();

  const prefetchConversations = () => {
    queryClient.prefetchQuery({
      queryKey: ["conversations"],
      queryFn: fetchConversations,
      staleTime: 1000 * 60 * 1,
    });
  };

  return { prefetchConversations };
};
