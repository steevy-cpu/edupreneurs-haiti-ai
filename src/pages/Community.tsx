import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Search, Smile, Check, CheckCheck, BadgeCheck, Edit2, Trash2, X, MoreVertical } from "lucide-react";
import { useMessageSounds } from "@/hooks/useMessageSounds";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { initializePushNotifications } from "@/utils/pushNotifications";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean;
}

interface Conversation {
  id: string;
  created_at: string;
  otherUser?: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  profile?: Profile;
  shared_post_id?: string | null;
  replied_to_id?: string | null;
  replied_to?: Message;
  shared_post?: {
    id: string;
    content: string;
    image_url: string | null;
    user_id: string;
    profile?: Profile;
  };
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const { playSendSound, playReceiveSound } = useMessageSounds();
  
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const previousMessagesCount = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<any>(null);
  const reactionChannelRef = useRef<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
      initializePushNotifications(user.id);
      subscribeToNotifications();
    }
  }, [user]);

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'broadcast',
        { event: 'new_message' },
        (payload) => {
          console.log('New message notification:', payload);
          const { title, body, conversationId } = payload.payload;
          
          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
              body,
              icon: '/favicon.ico',
              tag: conversationId,
              requireInteraction: false
            });

            notification.onclick = () => {
              window.focus();
              navigate(`/community?conversation=${conversationId}`);
              notification.close();
            };

            // Play sound
            playReceiveSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (selectedConversation) {
      const loadConversation = async () => {
        await fetchMessages(selectedConversation);
        await markMessagesAsRead(selectedConversation);
        await fetchReactions(selectedConversation);
      };
      loadConversation();
      subscribeToConversationMessages(selectedConversation);
      subscribeToReactions(selectedConversation);
    }
    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (reactionChannelRef.current) {
        supabase.removeChannel(reactionChannelRef.current);
      }
    };
  }, [selectedConversation]);

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
    
    if (!error) {
      // Refresh conversations to update unread counts
      await fetchConversations();
    }

    if (!error) {
      // Immediately update local state for messages
      setMessages(prev =>
        prev.map(msg =>
          msg.sender_id !== user.id && !msg.read
            ? { ...msg, read: true }
            : msg
        )
      );
      
      // Update conversations state to remove badge
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Play sound when receiving new messages
    if (messages.length > previousMessagesCount.current && previousMessagesCount.current > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id !== user?.id) {
        playReceiveSound();
      }
    }
    previousMessagesCount.current = messages.length;
  }, [messages, user, playReceiveSound]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations) return;

    const conversationIds = participations.map(p => p.conversation_id);

    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds);

    const otherUserIds = allParticipants
      ?.filter(p => p.user_id !== user.id)
      .map(p => p.user_id) || [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", otherUserIds);

    const { data: lastMessages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    // Fetch unread counts for each conversation
    const { data: allMessages } = await supabase
      .from("messages")
      .select("conversation_id, sender_id, read")
      .in("conversation_id", conversationIds)
      .eq("read", false)
      .neq("sender_id", user.id);

    const conversationsData: Conversation[] = conversationIds.map(convId => {
      const otherUserId = allParticipants?.find(
        p => p.conversation_id === convId && p.user_id !== user.id
      )?.user_id;
      
      const otherUserProfile = profiles?.find(p => p.user_id === otherUserId);
      const lastMsg = lastMessages?.find(m => m.conversation_id === convId);
      const unreadCount = allMessages?.filter(m => m.conversation_id === convId).length || 0;

      return {
        id: convId,
        created_at: lastMsg?.created_at || "",
        otherUser: otherUserProfile,
        lastMessage: lastMsg?.content,
        lastMessageTime: lastMsg?.created_at,
        unreadCount,
      };
    });

    conversationsData.sort((a, b) => 
      new Date(b.lastMessageTime || b.created_at).getTime() - 
      new Date(a.lastMessageTime || a.created_at).getTime()
    );

    // Group conversations by user (consolidate multiple conversations with same user)
    const groupedConversations = new Map<string, Conversation>();
    conversationsData.forEach(conv => {
      const userId = conv.otherUser?.user_id;
      if (!userId) return;
      
      const existing = groupedConversations.get(userId);
      if (!existing) {
        groupedConversations.set(userId, conv);
      } else {
        // Keep the most recent conversation and sum unread counts
        const existingTime = new Date(existing.lastMessageTime || existing.created_at).getTime();
        const currentTime = new Date(conv.lastMessageTime || conv.created_at).getTime();
        
        if (currentTime > existingTime) {
          groupedConversations.set(userId, {
            ...conv,
            unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
          });
        } else {
          groupedConversations.set(userId, {
            ...existing,
            unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
          });
        }
      }
    });

    setConversations(Array.from(groupedConversations.values()));
  };

  const fetchMessages = async (conversationId: string) => {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("id, content, sender_id, created_at, read, shared_post_id, conversation_id, replied_to_id")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!messagesData) return;

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

    setMessages(enrichedMessages);
  };

  const subscribeToConversationMessages = (conversationId: string) => {
    // Unsubscribe from previous channel if exists
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    console.log('🔔 Setting up realtime subscription for conversation:', conversationId);

    // Subscribe to real-time updates for this specific conversation
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
          // Fetch the sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", payload.new.sender_id)
            .single();

          // Fetch replied message if exists
          let repliedToMessage = undefined;
          if (payload.new.replied_to_id) {
            const { data: repliedData } = await supabase
              .from("messages")
              .select("id, content, sender_id, created_at, read")
              .eq("id", payload.new.replied_to_id)
              .single();

            if (repliedData) {
              const { data: repliedProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", repliedData.sender_id)
                .single();

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
              const { data: postProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", postData.user_id)
                .single();

              sharedPost = {
                ...postData,
                profile: postProfile
              };
            }
          }

          // Add the new message with profile to the messages array
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            read: payload.new.read || false,
            shared_post_id: payload.new.shared_post_id,
            replied_to_id: payload.new.replied_to_id,
            profile,
            replied_to: repliedToMessage,
            shared_post: sharedPost,
          };

          setMessages((prev) => [...prev, newMessage]);

          // Show browser notification if message is from another user
          if (payload.new.sender_id !== user?.id && Notification.permission === 'granted') {
            const senderName = profile?.full_name || 'Quelqu\'un';
            const messageContent = sharedPost 
              ? `${senderName} vous a partagé un post` 
              : payload.new.content.substring(0, 100);
            const notification = new Notification(`${senderName} vous a envoyé un message`, {
              body: messageContent,
              icon: '/favicon.ico',
              tag: conversationId,
              requireInteraction: false,
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };
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
          // Update message in real-time (for read status and other updates)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id 
                ? { 
                    ...msg, 
                    read: payload.new.read,
                    content: payload.new.content,
                  }
                : msg
            )
          );
        }
      )
      .subscribe();

    messageChannelRef.current = channel;
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          // Update conversations list when new message arrives
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // If message was marked as read, update the conversation's unread count
          if (payload.new.read && !payload.old.read) {
            // Refetch conversations to update unread counts
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: messageContent,
      read: false,
      replied_to_id: replyingTo?.id || null,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }

    playSendSound();
    setNewMessage("");
    setReplyingTo(null);
    
    // Send notification to recipient
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (conversation?.otherUser) {
      // Get sender's profile for better notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, nickname')
        .eq('user_id', user.id)
        .single();
      
      const senderName = senderProfile?.full_name || user.email || 'Someone';
      
      // Check if messaging Eric (AI assistant)
      const ERIC_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';
      if (conversation.otherUser.user_id === ERIC_USER_ID) {
        try {
          // Call Eric's chat function (handles AI and message insertion)
          const { error: ericError } = await supabase.functions.invoke('eric-chat', {
            body: { 
              conversationId: selectedConversation,
              userMessage: messageContent,
              userId: user.id,
              userNickname: senderProfile?.nickname || senderProfile?.full_name
            }
          });

          if (ericError) {
            console.error('Error calling Eric chat:', ericError);
            toast({
              title: "Erreur",
              description: "Impossible d'obtenir une réponse d'Eric",
              variant: "destructive",
            });
          }
        } catch (aiError) {
          console.error('Error getting AI response:', aiError);
          toast({
            title: "Erreur",
            description: "Impossible d'obtenir une réponse d'Eric",
            variant: "destructive",
          });
        }
      } else {
        // Regular user - send notification
        const notificationChannel = supabase.channel(`user-notifications-${conversation.otherUser.user_id}`);
        await notificationChannel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {
            title: `${senderName} vous a envoyé un message`,
            body: messageContent.substring(0, 100),
            conversationId: selectedConversation
          }
        });
      }
    }
    setIsSending(false);
  };

  const fetchReactions = async (conversationId: string) => {
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
  };

  const subscribeToReactions = (conversationId: string) => {
    if (reactionChannelRef.current) {
      supabase.removeChannel(reactionChannelRef.current);
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
            setReactions(prev => ({
              ...prev,
              [newReaction.message_id]: [...(prev[newReaction.message_id] || []), newReaction]
            }));
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
  };

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditedContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  const handleSaveEdit = async (messageId: string) => {
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
        .update({ content: editedContent.trim() })
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, content: editedContent.trim() } : msg
      ));

      setEditingMessageId(null);
      setEditedContent("");

      toast({
        title: "Succès",
        description: "Message modifié",
      });
    } catch (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.filter(msg => msg.id !== messageId));

      toast({
        title: "Succès",
        description: "Message supprimé",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive",
      });
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if user already reacted with this emoji
    const existingReaction = reactions[messageId]?.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de retirer la réaction",
          variant: "destructive",
        });
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji,
        });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la réaction",
          variant: "destructive",
        });
      }
    }

    setShowReactionPicker(null);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Conversation supprimée",
      });

      // Clear selection if this conversation was selected
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }

      // Refresh conversations list
      await fetchConversations();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    } finally {
      setDeleteConversationId(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="fixed inset-0 bg-background flex overflow-hidden pb-16 md:pb-0">
      {/* Conversations List */}
      <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 lg:w-96 border-r border-border/50 overflow-hidden`}>
        <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="shrink-0"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold flex-1">Messages</h1>
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/user-search")}
              className="shrink-0"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <p className="text-muted-foreground">Aucune conversation</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/user-search")}
              >
                Rechercher des utilisateurs
              </Button>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 ${
                  selectedConversation === conv.id ? "bg-muted/50" : ""
                }`}
              >
                <div 
                  className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                    <AvatarImage src={getAvatarUrl(conv.otherUser?.avatar_url)} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base">
                      {(conv.otherUser?.nickname || conv.otherUser?.full_name)?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold truncate text-sm sm:text-base">
                        {conv.otherUser?.nickname || conv.otherUser?.full_name || "Utilisateur"}
                      </p>
                      {conv.otherUser?.verified && (
                        <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                      )}
                      {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                        <span className="flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {conv.lastMessage || "Aucun message"}
                    </p>
                  </div>
                  {conv.lastMessageTime && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConversationId(conv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer la conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages View */}
      <div className={`${selectedConversation ? "block" : "hidden md:block"} flex-1 flex flex-col overflow-hidden`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="border-b border-border/50 bg-background p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shrink-0 z-10">
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </Button>
              <Avatar 
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const otherUser = conversations.find(c => c.id === selectedConversation)?.otherUser;
                  if (otherUser) navigate(`/profile/${otherUser.user_id}`);
                }}
              >
                <AvatarImage src={getAvatarUrl(conversations.find(c => c.id === selectedConversation)?.otherUser?.avatar_url)} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base">
                  {(conversations.find(c => c.id === selectedConversation)?.otherUser?.nickname || conversations.find(c => c.id === selectedConversation)?.otherUser?.full_name)?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div 
                className="min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const otherUser = conversations.find(c => c.id === selectedConversation)?.otherUser;
                  if (otherUser) navigate(`/profile/${otherUser.user_id}`);
                }}
              >
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {conversations.find(c => c.id === selectedConversation)?.otherUser?.nickname || conversations.find(c => c.id === selectedConversation)?.otherUser?.full_name || "Utilisateur"}
                  </p>
                  {conversations.find(c => c.id === selectedConversation)?.otherUser?.verified && (
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                  )}
                </div>
              </div>
              
              {/* Three-dot menu in header */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteConversationId(selectedConversation)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer la conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4">
              <div className="space-y-2 sm:space-y-4 pb-4 max-w-full">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-2`}
                    >
                      <div 
                        className={`flex gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"} cursor-pointer group`}
                        onClick={(e) => {
                          // Don't trigger reply if clicking on avatar or post
                          if (!(e.target as HTMLElement).closest('.no-reply-trigger')) {
                            setReplyingTo(message);
                          }
                        }}
                      >
                        <Avatar 
                          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 cursor-pointer hover:opacity-80 transition-opacity no-reply-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (message.profile?.user_id) {
                              navigate(`/profile/${message.profile.user_id}`);
                            }
                          }}
                        >
                          <AvatarImage src={getAvatarUrl(message.profile?.avatar_url)} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-[10px] sm:text-xs">
                            {(message.profile?.nickname || message.profile?.full_name)?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 min-w-0 max-w-full">
                          {message.replied_to && (
                            <div className={`text-xs px-2 py-1 rounded-lg border break-words ${
                              isOwn ? "bg-primary/20 border-primary/30" : "bg-muted/60 border-border/30"
                            }`}>
                              <div className="font-semibold opacity-70">
                                {message.replied_to.profile?.nickname || message.replied_to.profile?.full_name}
                              </div>
                              <div className="opacity-60 truncate">
                                {message.replied_to.content.substring(0, 50)}
                                {message.replied_to.content.length > 50 && "..."}
                              </div>
                            </div>
                          )}
                          {message.shared_post ? (
                            // Shared Post Display
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/feed");
                              }}
                              className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 cursor-pointer hover:opacity-90 transition-opacity no-reply-trigger break-words ${
                                isOwn
                                  ? "bg-primary/90 text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20">
                                <span className="text-xs font-semibold opacity-80">
                                  📝 Post partagé de {message.shared_post.profile?.nickname || message.shared_post.profile?.full_name}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words mb-2">
                                {message.shared_post.content}
                              </p>
                              {message.shared_post.image_url && (
                                <img
                                  src={message.shared_post.image_url}
                                  alt="Post"
                                  className="rounded-lg w-full max-h-48 object-contain bg-muted/20"
                                />
                              )}
                              <p className="text-xs opacity-70 mt-2">Cliquez pour voir le post</p>
                            </div>
                          ) : editingMessageId === message.id ? (
                            // Editing Mode
                            <div className="flex flex-col gap-2 w-full">
                              <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="min-h-[60px] resize-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="no-reply-trigger"
                                >
                                  <X size={14} className="mr-1" />
                                  Annuler
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit(message.id);
                                  }}
                                  className="no-reply-trigger"
                                >
                                  <Check size={14} className="mr-1" />
                                  Enregistrer
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Regular Message Display
                            <div className="relative group/message">
                              <div
                                className={`rounded-2xl px-3 py-2 sm:px-4 break-words overflow-wrap-anywhere ${
                                  isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                  {message.content}
                                </p>
                              </div>
                              {isOwn && (
                                <div className="absolute -right-2 top-0 opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 bg-background/90 hover:bg-background no-reply-trigger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMessage(message.id, message.content);
                                    }}
                                  >
                                    <Edit2 size={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 bg-background/90 hover:bg-destructive hover:text-destructive-foreground no-reply-trigger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(message.id);
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.created_at)}
                            </span>
                            {isOwn && (
                              <span className="inline-flex">
                                {message.read ? (
                                  <CheckCheck size={14} className="text-primary" />
                                ) : (
                                  <Check size={14} className="text-muted-foreground" />
                                )}
                              </span>
                            )}
                          </div>
                          
                          {/* Reactions Display */}
                          {reactions[message.id] && reactions[message.id].length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(
                                reactions[message.id].reduce((acc, reaction) => {
                                  if (!acc[reaction.emoji]) {
                                    acc[reaction.emoji] = [];
                                  }
                                  acc[reaction.emoji].push(reaction.user_id);
                                  return acc;
                                }, {} as Record<string, string[]>)
                              ).map(([emoji, userIds]) => {
                                const hasUserReacted = userIds.includes(user?.id);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReaction(message.id, emoji);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors no-reply-trigger ${
                                      hasUserReacted 
                                        ? "bg-primary/20 border border-primary/50" 
                                        : "bg-muted border border-border hover:bg-muted/80"
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-[10px] font-medium">{userIds.length}</span>
                                  </button>
                                );
                              })}
                              
                              {/* Add Reaction Button */}
                              <Popover 
                                open={showReactionPicker === message.id} 
                                onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-0.5 rounded-full text-xs bg-muted border border-border hover:bg-muted/80 transition-colors no-reply-trigger"
                                  >
                                    ➕
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-2" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex gap-2">
                                    {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'].map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleReaction(message.id, emoji);
                                        }}
                                        className="text-xl hover:scale-125 transition-transform"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                          
                          {/* Add Reaction Button (when no reactions exist) */}
                          {(!reactions[message.id] || reactions[message.id].length === 0) && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                              <Popover 
                                open={showReactionPicker === message.id} 
                                onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-0.5 rounded-full text-xs bg-muted border border-border hover:bg-muted/80 transition-colors no-reply-trigger flex items-center gap-1"
                                  >
                                    <Smile size={12} />
                                    <span className="text-[10px]">Réagir</span>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-2" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex gap-2">
                                    {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'].map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleReaction(message.id, emoji);
                                        }}
                                        className="text-xl hover:scale-125 transition-transform"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-border/50 p-2 sm:p-4 bg-background shrink-0">
              {replyingTo && (
                <div className="mb-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/30 flex items-start justify-between max-w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-primary mb-0.5">
                      Répondre à {replyingTo.profile?.nickname || replyingTo.profile?.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {replyingTo.content}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => setReplyingTo(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="flex gap-1.5 sm:gap-2 items-end">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Smile size={18} className="sm:w-5 sm:h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-0" align="start">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setNewMessage((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      width="100%"
                      height="400px"
                    />
                  </PopoverContent>
                </Popover>
                <Textarea
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="text-sm sm:text-base resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <p className="text-muted-foreground">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
      
      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={(open) => !open && setDeleteConversationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les messages de cette conversation seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConversationId && handleDeleteConversation(deleteConversationId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Community;
