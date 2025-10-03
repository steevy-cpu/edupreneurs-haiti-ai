import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, BookOpen, MessageCircle, Trophy, Settings, Send, Search, ArrowLeft } from "lucide-react";

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
  other_user: {
    id: string;
    full_name: string;
    nickname: string;
  };
  last_message?: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participants } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations:conversation_id (
          id,
          updated_at
        )
      `)
      .eq("user_id", user.id);

    if (!participants) return;

    const conversationsData = await Promise.all(
      participants.map(async (p: any) => {
        const { data: otherParticipants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", p.conversation_id)
          .neq("user_id", user.id)
          .single();

        let otherUserProfile = null;
        if (otherParticipants) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, nickname")
            .eq("user_id", otherParticipants.user_id)
            .single();
          otherUserProfile = profile;
        }

        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", p.conversation_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          id: p.conversations.id,
          updated_at: p.conversations.updated_at,
          other_user: {
            id: otherParticipants?.user_id || "",
            full_name: otherUserProfile?.full_name || "User",
            nickname: otherUserProfile?.nickname || "user"
          },
          last_message: lastMessage?.content || ""
        };
      })
    );

    setConversations(conversationsData);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
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
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim()
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return;
    }

    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-xl border-r border-border/50`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              ÉducaNet
            </h2>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300"
            >
              <Home size={18} />
              Dashboard
            </a>
            <a
              href="/matieres"
              className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300"
            >
              <BookOpen size={18} />
              Matières
            </a>
            <a
              href="/community"
              className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white shadow-lg shadow-primary/20 translate-x-1"
            >
              <MessageCircle size={18} />
              Communauté
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300"
            >
              <Trophy size={18} />
              Récompenses
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300"
            >
              <Settings size={18} />
              Paramètres
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-96 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations
                .filter((conv) =>
                  conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.other_user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex items-center gap-3 rounded-xl mb-2 transition-all hover:bg-accent/50 ${
                      selectedConversation === conv.id ? "bg-accent" : ""
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-success text-white">
                        {conv.other_user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{conv.other_user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message || "Pas de messages"}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-success text-white">
                    {selectedConv?.other_user.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConv?.other_user.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{selectedConv?.other_user.nickname}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          message.sender_id === user?.id
                            ? "bg-gradient-to-br from-primary to-success text-white"
                            : "bg-card"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? "text-white/70" : "text-muted-foreground"
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    placeholder="Envoyer un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    size="icon"
                    className="bg-gradient-to-br from-primary to-success hover:opacity-90"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
