import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Send, Wand2, Languages, PenTool, Plus, Settings, GitBranch, Maximize2, Minimize2, History, CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface AIAssistantProps {
  selectedLesson: any;
  onApplyContent: (content: string, operation: string, data?: any) => void;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  operation?: string;
  timestamp?: number;
  isStructured?: boolean;
  operationData?: any;
};

export default function AIAssistant({ selectedLesson, onApplyContent }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const addToHistory = (command: string) => {
    if (command.trim() && !commandHistory.includes(command)) {
      const newHistory = [command, ...commandHistory].slice(0, 10);
      setCommandHistory(newHistory);
      localStorage.setItem('ai-command-history', JSON.stringify(newHistory));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('ai-command-history');
    if (saved) {
      try {
        setCommandHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load command history');
      }
    }
  }, []);

  const streamChat = async (userMessage: string, operation: string) => {
    console.log('🚀 streamChat called:', { userMessage, operation });
    setIsLoading(true);
    setLoadingOperation(operation);
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: Date.now() }
    ];
    console.log('📝 Setting user message:', newMessages);
    setMessages(newMessages);
    
    let currentOperation = operation;

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
      }

      // Fetch additional context
      const { data: currentSubject } = selectedLesson?.subject_id
        ? await supabase
            .from('subjects')
            .select('id, name, grade_level')
            .eq('id', selectedLesson.subject_id)
            .single()
        : { data: null };

      const enhancedContext = {
        selectedLesson: selectedLesson ? {
          ...selectedLesson,
          subjectName: currentSubject?.name,
        } : null,
      };

      console.log('📦 Enhanced context:', JSON.stringify({
        selectedLesson: enhancedContext.selectedLesson ? {
          id: enhancedContext.selectedLesson.id,
          title: enhancedContext.selectedLesson.title,
          subject_id: enhancedContext.selectedLesson.subject_id,
          subjectName: enhancedContext.selectedLesson.subjectName,
          grade_level: enhancedContext.selectedLesson.grade_level
        } : null
      }, null, 2));

      console.log('📡 Calling edge function...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: newMessages.map(m => ({
              role: m.role,
              content: m.content
            })),
            context: enhancedContext,
          }),
        }
      );

      console.log('📥 Response received:', { ok: response.ok, status: response.status, contentType: response.headers.get('content-type') });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requêtes atteinte. Attendez quelques instants.");
          setIsLoading(false);
          return;
        }
        const errorText = await response.text();
        console.error('Edge function error:', errorText);
        toast.error("Erreur de communication avec l'IA");
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      console.log('🔄 Starting stream processing...');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        console.log('✅ Reader obtained, starting read loop...');
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
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
                console.log('💬 Received chunk:', content.substring(0, 50), 'Total length:', assistantMessage.length);
                setMessages([
                  ...newMessages,
                  { role: 'assistant', content: assistantMessage, operation: currentOperation }
                ]);
              }
            } catch (e) {
              console.warn('⚠️ Parse error:', e);
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      }

      console.log('✅ Stream complete, final message length:', assistantMessage.length);
      setInput("");
    } catch (error) {
      console.error('❌ AI Assistant error:', error);
      toast.error("Erreur lors de la communication avec l'assistant IA");
    } finally {
      setIsLoading(false);
      setLoadingOperation("");
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
    addToHistory(input);
    streamChat(input, 'custom');
  };

  const handleHistoryClick = (command: string) => {
    setInput(command);
  };

  return (
    <Card className={`flex flex-col transition-all duration-300 animate-fade-in ${isExpanded ? 'fixed inset-4 z-50' : 'h-full'}`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Assistant IA - Commandes Naturelles
            </CardTitle>
            <CardDescription className="text-xs">
              Propulsé par Lovable AI • Créez, modifiez et gérez le contenu en langage naturel
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="hover-scale"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover-scale"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              {loadingOperation === 'generate' && 'Génération du contenu...'}
              {loadingOperation === 'enhance' && 'Amélioration du contenu...'}
              {loadingOperation === 'exercises' && 'Création des exercices...'}
              {loadingOperation === 'translate' && 'Traduction en cours...'}
              {loadingOperation === 'custom' && 'Traitement de votre demande...'}
              {!loadingOperation && 'En cours...'}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden min-h-0">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
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

        <Separator />

        {/* Context Info */}
        {selectedLesson && (
          <div className="bg-primary/10 rounded p-2 text-xs flex-shrink-0">
            <div className="font-semibold">{selectedLesson.title}</div>
            <div className="text-muted-foreground">{selectedLesson.grade_level}</div>
          </div>
        )}

        <Separator />

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 flex-shrink-0">
            <MessageSquare className="h-4 w-4" />
            Conversation
          </h4>
          <ScrollArea className="flex-1 border rounded-lg p-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground p-6 animate-fade-in">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20 animate-pulse" />
                <p className="font-semibold mb-3 text-base">Commencez une conversation</p>
                <p className="text-xs">Cliquez sur un bouton d'action ou tapez une commande ci-dessous</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          {msg.role === 'assistant' && (
                            <Badge variant="secondary" className="mt-0.5 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              IA
                            </Badge>
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            {msg.timestamp && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                        {msg.role === 'assistant' && msg.operation && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onApplyContent(msg.content, msg.operation!);
                              toast.success("Contenu appliqué avec succès!");
                            }}
                            className="mt-2 self-start hover-scale gap-2"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Appliquer les modifications
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">L'IA réfléchit...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input - Always visible */}
        <div className="flex gap-2 flex-shrink-0 pt-2 border-t">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre commande ici... Ex: 'Génère une leçon sur les fractions pour la 6ème'"
            rows={3}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="transition-all focus:ring-2 focus:ring-primary resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="hover-scale h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
