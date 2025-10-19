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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // If first drag, initialize position from current element location
    if (!hasMoved) {
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      if (currentRef) {
        const rect = currentRef.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    } else {
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
    
    setIsDragging(true);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setHasMoved(true);
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Get the current ref dimensions
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || 0;
      const height = currentRef?.offsetHeight || 0;
      
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
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, isOpen]);

  return (
    <>
      {!isOpen ? (
        /* Floating Character */
        <div 
          ref={floatingRef}
          className={hasMoved ? "" : "eric-floating-character"}
          style={hasMoved ? {
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1000,
            width: '7rem',
            cursor: isDragging ? 'grabbing' : 'pointer',
            userSelect: 'none',
            transition: isDragging ? 'none' : 'transform 0.3s'
          } : {
            cursor: isDragging ? 'grabbing' : 'pointer',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (!isDragging) {
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
          />
        </div>
      ) : (
        /* Chat Interface */
        <div 
          ref={chatRef}
          className={hasMoved ? "" : "eric-chat-interface"}
          style={hasMoved ? {
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1001,
            width: '380px',
            maxHeight: 'calc(100vh - 280px)',
            cursor: isDragging ? 'grabbing' : 'default',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            background: 'transparent',
            borderRadius: '1.5rem',
            padding: '1.25rem'
          } : {
            cursor: isDragging ? 'grabbing' : 'default',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
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
      )}
    </>
  );
};
