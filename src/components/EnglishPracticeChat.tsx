import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ericChairDesk from "@/assets/eric-chair-desk.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EnglishPracticeChatProps {
  lessonTitle: string;
  lessonObjective: string;
  lessonSlug: string;
  gradeLevel: string;
  userNickname: string;
}

export const EnglishPracticeChat = ({
  lessonTitle,
  lessonObjective,
  lessonSlug,
  gradeLevel,
  userNickname,
}: EnglishPracticeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [displayName, setDisplayName] = useState(userNickname);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasPreviousConversation, setHasPreviousConversation] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadPreviousConversation = async (userId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data: sessions, error: sessionError } = await supabase
        .from('english_practice_conversations')
        .select('session_id, created_at')
        .eq('user_id', userId)
        .eq('lesson_slug', lessonSlug)
        .eq('grade_level', gradeLevel)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      if (sessions && sessions.length > 0) {
        const lastSessionId = sessions[0].session_id;
        
        const { data: history, error: historyError } = await supabase
          .from('english_practice_conversations')
          .select('message_role, message_content, created_at')
          .eq('session_id', lastSessionId)
          .order('created_at', { ascending: true });

        if (historyError) throw historyError;

        if (history && history.length > 0) {
          const loadedMessages = history.map(msg => ({
            role: msg.message_role as 'user' | 'assistant',
            content: msg.message_content
          }));
          
          setMessages(loadedMessages);
          setSessionId(lastSessionId);
          setHasPreviousConversation(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return false;
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessageToDatabase = async (
    role: 'user' | 'assistant',
    content: string,
    currentSessionId: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('english_practice_conversations')
        .insert({
          user_id: user.id,
          lesson_slug: lessonSlug,
          grade_level: gradeLevel,
          session_id: currentSessionId,
          message_role: role,
          message_content: content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const startNewConversation = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setMessages([]);
    setHasPreviousConversation(false);
    setIsInitialized(false);
  };

  const deleteConversationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('english_practice_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_slug', lessonSlug)
        .eq('grade_level', gradeLevel);

      if (error) throw error;

      toast.success("Conversation history cleared!");
      startNewConversation();
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error("Failed to clear conversation history");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.nickname) {
          setDisplayName(profile.nickname);
        }

        const hasHistory = await loadPreviousConversation(user.id);
        
        if (!hasHistory) {
          const newSessionId = crypto.randomUUID();
          setSessionId(newSessionId);
          await initializeChat(newSessionId);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, lessonSlug, gradeLevel]);

  const initializeChat = async (currentSessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("anglais-practice-tutor", {
        body: {
          message: "",
          lessonContext: {
            title: lessonTitle,
            objective: lessonObjective,
            slug: lessonSlug,
            gradeLevel: gradeLevel,
          },
          chatHistory: [],
          userNickname: displayName,
          isInitialGreeting: true,
        },
      });

      if (error) throw error;

      if (data?.response) {
        setMessages([{ role: "assistant", content: data.response }]);
        await saveMessageToDatabase('assistant', data.response, currentSessionId);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Erreur lors de l'initialisation du chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    await saveMessageToDatabase('user', userMessage, sessionId);
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("anglais-practice-tutor", {
        body: {
          message: userMessage,
          lessonContext: {
            title: lessonTitle,
            objective: lessonObjective,
            slug: lessonSlug,
            gradeLevel: gradeLevel,
          },
          chatHistory: messages,
          userNickname: displayName,
          isInitialGreeting: false,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Trop de requêtes. Eric a besoin d'une pause. Réessayez dans un moment.");
        } else if (error.message?.includes("402")) {
          toast.error("Limite de crédits atteinte. Contactez votre administrateur.");
        } else {
          throw error;
        }
        return;
      }

      if (data?.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        await saveMessageToDatabase('assistant', data.response, sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble understanding that. Could you try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "Hello!",
    "How are you?",
    "My name is...",
    "Nice to meet you",
  ];

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      {isLoadingHistory ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading previous conversation...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <img
                src={ericChairDesk}
                alt="Eric"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  🗣️ Practice Your English with Eric
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasPreviousConversation ? "Continuing previous conversation" : "Practice Mode - Not Graded"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {hasPreviousConversation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewConversation}
                  title="Start a fresh conversation"
                  disabled={isLoading}
                >
                  🔄 New Chat
                </Button>
              )}
              
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteConversationHistory}
                  title="Clear all conversation history"
                  disabled={isLoading}
                >
                  🗑️ Clear History
                </Button>
              )}
            </div>
          </div>

      <div className="space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-card text-card-foreground border"
              }`}
            >
              <p className="text-sm sm:text-base whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground border p-3 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Eric is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2">
          <p className="text-sm text-muted-foreground w-full">💡 Try these:</p>
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(reply);
              }}
              disabled={isLoading}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message in English..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !sessionId}
              size="icon"
              className="h-[80px] w-[80px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
