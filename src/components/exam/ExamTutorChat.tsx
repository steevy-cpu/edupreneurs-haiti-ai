import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Youtube, MessageCircle, Trash2, ChevronLeft, ChevronRight, Lightbulb, Eye, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import judeProfile from "@/assets/jude-profile.jpeg";
import { MathText } from '@/components/MathContent';
import { motion, AnimatePresence } from "framer-motion";
interface Message {
  id: string;
  message_role: string;
  message_content: string;
  created_at: string;
}

interface ReferenceText {
  section?: string;
  title?: string;
  text: string;
}

interface ExamTutorChatProps {
  sessionId: string;
  exerciseId: string;
  exercise: {
    exercise_number: number;
    question_text: string;
    options: any;
    correct_answer: string | null;
    concept: string;
    points: number;
  };
  examInfo: {
    subject: string;
    year: number;
    title: string;
  };
  referenceTexts?: ReferenceText[];
  totalExercises: number;
  currentExerciseIndex: number;
  onAnswerValidated?: (isCorrect: boolean, points: number) => void;
  onPreviousExercise?: () => void;
  onNextExercise?: () => void;
}

export const ExamTutorChat = ({
  sessionId,
  exerciseId,
  exercise,
  examInfo,
  referenceTexts = [],
  totalExercises,
  currentExerciseIndex,
  onAnswerValidated,
  onPreviousExercise,
  onNextExercise,
}: ExamTutorChatProps) => {
  const options = Array.isArray(exercise.options) ? exercise.options : [];
  const letters = ['A', 'B', 'C', 'D'];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [youtubeQuery, setYoutubeQuery] = useState("");
  const [showQuestion, setShowQuestion] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Helper function to format options for display in chat
  const formatOptionsForChat = (opts: any): string => {
    if (!opts) return '';
    
    const optLetters = ['A', 'B', 'C', 'D'];
    
    if (Array.isArray(opts)) {
      return opts.map((opt, idx) => `${optLetters[idx]}) ${opt}`).join('\n');
    } else if (typeof opts === 'object') {
      // Handle object format {a: "...", b: "...", c: "...", d: "..."}
      return Object.entries(opts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key.toUpperCase()}) ${value}`)
        .join('\n');
    }
    
    return '';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversation();
    setSelectedAnswer(null); // Reset answer selection when exercise changes
    setToolsExpanded(false); // Keep the conversation area large by default
  }, [exerciseId]);

  const loadConversation = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('exam_practice_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('exercise_id', exerciseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        await sendInitialGreeting();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendInitialGreeting = async () => {
    let greeting = '';
    const formattedOptions = formatOptionsForChat(exercise.options);
    const optionsSection = formattedOptions ? `\n\n${formattedOptions}` : '';
    
    if (exercise.exercise_number === 1 && !hasGreeted) {
      // Full introduction only for first question on first load
      greeting = `Salut! 👋 Je suis Jude, ton tuteur pour l'examen de ${examInfo.subject} ${examInfo.year}.

📝 **Question ${exercise.exercise_number}:**

${exercise.question_text}${optionsSection}

Prends ton temps pour réfléchir. Tu peux me demander des indices ou cliquer sur "Révéler la réponse" si tu es bloqué! 💡`;
      setHasGreeted(true);
    } else {
      // Simple transition for all other cases (jumping or progressing)
      greeting = `Passons à la question ${exercise.exercise_number} de l'examen officiel de ${examInfo.subject} (${examInfo.year}) pour la 9ème AF:

📝 **Question ${exercise.exercise_number}:**

${exercise.question_text}${optionsSection}

Prends ton temps pour réfléchir! 💡`;
      setHasGreeted(true);
    }
    
    await saveMessage('assistant', greeting);
    setShowQuestion(true);
    setSelectedAnswer(null);
  };

  const saveMessage = async (role: string, content: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('exam_practice_conversations')
        .insert({
          user_id: user.user.id,
          session_id: sessionId,
          exercise_id: exerciseId,
          message_role: role,
          message_content: content,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleAnswerSelection = async (answer: string) => {
    setSelectedAnswer(answer);
    const messageText = `Ma réponse: ${answer}`;
    
    setIsLoading(true);

    await saveMessage('user', messageText);

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          exercise,
          userMessage: messageText,
          conversationHistory: messages,
          studentAnswer: answer,
          referenceTexts,
        }
      });

      if (error) throw error;

      await saveMessage('assistant', data.response);

      if (data.youtubeQuery) {
        setYoutubeQuery(data.youtubeQuery);
      }

      if (data.shouldAwardPoints && onAnswerValidated) {
        onAnswerValidated(data.isCorrect, data.pointsEarned);
      }

      if (data.isCorrect) {
        toast({
          title: "Bravo! 🎉",
          description: `Tu as gagné ${data.pointsEarned} points!`,
        });
        
        // Auto-move to next question after short delay
        setTimeout(() => {
          if (onNextExercise) {
            onNextExercise();
          }
        }, 2000);
      } else {
        // Also move to next after showing wrong answer explanation
        setTimeout(() => {
          if (onNextExercise) {
            onNextExercise();
          }
        }, 4000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter Jude. Réessaie!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealAnswer = async () => {
    const messageText = "Révèle-moi la réponse avec une explication";
    
    setIsLoading(true);

    await saveMessage('user', messageText);

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          exercise,
          userMessage: messageText,
          conversationHistory: messages,
          revealAnswer: true,
          referenceTexts,
        }
      });

      if (error) throw error;

      await saveMessage('assistant', data.response);

      if (data.youtubeQuery) {
        setYoutubeQuery(data.youtubeQuery);
      }
    } catch (error) {
      console.error('Error revealing answer:', error);
      toast({
        title: "Erreur",
        description: "Impossible de révéler la réponse. Réessaie!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = inputMessage;
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    setInputMessage("");

    await saveMessage('user', messageText);

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          exercise,
          userMessage: messageText,
          conversationHistory: messages,
          referenceTexts,
        }
      });

      if (error) throw error;

      await saveMessage('assistant', data.response);

      if (data.youtubeQuery) {
        setYoutubeQuery(data.youtubeQuery);
      }

      if (data.shouldAwardPoints && onAnswerValidated) {
        onAnswerValidated(data.isCorrect, data.pointsEarned);
      }

      if (data.isCorrect) {
        toast({
          title: "Bravo! 🎉",
          description: `Tu as gagné ${data.pointsEarned} points!`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter Jude. Réessaie!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
  };

  const handleClearHistory = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('exam_practice_conversations')
        .delete()
        .eq('session_id', sessionId)
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.user.id);

      if (error) throw error;

      setMessages([]);
      setShowDeleteDialog(false);
      await sendInitialGreeting();

      toast({
        title: "Historique effacé",
        description: "La conversation a été réinitialisée",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effacer l'historique",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    await sendInitialGreeting();
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-primary/20">
      {/* Header with gradient */}
      <div className="flex items-center gap-3 p-3 border-b bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 flex-shrink-0">
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={judeProfile} alt="Jude" />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">J</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">Jude - Ton Tuteur IA</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Q{exercise.exercise_number}/{totalExercises}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {exercise.concept}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            disabled={isLoading}
            className="h-8 w-8"
            title="Nouvelle conversation"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading || messages.length === 0}
            className="h-8 w-8"
            title="Effacer l'historique"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 min-h-0 bg-gradient-to-b from-background to-muted/20">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex gap-3 ${
                  message.message_role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.message_role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/30">
                    <AvatarImage src={judeProfile} alt="Jude" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">J</AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={`p-3 max-w-[85%] shadow-sm ${
                    message.message_role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border-primary/10 rounded-bl-sm'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    <MathText text={message.message_content} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarImage src={judeProfile} alt="Jude" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">J</AvatarFallback>
              </Avatar>
              <Card className="p-4 bg-card border-primary/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-3 py-2 border-t bg-gradient-to-t from-muted/30 to-background space-y-2 flex-shrink-0">
        {/* Collapsible tools to keep more space for the conversation */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setToolsExpanded((v) => !v)}
          className="w-full h-7 justify-between px-2 text-xs"
        >
          <span className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary/70" />
            Options & outils
          </span>
          {toolsExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {!toolsExpanded && showQuestion && options.length > 0 && selectedAnswer === null && (
          <p className="text-xs text-muted-foreground px-2">
            Ouvre “Options & outils” pour voir les choix de réponse.
          </p>
        )}

        <AnimatePresence initial={false}>
          {toolsExpanded && (
            <motion.div
              key="tools"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-1">
                {/* Answer Options - Only show if we have valid options */}
                {showQuestion && options.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">?</span>
                      </span>
                      Sélectionne ta réponse:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((option: string, idx: number) => {
                        const isSelected = selectedAnswer === letters[idx];
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                            whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                          >
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => handleAnswerSelection(letters[idx])}
                              disabled={isLoading || selectedAnswer !== null}
                              className={`w-full justify-start text-left h-auto py-3 px-4 transition-all ${
                                isSelected
                                  ? "ring-2 ring-primary ring-offset-2"
                                  : "hover:border-primary/50 hover:bg-muted/40"
                              } ${selectedAnswer !== null && !isSelected ? "opacity-50" : ""}`}
                            >
                              <span
                                className={`font-bold mr-3 w-7 h-7 rounded-full flex items-center justify-center ${
                                  isSelected ? "bg-primary-foreground/20" : "bg-primary/10"
                                }`}
                              >
                                {letters[idx]}
                              </span>
                              <span className="text-sm flex-1">{option}</span>
                              {isSelected && <CheckCircle2 className="h-5 w-5 ml-2" />}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Message for exercises without options */}
                {showQuestion && options.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                    <Lightbulb className="h-4 w-4" />
                    <span>Question ouverte - Tape ta réponse ci-dessous ou demande de l'aide à Jude</span>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction("Donne-moi un indice pour cette question.")}
                    disabled={isLoading}
                    className="flex-1 h-9 gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Indice
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRevealAnswer}
                    disabled={isLoading}
                    className="flex-1 h-9 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Révéler la réponse
                  </Button>
                </div>

                {youtubeQuery && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" size="sm" asChild className="w-full h-9">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Regarder une vidéo explicative
                      </a>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message input (always visible) */}
        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient-x">
          <form onSubmit={handleSendMessage} className="flex gap-2 bg-card rounded-[10px] p-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pose une question à Jude..."
              disabled={isLoading}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="h-9 w-9"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(totalExercises, 5) }).map((_, i) => {
              const startIdx = Math.max(0, Math.min(currentExerciseIndex - 2, totalExercises - 5));
              const exerciseIdx = startIdx + i;
              return (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    exerciseIdx === currentExerciseIndex
                      ? 'w-4 bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextExercise}
            disabled={currentExerciseIndex >= totalExercises - 1}
            className="h-8"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer l'historique?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera toute la conversation pour cet exercice. Tu ne pourras pas la récupérer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Effacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
