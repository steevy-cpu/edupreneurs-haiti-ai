import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ericStudentDesk from "@/assets/eric-student-desk.png";

interface Message {
  content: string;
  sender: "user" | "eric";
}

export const HomeChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Bonjour ! Je suis Eric, votre futur professeur. Comment puis-je vous aider à découvrir EDUPRENEURS ? 😊",
      sender: "eric"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const faqSuggestions = [
    "Qu'est-ce qu'EDUPRENEURS ?",
    "Comment puis-je m'inscrire ?",
    "Quels cours sont disponibles ?",
    "Comment fonctionne la plateforme ?"
  ];
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const constrainToViewport = (pos: { x: number; y: number }) => {
    if (!hasMoved) return pos;

    const currentRef = isOpen ? chatRef.current : floatingRef.current;
    const ericRef = floatingRef.current;
    
    if (!currentRef) return pos;

    let width = currentRef.offsetWidth || (isOpen ? 380 : 112);
    let height = currentRef.offsetHeight || (isOpen ? 500 : 112);
    
    if (isOpen && ericRef) {
      const ericHeight = ericRef.offsetHeight || 80;
      const ericWidth = ericRef.offsetWidth || 80;
      height += ericHeight + 10;
      width = Math.max(width, ericWidth);
    }

    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY))
    };
  };

  useEffect(() => {
    if (!hasMoved) return;

    const handleResize = () => {
      setPosition(prev => constrainToViewport(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasMoved, isOpen]);

  useEffect(() => {
    if (isOpen && hasMoved) {
      setPosition(prev => constrainToViewport(prev));
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

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    setInput("");
    setShowSuggestions(false);
    
    setMessages(prev => [...prev, { content: userMessage, sender: "user" }]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('eric-chat', {
        body: {
          message: userMessage,
          chatHistory: messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          }))
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        content: data.response, 
        sender: "eric"
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

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // Don't start dragging on the closed Eric - just let the click work
    if (!isOpen && !hasMoved) {
      return;
    }
    
    setHasActuallyDragged(false);
    
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

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, input, .eric-chat-messages')) {
      return;
    }
    
    // Don't start dragging on the closed Eric - just let the tap work
    if (!isOpen && !hasMoved) {
      return;
    }
    
    setHasActuallyDragged(false);
    
    const touch = e.touches[0];
    
    if (!hasMoved) {
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      if (currentRef) {
        const rect = currentRef.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
        setDragStart({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    } else {
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
    
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setHasActuallyDragged(true);
      setHasMoved(true);
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || 0;
      const height = currentRef?.offsetHeight || 0;
      
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      setHasActuallyDragged(true);
      setHasMoved(true);
      
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      const currentRef = isOpen ? chatRef.current : floatingRef.current;
      const width = currentRef?.offsetWidth || 0;
      const height = currentRef?.offsetHeight || 0;
      
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

    const handleTouchEnd = () => {
      setIsDragging(false);
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
        <div 
          ref={floatingRef}
          style={{
            position: 'fixed',
            left: hasMoved ? `${position.x}px` : 'auto',
            top: hasMoved ? `${position.y}px` : 'auto',
            right: hasMoved ? 'auto' : '2rem',
            bottom: hasMoved ? 'auto' : '2rem',
            zIndex: 1000,
            width: '5rem',
            cursor: isDragging ? 'grabbing' : 'pointer',
            userSelect: 'none',
            transition: isDragging ? 'none' : 'transform 0.3s'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => setIsOpen(true)}
        >
          <div className="eric-floating-tooltip">
            Cliquez sur moi
          </div>
          <img 
            src={ericStudentDesk} 
            alt="Eric - Assistant IA" 
            title="Cliquez pour parler avec Eric"
            className="w-full h-auto pointer-events-none drop-shadow-2xl"
          />
        </div>
      ) : (
        <>
          <div 
            ref={floatingRef}
            style={{
              position: 'fixed',
              left: hasMoved ? `${position.x + 220}px` : 'auto',
              top: hasMoved ? `${position.y - 40}px` : 'auto',
              right: hasMoved ? 'auto' : '2.5rem',
              bottom: hasMoved ? 'auto' : 'calc(100vh - 22rem)',
              zIndex: 1002,
              width: '4rem',
              cursor: isDragging ? 'grabbing' : 'pointer',
              userSelect: 'none',
              transition: isDragging ? 'none' : 'all 0.3s'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img 
              src={ericStudentDesk} 
              alt="Eric - Assistant IA" 
              title="Eric - Votre assistant"
              className="w-full h-auto pointer-events-none drop-shadow-2xl"
            />
          </div>

          <div 
            ref={chatRef}
            style={{
              position: 'fixed',
              left: hasMoved ? `${position.x}px` : 'auto',
              top: hasMoved ? `${position.y}px` : 'auto',
              right: hasMoved ? 'auto' : '2rem',
              bottom: hasMoved ? 'auto' : '2rem',
              zIndex: 1001,
              width: '320px',
              maxHeight: '420px',
              cursor: isDragging ? 'grabbing' : 'default',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              background: 'transparent',
              borderRadius: '1.5rem',
              padding: '1rem'
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

          <div className="eric-chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`eric-message ${message.sender === "user" ? "eric-message-user" : "eric-message-eric"}`}
              >
                <img 
                  src={message.sender === "eric" ? ericStudentDesk : "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"}
                  alt={message.sender}
                  className="eric-message-avatar"
                />
                <div className="eric-message-content">
                  {message.content}
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
            
            {showSuggestions && messages.length === 1 && (
              <div className="flex flex-col gap-2 mt-4 px-2">
                {faqSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left justify-start bg-card/80 hover:bg-card transition-colors border border-border/50"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="eric-chat-input-container flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyPress}
              placeholder="Posez une question..."
              className="eric-chat-input resize-none flex-1"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <Button 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="eric-send-btn flex-shrink-0"
              size="icon"
              title="Envoyer le message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          </div>
        </>
      )}
    </>
  );
};