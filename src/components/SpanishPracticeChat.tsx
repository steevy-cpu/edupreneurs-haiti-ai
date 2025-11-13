import { useState, useRef, useEffect } from "react";
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
import ericChairDesk from "@/assets/eric-chair-desk.png";

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
          toast.error("Demasiadas solicitudes. Eric necesita un descanso. Intenta de nuevo en un momento.");
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

  const quickReplies = [
    "¡Hola!",
    "¿Cómo estás?",
    "Me llamo...",
    "Mucho gusto",
  ];

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      {isLoadingHistory ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Cargando conversación anterior...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <img
                src={ericChairDesk}
                alt="Eric"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  🗣️ Practica tu Español con Eric
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasPreviousConversation ? "Continuando conversación anterior" : "Modo de Práctica - No Calificado"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1.5 sm:gap-2">
              {hasPreviousConversation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewConversation}
                  title="Iniciar una conversación nueva"
                  disabled={isLoading}
                  className="text-xs sm:text-sm px-2 sm:px-3"
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
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">🗑️ Borrar Historial</span>
                  <span className="sm:hidden">🗑️</span>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3 min-h-[300px] max-h-[400px] sm:max-h-[500px] overflow-y-auto p-3 sm:p-4 bg-muted/30 rounded-lg scroll-smooth">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-lg break-words ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card text-card-foreground border"
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-card text-card-foreground border p-2.5 sm:p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Eric está escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {messages.length === 1 && !hasPreviousConversation && (
            <div className="flex flex-wrap gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground w-full">💡 Prueba estos:</p>
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(reply);
                  }}
                  disabled={isLoading}
                  className="text-xs sm:text-sm"
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
              placeholder="Escribe tu mensaje en español..."
              className="min-h-[60px] sm:min-h-[80px] resize-none text-sm sm:text-base flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !sessionId}
              size="icon"
              className="h-[60px] w-[60px] sm:h-[80px] sm:w-[80px] shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar Historial de Conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto borrará permanentemente todas tus conversaciones de práctica para esta lección. 
              No podrás revisar tus mensajes anteriores con Eric. Esta acción no se puede deshacer.
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