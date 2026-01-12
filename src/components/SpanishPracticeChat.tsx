import { useState, useRef, useEffect, useCallback, type FocusEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import judeChairDesk from "@/assets/eric-chair-desk.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SpanishPracticeChatProps {
  lessonTitle: string;
  lessonObjective: string;
  lessonSlug: string;
  gradeLevel: string;
  userNickname: string;
}

export const SpanishPracticeChat = ({
  lessonTitle,
  lessonObjective,
  lessonSlug,
  gradeLevel,
  userNickname,
}: SpanishPracticeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [displayName, setDisplayName] = useState(userNickname);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasPreviousConversation, setHasPreviousConversation] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  useEffect(() => {
    const shouldSmooth = isLoadingHistory || isLoading;
    scrollToBottom(shouldSmooth);
  }, [messages, isLoadingHistory, isLoading]);

  const loadPreviousConversation = async (userId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data: sessions, error: sessionError } = await supabase
        .from('spanish_practice_conversations')
        .select('session_id, created_at')
        .eq('user_id', userId)
        .eq('lesson_slug', lessonSlug)
        .eq('grade_level', gradeLevel)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      if (sessions && sessions.length > 0) {
        const lastSessionId = sessions[0].session_id;
        
        const { data: history, error: historyError } = await supabase
          .from('spanish_practice_conversations')
          .select('message_role, message_content, created_at')
          .eq('session_id', lastSessionId)
          .order('created_at', { ascending: true });

        if (historyError) throw historyError;

        if (history && history.length > 0) {
          const loadedMessages = history.map(msg => ({
            role: msg.message_role as 'user' | 'assistant',
            content: msg.message_content
          }));
          
          setMessages(loadedMessages);
          setSessionId(lastSessionId);
          setHasPreviousConversation(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return false;
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessageToDatabase = async (
    role: 'user' | 'assistant',
    content: string,
    currentSessionId: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('spanish_practice_conversations')
        .insert({
          user_id: user.id,
          lesson_slug: lessonSlug,
          grade_level: gradeLevel,
          session_id: currentSessionId,
          message_role: role,
          message_content: content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const startNewConversation = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setMessages([]);
    setHasPreviousConversation(false);
    setIsInitialized(false);
  };

  const confirmDeleteHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('spanish_practice_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_slug', lessonSlug)
        .eq('grade_level', gradeLevel);

      if (error) throw error;

      toast.success("¡Historial de conversación borrado!");
      startNewConversation();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error("Error al borrar el historial");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.nickname) {
          setDisplayName(profile.nickname);
        }

        const hasHistory = await loadPreviousConversation(user.id);
        
        if (!hasHistory) {
          const newSessionId = crypto.randomUUID();
          setSessionId(newSessionId);
          await initializeChat(newSessionId);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, lessonSlug, gradeLevel]);

  const initializeChat = async (currentSessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("spanish-practice-tutor", {
        body: {
          message: "",
          lessonContext: {
            title: lessonTitle,
            objective: lessonObjective,
            slug: lessonSlug,
            gradeLevel: gradeLevel,
          },
          chatHistory: [],
          userNickname: displayName,
          isInitialGreeting: true,
        },
      });

      if (error) throw error;

      if (data?.response) {
        setMessages([{ role: "assistant", content: data.response }]);
        await saveMessageToDatabase('assistant', data.response, currentSessionId);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Error al inicializar el chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    await saveMessageToDatabase('user', userMessage, sessionId);
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("spanish-practice-tutor", {
        body: {
          message: userMessage,
          lessonContext: {
            title: lessonTitle,
            objective: lessonObjective,
            slug: lessonSlug,
            gradeLevel: gradeLevel,
          },
          chatHistory: messages,
          userNickname: displayName,
          isInitialGreeting: false,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Demasiadas solicitudes. Jude necesita un descanso. Intenta de nuevo en un momento.");
        } else if (error.message?.includes("402")) {
          toast.error("Límite de créditos alcanzado. Contacta a tu administrador.");
        } else {
          throw error;
        }
        return;
      }

      if (data?.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        await saveMessageToDatabase('assistant', data.response, sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar el mensaje");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, tuve problemas para entender eso. ¿Podrías intentarlo de nuevo?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputFocus = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  const quickReplies = [
    "¡Hola!",
    "¿Cómo estás?",
    "Me llamo...",
    "Mucho gusto",
  ];

  return (
    <Card className="flex flex-col h-[480px] sm:h-[560px] md:h-[640px] overflow-hidden">
      {isLoadingHistory ? (
        <div className="flex items-center justify-center p-8 flex-1">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Cargando conversación anterior...</span>
        </div>
      ) : (
        <>
          {/* Sticky Header */}
          <div className="flex-shrink-0 sticky top-0 z-10 bg-card px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={judeChairDesk}
                  alt="Jude"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate">
                    🗣️ Practica tu Español con Jude
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hasPreviousConversation ? "Continuando conversación anterior" : "Modo de Práctica - No Calificado"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1.5 sm:gap-2 self-end sm:self-auto">
                {hasPreviousConversation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startNewConversation}
                    title="Iniciar una conversación nueva"
                    disabled={isLoading}
                    className="text-xs sm:text-sm px-2 py-1 sm:px-3 h-8 sm:h-9"
                  >
                    <span className="hidden sm:inline">🔄 Nuevo Chat</span>
                    <span className="sm:hidden">🔄</span>
                  </Button>
                )}
                
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    title="Borrar todo el historial de conversación"
                    disabled={isLoading}
                    className="text-xs sm:text-sm px-2 py-1 sm:px-3 h-8 sm:h-9"
                  >
                    <span className="hidden sm:inline">🗑️ Borrar Historial</span>
                    <span className="sm:hidden">🗑️</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-muted/30"
          >
            <div className="space-y-2 sm:space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] p-2 sm:p-2.5 md:p-3 rounded-lg break-words ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card text-card-foreground border"
                    }`}
                  >
                    <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-card text-card-foreground border p-2 sm:p-2.5 md:p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Jude está escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>

          {/* Fixed Footer - Quick Replies + Input */}
          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 pt-3 sm:pt-4 border-t bg-card">
            {messages.length === 1 && !hasPreviousConversation && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                <p className="text-xs sm:text-sm text-muted-foreground w-full mb-1">💡 Prueba estos:</p>
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(reply);
                    }}
                    disabled={isLoading}
                    className="text-xs sm:text-sm px-2 py-1 h-7 sm:h-8"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleInputFocus}
                placeholder="Escribe tu mensaje en español..."
                className="min-h-[50px] sm:min-h-[60px] md:min-h-[80px] resize-none text-xs sm:text-sm md:text-base flex-1 mobile-input tap-highlight-none"
                autoCapitalize="sentences"
                autoCorrect="on"
                spellCheck={false}
                enterKeyHint="send"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || !sessionId}
                size="icon"
                className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] md:h-[80px] md:w-[80px] shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar Historial de Conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto borrará permanentemente todas tus conversaciones de práctica para esta lección. 
              No podrás revisar tus mensajes anteriores con Jude. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Borrar Historial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};