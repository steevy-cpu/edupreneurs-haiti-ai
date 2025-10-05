import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Search, Smile } from "lucide-react";
import { useMessageSounds } from "@/hooks/useMessageSounds";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { initializePushNotifications } from "@/utils/pushNotifications";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
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
  profile?: Profile;
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
  const previousMessagesCount = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<any>(null);

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
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
      subscribeToConversationMessages(selectedConversation);
    }
    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
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
      // Immediately update local conversations state to remove badge
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

    setConversations(conversationsData);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!messagesData) return;

    const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", senderIds);

    const enrichedMessages = messagesData.map(msg => ({
      ...msg,
      profile: profiles?.find(p => p.user_id === msg.sender_id),
    }));

    setMessages(enrichedMessages);
  };

  const subscribeToConversationMessages = (conversationId: string) => {
    // Unsubscribe from previous channel if exists
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    // Subscribe to real-time updates for this specific conversation
    const channel = supabase
      .channel(`messages-${conversationId}`)
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

          // Add the new message with profile to the messages array
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            profile,
          };

          setMessages((prev) => [...prev, newMessage]);

          // Show browser notification if message is from another user
          if (payload.new.sender_id !== user?.id && Notification.permission === 'granted') {
            const senderName = profile?.full_name || 'Quelqu\'un';
            const notification = new Notification(`${senderName} vous a envoyé un message`, {
              body: payload.new.content.substring(0, 100),
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
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } else {
      playSendSound();
      setNewMessage("");
      
      // Send notification to recipient
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation?.otherUser) {
        // Get sender's profile for better notification
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        const senderName = senderProfile?.full_name || user.email || 'Someone';
        
        // Broadcast notification via realtime
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
    <div className="min-h-screen bg-background flex">
      {/* Conversations List */}
      <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-96 border-r border-border/50`}>
        <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">Messages</h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/user-search")}
            >
              <Search size={20} />
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
                onClick={() => setSelectedConversation(conv.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 ${
                  selectedConversation === conv.id ? "bg-muted/50" : ""
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
                    {conv.otherUser?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {conv.otherUser?.full_name || "Utilisateur"}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage || "Aucun message"}
                  </p>
                </div>
                {conv.lastMessageTime && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages View */}
      <div className={`${selectedConversation ? "block" : "hidden md:block"} flex-1 flex flex-col`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur p-4 flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft size={20} />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
                  {conversations.find(c => c.id === selectedConversation)?.otherUser?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {conversations.find(c => c.id === selectedConversation)?.otherUser?.full_name || "Utilisateur"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-xs">
                            {message.profile?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-2">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                    >
                      <Smile size={20} />
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
                <Input
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send size={20} />
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
    </div>
  );
};

export default Community;
