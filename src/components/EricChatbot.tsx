import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ericAvatar from "@/assets/dashboard00.png";
import { getAvatarUrl } from "@/lib/avatarMap";
import { useEricDraggable } from "@/hooks/useEricDraggable";

interface Message {
  content: string;
  sender: "user" | "eric";
  navigationPath?: string;
}

export const EricChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userNickname, setUserNickname] = useState<string>("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use the shared draggable hook
  const {
    hasMoved,
    isDragging,
    hasActuallyDragged,
    floatingRef,
    chatRef,
    handleMouseDown,
    handleTouchStart,
    getPositionStyles,
    resetPosition,
  } = useEricDraggable(isOpen, { defaultWidth: 380, defaultHeight: 500 });

  // Use a single DOM node for both open/closed measurements to avoid "duplicate" behavior
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    (floatingRef as any).current = node;
    (chatRef as any).current = node;
  }, [floatingRef, chatRef]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, avatar_url')
            .eq('user_id', user.id)
            .single();
          
          const nickname = profile?.nickname || "l'élève";
          setUserNickname(nickname);
          setUserAvatarUrl(profile?.avatar_url || "");
          
          // Set initial greeting with nickname
          const now = new Date();
          const haitiOffset = -5;
          const haitiTime = new Date(now.getTime() + (haitiOffset * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
          const currentHour = haitiTime.getHours();
          
          let greeting = "Bonjour";
          if (currentHour >= 18 || currentHour < 5) {
            greeting = "Bonsoir";
          } else if (currentHour >= 12 && currentHour < 18) {
            greeting = "Bon après-midi";
          }
          
          setMessages([{
            content: `${greeting} ${nickname} ! Je suis Eric, votre assistant. Comment puis-je vous aider ? 😊`,
            sender: "eric"
          }]);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback greeting without nickname
        setMessages([{
          content: "Salut ! Je suis Eric, votre assistant. Comment puis-je vous aider ? 😊",
          sender: "eric"
        }]);
      }
    };

    fetchUserProfile();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { content: userMessage, sender: "user" }]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('math-ai-tutor', {
        body: {
          message: userMessage,
          lessonType: 'tutor',
          userNickname: userNickname,
          chatHistory: messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          }))
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        content: data.response, 
        sender: "eric",
        navigationPath: data.navigate || undefined
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div 
      ref={setRootRef}
      style={{
        ...getPositionStyles(isOpen, {
          closedTop: '5rem',
          closedRight: '0.75rem',
          openTop: '5rem',
          openRight: '0.75rem',
        }),
        zIndex: 1000,
      }}
      // Only apply drag to container when chat is open
      onMouseDown={isOpen ? handleMouseDown : undefined}
      onTouchStart={isOpen ? handleTouchStart : undefined}
    >
      {/* Eric's image - always visible, draggable when closed, clickable to toggle chat */}
      <div 
        className={`w-14 sm:w-16 md:w-20 lg:w-28 cursor-pointer ${!isOpen ? 'hover:scale-105' : ''} transition-transform`}
        // Apply drag handlers to Eric's image when chat is closed
        onMouseDown={!isOpen ? handleMouseDown : undefined}
        onTouchStart={!isOpen ? handleTouchStart : undefined}
        onClick={() => {
          if (!hasActuallyDragged) {
            if (isOpen) {
              resetPosition();
            }
            setIsOpen(!isOpen);
          }
        }}
      >
        {!isOpen && (
          <div className="eric-floating-tooltip text-[10px] sm:text-xs">
            Cliquez sur moi
          </div>
        )}
        <img 
          src={ericAvatar} 
          alt="Eric - Assistant IA" 
          title={isOpen ? "Cliquez pour fermer" : "Cliquez pour parler avec Eric"}
          className="w-full h-auto pointer-events-none drop-shadow-2xl"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Chat Interface - attached below Eric */}
      {isOpen && (
        <div className="relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] flex flex-col mt-2">
          {/* Messages - floating bubbles */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[40vh] sm:max-h-[45vh] md:max-h-[50vh]">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Only show avatar for user messages - Eric is already visible above */}
                {message.sender === "user" && (
                  <img 
                    src={getAvatarUrl(userAvatarUrl) || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"}
                    alt="user"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className={`max-w-[90%] p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm shadow-md ${
                  message.sender === "user" 
                    ? "bg-primary text-primary-foreground rounded-br-sm" 
                    : "bg-background/95 backdrop-blur-sm rounded-bl-sm border border-border/20"
                }`}>
                  {message.content}
                  {message.navigationPath && (
                    <Button
                      className="mt-2 w-full text-xs"
                      size="sm"
                      onClick={() => navigate(message.navigationPath!)}
                    >
                      Aller à cette page
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Eric écrit</span>
                <span className="animate-pulse">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - floating style */}
          <div className="pt-2 sm:pt-3">
            <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full shadow-md p-1.5 pl-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre question..."
                maxLength={200}
                className="flex-1 min-h-[32px] max-h-[50px] text-xs sm:text-sm resize-none border-0 bg-transparent focus-visible:ring-0 px-0 py-1.5"
                rows={1}
              />
              <Button
                size="icon"
                className="rounded-full w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
                onClick={sendMessage}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
