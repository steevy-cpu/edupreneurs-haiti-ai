import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ericAvatar from "@/assets/dashboard00.png";
import { getAvatarUrl } from "@/lib/avatarMap";

interface Message {
  content: string;
  sender: "user" | "eric";
  navigationPath?: string;
}

export const EricChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [userNickname, setUserNickname] = useState<string>("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false);
  const [dragThresholdMet, setDragThresholdMet] = useState(false);
  const DRAG_THRESHOLD = 5; // pixels
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
            content: `${greeting} ${nickname} ! Je suis Eric, votre professeur. Comment puis-je vous aider ? 😊`,
            sender: "eric"
          }]);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback greeting without nickname
        setMessages([{
          content: "Salut ! Je suis Eric, votre professeur. Comment puis-je vous aider ? 😊",
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

  // Initialize centered position when chatbox opens
  useEffect(() => {
    if (isOpen && !position) {
      const chatWidth = 380;
      const chatHeight = 500;
      setPosition({
        x: (window.innerWidth - chatWidth) / 2,
        y: (window.innerHeight - chatHeight) / 2
      });
    }
  }, [isOpen, position]);

  // Constrain position within viewport bounds
  const constrainToViewport = (pos: { x: number; y: number }) => {
    const chatWidth = 380;
    const chatHeight = 500;

    const maxX = window.innerWidth - chatWidth;
    const maxY = window.innerHeight - chatHeight;

    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY))
    };
  };

  // Handle window resize to keep chatbox in viewport
  useEffect(() => {
    if (!position) return;

    const handleResize = () => {
      setPosition(prev => prev ? constrainToViewport(prev) : null);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Constrain position when chatbox opens to prevent cutoff
  useEffect(() => {
    if (isOpen && position) {
      setTimeout(() => {
        setPosition(prev => prev ? constrainToViewport(prev) : null);
      }, 0);
    }
  }, [isOpen]);

  const speakMessage = (text: string, index: number) => {
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

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

  // Drag handlers for both mouse and touch
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // Reset drag flags
    setHasActuallyDragged(false);
    setDragThresholdMet(false);
    
    // Store the initial click position
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't drag when touching interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // Reset drag flags
    setHasActuallyDragged(false);
    setDragThresholdMet(false);
    
    const touch = e.touches[0];
    
    // Store the initial touch position
    setDragStart({
      x: touch.clientX,
      y: touch.clientY
    });
    
    setIsDragging(true);
  };

  // Handle mouse/touch move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate distance from initial click position
      const deltaX = Math.abs(e.clientX - dragStart.x);
      const deltaY = Math.abs(e.clientY - dragStart.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only start dragging if threshold is met
      if (distance < DRAG_THRESHOLD && !dragThresholdMet) {
        return;
      }
      
      // Threshold met, initialize position if first drag
      if (!dragThresholdMet) {
        setDragThresholdMet(true);
        setHasActuallyDragged(true);
        setHasMoved(true);
        
        // Initialize drag offset from current element position
        const currentRef = isOpen ? chatRef.current : floatingRef.current;
        if (currentRef && position) {
          setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
          });
        }
        return;
      }
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Get the current ref dimensions
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || 380;
      const height = currentRef?.offsetHeight || 500;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      
      // Calculate distance from initial touch position
      const deltaX = Math.abs(touch.clientX - dragStart.x);
      const deltaY = Math.abs(touch.clientY - dragStart.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only start dragging if threshold is met
      if (distance < DRAG_THRESHOLD && !dragThresholdMet) {
        return;
      }
      
      // Prevent scrolling while dragging
      e.preventDefault();
      
      // Threshold met, initialize position if first drag
      if (!dragThresholdMet) {
        setDragThresholdMet(true);
        setHasActuallyDragged(true);
        setHasMoved(true);
        
        // Initialize drag offset from current element position
        const currentRef = isOpen ? chatRef.current : floatingRef.current;
        if (currentRef && position) {
          setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
          });
        }
        return;
      }
      
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      // Get the current ref dimensions
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || 380;
      const height = currentRef?.offsetHeight || 500;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragThresholdMet(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setDragThresholdMet(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, isOpen]);

  return (
    <>
      {!isOpen ? (
        /* Floating Character when closed */
        <div 
          ref={floatingRef}
          className="eric-floating-character"
          style={{
            cursor: isDragging ? 'grabbing' : 'pointer',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={(e) => {
            if (!hasActuallyDragged) {
              setIsOpen(true);
            }
          }}
        >
          <div className="eric-floating-tooltip">
            Cliquez sur moi
          </div>
          <img 
            src={ericAvatar} 
            alt="Eric - Assistant IA" 
            title="Cliquez pour parler avec Eric"
            className="w-full h-auto pointer-events-none drop-shadow-2xl"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        /* Chat Interface with Eric at top right */
        <>
          {/* Eric Picture at top right of chatbox */}
          <div 
            ref={floatingRef}
            style={position ? {
              position: 'fixed',
              left: `${position.x + 300}px`,
              top: `${position.y + 15}px`,
              zIndex: 1002,
              width: '4.5rem',
              pointerEvents: 'none'
            } : {
              display: 'none'
            }}
          >
            <img 
              src={ericAvatar} 
              alt="Eric - Assistant IA" 
              title="Eric - Votre assistant"
              className="w-full h-auto pointer-events-none drop-shadow-2xl"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div 
            ref={chatRef}
            style={position ? {
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 1001,
              width: '380px',
              maxHeight: 'calc(100vh - 40px)',
              cursor: isDragging ? 'grabbing' : 'default',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              background: 'hsl(var(--card))',
              borderRadius: '1.5rem',
              padding: '1.25rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            } : {
              display: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <Button
              variant="destructive"
              size="icon"
              className="eric-close-btn"
              onClick={() => setIsOpen(false)}
              title="Fermer le chat"
            >
              <X className="w-4 h-4" />
            </Button>

          {/* Messages */}
          <div className="eric-chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`eric-message ${message.sender === "user" ? "eric-message-user" : "eric-message-eric"}`}
              >
                <img 
                  src={message.sender === "eric" ? ericAvatar : (getAvatarUrl(userAvatarUrl) || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>")}
                  alt={message.sender}
                  className="eric-message-avatar"
                  loading="lazy"
                  decoding="async"
                />
                <div className="eric-message-content">
                  {message.content}
                  {message.navigationPath && (
                    <Button
                      className="mt-3 w-full"
                      onClick={() => window.location.href = message.navigationPath!}
                    >
                      Aller à cette page
                    </Button>
                  )}
                </div>
                {message.sender === "eric" && (
                  <div className="eric-message-controls">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`eric-message-speaker-btn ${isSpeaking === index ? "speaking" : ""}`}
                      onClick={() => speakMessage(message.content, index)}
                      title="Écouter ce message"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="eric-typing-indicator">
                Eric écrit<span className="eric-dots">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="eric-input-area">
            <div className="eric-input-group">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre question..."
                maxLength={200}
                className="eric-input resize-none"
                rows={1}
              />
              <Button
                size="icon"
                className="eric-send-btn"
                onClick={sendMessage}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
};
