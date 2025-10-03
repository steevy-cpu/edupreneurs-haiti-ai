import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Search, Menu, X, ArrowLeft } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  updated_at: string;
  otherUser?: Profile;
  lastMessage?: Message;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    fetchConversations();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*");
    
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setAllUsers(data || []);
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (participantError) {
      console.error("Error fetching conversations:", participantError);
      return;
    }

    const conversationIds = participantData?.map(p => p.conversation_id) || [];
    
    if (conversationIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (convError) {
      console.error("Error fetching conversation details:", convError);
      return;
    }

    // Fetch other participants and last messages
    const enrichedConvs = await Promise.all(
      (convData || []).map(async (conv) => {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.id)
          .neq("user_id", user.id);

        const otherUserId = participants?.[0]?.user_id;
        
        if (otherUserId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", otherUserId)
            .single();

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            otherUser: profile,
            lastMessage: lastMsg
          };
        }
        return conv;
      })
    );

    setConversations(enrichedConvs);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = (conversationId: string) => {
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: currentUser.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const startNewConversation = async (userId: string) => {
    if (!currentUser) return;

    // Check if conversation already exists
    const { data: existingParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUser.id);

    if (existingParticipants) {
      for (const participant of existingParticipants) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("*")
          .eq("conversation_id", participant.conversation_id)
          .eq("user_id", userId)
          .single();

        if (otherParticipant) {
          setSelectedConversation(participant.conversation_id);
          setShowUserList(false);
          setIsMobileMenuOpen(false);
          return;
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (convError || !newConv) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
      return;
    }

    // Add participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: currentUser.id },
      { conversation_id: newConv.id, user_id: userId },
    ]);

    setSelectedConversation(newConv.id);
    setShowUserList(false);
    setIsMobileMenuOpen(false);
    fetchConversations();
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.user_id !== currentUser?.id &&
      (user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversations List */}
      <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } lg:flex flex-col w-full lg:w-[420px] border-r border-border/50 bg-background`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-accent/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-none h-9 rounded-lg focus-visible:ring-1"
            />
          </div>
        </div>

        {/* New Message Button */}
        <div className="px-4 py-2">
          <Button
            onClick={() => setShowUserList(!showUserList)}
            variant="ghost"
            className="w-full justify-start text-primary hover:bg-accent/50 font-semibold"
          >
            <Send size={16} className="mr-2" />
            Nouveau message
          </Button>
        </div>

        {/* User List Modal */}
        {showUserList && (
          <div className="absolute inset-0 bg-background z-50 lg:relative">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-semibold">Nouveau message</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserList(false)}
                className="hover:bg-accent/50"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/30 border-none h-9 rounded-lg"
                />
              </div>
              <ScrollArea className="h-[calc(100vh-200px)]">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startNewConversation(user.user_id)}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground">
                        {user.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user.nickname}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Send size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucune conversation</p>
              <p className="text-xs text-muted-foreground mt-1">Commencez à chatter !</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                  selectedConversation === conv.id ? "bg-accent/30" : ""
                }`}
              >
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground text-lg">
                    {conv.otherUser?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">
                    {conv.otherUser?.full_name || "Utilisateur inconnu"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage?.content || "Envoyez un message"}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-accent/50"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <ArrowLeft size={20} />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground">
                  {selectedConvData?.otherUser?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {selectedConvData?.otherUser?.full_name || "Utilisateur inconnu"}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{selectedConvData?.otherUser?.nickname}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-6">
              <div className="space-y-2 max-w-3xl mx-auto">
                {messages.map((msg, index) => {
                  const isOwn = msg.sender_id === currentUser?.id;
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isOwn && (
                        <Avatar className={`h-7 w-7 ${showAvatar ? "" : "invisible"}`}>
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground text-xs">
                            {selectedConvData?.otherUser?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`group relative max-w-[70%] rounded-[18px] px-3 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/70 text-foreground"
                        }`}
                      >
                        <p className="text-[15px] leading-5 break-words">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-border/50 bg-background">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="pr-10 rounded-full border border-border/50 bg-background focus-visible:ring-1 h-10"
                  />
                  {newMessage.trim() && (
                    <Button
                      onClick={sendMessage}
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                    >
                      <Send size={18} className="text-primary" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mb-6 hover:bg-accent/50"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </Button>
            <div className="w-24 h-24 rounded-full border-2 border-foreground/20 flex items-center justify-center mb-4">
              <Send size={32} />
            </div>
            <h3 className="text-xl font-light mb-2">Vos messages</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Envoyez des messages privés à vos amis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
