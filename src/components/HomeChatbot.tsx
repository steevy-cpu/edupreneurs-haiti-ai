import { useState, useRef, useEffect, useCallback, type FocusEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { ChatMessageRenderer } from "@/components/ChatMessageRenderer";
import { cn } from "@/lib/utils";
import { getTimeBasedGreeting } from "@/utils/getTimeBasedGreeting";
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

// Generate initial message with time-aware greeting
const getInitialMessage = (): Message => {
  const { greeting } = getTimeBasedGreeting();
  return {
    content: `${greeting} ! Je suis Jude, votre assistant IA sur EDUPRENEURS. Comment puis-je vous aider à découvrir notre plateforme ? 😊`,
    sender: "eric"
  };
};

export const HomeChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [getInitialMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const chatRef = useRef<HTMLDivElement>(null);
  const { isSlowConnection, shouldShowAnimations } = useNetworkAwareLoading();
  const shouldShowBlur = !isSlowConnection;

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
          })),
          localHour: new Date().getHours()
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

  const handleInputFocus = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  return (
    <>
      {/* Backdrop overlay when chat is open */}
      {isOpen && (
        <div 
          className={cn(
            "fixed inset-0 bg-black/40 transition-opacity duration-200",
            shouldShowBlur ? "backdrop-blur-sm" : ""
          )}
          style={{ zIndex: 999 }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <div 
        ref={chatRef}
        style={{
          position: 'fixed',
          right: '0.5rem',
          bottom: '1rem',
          zIndex: 1000,
        }}
        className="flex flex-row items-end gap-1 sm:gap-2"
      >
      {/* Chat content - only visible when open */}
      {isOpen && (
        <div className="flex flex-col w-[280px] xs:w-[300px] sm:w-[320px] md:w-[340px] max-h-[60vh] sm:max-h-[65vh]">
          <Button
            variant="destructive"
            size="icon"
            className="eric-close-btn self-end mb-1"
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
                  width={32}
                  height={32}
                  className="eric-message-avatar"
                  loading="lazy"
                  decoding="async"
                />
                <div className="eric-message-content">
{message.sender === "eric" && index === typingMessageIndex ? (
                    <TypewriterText 
                      text={message.content} 
                      speed={isSlowConnection ? 5 : 15} 
                      onComplete={() => setTypingMessageIndex(null)}
                    />
                  ) : (
                    <ChatMessageRenderer content={message.content} />
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="eric-typing-indicator flex items-center gap-1">
                <span>Jude écrit</span>
                <span className="flex gap-0.5">
                  <span className="animate-typing-wave" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-typing-wave" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-typing-wave" style={{ animationDelay: '300ms' }}>.</span>
                </span>
              </div>
            )}
            
            {showSuggestions && messages[messages.length - 1]?.sender === "eric" && (
              <div className="flex flex-col gap-1.5 mt-3 px-1">
                {faqSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    className="w-full text-left justify-start shadow-sm transition-all text-xs py-2 h-auto"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="eric-chat-input-container flex items-end gap-1.5 mt-2">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyPress}
              onFocus={handleInputFocus}
              placeholder="Posez une question..."
              className="eric-chat-input resize-none flex-1 text-sm mobile-input tap-highlight-none"
              autoCapitalize="sentences"
              autoCorrect="on"
              lang="fr"
              spellCheck={true}
              enterKeyHint="send"
              rows={1}
              style={{ minHeight: '36px', maxHeight: '100px' }}
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
      )}

      {/* Jude character - always visible, clickable when chat is closed */}
      <div 
        className={`w-16 sm:w-20 md:w-24 lg:w-28 flex-shrink-0 ${!isOpen ? 'cursor-pointer' : ''}`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
{!isOpen && (
          <div className={`eric-floating-tooltip text-[10px] sm:text-xs whitespace-nowrap ${shouldShowAnimations ? '' : '[animation:none]'}`}>
            Cliquez sur moi
          </div>
        )}
        <img 
          src={ericStudentDesk} 
          alt="Jude - Assistant IA" 
          title={isOpen ? "Jude - Votre assistant" : "Cliquez pour parler avec Jude"}
          width={112}
          height={168}
          className="w-full h-auto pointer-events-none drop-shadow-2xl"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
    </>
  );
};
