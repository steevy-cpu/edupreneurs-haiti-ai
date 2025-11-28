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

interface Message {
  id: string;
  message_role: string;
  message_content: string;
  created_at: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversation();
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
    const greeting = `Salut! 👋 Je suis Eric, ton tuteur pour cet examen.

Regarde la question ${exercise.exercise_number} dans le document PDF à gauche. Elle porte sur ${exercise.concept}.

Prends ton temps pour lire et comprendre la question. Quand tu es prêt, sélectionne une réponse (A, B, C, ou D) en cliquant sur les boutons ci-dessus!

Tu peux aussi me poser des questions si tu as besoin d'aide. 💡`;
    
    await saveMessage('assistant', greeting);
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
        description: "Impossible de contacter Eric. Réessaie!",
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
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={ericAiHelper} alt="Eric" />
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">Eric - Ton Tuteur</h3>
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
      <ScrollArea className="flex-1 p-4">
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
                  <AvatarImage src={ericAiHelper} alt="Eric" />
                  <AvatarFallback>E</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`p-3 max-w-[80%] ${
                  message.message_role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.message_content}
                </p>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={ericAiHelper} alt="Eric" />
                <AvatarFallback>E</AvatarFallback>
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
      <div className="p-4 border-t bg-background space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Explique-moi ce concept en détail.")}
            disabled={isLoading}
            className="flex-1"
          >
            Explique-moi
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Donne-moi un indice pour cette question.")}
            disabled={isLoading}
            className="flex-1"
          >
            Indice
          </Button>
        </div>

        {youtubeQuery && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Youtube className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  Vidéo recommandée par Eric
                </p>
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
                    Voir la vidéo
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pose une question à Eric..."
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
