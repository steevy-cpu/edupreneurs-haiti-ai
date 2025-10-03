import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  BookOpen, 
  Lightbulb, 
  CheckCircle,
  Loader2,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type LessonMode = 'lesson' | 'exercise' | 'quiz';

const MathCourse = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour! Je suis ton tuteur de mathématiques personnalisé. Comment puis-je t\'aider aujourd\'hui? Tu peux me demander d\'expliquer un concept, de faire des exercices, ou de tester tes connaissances avec un quiz! 📐'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lessonMode, setLessonMode] = useState<LessonMode>('lesson');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('math-ai-tutor', {
        body: {
          message: input,
          lessonType: lessonMode,
          chatHistory: messages
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI tutor:', error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter le tuteur IA. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mathématiques 📐</h1>
                <p className="text-sm text-muted-foreground">Tuteur IA Personnel</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Mode Selector */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Mode:</span>
            <Button
              variant={lessonMode === 'lesson' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLessonMode('lesson')}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Leçon
            </Button>
            <Button
              variant={lessonMode === 'exercise' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLessonMode('exercise')}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Exercice
            </Button>
            <Button
              variant={lessonMode === 'quiz' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLessonMode('quiz')}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Quiz
            </Button>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col h-[calc(100vh-280px)]">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-secondary text-white'
                        : 'bg-gradient-to-br from-accent to-yellow-500 text-white'
                    }>
                      {message.role === 'user' ? 'É' : '🤖'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-4 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-accent to-yellow-500 text-white">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-4 bg-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Pose ta question en mathématiques..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MathCourse;
