import { useState, useRef, useEffect } from "react";
import { Send, X, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import judeProfile from "@/assets/jude-profile.jpeg";
import ericAiHelper from "@/assets/eric-ai-helper.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EbookJudeAssistantProps {
  bookTitle: string;
  bookAuthor?: string;
  currentPage: number;
  selectedText?: string;
  onClearSelection?: () => void;
}

export function EbookJudeAssistant({
  bookTitle,
  bookAuthor,
  currentPage,
  selectedText,
  onClearSelection,
}: EbookJudeAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-open when text is selected
  useEffect(() => {
    if (selectedText && selectedText.length > 0) {
      setIsOpen(true);
      // Pre-fill with question about selected text
      setInput(`Que signifie "${selectedText}" ?`);
    }
  }, [selectedText]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("reading-tutor", {
        body: {
          message: userMessage,
          chatHistory: messages,
          bookTitle,
          bookAuthor,
          currentPage,
          selectedText,
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response 
      }]);

      // Clear selection after sending
      if (onClearSelection) onClearSelection();
    } catch (error) {
      console.error("Reading tutor error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Désolé, je n'ai pas pu répondre. Réessaie dans un instant. 🙏" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = selectedText ? [
    { label: "📖 Définition", prompt: `Que signifie "${selectedText}" ?` },
    { label: "✨ Synonymes", prompt: `Donne-moi des synonymes de "${selectedText}"` },
    { label: "🌍 Traduis", prompt: `Traduis "${selectedText}" en français` },
    { label: "🔍 Contexte", prompt: `Explique "${selectedText}" dans le contexte du livre` },
  ] : [
    { label: "📚 Aide lecture", prompt: "Comment ce livre peut m'aider dans mes études ?" },
    { label: "📝 Vocabulaire", prompt: "Quels sont les mots importants à retenir ?" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full md:bottom-6 overflow-hidden bg-transparent border-0 shadow-none p-0"
      >
        <img 
          src={ericAiHelper} 
          alt="Jude Assistant" 
          className="h-full w-full object-cover"
        />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:bottom-6 sm:right-4 sm:w-96">
      <div className="flex h-[70vh] max-h-[500px] flex-col rounded-t-xl border bg-background shadow-2xl sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={judeProfile} alt="Jude" />
              <AvatarFallback>J</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Jude - Assistant Lecture</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {bookTitle} • Page {currentPage}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <img src={judeProfile} alt="Jude" className="h-16 w-16 rounded-full object-cover mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionne un mot que tu ne comprends pas, ou pose-moi une question sur ta lecture ! 📚
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(action.prompt);
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={judeProfile} alt="Jude" />
                      <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={judeProfile} alt="Jude" />
                    <AvatarFallback>J</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Selected Text Preview */}
        {selectedText && (
          <div className="border-t bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Texte sélectionné:</p>
            <p className="text-sm font-medium line-clamp-1">"{selectedText}"</p>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
