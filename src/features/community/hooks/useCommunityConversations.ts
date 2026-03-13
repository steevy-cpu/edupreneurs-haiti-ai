/**
 * @file useCommunityConversations — Manages conversation fetching, follower loading,
 * single conversation fetch, and conversation deletion logic.
 * Does NOT own realtime subscriptions — those live in useCommunityRealtime.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { Profile, Conversation } from "@/types/community";

interface UseCommunityConversationsParams {
  user: any;
  selectedConversation: string | null;
  setSelectedConversation: React.Dispatch<React.SetStateAction<string | null>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setOfflineLastSeenTimes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export interface UseCommunityConversationsReturn {
  isLoadingConversations: boolean;
  setIsLoadingConversations: React.Dispatch<React.SetStateAction<boolean>>;
  loadingTimedOut: boolean;
  setLoadingTimedOut: React.Dispatch<React.SetStateAction<boolean>>;
  selectedConversationDetails: Conversation | null;
  setSelectedConversationDetails: React.Dispatch<React.SetStateAction<Conversation | null>>;
  followers: Profile[];
  fetchConversations: () => Promise<void>;
  fetchFollowers: () => Promise<void>;
  fetchSingleConversation: (convId: string) => Promise<Conversation | null>;
  handleDeleteConversation: (conversationId: string) => Promise<void>;
}

export function useCommunityConversations({
  user,
  selectedConversation,
  setSelectedConversation,
  conversations,
  setConversations,
  setMessages,
  setOfflineLastSeenTimes,
}: UseCommunityConversationsParams): UseCommunityConversationsReturn {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [selectedConversationDetails, setSelectedConversationDetails] = useState<Conversation | null>(null);
  const [followers, setFollowers] = useState<Profile[]>([]);

  // Fetch single conversation data when navigating via URL (for new/empty conversations)
  const fetchSingleConversation = useCallback(async (convId: string): Promise<Conversation | null> => {
    if (!user) return null;
    
    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .select("id, created_at, is_group, group_id")
      .eq("id", convId)
      .single();
    
    if (convError || !convData) {
      logger.error('Error fetching single conversation:', convError);
      return null;
    }
    
    // Fetch all participants
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", convId);
    
    const otherUserId = participants?.find(p => p.user_id !== user.id)?.user_id;
    
    if (!otherUserId && !convData.is_group) return null;
    
    // Fetch the other user's profile
    let otherUserProfile = null;
    if (otherUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", otherUserId)
        .single();
      otherUserProfile = profile as Profile | null;
    }
    
    // Fetch group details if group conversation
    let groupData = null;
    if (convData.is_group && convData.group_id) {
      const { data: group } = await supabase
        .from("group_chats")
        .select("*")
        .eq("id", convData.group_id)
        .single();
      
      if (group) {
        const { data: members } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", convData.group_id);
        
        groupData = {
          ...group,
          member_count: members?.length || 0
        };
      }
    }
    
    return {
      id: convId,
      created_at: convData.created_at,
      is_group: convData.is_group,
      otherUser: otherUserProfile || undefined,
      group: groupData || undefined,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
    };
  }, [user]);

  const fetchConversations = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setIsLoadingConversations(false);
      return;
    }

    // Fetch all conversations with visibility info
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, visible_from_message_id")
      .eq("user_id", authUser.id);

    if (!participations) {
      setIsLoadingConversations(false);
      return;
    }

    // Create map of visibility thresholds
    const visibilityMap = new Map<string, string | null>();
    participations.forEach(p => {
      visibilityMap.set(p.conversation_id, p.visible_from_message_id);
    });

    const conversationIds = participations.map(p => p.conversation_id);
    
    if (conversationIds.length === 0) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    // Fetch conversation details including group info
    const { data: conversationData } = await supabase
      .from("conversations")
      .select("id, created_at, is_group, group_id")
      .in("id", conversationIds);

    // Fetch group details for group conversations
    const groupIds = conversationData
      ?.filter(c => c.is_group && c.group_id)
      .map(c => c.group_id!) || [];

    // Fetch all participants in a single batch query (optimized - one query for all conversations)
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("user_id, conversation_id")
      .in("conversation_id", conversationIds);

    // Get other user IDs (excluding current user) for profile fetching
    const otherUserIds = allParticipants
      ?.filter(p => p.user_id !== authUser.id)
      .map(p => p.user_id) || [];
    const uniqueOtherUserIds = [...new Set(otherUserIds)];

    // Fetch profiles for all other participants
    const { data: profiles } = uniqueOtherUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("*")
          .in("user_id", uniqueOtherUserIds)
      : { data: [] };

    // Update lastSeenTimes with actual database values
    if (profiles && profiles.length > 0) {
      const newLastSeenTimes: Record<string, string> = {};
      profiles.forEach(profile => {
        if (profile.last_seen) {
          newLastSeenTimes[profile.user_id] = profile.last_seen;
        }
      });
      setOfflineLastSeenTimes(prev => ({ ...prev, ...newLastSeenTimes }));
    }

    let groupDetails: any[] = [];
    if (groupIds.length > 0) {
      const { data: groups } = await supabase
        .from("group_chats")
        .select("*")
        .in("id", groupIds);
      
      // Fetch member counts for each group
      const { data: memberCounts } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);
      
      const memberCountMap = new Map<string, number>();
      memberCounts?.forEach(m => {
        memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
      });

      groupDetails = groups?.map(g => ({
        ...g,
        member_count: memberCountMap.get(g.id) || 0
      })) || [];
    }

    // Fetch conversation previews via optimized DB function
    const { data: previews } = await supabase.rpc('get_conversation_previews', {
      p_user_id: authUser.id
    });

    // Build preview lookup map for O(1) access
    const previewMap = new Map<string, any>();
    previews?.forEach((p: any) => previewMap.set(p.conversation_id, p));

    // Build conversations list - deduplicate both group and 1-on-1
    const groupedByUser = new Map<string, Conversation>();
    const groupedByGroup = new Map<string, Conversation>();

    conversationIds.forEach(convId => {
      const convInfo = conversationData?.find(c => c.id === convId);
      if (!convInfo) return;

      const preview = previewMap.get(convId);
      
      // Skip if user soft-deleted and all messages are before visibility threshold
      if (preview?.visible_from_message_id && (!preview?.last_message_id || preview.last_message_id === preview.visible_from_message_id)) {
        return;
      }

      const lastMsg = preview?.last_message_id ? {
        content: preview.last_message_content,
        created_at: preview.last_message_at,
        sender_id: preview.last_message_sender_id,
      } : null;
      const unreadCount = Number(preview?.unread_count || 0);

      if (convInfo.is_group && convInfo.group_id) {
        // Group conversation - deduplicate by group_id
        const groupData = groupDetails.find(g => g.id === convInfo.group_id);
        if (groupData) {
          const conv: Conversation = {
            id: convId,
            created_at: lastMsg?.created_at || convInfo.created_at,
            is_group: true,
            group: groupData,
            lastMessage: lastMsg?.content,
            lastMessageTime: lastMsg?.created_at,
            unreadCount,
          };
          
          const existing = groupedByGroup.get(convInfo.group_id);
          if (!existing) {
            groupedByGroup.set(convInfo.group_id, conv);
          } else {
            const existingTime = new Date(existing.lastMessageTime || existing.created_at).getTime();
            const currentTime = new Date(conv.lastMessageTime || conv.created_at).getTime();
            
            if (currentTime > existingTime) {
              groupedByGroup.set(convInfo.group_id, {
                ...conv,
                unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
              });
            } else {
              groupedByGroup.set(convInfo.group_id, {
                ...existing,
                unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
              });
            }
          }
        }
      } else {
        // 1-on-1 conversation
        const otherUserId = allParticipants?.find(
          p => p.conversation_id === convId && p.user_id !== authUser.id
        )?.user_id;
        
        // Conversations with deleted users kept visible so user can still delete them
        const otherUserProfile = otherUserId
          ? profiles?.find(p => p.user_id === otherUserId)
          : undefined;
        
        const conv: Conversation = {
          id: convId,
          created_at: lastMsg?.created_at || convInfo.created_at,
          is_group: false,
          otherUser: otherUserProfile,
          lastMessage: lastMsg?.content,
          lastMessageTime: lastMsg?.created_at,
          unreadCount,
        };
        
        // Group by user to merge duplicate conversations; use convId as key for deleted users
        const groupKey = otherUserId || convId;
        const existing = groupedByUser.get(groupKey);
        if (!existing) {
          groupedByUser.set(groupKey, conv);
        } else {
          const existingTime = new Date(existing.lastMessageTime || existing.created_at).getTime();
          const currentTime = new Date(conv.lastMessageTime || conv.created_at).getTime();
          
          if (currentTime > existingTime) {
            groupedByUser.set(groupKey, {
              ...conv,
              unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
            });
          } else {
            groupedByUser.set(groupKey, {
              ...existing,
              unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
            });
          }
        }
      }
    });

    // Combine group and 1-on-1 conversations and sort by most recent
    const allConversations = [...Array.from(groupedByGroup.values()), ...Array.from(groupedByUser.values())];
    const sortedConversations = allConversations.sort((a, b) => 
      new Date(b.lastMessageTime || b.created_at).getTime() - 
      new Date(a.lastMessageTime || a.created_at).getTime()
    );
    
    setConversations(sortedConversations);
    setIsLoadingConversations(false);
  }, [setConversations, setOfflineLastSeenTimes]);

  const fetchFollowers = useCallback(async () => {
    if (!user) return;

    const { data: followsData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .eq("status", "accepted");

    if (!followsData) return;

    const followingIds = followsData.map(f => f.following_id);
    
    if (followingIds.length === 0) {
      setFollowers([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", followingIds);

    setFollowers(profiles || []);
  }, [user]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      if (!user?.id) {
        toast({
          title: "Erreur",
          description: "Utilisateur non authentifié",
          variant: "destructive",
        });
        return;
      }

      const conversation = conversations.find(c => c.id === conversationId);
      const isGroup = conversation?.is_group;

      if (isGroup) {
        // For group conversations: delete only user's messages
        const { error: deleteError } = await supabase
          .from("messages")
          .delete()
          .eq("conversation_id", conversationId)
          .eq("sender_id", user.id);

        if (deleteError) {
          logger.error("Error deleting messages:", deleteError);
          throw deleteError;
        }
      } else {
        // For single conversations (WhatsApp-like behavior):
        // Set visible_from_message_id to hide all current messages
        const { data: lastMessage, error: fetchError } = await supabase
          .from("messages")
          .select("id")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          logger.error("Error fetching last message:", fetchError);
          throw fetchError;
        }

        if (!lastMessage) {
          // Empty conversation — delete participant row entirely
          const { error: deleteError } = await supabase
            .from("conversation_participants")
            .delete()
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);

          if (deleteError) {
            logger.error("Error deleting participant row:", deleteError);
            throw deleteError;
          }
        } else {
          // Has messages — soft delete via visibility threshold
          const { error: updateError } = await supabase
            .from("conversation_participants")
            .update({ visible_from_message_id: lastMessage.id })
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);

          if (updateError) {
            logger.error("Error updating visibility:", updateError);
            throw updateError;
          }
        }
      }

      // Remove conversation from local state directly — avoids expensive refetch
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setMessages([]);

      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        navigate('/community');
      }
      toast({
        title: "Succès",
        description: isGroup 
          ? "Vos messages ont été supprimés" 
          : "La conversation a été supprimée de votre liste",
      });
    } catch (error) {
      logger.error("Error deleting conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    }
  }, [user, conversations, selectedConversation, setConversations, setMessages, setSelectedConversation, navigate, toast]);

  return {
    isLoadingConversations,
    setIsLoadingConversations,
    loadingTimedOut,
    setLoadingTimedOut,
    selectedConversationDetails,
    setSelectedConversationDetails,
    followers,
    fetchConversations,
    fetchFollowers,
    fetchSingleConversation,
    handleDeleteConversation,
  };
}
