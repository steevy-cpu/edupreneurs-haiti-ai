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
        } lg:flex flex-col w-full lg:w-96 border-r border-border`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Communauté
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <Button
            onClick={() => setShowUserList(!showUserList)}
            className="w-full bg-gradient-to-r from-primary to-success hover:opacity-90"
          >
            Nouveau message
          </Button>

          {showUserList && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-64 border border-border rounded-lg">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startNewConversation(user.user_id)}
                    className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                  >
                    <Avatar>
                      <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{user.nickname}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-colors border-b border-border ${
                selectedConversation === conv.id ? "bg-accent" : ""
              }`}
            >
              <Avatar>
                <AvatarFallback>
                  {conv.otherUser?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {conv.otherUser?.full_name || "Utilisateur inconnu"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage?.content || "Aucun message"}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <ArrowLeft size={24} />
              </Button>
              <Avatar>
                <AvatarFallback>
                  {selectedConvData?.otherUser?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedConvData?.otherUser?.full_name || "Utilisateur inconnu"}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{selectedConvData?.otherUser?.nickname}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender_id === currentUser?.id
                          ? "bg-gradient-to-r from-primary to-success text-white"
                          : "bg-accent"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  className="bg-gradient-to-r from-primary to-success hover:opacity-90"
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mb-4"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </Button>
            <p className="text-lg">Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
