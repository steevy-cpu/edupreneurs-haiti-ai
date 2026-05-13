import { useState, useRef, useEffect, useCallback, type FocusEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
const judeAvatar = '/images/dashboard00-200w.webp';
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatarMap";
import { useEricDraggable } from "@/hooks/useEricDraggable";
import { useVisitor } from "@/contexts/VisitorContext";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { ChatMessageRenderer } from "@/components/ChatMessageRenderer";
// Get human-readable page name from path
const getPageName = (path: string): string => {
  const pageNames: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/leaderboard': 'Classement',
    '/matieres': 'Matières',
    '/community': 'Communauté',
    '/feed': 'Fil d\'actualité',
    '/chess-game': 'Échecs',
    '/passion-discovery': 'Passions',
    '/profile': 'Profil',
    '/settings': 'Paramètres',
    '/notifications': 'Notifications',
    '/baccalaureat': 'Baccalauréat',
    '/exams': 'Examens',
  };
  return pageNames[path] || 'Aller à cette page';
};

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
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
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
        onCompleteRef.current?.();
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return (
    <span>
      {displayedText}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
    </span>
  );
};

export const JudeChatbot = () => {
  const [isStable, setIsStable] = useState(false);
  const { isVisitor } = useVisitor();
  const { user } = useSessionAuth(); // CRITICAL: Use cached auth instead of getUser()
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
  const { isSlowConnection, shouldShowAnimations, shouldShowBlur } = useNetworkAwareLoading();
  // Fix 2: Mobile tooltip that shows once on first visit
  const [showMobileTooltip, setShowMobileTooltip] = useState(
    () => !localStorage.getItem('jude-tooltip-shown')
  );

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

  // ===== KEYBOARD TRACKING FOR MOBILE =====
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  // Track keyboard visibility using visualViewport API
  useEffect(() => {
    const handleViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      
      // Calculate keyboard height (iOS includes offsetTop)
      const kbHeight = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      setKeyboardHeight(kbHeight);
      setIsKeyboardOpen(kbHeight > 80);
      setVisualViewportHeight(vv.height);
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      handleViewportChange();
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  // Reset drag position when keyboard opens to avoid positioning conflicts
  useEffect(() => {
    if (isKeyboardOpen && hasMoved) {
      resetPosition();
    }
  }, [isKeyboardOpen, hasMoved, resetPosition]);

  // Fetch user profile on mount - uses cached auth from useSessionAuth (no redundant getUser call)
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Skip fetch if visitor, hidden route, or no user
      if (isVisitor || HIDDEN_ROUTES.includes(location.pathname) || !user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
        
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
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessages([{
          content: "Salut ! Je suis Jude, votre assistant. Comment puis-je vous aider ? 😊",
          sender: "jude"
        }]);
      }
    };

    fetchUserProfile();
  }, [isVisitor, location.pathname, user]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Improved mobile scroll behavior - MUST be before early return
  const handleInputFocus = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', // Changed from 'center' for better mobile reliability
      });
      // Also scroll messages to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 350); // Increased delay for keyboard animation
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // isStable guard: prevents null dispatcher crash on lazy-load mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsStable(true));
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Fix 2: Auto-hide mobile tooltip after 5 seconds, persist in localStorage
  useEffect(() => {
    if (!showMobileTooltip) return;
    const timer = setTimeout(() => {
      setShowMobileTooltip(false);
      localStorage.setItem('jude-tooltip-shown', 'true');
    }, 5000);
    return () => clearTimeout(timer);
  }, [showMobileTooltip]);

  // Hide JudeChatbot in visitor mode or on specific routes - AFTER all hooks
  if (!isStable || isVisitor || HIDDEN_ROUTES.includes(location.pathname)) {
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
      const navigationPath = data.navigate;

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

  // Calculate container positioning based on keyboard state
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1001, // Above MobileBottomNav (1000) during transition
      transition: 'all 0.2s ease-out', // Smooth transition for keyboard
    };

    if (isOpen) {
      if (isKeyboardOpen) {
        // Keyboard open: position from bottom, above keyboard
        return {
          ...baseStyles,
          bottom: `${keyboardHeight + 16}px`, // Better visual buffer
          right: '0.75rem',
          left: 'auto',
          top: 'auto',
        };
      } else {
        // Keyboard closed: use original top positioning
        return {
          ...baseStyles,
          top: '4.5rem',
          right: '0.75rem',
        };
      }
    } else {
      // Closed state: use drag positioning
      return {
        ...baseStyles,
        ...getPositionStyles(false, {
          closedTop: '5rem',
          closedRight: '0.75rem',
          openTop: '5rem',
          openRight: '0.75rem',
        }),
      };
    }
  };

  // Calculate messages area max height based on keyboard state
  const getMessagesMaxHeight = (): string => {
    if (isKeyboardOpen) {
      // Dynamic height when keyboard open, minimum 100px
      return `${Math.max(100, visualViewportHeight - 180)}px`;
    }
    // Default responsive heights when keyboard closed
    return undefined as any; // Let CSS classes handle it
  };

  return (
    <>
      {/* Backdrop overlay when chat is open */}
      {isOpen && (
        <div 
          className={cn(
            "fixed inset-0 bg-black/40 transition-opacity duration-200",
            shouldShowBlur ? "backdrop-blur-sm" : ""
          )}
          style={{ zIndex: 1000 }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <div 
        ref={setRootRef}
        style={getContainerStyles()}
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
          <>
            {/* Desktop tooltip — always visible */}
            <div className={`eric-floating-tooltip text-[10px] sm:text-xs hidden lg:block ${shouldShowAnimations ? '' : '[animation:none]'}`}>
              Cliquez sur moi
            </div>
            {/* Fix 2: Mobile tooltip — shows once on first visit, fades after 5s */}
            {showMobileTooltip && (
              <div className="eric-floating-tooltip text-[10px] sm:text-xs lg:hidden animate-fade-in">
                Parle avec Jude! 💬
              </div>
            )}
          </>
        )}
        
        <div className="w-14 sm:w-16 md:w-20 lg:w-28">
          <img
            src={judeAvatar}
            srcSet="/images/dashboard00-200w.webp 200w, /images/dashboard00-400w.webp 400w"
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 112px"
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
          {/* Fix 1: First-time friendly suggested prompts — disappear after first message */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 mr-14 sm:mr-20 md:mr-24 lg:mr-28">
              {[
                "Comment je gagne du Gold ? 🥇",
                "Explique-moi comment utiliser la plateforme 📚",
                "Aide-moi à choisir une matière 🎯",
              ].map((faq) => (
                <button
                  key={faq}
                  onClick={() => {
                    // Directly add user message + trigger AI call (avoids stale state from setTimeout)
                    setMessages(prev => [...prev, { content: faq, sender: "user" }]);
                    setInput("");
                    setIsTyping(true);
                    supabase.functions.invoke('jude-ai-tutor', {
                      body: {
                        message: faq,
                        chatHistory: messages.map(m => ({
                          role: m.sender === "user" ? "user" : "assistant",
                          content: m.content
                        })),
                        userNickname,
                        currentPage: location.pathname,
                        enableVoice: false
                      }
                    }).then(({ data, error }) => {
                      if (error) throw error;
                      const responseText = data?.response || data?.text || "Désolé, je n'ai pas pu traiter votre message.";
                      setMessages(prev => {
                        const newMessages = [...prev, { content: responseText, sender: "jude" as const, navigationPath: data?.navigate }];
                        setTypingMessageIndex(newMessages.length - 1);
                        return newMessages;
                      });
                    }).catch(() => {
                      setMessages(prev => [...prev, { content: "Désolé, une erreur s'est produite.", sender: "jude" as const }]);
                    }).finally(() => setIsTyping(false));
                  }}
                  className="text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 bg-accent/90 backdrop-blur-sm border border-primary/30 hover:bg-accent rounded-full text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200 max-w-[45%] sm:max-w-none leading-tight"
                >
                  {faq}
                </button>
              ))}
            </div>
          )}
          
          {/* Messages - with keyboard-aware height */}
          <div 
            className={`flex-1 overflow-y-auto space-y-3 ${!isKeyboardOpen ? 'max-h-[40vh] sm:max-h-[45vh] md:max-h-[50vh]' : ''}`}
            style={isKeyboardOpen ? { maxHeight: getMessagesMaxHeight() } : undefined}
          >
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
                    : `${shouldShowBlur ? 'bg-background/95 backdrop-blur-sm' : 'bg-background'} rounded-bl-sm border border-border/20`
                }`}>
                  {message.sender === "jude" && index === typingMessageIndex ? (
                    <TypewriterText 
                      text={message.content} 
                      speed={isSlowConnection ? 5 : 15} 
                      onComplete={() => setTypingMessageIndex(null)}
                    />
                  ) : (
                    <ChatMessageRenderer content={message.content} />
                  )}
                  {message.navigationPath && (
                    <Button
                      className="mt-2 w-full text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(message.navigationPath!)}
                    >
                      <ArrowRight className="w-3 h-3 mr-1.5" />
                      {getPageName(message.navigationPath)}
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

          {/* Input Area - with safe area padding */}
          <div 
            className="pt-2 sm:pt-3"
            style={{
              paddingBottom: isKeyboardOpen 
                ? '0.5rem' 
                : 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className={`flex items-center gap-2 ${shouldShowBlur ? 'bg-background/95 backdrop-blur-sm' : 'bg-background'} rounded-full shadow-md p-1.5 pl-4`}>
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
              lang="fr"
              spellCheck={true}
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
    </>
  );
};
