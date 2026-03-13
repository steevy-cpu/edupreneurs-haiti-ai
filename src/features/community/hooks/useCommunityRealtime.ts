/**
 * @file useCommunityRealtime — Centralizes ALL realtime subscriptions for the Community page.
 * Owns messageChannelRef and reactionChannelRef internally, returns them for parent cleanup.
 * Three subscriptions: subscribeToConversationMessages, subscribeToMessages, subscribeToReactions.
 * (subscribeToTypingPresence lives in useTypingIndicators — separate presence concern.)
 */
import { useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Message, Reaction, Profile, JUDE_USER_ID } from "@/types/community";

interface UseCommunityRealtimeParams {
  user: any;
  selectedConversation: string | null;
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReactions: React.Dispatch<React.SetStateAction<Record<string, Reaction[]>>>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  getCachedProfile: (userId: string) => Promise<Profile | null>;
  setIsAwaitingJudeResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setTypewriterMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  /** Ref to currently selected conversation — avoids stale closures in realtime callbacks */
  selectedConversationRef: React.MutableRefObject<string | null>;
  playReceiveSound: () => void;
}

export interface UseCommunityRealtimeReturn {
  subscribeToConversationMessages: (conversationId: string) => void;
  subscribeToMessages: () => (() => void) | undefined;
  subscribeToReactions: (conversationId: string) => void;
  messageChannelRef: React.MutableRefObject<any>;
  reactionChannelRef: React.MutableRefObject<any>;
}

