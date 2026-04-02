/**
 * @file useCommunityMessages — Manages message fetching, editing, reactions, profile caching,
 * and read receipts. sendMessage stays in Community.tsx parent due to heavy cross-cutting deps.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { Profile, Message, Reaction } from "@/types/community";

interface UseCommunityMessagesParams {
  user: any;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  reactions: Record<string, Reaction[]>;
  setReactions: React.Dispatch<React.SetStateAction<Record<string, Reaction[]>>>;
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  /** Ref tracking the currently active conversation — prevents race conditions on fetch */
  currentConversationRef: React.MutableRefObject<string | null>;
}

export interface UseCommunityMessagesReturn {
  editingMessageId: string | null;
  editedContent: string;
  setEditedContent: React.Dispatch<React.SetStateAction<string>>;
  cachedUserProfile: Profile | null;
  showReactionPicker: string | null;
  setShowReactionPicker: React.Dispatch<React.SetStateAction<string | null>>;
  isLoadingMessages: boolean;
  profileCacheRef: React.MutableRefObject<Map<string, Profile>>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchReactions: (conversationId: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  getCachedProfile: (userId: string) => Promise<Profile | null>;
  handleEditMessage: (messageId: string, currentContent: string) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (messageId: string) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

// Fix 4: LRU eviction limit to prevent memory leak
const MAX_PROFILE_CACHE_SIZE = 100;

export function useCommunityMessages({
  user,
  messages,
  setMessages,
  reactions,
  setReactions,
  conversations,
  setConversations,
  currentConversationRef,
}: UseCommunityMessagesParams): UseCommunityMessagesReturn {
  const { toast } = useToast();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  // Cached user profile for optimistic updates — prevents redundant fetches
  const [cachedUserProfile, setCachedUserProfile] = useState<Profile | null>(null);
  const profileCacheRef = useRef<Map<string, Profile>>(new Map());

  // Cache user profile on mount for optimistic updates
  useEffect(() => {
    const cacheUserProfile = async () => {
      if (user && !cachedUserProfile) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          setCachedUserProfile(profile as Profile);
        }
      }
    };
    cacheUserProfile();
  }, [user?.id]);

