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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const initializeChat = async () => {
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
          userNickname: userNickname,
          isInitialGreeting: true,
        },
      });

      if (error) throw error;

      if (data?.response) {
        setMessages([{ role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Erreur lors de l'initialisation du chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
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
          userNickname: userNickname,
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
      <div className="flex items-center gap-3 pb-4 border-b">
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
            Practice Mode - Not Graded
          </p>
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
          disabled={!input.trim() || isLoading}
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
    </Card>
  );
};
