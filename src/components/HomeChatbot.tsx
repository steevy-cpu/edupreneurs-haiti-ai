import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ericStudentDesk from "@/assets/eric-student-desk.png";

interface Message {
  content: string;
  sender: "user" | "eric";
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

export const HomeChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Bonjour ! Je suis Jude, votre futur professeur. Comment puis-je vous aider à découvrir EDUPRENEURS ? 😊",
      sender: "eric"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const chatRef = useRef<HTMLDivElement>(null);

  const faqSuggestions = [
    "Qu'est-ce qu'EDUPRENEURS ?",
    "Comment puis-je m'inscrire ?",
    "Quels cours sont disponibles ?",
    "Comment fonctionne la plateforme ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    setInput("");
    
    setMessages(prev => [...prev, { content: userMessage, sender: "user" }]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('home-eric-chat', {
        body: {
          message: userMessage,
          chatHistory: messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          }))
        }
      });

      if (error) throw error;

      setMessages(prev => {
        const newMessages = [...prev, { 
          content: data.response, 
          sender: "eric" as const
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
    <>
      {!isOpen ? (
        <div 
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '1.5rem',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          className="w-12 sm:w-14 md:w-16 lg:w-20"
          onClick={() => setIsOpen(true)}
        >
          <div className="eric-floating-tooltip text-[10px] sm:text-xs">
            Cliquez sur moi
          </div>
          <img 
            src={ericStudentDesk} 
            alt="Jude - Assistant IA" 
            title="Cliquez pour parler avec Jude"
            className="w-full h-auto pointer-events-none drop-shadow-2xl"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <>
          {/* Eric avatar above the chat when open - fixed position */}
          <div 
            style={{
              position: 'fixed',
              right: '2rem',
              bottom: 'calc(60vh + 2rem)',
              zIndex: 1002,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            className="w-10 sm:w-12 md:w-14 lg:w-16"
          >
            <img 
              src={ericStudentDesk} 
              alt="Jude - Assistant IA" 
              title="Jude - Votre assistant"
              className="w-full h-auto pointer-events-none drop-shadow-2xl"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div 
            ref={chatRef}
            style={{
              position: 'fixed',
              right: '0.5rem',
              bottom: '1rem',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              background: 'transparent',
              borderRadius: '1.5rem',
            }}
            className="w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] max-h-[60vh] sm:max-h-[65vh] md:max-h-[420px] p-3 sm:p-4"
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
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="eric-message-content">
                    {message.sender === "eric" && index === typingMessageIndex ? (
                      <TypewriterText 
                        text={message.content} 
                        speed={15} 
                        onComplete={() => setTypingMessageIndex(null)} 
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="eric-typing-indicator">
                  Jude écrit<span className="eric-dots">...</span>
                </div>
              )}
              
              {showSuggestions && messages[messages.length - 1]?.sender === "eric" && (
                <div className="flex flex-col gap-2 mt-4 px-2">
                  {faqSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      className="w-full text-left justify-start shadow-sm transition-all"
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
