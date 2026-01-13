import { useState, useRef, useEffect, useCallback, type FocusEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import judeAvatar from "@/assets/dashboard00.png";
import { getAvatarUrl } from "@/lib/avatarMap";
import { useEricDraggable } from "@/hooks/useEricDraggable";
import { useVisitor } from "@/contexts/VisitorContext";

// Routes where JudeChatbot should be hidden
const HIDDEN_ROUTES = ['/cookie-settings', '/privacy-policy', '/control-center'];

interface Message {
  content: string;
  sender: "user" | "jude";
  navigationPath?: string;
}

// Typewriter effect component
const TypewriterText = ({ 
  text, 
  speed = 15, 
  onComplete
}: { 
  text: string; 
  speed?: number; 
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);
  
  return (
    <span>
      {displayedText}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
    </span>
  );
};

export const JudeChatbot = () => {
  const { isVisitor } = useVisitor();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [userNickname, setUserNickname] = useState<string>("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  // Use a single DOM node for both open/closed measurements - MUST be before early return
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    (floatingRef as any).current = node;
    (chatRef as any).current = node;
  }, [floatingRef, chatRef]);

  // Fetch user profile on mount - MUST be before early return (React Hooks Rule)
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Skip fetch if visitor or hidden route
      if (isVisitor || HIDDEN_ROUTES.includes(location.pathname)) return;
      
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
            content: `${greeting} ${nickname} ! Je suis Jude, votre assistant. Comment puis-je vous aider ? 😊`,
            sender: "jude"
          }]);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessages([{
          content: "Salut ! Je suis Jude, votre assistant. Comment puis-je vous aider ? 😊",
          sender: "jude"
        }]);
      }
    };

    fetchUserProfile();
  }, [isVisitor, location.pathname]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Hide JudeChatbot in visitor mode or on specific routes - AFTER all hooks
  if (isVisitor || HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    setMessages(prev => [...prev, { content: userMessage, sender: "user" }]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('jude-ai-tutor', {
        body: {
          message: userMessage,
          chatHistory: messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          })),
          userNickname,
          currentPage: location.pathname, // Pass current page for context
          enableVoice: false
        }
      });

      if (error) throw error;

      const responseText = data.response || data.text || "Désolé, je n'ai pas pu traiter votre message.";
      const navigationPath = data.navigation?.path;

      setMessages(prev => {
        const newMessages = [...prev, { 
          content: responseText, 
          sender: "jude" as const,
          navigationPath
        }];
        setTypingMessageIndex(newMessages.length - 1);
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
      setMessages(prev => [...prev, { 
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.", 
        sender: "jude" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputFocus = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  return (
    <div 
      ref={setRootRef}
      style={{
        position: 'fixed',
        zIndex: 1000,
        ...(isOpen 
          ? { 
              top: '4.5rem',
              right: '0.75rem',
            }
          : getPositionStyles(false, {
              closedTop: '5rem',
              closedRight: '0.75rem',
              openTop: '5rem',
              openRight: '0.75rem',
            })
        ),
      }}
      onMouseDown={!isOpen ? handleMouseDown : undefined}
      onTouchStart={!isOpen ? handleTouchStart : undefined}
    >
      {/* Jude's 2D avatar */}
      <div 
        className={`cursor-pointer ${!isOpen ? 'hover:scale-105' : ''} transition-transform`}
        onClick={() => {
          if (!hasActuallyDragged) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {!isOpen && (
          <div className="eric-floating-tooltip text-[10px] sm:text-xs">
            Cliquez sur moi
          </div>
        )}
        
        <div className="w-14 sm:w-16 md:w-20 lg:w-28">
          <img 
            src={judeAvatar} 
            alt="Jude - Assistant IA" 
            title={isOpen ? "Cliquez pour fermer" : "Cliquez pour parler avec Jude"}
            className="w-full h-auto pointer-events-none drop-shadow-2xl"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] flex flex-col mt-2">
          {/* FAQ Quick Actions - show only when no user messages yet */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3 mr-16 sm:mr-20 md:mr-24 lg:mr-28">
              {[
                "Comment voir mes cours ?",
                "Où est le classement ?",
                "Aide-moi à étudier",
              ].map((faq) => (
                <button
                  key={faq}
                  onClick={() => {
                    setInput(faq);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-[10px] sm:text-xs px-3 py-1.5 bg-accent/90 backdrop-blur-sm border border-primary/30 hover:bg-accent rounded-full text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {faq}
                </button>
              ))}
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[40vh] sm:max-h-[45vh] md:max-h-[50vh]">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
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
                  {message.sender === "jude" && index === typingMessageIndex ? (
                    <TypewriterText 
                      text={message.content} 
                      speed={15} 
                      onComplete={() => setTypingMessageIndex(null)}
                    />
                  ) : (
                    message.content
                  )}
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
                <span>Jude réfléchit</span>
                <span className="animate-pulse">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="pt-2 sm:pt-3">
            <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full shadow-md p-1.5 pl-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleInputFocus}
                placeholder="Tapez votre question..."
                maxLength={200}
                className="flex-1 min-h-[32px] max-h-[50px] text-xs sm:text-sm resize-none border-0 bg-transparent focus-visible:ring-0 px-0 py-1.5 mobile-input tap-highlight-none"
                autoCapitalize="sentences"
                autoCorrect="on"
                spellCheck={false}
                enterKeyHint="send"
                rows={1}
              />
              <Button
                size="icon"
                className="rounded-full w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
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
