import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Send, Lightbulb, HelpCircle, Trash2, Plus, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericAiHelper from "@/assets/eric-ai-helper.png";
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

interface Message {
  id: string;
  message_role: string;
  message_content: string;
  created_at: string;
}

interface ExamTutorChatProps {
  sessionId: string;
  exerciseId: string;
  exercise: any;
  onAnswerValidated?: (isCorrect: boolean, points: number) => void;
}

export const ExamTutorChat = ({
  sessionId,
  exerciseId,
  exercise,
  onAnswerValidated,
}: ExamTutorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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
        // Send initial greeting
        await sendInitialGreeting();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendInitialGreeting = async () => {
    const greeting = `Salut! 👋 Je suis Eric, ton tuteur pour cet examen. Je vais t'aider avec cette question sur ${exercise.concept}. Prends ton temps pour lire la question, et dis-moi ce que tu en penses! Tu peux me demander des indices si tu es bloqué. 💡`;
    
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

  const handleSendMessage = async (quickMessage?: string) => {
    const messageText = quickMessage || input;
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    setInput("");

    await saveMessage('user', messageText);

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          exercise,
          userMessage: messageText,
          conversationHistory: messages,
          studentAnswer: messageText.match(/^[A-D]$/i) ? messageText : null,
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <img src={ericAiHelper} alt="Eric" />
          </Avatar>
          <div>
            <h3 className="font-semibold">Eric - Ton Tuteur</h3>
            <p className="text-sm text-muted-foreground">{exercise.concept}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.message_role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.message_role === 'assistant' && (
              <Avatar className="h-8 w-8">
                <img src={ericAiHelper} alt="Eric" />
              </Avatar>
            )}
            <Card
              className={`p-3 max-w-[80%] ${
                message.message_role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.message_content}</p>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <img src={ericAiHelper} alt="Eric" />
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

      {/* YouTube suggestion */}
      {youtubeQuery && (
        <div className="px-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`, '_blank')}
          >
            <Youtube className="h-4 w-4 mr-2" />
            Voir des vidéos sur {exercise.concept}
          </Button>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 px-4 pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage("Explique-moi ce concept")}
          disabled={isLoading}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Explique-moi
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage("Donne-moi un indice")}
          disabled={isLoading}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Indice
        </Button>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tape ta réponse ou pose une question..."
            disabled={isLoading}
          />
          <Button onClick={() => handleSendMessage()} disabled={isLoading}>
            <Send className="h-4 w-4" />
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
    </div>
  );
};
