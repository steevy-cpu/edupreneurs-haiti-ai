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
  shared_post_id?: string | null;
  shared_post?: {
    id: string;
    content: string;
    image_url: string | null;
    user_id: string;
    profile?: Profile;
  };
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
      return {
        ...msg,
        profile: profiles?.find(p => p.user_id === msg.sender_id),
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
            shared_post_id: payload.new.shared_post_id,
            profile,
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
    <div className="min-h-screen bg-background flex pb-16 md:pb-0">
      {/* Conversations List */}
      <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 lg:w-96 border-r border-border/50`}>
        <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h1 className="text-lg sm:text-xl font-semibold">Messages</h1>
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
                onClick={() => setSelectedConversation(conv.id)}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 ${
                  selectedConversation === conv.id ? "bg-muted/50" : ""
                }`}
              >
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base">
                    {conv.otherUser?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate text-sm sm:text-base">
                      {conv.otherUser?.full_name || "Utilisateur"}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {conv.lastMessage || "Aucun message"}
                  </p>
                </div>
                {conv.lastMessageTime && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages View */}
      <div className={`${selectedConversation ? "block" : "hidden md:block"} flex-1 flex flex-col max-h-screen md:h-auto`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden shrink-0"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </Button>
              <Avatar 
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const otherUser = conversations.find(c => c.id === selectedConversation)?.otherUser;
                  if (otherUser) navigate(`/profile?userId=${otherUser.user_id}`);
                }}
              >
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base">
                  {conversations.find(c => c.id === selectedConversation)?.otherUser?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div 
                className="min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const otherUser = conversations.find(c => c.id === selectedConversation)?.otherUser;
                  if (otherUser) navigate(`/profile?userId=${otherUser.user_id}`);
                }}
              >
                <p className="font-semibold text-sm sm:text-base truncate">
                  {conversations.find(c => c.id === selectedConversation)?.otherUser?.full_name || "Utilisateur"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-2 sm:p-4">
              <div className="space-y-2 sm:space-y-4 pb-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[75%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        <Avatar 
                          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (message.profile?.user_id) {
                              navigate(`/profile?userId=${message.profile.user_id}`);
                            }
                          }}
                        >
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-[10px] sm:text-xs">
                            {message.profile?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {message.shared_post ? (
                            // Shared Post Display
                            <div
                              onClick={() => navigate("/feed")}
                              className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 cursor-pointer hover:opacity-90 transition-opacity ${
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
                                  className="rounded-lg w-full max-h-32 sm:max-h-48 object-cover"
                                />
                              )}
                              <p className="text-xs opacity-70 mt-2">Cliquez pour voir le post</p>
                            </div>
                          ) : (
                            // Regular Message Display
                            <div
                              className={`rounded-2xl px-3 py-2 sm:px-4 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                          )}
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
            <div className="border-t border-border/50 p-2 sm:p-4">
              <div className="flex gap-1.5 sm:gap-2">
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
                  className="text-sm sm:text-base"
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
    </div>
  );
};

export default Community;