  // Helper to get cached profile or fetch if not cached (LRU eviction)
  const getCachedProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (profileCacheRef.current.has(userId)) {
      return profileCacheRef.current.get(userId)!;
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    if (profile) {
      // Evict oldest entry if cache is full (LRU)
      if (profileCacheRef.current.size >= MAX_PROFILE_CACHE_SIZE) {
        const oldestKey = profileCacheRef.current.keys().next().value;
        if (oldestKey) {
          profileCacheRef.current.delete(oldestKey);
        }
      }
      profileCacheRef.current.set(userId, profile as Profile);
    }
    return profile as Profile | null;
  }, []);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
    
    if (!error) {
      // Update local state ONLY — no refetch needed (performance optimization)
      setMessages(prev =>
        prev.map(msg =>
          msg.sender_id !== user.id && !msg.read
            ? { ...msg, read: true }
            : msg
        )
      );
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      // Notify sidebar badge system to clear message count immediately
      window.dispatchEvent(new Event('messages-read'));
    }
  }, [user, setMessages, setConversations]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    // NEW APPROACH: Use message ID-based filtering instead of timestamps
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("visible_from_message_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user?.id)
      .single();
    
    if (participantError) {
      logger.error('Error fetching participant visibility:', participantError);
    }

    const visibilityThreshold = participantData?.visible_from_message_id;

    // Fetch messages with pagination (limit 50 for better performance)
    let query = supabase
      .from("messages")
      .select("id, content, sender_id, created_at, read, shared_post_id, conversation_id, replied_to_id, image_url, video_url, document_url, document_name, thumbnail_url, edited_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: allMessages, error: messagesError } = await query;
    
    // Reverse to display in chronological order (oldest first)
    const reversedMessages = allMessages ? [...allMessages].reverse() : [];
    
    if (messagesError) {
      logger.error('Messages error:', messagesError);
    }

    // Filter messages on the client side based on visibility threshold
    let messagesData = reversedMessages;
    if (visibilityThreshold && reversedMessages.length > 0) {
      const thresholdIndex = reversedMessages.findIndex(m => m.id === visibilityThreshold);
      if (thresholdIndex !== -1) {
        messagesData = reversedMessages.slice(thresholdIndex);
      }
    }

    // Handle empty conversations (new chats with no messages yet)
    if (!messagesData || messagesData.length === 0) {
      setMessages([]);
      return;
    }

    const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", senderIds);

    // Get shared post IDs
    const sharedPostIds = messagesData
      .filter(m => m.shared_post_id)
      .map(m => m.shared_post_id);

    let sharedPosts: any[] = [];
    let sharedPostProfiles: any[] = [];

    if (sharedPostIds.length > 0) {
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .in("id", sharedPostIds);

      sharedPosts = postsData || [];

      const postUserIds = [...new Set(sharedPosts.map(p => p.user_id))];
      const { data: postProfilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", postUserIds);

      sharedPostProfiles = postProfilesData || [];
    }

    const enrichedMessages = messagesData.map(msg => {
      const sharedPost = sharedPosts.find(p => p.id === msg.shared_post_id);
      const repliedTo = msg.replied_to_id 
        ? messagesData.find(m => m.id === msg.replied_to_id)
        : null;
      
      return {
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        conversation_id: msg.conversation_id,
        shared_post_id: msg.shared_post_id,
        replied_to_id: msg.replied_to_id,
        read: msg.read ?? false,
        image_url: msg.image_url,
        video_url: msg.video_url,
        profile: profiles?.find(p => p.user_id === msg.sender_id),
        replied_to: repliedTo ? {
          id: repliedTo.id,
          content: repliedTo.content,
          sender_id: repliedTo.sender_id,
          created_at: repliedTo.created_at,
          read: repliedTo.read ?? false,
          profile: profiles?.find(p => p.user_id === repliedTo.sender_id),
          shared_post_id: repliedTo.shared_post_id,
        } : undefined,
        shared_post: sharedPost ? {
          ...sharedPost,
          profile: sharedPostProfiles.find(p => p.user_id === sharedPost.user_id)
        } : undefined
      };
    });

    // Fix 2: Guard against race condition — verify this is still the active conversation
    if (conversationId !== currentConversationRef.current) {
      return;
    }

    setMessages(enrichedMessages);
  }, [user, setMessages, currentConversationRef]);

  const fetchReactions = useCallback(async (conversationId: string) => {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId);

    if (!messagesData) return;

    const messageIds = messagesData.map(m => m.id);
    
    const { data: reactionsData } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    if (reactionsData) {
      const reactionsByMessage = reactionsData.reduce((acc, reaction) => {
        if (!acc[reaction.message_id]) {
          acc[reaction.message_id] = [];
        }
        acc[reaction.message_id].push(reaction);
        return acc;
      }, {} as Record<string, Reaction[]>);
      
      setReactions(reactionsByMessage);
    }
  }, [setReactions]);

  const handleEditMessage = useCallback((messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditedContent(currentContent);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditedContent("");
  }, []);

  const handleSaveEdit = useCallback(async (messageId: string) => {
    if (!editedContent.trim()) {
      toast({
        title: "Erreur",
        description: "Le message ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .update({ content: editedContent.trim(), edited_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state with edited content and timestamp
      const nowISO = new Date().toISOString();
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: editedContent.trim(), edited_at: nowISO } : msg
      ));

      setEditingMessageId(null);
      setEditedContent("");

      toast({
        title: "Succès",
        description: "Message modifié",
      });
    } catch (error) {
      logger.error("Error updating message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le message",
        variant: "destructive",
      });
    }
  }, [editedContent, setMessages, toast]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: "Succès",
        description: "Message supprimé",
      });
    } catch (error) {
      logger.error("Error deleting message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive",
      });
    }
  }, [setMessages, toast]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if user already reacted with this emoji
    const existingReaction = reactions[messageId]?.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (!error) {
        setShowReactionPicker(null);
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji,
        });

      if (!error) {
        setShowReactionPicker(null);
      }
    }
  }, [user, reactions]);

  return {
    editingMessageId,
    editedContent,
    setEditedContent,
    cachedUserProfile,
    showReactionPicker,
    setShowReactionPicker,
    isLoadingMessages,
    profileCacheRef,
    fetchMessages,
    fetchReactions,
    markMessagesAsRead,
    getCachedProfile,
    handleEditMessage,
    handleCancelEdit,
    handleSaveEdit,
    handleDeleteMessage,
    toggleReaction,
  };
}
