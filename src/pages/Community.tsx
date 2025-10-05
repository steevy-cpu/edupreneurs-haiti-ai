import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Search } from "lucide-react";
import { useMessageSounds } from "@/hooks/useMessageSounds";

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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const previousMessagesCount = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

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

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } else if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
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

    const conversationsData: Conversation[] = conversationIds.map(convId => {
      const otherUserId = allParticipants?.find(
        p => p.conversation_id === convId && p.user_id !== user.id
      )?.user_id;
      
      const otherUserProfile = profiles?.find(p => p.user_id === otherUserId);
      const lastMsg = lastMessages?.find(m => m.conversation_id === convId);

      return {
        id: convId,
        created_at: lastMsg?.created_at || "",
        otherUser: otherUserProfile,
        lastMessage: lastMsg?.content,
        lastMessageTime: lastMsg?.created_at,
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

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          if (selectedConversation) {
            fetchMessages(selectedConversation);
          }
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
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim(),
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
                  <p className="font-semibold truncate">
                    {conv.otherUser?.full_name || "Utilisateur"}
                  </p>
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
