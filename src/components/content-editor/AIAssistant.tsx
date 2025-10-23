import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Send, Maximize2, Minimize2, History, CheckCircle, Loader2, MessageSquare, Lightbulb, BookOpen, Youtube } from "lucide-react";
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
      case "introduction":
        prompt = `Utilise l'outil update_lesson_content pour créer une introduction engageante pour cette leçon. L'introduction doit:
- Avoir un paragraphe d'accroche qui capte l'attention (situation du quotidien haïtien, question intrigante)
- Expliquer pourquoi c'est important d'apprendre ce sujet
- Présenter le vocabulaire clé qui sera utilisé
- Environ 200-300 mots en HTML structuré avec <p>, <strong>, <em>
Après la création, valide la leçon avec validate_lesson.`;
        break;
      case "contenu":
        prompt = `Utilise l'outil update_lesson_content pour créer le contenu principal DÉTAILLÉ de cette leçon. Le contenu doit:
- Avoir minimum 5-7 sections bien détaillées avec <h3> pour les titres
- Chaque section avec paragraphes explicatifs, listes <ul> ou <ol>
- Au moins 2-3 exemples pratiques concrets avec contexte haïtien dans des <div class="example-box">
- Utiliser les balises: <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>
- Classes CSS: content-section, example-box, exercise, important-note
- Faire 800-1200 mots minimum
Après la création, valide la leçon avec validate_lesson.`;
        break;
      case "exemples":
        prompt = `Utilise l'outil update_lesson_content pour créer des exemples et exercices DÉTAILLÉS. Ils doivent inclure:
- 3 exemples résolus étape par étape avec contexte haïtien
- 5 exercices de difficulté progressive avec solutions complètes
- Format HTML avec <div class="exercise">, numérotation, explications détaillées
- Environ 600-800 mots au total
Après la création, valide la leçon avec validate_lesson.`;
        break;
      case "quiz":
        prompt = `Utilise l'outil update_lesson_content pour créer un quiz complet. Le quiz doit avoir:
- 10 questions à choix multiples
- 4 options chacune en HTML structuré
- Difficulté progressive (facile → moyen → difficile)
- Format structuré pour intégration dans le système de quiz
- Indiquer la bonne réponse pour chaque question
Après la création, valide la leçon avec validate_lesson.`;
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
              {loadingOperation === 'introduction' && 'L\'IA crée l\'introduction via les outils...'}
              {loadingOperation === 'contenu' && 'L\'IA génère le contenu via les outils...'}
              {loadingOperation === 'exemples' && 'L\'IA crée les exemples et exercices via les outils...'}
              {loadingOperation === 'quiz' && 'L\'IA génère le quiz via les outils...'}
              {loadingOperation === 'custom' && 'L\'IA traite votre demande...'}
              {!loadingOperation && 'L\'IA réfléchit et exécute les outils...'}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden min-h-0">
        {/* Quick Actions - Section Generators */}
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('introduction')}
            disabled={isLoading || !selectedLesson}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Introduction
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('contenu')}
            disabled={isLoading || !selectedLesson}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Contenu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('exemples')}
            disabled={isLoading || !selectedLesson}
            className="gap-2"
          >
            📝 Exemples
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('quiz')}
            disabled={isLoading || !selectedLesson}
            className="gap-2"
          >
            🎯 Quiz
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const url = prompt("Collez l'URL de la vidéo YouTube ici:");
              if (url && selectedLesson) {
                // Extract and validate URL
                const urlMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
                if (urlMatch) {
                  try {
                    const { error } = await supabase
                      .from('lessons')
                      .update({ 
                        youtube_url: url,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', selectedLesson.id);
                    
                    if (error) throw error;
                    
                    toast.success("Vidéo YouTube ajoutée avec succès!");
                    onApplyContent(url, 'youtube');
                  } catch (error) {
                    console.error('Error adding YouTube URL:', error);
                    toast.error("Erreur lors de l'ajout de la vidéo");
                  }
                } else {
                  toast.error("URL YouTube invalide. Utilisez un lien comme: https://www.youtube.com/watch?v=...");
                }
              }
            }}
            disabled={isLoading || !selectedLesson}
            className="gap-2 col-span-2"
          >
            <Youtube className="h-4 w-4" />
            Ajouter Vidéo YouTube
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
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {msg.content.includes('✅') && (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Modifications appliquées
                              </Badge>
                            )}
                          </div>
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
