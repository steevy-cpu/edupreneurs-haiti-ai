import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Youtube, MessageCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ericAiHelper from "@/assets/eric-ai-helper.png";
import { MathText } from '@/components/MathContent';

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
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-muted/30 flex-shrink-0">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={ericAiHelper} alt="Jude" />
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">Jude - Ton Tuteur</h3>
          <p className="text-xs text-muted-foreground">
            Assistant IA pour l'examen
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Nouveau
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading || messages.length === 0}
            className="hidden sm:flex"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.message_role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.message_role === 'assistant' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={ericAiHelper} alt="Jude" />
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`p-3 max-w-[80%] ${
                  message.message_role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  <MathText text={message.message_content} />
                </div>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={ericAiHelper} alt="Jude" />
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
              <Card className="p-3 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-background space-y-2 flex-shrink-0">
        {/* Answer Options - Only show if we have valid options */}
        {showQuestion && options.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Sélectionne ta réponse:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {options.map((option: string, idx: number) => (
                <Button
                  key={idx}
                  variant={selectedAnswer === letters[idx] ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAnswerSelection(letters[idx])}
                  disabled={isLoading || selectedAnswer !== null}
                  className="justify-start text-left h-auto py-2"
                >
                  <span className="font-bold mr-1">{letters[idx]})</span>
                  <span className="text-xs truncate">{option}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Message for exercises without options */}
        {showQuestion && options.length === 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Question ouverte - Tape ta réponse ci-dessous ou demande de l'aide à Jude
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Donne-moi un indice pour cette question.")}
            disabled={isLoading}
            className="flex-1 h-8 text-xs px-2"
          >
            Indice
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRevealAnswer}
            disabled={isLoading}
            className="flex-1 h-8 text-xs px-2"
          >
            Révéler la réponse
          </Button>
        </div>

        {youtubeQuery && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full"
          >
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube className="h-4 w-4 mr-2" />
              Vidéo recommandée
            </a>
          </Button>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pose une question à Jude..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousExercise}
            disabled={currentExerciseIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentExerciseIndex + 1} / {totalExercises}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextExercise}
            disabled={currentExerciseIndex >= totalExercises - 1}
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