export function useCommunityRealtime({
  user,
  selectedConversation,
  conversations,
  setConversations,
  setMessages,
  setReactions,
  markMessagesAsRead,
  getCachedProfile,
  setIsAwaitingJudeResponse,
  setTypewriterMessageId,
  selectedConversationRef,
  playReceiveSound,
}: UseCommunityRealtimeParams): UseCommunityRealtimeReturn {
  const messageChannelRef = useRef<any>(null);
  const reactionChannelRef = useRef<any>(null);

  // Subscribe to real-time messages for a specific conversation (INSERT + UPDATE)
  const subscribeToConversationMessages = useCallback((conversationId: string) => {
    // Guard: Don't re-subscribe if already subscribed to this conversation
    if (messageChannelRef.current?.topic === `realtime:messages-${conversationId}`) {
      console.log('[Messages] Already subscribed to:', conversationId);
      return;
    }

    const channel = supabase
      .channel(`messages-${conversationId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the sender profile from cache
          const profile = await getCachedProfile(payload.new.sender_id);

          // Handle replied-to message
          let repliedToMessage = undefined;
          if (payload.new.replied_to_id) {
            const { data: repliedData } = await supabase
              .from("messages")
              .select("id, content, sender_id, created_at, read")
              .eq("id", payload.new.replied_to_id)
              .single();

            if (repliedData) {
              const repliedProfile = await getCachedProfile(repliedData.sender_id);
              repliedToMessage = {
                ...repliedData,
                profile: repliedProfile
              };
            }
          }

          // Fetch shared post if exists
          let sharedPost = undefined;
          if (payload.new.shared_post_id) {
            const { data: postData } = await supabase
              .from("posts")
              .select("*")
              .eq("id", payload.new.shared_post_id)
              .single();

            if (postData) {
              const postProfile = await getCachedProfile(postData.user_id);
              sharedPost = {
                ...postData,
                profile: postProfile
              };
            }
          }

          // Build message object including new media columns from realtime payload
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            read: payload.new.read || false,
            shared_post_id: payload.new.shared_post_id,
            replied_to_id: payload.new.replied_to_id,
            image_url: payload.new.image_url,
            video_url: payload.new.video_url,
            document_url: payload.new.document_url,
            document_name: payload.new.document_name,
            thumbnail_url: payload.new.thumbnail_url,
            edited_at: payload.new.edited_at,
            profile,
            replied_to: repliedToMessage,
            shared_post: sharedPost,
          };

          // Only add if message doesn't already exist (avoid duplicates with optimistic updates)
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Detect Jude's response — clear awaiting state and trigger typewriter effect
          if (payload.new.sender_id === JUDE_USER_ID) {
            setIsAwaitingJudeResponse(false);
            setTypewriterMessageId(payload.new.id);
          }

          // Check if this is a group message mentioning Jude
          const currentConversation = conversations.find(c => c.id === conversationId);
          const isGroupChat = currentConversation?.is_group;
          const mentionsJude = payload.new.content.toLowerCase().includes('hey jude');
          
          // If in group chat and mentions Jude, trigger Jude's response
          if (isGroupChat && mentionsJude && payload.new.sender_id !== JUDE_USER_ID) {
            supabase.functions.invoke('eric-chat', {
              body: { 
                conversationId: conversationId,
                userMessage: payload.new.content,
                userId: payload.new.sender_id,
                userNickname: profile?.nickname || profile?.full_name
              }
            }).catch(error => {
              logger.error('Error calling Eric chat:', error);
            });
          }

          // Show notification if message is from another user AND this is the CURRENT conversation
          if (payload.new.sender_id !== user?.id && conversationId === selectedConversation) {
            if ('Notification' in window && Notification.permission === 'granted') {
              const senderName = profile?.nickname || profile?.full_name || 'Quelqu\'un';
              const messageContent = sharedPost 
                ? 'a partagé un post' 
                : (payload.new.content || 'Nouveau message').substring(0, 100);
              
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(senderName, {
                    body: messageContent,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: conversationId,
                    requireInteraction: false,
                    data: {
                      url: `/community?conversation=${conversationId}`,
                      conversationId: conversationId
                    }
                  });
                });
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Update message in real-time (read status, edits, media URLs)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id 
                ? { 
                    ...msg, 
                    read: payload.new.read,
                    content: payload.new.content,
                    edited_at: payload.new.edited_at,
                    image_url: payload.new.image_url || msg.image_url,
                    video_url: payload.new.video_url || msg.video_url,
                    thumbnail_url: payload.new.thumbnail_url || msg.thumbnail_url,
                  }
                : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('[Messages] Subscription status for conversation:', conversationId, status);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Messages] Channel error, attempting reconnect...');
          setTimeout(() => {
            if (selectedConversation === conversationId) {
              subscribeToConversationMessages(conversationId);
            }
          }, 2000);
        }
      });

    messageChannelRef.current = channel;
  }, [user, selectedConversation, conversations, setMessages, getCachedProfile, setIsAwaitingJudeResponse, setTypewriterMessageId]);

  // Global message subscription — updates conversation order, unread counts, and notifications
  const subscribeToMessages = useCallback(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("messages-changes", {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=neq.${user?.id}`,
        },
        async (payload) => {
          // Play receive sound for messages from other users
          if (payload.new.sender_id !== user?.id) {
            playReceiveSound();
          }
          
          // Immediately update the conversation order in local state
          const conversationId = payload.new.conversation_id;
          const newMessageTime = payload.new.created_at;
          
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.id !== conversationId) return conv;
              
              // Increment unread count only if not the currently selected conversation
              const shouldIncrementUnread = 
                payload.new.sender_id !== user?.id && 
                conversationId !== selectedConversationRef.current;
              
              return { 
                ...conv, 
                lastMessage: payload.new.content,
                lastMessageTime: newMessageTime,
                unreadCount: shouldIncrementUnread 
                  ? (conv.unreadCount || 0) + 1 
                  : conv.unreadCount,
              };
            });
            
            // Re-sort immediately
            return updated.sort((a, b) => 
              new Date(b.lastMessageTime || b.created_at).getTime() - 
              new Date(a.lastMessageTime || a.created_at).getTime()
            );
          });
          
          // Show browser notification for messages in OTHER conversations
          if (payload.new.sender_id !== user?.id && conversationId !== selectedConversationRef.current) {
            const senderProfile = await getCachedProfile(payload.new.sender_id);
            const senderName = senderProfile?.nickname || senderProfile?.full_name || 'Quelqu\'un';
              
            const { data: conversationData } = await supabase
              .from('conversations')
              .select('is_group, group_id')
              .eq('id', conversationId)
              .single();
            
            let conversationName = senderName;
            
            if (conversationData?.is_group && conversationData?.group_id) {
              const { data: groupData } = await supabase
                .from('group_chats')
                .select('name')
                .eq('id', conversationData.group_id)
                .single();
              
              conversationName = groupData?.name || 'Groupe';
            }
            
            if ('Notification' in window && Notification.permission === 'granted') {
              const messagePreview = payload.new.content.substring(0, 100) || 'Nouveau message';
              const notificationTitle = conversationData?.is_group 
                ? `${senderName} dans ${conversationName}`
                : `${senderName}`;
              
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(notificationTitle, {
                    body: messagePreview,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: conversationId,
                    requireInteraction: false,
                    data: {
                      url: `/community?conversation=${conversationId}`,
                      conversationId: conversationId
                    }
                  });
                });
              }
            }
          }
          
          // Fallback: update messages if this is the currently selected conversation
          if (conversationId === selectedConversationRef.current && payload.new.sender_id !== user?.id) {
            const profile = await getCachedProfile(payload.new.sender_id);
            
            setMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev;
              
              return [...prev, {
                id: payload.new.id,
                content: payload.new.content,
                sender_id: payload.new.sender_id,
                created_at: payload.new.created_at,
                read: payload.new.read || false,
                image_url: payload.new.image_url,
                video_url: payload.new.video_url,
                profile,
              }];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `sender_id=neq.${user?.id}`,
        },
        (payload) => {
          // If message was marked as read, update the conversation's unread count
          if (payload.new.read && !payload.old.read) {
            setConversations(prev => 
              prev.map(conv => 
                conv.id === payload.new.conversation_id 
                  ? { ...conv, unreadCount: Math.max(0, (conv.unreadCount || 0) - 1) }
                  : conv
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, setConversations, setMessages, getCachedProfile, selectedConversationRef, playReceiveSound]);

  // Subscribe to reactions for a specific conversation
  const subscribeToReactions = useCallback((conversationId: string) => {
    // Guard: Don't re-subscribe if already subscribed to this conversation
    if (reactionChannelRef.current?.topic === `realtime:reactions-${conversationId}`) {
      console.log('[Reactions] Already subscribed to:', conversationId);
      return;
    }

    const channel = supabase
      .channel(`reactions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReaction = payload.new as Reaction;
            // Client-side guard: only apply if message belongs to current conversation
            setMessages(currentMsgs => {
              if (!currentMsgs.some(m => m.id === newReaction.message_id)) return currentMsgs;
              // Update reactions state (side effect inside functional update for atomicity)
              setReactions(prev => ({
                ...prev,
                [newReaction.message_id]: [...(prev[newReaction.message_id] || []), newReaction]
              }));
              return currentMsgs; // Don't modify messages, just used for the guard check
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedReaction = payload.old as Reaction;
            setReactions(prev => ({
              ...prev,
              [deletedReaction.message_id]: (prev[deletedReaction.message_id] || []).filter(
                r => r.id !== deletedReaction.id
              )
            }));
          }
        }
      )
      .subscribe();

    reactionChannelRef.current = channel;
  }, [setMessages, setReactions]);

  return {
    subscribeToConversationMessages,
    subscribeToMessages,
    subscribeToReactions,
    messageChannelRef,
    reactionChannelRef,
  };
}
