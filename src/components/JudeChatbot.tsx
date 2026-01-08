import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Volume2, VolumeX, Box, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import judeAvatar from "@/assets/dashboard00.png";
import { getAvatarUrl } from "@/lib/avatarMap";
import { useEricDraggable } from "@/hooks/useEricDraggable";
import { use3DJude } from "@/hooks/use3DJude";
import { useVisitor } from "@/contexts/VisitorContext";

// Lazy load 3D canvas for performance
const Jude3DCanvas = lazy(() => 
  import('@/components/jude3d/Jude3DCanvas').then(m => ({ default: m.Jude3DCanvas }))
);

interface Message {
  content: string;
  sender: "user" | "jude";
  navigationPath?: string;
}

export const JudeChatbot = () => {
  const { isVisitor } = useVisitor();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [userNickname, setUserNickname] = useState<string>("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use the 3D Jude hook
  const {
    isLoading,
    isSpeaking,
    currentAnimation,
    currentEmotion,
    messages,
    setMessages,
    phonemes,
    audioRef,
    isAudioPlaying,
    enable3D,
    enableVoice,
    sendMessage: send3DMessage,
    toggleVoice,
    toggle3D,
    stopAudio
  } = use3DJude({ userNickname, enableVoice: true, enable3D: true });

  // Hide JudeChatbot in visitor mode
  if (isVisitor) {
    return null;
  }
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

  // Use a single DOM node for both open/closed measurements
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
  }, [setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    await send3DMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} className="hidden" />
      
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
        {/* Jude's avatar - 3D or 2D */}
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
          
          {enable3D && isOpen ? (
            // 3D Canvas when open and 3D enabled
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px]">
              <Suspense fallback={
                <img 
                  src={judeAvatar} 
                  alt="Jude - Assistant IA" 
                  className="w-full h-auto pointer-events-none drop-shadow-2xl"
                />
              }>
                <Jude3DCanvas
                  modelUrl="/models/jude.glb"
                  usePlaceholder={false}
                  currentAnimation={currentAnimation}
                  currentEmotion={currentEmotion}
                  phonemes={phonemes}
                  audioElement={audioRef.current}
                  isPlaying={isAudioPlaying}
                  className="w-full h-full rounded-xl overflow-hidden"
                />
              </Suspense>
            </div>
          ) : (
            // 2D image fallback
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
          )}
        </div>

        {/* Chat Interface */}
        {isOpen && (
          <div className="relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] flex flex-col mt-2">
            {/* Toggle buttons for voice and 3D */}
            <div className="flex gap-2 mb-2 justify-end">
              <Button
                size="sm"
                variant={enableVoice ? "default" : "outline"}
                className="h-7 w-7 p-0"
                onClick={toggleVoice}
                title={enableVoice ? "Désactiver la voix" : "Activer la voix"}
              >
                {enableVoice ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="sm"
                variant={enable3D ? "default" : "outline"}
                className="h-7 w-7 p-0"
                onClick={toggle3D}
                title={enable3D ? "Mode 2D" : "Mode 3D"}
              >
                {enable3D ? <Box className="h-3.5 w-3.5" /> : <Image className="h-3.5 w-3.5" />}
              </Button>
            </div>

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
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Jude réfléchit</span>
                  <span className="animate-pulse">...</span>
                </div>
              )}
              {isSpeaking && !isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Jude parle</span>
                  <Volume2 className="h-3 w-3 animate-pulse" />
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
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre question..."
                  maxLength={200}
                  className="flex-1 min-h-[32px] max-h-[50px] text-xs sm:text-sm resize-none border-0 bg-transparent focus-visible:ring-0 px-0 py-1.5"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="rounded-full w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
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
