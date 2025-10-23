import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Send, Wand2, Languages, PenTool } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantProps {
  selectedLesson: any;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const AIAssistant = ({ selectedLesson }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const streamChat = async (userMessage: string, operation: string) => {
    setIsLoading(true);
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            operation,
            lessonData: selectedLesson,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.");
          return;
        }
        if (response.status === 402) {
          toast.error("Crédits insuffisants. Veuillez ajouter des crédits.");
          return;
        }
        if (response.status === 403) {
          toast.error("Accès refusé. Vérifiez vos permissions.");
          return;
        }
        throw new Error('Erreur lors de la communication avec l\'IA');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages([
                  ...newMessages,
                  { role: 'assistant', content: assistantMessage }
                ]);
              }
            } catch (e) {
              // Incomplete JSON, wait for more data
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      }

      setInput("");
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error("Erreur lors de la communication avec l'assistant IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = "";
    switch (action) {
      case "generate":
        prompt = `Génère un contenu complet de leçon sur le sujet "${selectedLesson?.title || 'ce sujet'}" avec:
- Une introduction engageante
- Le contenu principal bien structuré en HTML
- Des exemples concrets tirés du contexte haïtien
- 5 exercices de difficulté progressive avec solutions détaillées`;
        break;
      case "enhance":
        prompt = `Améliore le contenu existant de cette leçon en ajoutant:
- Plus de détails et d'explications claires
- Des analogies et métaphores adaptées au contexte haïtien
- Des exemples supplémentaires concrets
- Des exercices pratiques variés`;
        break;
      case "exercises":
        prompt = "Crée 5 nouveaux exercices variés avec solutions détaillées pour cette leçon, du plus facile au plus difficile";
        break;
      case "translate":
        prompt = "Traduis les parties principales de cette leçon en créole haïtien, en gardant les termes techniques en français avec explications";
        break;
      case "simplify":
        prompt = "Simplifie le contenu de cette leçon pour le rendre plus accessible, utilise des phrases courtes et plus d'exemples";
        break;
      case "quiz":
        prompt = "Crée un quiz de 10 questions à choix multiples (4 options chacune) sur cette leçon, avec difficulté progressive";
        break;
    }
    streamChat(prompt, action);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    streamChat(input, 'custom');
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Assistant IA
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Propulsé par Lovable AI • Optimisé pour le curriculum MENFP
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('generate')}
            disabled={isLoading || !selectedLesson}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Générer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('enhance')}
            disabled={isLoading || !selectedLesson}
          >
            <PenTool className="mr-2 h-4 w-4" />
            Améliorer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('exercises')}
            disabled={isLoading || !selectedLesson}
          >
            📝 Exercices
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('translate')}
            disabled={isLoading || !selectedLesson}
          >
            <Languages className="mr-2 h-4 w-4" />
            Créole
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('simplify')}
            disabled={isLoading || !selectedLesson}
          >
            💡 Simplifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('quiz')}
            disabled={isLoading || !selectedLesson}
          >
            🎯 Quiz
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Utilisez les actions rapides ou posez une question</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <Badge variant="secondary" className="mt-0.5">IA</Badge>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question à l'assistant IA..."
            rows={2}
            disabled={isLoading || !selectedLesson}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !selectedLesson}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
