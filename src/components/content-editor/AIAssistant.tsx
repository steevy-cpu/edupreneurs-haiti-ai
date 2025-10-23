import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Send, Wand2, Languages, PenTool, Plus, Settings, GitBranch, Maximize2, Minimize2, History, CheckCircle, Loader2, AlertTriangle, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
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

type OperationPreview = {
  operation: string;
  message: string;
  params: any;
  requiresConfirmation: boolean;
};

export const AIAssistant = ({ selectedLesson, onApplyContent }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [operationPreview, setOperationPreview] = useState<OperationPreview | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<any>(null);
  const [relatedLessons, setRelatedLessons] = useState<any[]>([]);

  // Load command history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-command-history');
    if (saved) {
      setCommandHistory(JSON.parse(saved));
    }
  }, []);

  // Fetch related lessons when lesson changes
  useEffect(() => {
    if (selectedLesson?.subject_id) {
      fetchRelatedLessons();
    } else {
      setRelatedLessons([]);
    }
  }, [selectedLesson?.id]);

  const fetchRelatedLessons = async () => {
    if (!selectedLesson?.subject_id) return;

    const { data } = await supabase
      .from('lessons')
      .select('id, title, grade_level, workflow_status')
      .eq('subject_id', selectedLesson.subject_id)
      .neq('id', selectedLesson.id)
      .limit(3);

    if (data) {
      setRelatedLessons(data);
    }
  };

  // Save command to history
  const addToHistory = (command: string) => {
    const updated = [command, ...commandHistory.filter(c => c !== command)].slice(0, 10);
    setCommandHistory(updated);
    localStorage.setItem('ai-command-history', JSON.stringify(updated));
  };

  // Execute operation with confirmation
  const executeOperation = (msg: Message) => {
    if (!msg.operationData) return;

    const { operation, params } = msg.operationData;
    const isDestructive = operation === 'delete';

    if (isDestructive) {
      setPendingOperation({ operation, params, content: msg.content });
      setShowConfirmDialog(true);
    } else {
      onApplyContent(msg.content, operation, params);
    }
  };

  const confirmOperation = () => {
    if (pendingOperation) {
      onApplyContent(
        pendingOperation.content,
        pendingOperation.operation,
        pendingOperation.params
      );
      setPendingOperation(null);
    }
    setShowConfirmDialog(false);
  };

  const streamChat = async (userMessage: string, operation: string) => {
    setIsLoading(true);
    setLoadingOperation(operation);
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: Date.now() }
    ];
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

      // Fetch additional context: subjects and related lessons
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, slug, grade_level, description')
        .order('name');

      const { data: relatedLessons } = selectedLesson?.subject_id
        ? await supabase
            .from('lessons')
            .select('id, title, slug, grade_level, workflow_status')
            .eq('subject_id', selectedLesson.subject_id)
            .neq('id', selectedLesson.id)
            .limit(5)
        : { data: null };

      // Build enhanced context
      const enhancedContext = {
        selectedLesson: selectedLesson ? {
          ...selectedLesson,
          hasContent: !!(selectedLesson.contenu || selectedLesson.exemples_exercices),
          hasObjectives: !!selectedLesson.objectif,
          hasIntroduction: !!selectedLesson.introduction,
          missingFields: [
            !selectedLesson.objectif && 'objectif',
            !selectedLesson.introduction && 'introduction',
            !selectedLesson.contenu && 'contenu',
            !selectedLesson.exemples_exercices && 'exemples_exercices'
          ].filter(Boolean)
        } : null,
        availableSubjects: subjects || [],
        relatedLessons: relatedLessons || [],
        conversationHistory: messages.slice(-5).map(m => ({ role: m.role, content: m.content.substring(0, 200) }))
      };

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
            command: userMessage,
            context: enhancedContext,
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

      // Check if response is JSON (structured operation)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const structuredResponse = await response.json();
        
        if (structuredResponse.operation) {
          // Show operation preview
          setOperationPreview({
            operation: structuredResponse.operation,
            message: structuredResponse.message,
            params: structuredResponse.params || {},
            requiresConfirmation: structuredResponse.requiresConfirmation
          });
          
          // Handle structured operations
          const confirmMsg: Message = {
            role: 'assistant',
            content: structuredResponse.message || 'Opération détectée',
            operation: structuredResponse.operation,
            isStructured: true,
            timestamp: Date.now(),
            operationData: {
              operation: structuredResponse.operation,
              params: structuredResponse.params
            }
          };
          
          setMessages([...newMessages, confirmMsg]);
        }
        setIsLoading(false);
        setLoadingOperation("");
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
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
                setMessages([
                  ...newMessages,
                  { role: 'assistant', content: assistantMessage, operation: currentOperation }
                ]);
              }
            } catch (e) {
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
      
      // Show error in chat
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `❌ Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
          timestamp: Date.now()
        }
      ]);
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
    <>
      <Card className={`flex flex-col transition-all duration-300 animate-fade-in ${isExpanded ? 'fixed inset-4 z-50 h-auto' : 'h-[600px]'}`}>
        <CardHeader className="pb-3">
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
      <CardContent className="flex-1 flex gap-3 p-4 overflow-hidden">
        {/* Command History Sidebar */}
        {showHistory && (
          <div className="w-48 border-r pr-3 flex flex-col gap-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </h4>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {commandHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun historique</p>
                ) : (
                  commandHistory.map((cmd, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 px-2"
                      onClick={() => handleHistoryClick(cmd)}
                    >
                      <span className="truncate">{cmd}</span>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Quick Actions - Enhanced */}
          <div className="grid grid-cols-3 gap-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Crée une nouvelle leçon sur ")}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Modifie les métadonnées de cette leçon: ")}
              disabled={isLoading || !selectedLesson}
            >
              <Settings className="mr-2 h-4 w-4" />
              Métadonnées
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Change le statut de cette leçon en révision")}
              disabled={isLoading || !selectedLesson}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Workflow
            </Button>
          </div>
          
          <Separator />

          {/* Context Info - Enhanced */}
          {selectedLesson && (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 text-xs border border-primary/20 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{selectedLesson.title}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {selectedLesson.grade_level} • {selectedLesson.workflow_status || 'draft'}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {selectedLesson.is_published ? '📤 Publié' : '📝 Brouillon'}
                  </Badge>
                </div>
              </div>

              {/* Smart Suggestions */}
              {(!selectedLesson.contenu || !selectedLesson.exemples_exercices || !selectedLesson.objectif) && (
                <Card className="border-amber-500/50 bg-amber-500/5 animate-fade-in">
                  <CardHeader className="p-2">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Suggestions intelligentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-0">
                    <div className="space-y-1 text-xs">
                      {!selectedLesson.objectif && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover-scale"
                          onClick={() => setInput(`Ajoute des objectifs d'apprentissage clairs pour "${selectedLesson.title}"`)}
                        >
                          <span className="text-amber-500 mr-2">•</span>
                          Ajouter des objectifs d'apprentissage
                        </Button>
                      )}
                      {!selectedLesson.introduction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover-scale"
                          onClick={() => setInput(`Crée une introduction engageante pour "${selectedLesson.title}"`)}
                        >
                          <span className="text-amber-500 mr-2">•</span>
                          Créer une introduction engageante
                        </Button>
                      )}
                      {!selectedLesson.contenu && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover-scale"
                          onClick={() => setInput(`Génère le contenu principal pour "${selectedLesson.title}"`)}
                        >
                          <span className="text-amber-500 mr-2">•</span>
                          Générer le contenu principal
                        </Button>
                      )}
                      {!selectedLesson.exemples_exercices && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover-scale"
                          onClick={() => setInput(`Crée des exercices pratiques pour "${selectedLesson.title}"`)}
                        >
                          <span className="text-amber-500 mr-2">•</span>
                          Ajouter des exercices pratiques
                        </Button>
                      )}
                      {selectedLesson.workflow_status === 'draft' && selectedLesson.contenu && selectedLesson.exemples_exercices && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover-scale"
                          onClick={() => setInput(`Soumettre "${selectedLesson.title}" pour révision`)}
                        >
                          <span className="text-green-500 mr-2">✓</span>
                          Prêt pour révision - Soumettre
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Lessons */}
              {relatedLessons.length > 0 && (
                <Card className="border-blue-500/50 bg-blue-500/5 animate-fade-in">
                  <CardHeader className="p-2">
                    <CardTitle className="text-xs flex items-center gap-2">
                      🔗 Leçons connexes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-0">
                    <div className="space-y-1 text-xs">
                      {relatedLessons.map((lesson) => (
                        <Button
                          key={lesson.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover-scale"
                          onClick={() => setInput(`Compare cette leçon avec "${lesson.title}" et suggère des liens`)}
                        >
                          <span className="text-blue-500 mr-2">→</span>
                          <span className="truncate">{lesson.title} ({lesson.grade_level})</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Operation Preview Card */}
          {operationPreview && (
            <Card className="border-2 border-primary/50 bg-primary/5 animate-scale-in">
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Aperçu de l'opération
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">{operationPreview.operation}</Badge>
                    <p className="text-xs text-muted-foreground flex-1">
                      {operationPreview.message}
                    </p>
                  </div>
                  {operationPreview.params && Object.keys(operationPreview.params).length > 0 && (
                    <div className="text-xs bg-muted/50 rounded p-2 space-y-1">
                      {Object.entries(operationPreview.params).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <ScrollArea className="flex-1 border rounded-lg p-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground p-6 animate-fade-in">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20 animate-pulse" />
                <p className="font-semibold mb-3 text-base">Assistant IA avec Commandes Naturelles</p>
                <p className="text-xs mb-3">Exemples de commandes:</p>
                <div className="text-xs space-y-2 text-left max-w-md mx-auto bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-2 hover-scale cursor-pointer" onClick={() => setInput("Crée une nouvelle leçon sur les équations du 2nd degré")}>
                    <span className="text-primary">•</span>
                    <span>"Crée une nouvelle leçon sur les équations du 2nd degré"</span>
                  </div>
                  <div className="flex items-start gap-2 hover-scale cursor-pointer" onClick={() => setInput("Modifie le titre de cette leçon")}>
                    <span className="text-primary">•</span>
                    <span>"Modifie le titre de cette leçon"</span>
                  </div>
                  <div className="flex items-start gap-2 hover-scale cursor-pointer" onClick={() => setInput("Soumettre cette leçon pour révision")}>
                    <span className="text-primary">•</span>
                    <span>"Soumettre cette leçon pour révision"</span>
                  </div>
                  <div className="flex items-start gap-2 hover-scale cursor-pointer" onClick={() => setInput("Génère 10 exercices de difficulté progressive")}>
                    <span className="text-primary">•</span>
                    <span>"Génère 10 exercices de difficulté progressive"</span>
                  </div>
                </div>
              </div>
          ) : (
              <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 shadow-sm transition-all hover:shadow-md ${
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
                      {msg.role === 'assistant' && msg.operation && !msg.isStructured && (
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
                      {msg.role === 'assistant' && msg.isStructured && msg.operationData && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => executeOperation(msg)}
                            className="self-start hover-scale gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setOperationPreview(null);
                              toast.info("Opération annulée");
                            }}
                            className="self-start hover-scale"
                          >
                            ✗ Annuler
                          </Button>
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

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Commande en langage naturel ou question... Ex: 'Crée une leçon sur les fractions pour la 6ème'"
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="hover-scale"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Confirmation Dialog for Destructive Operations */}
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent className="animate-scale-in">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmer l'opération
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pendingOperation?.operation === 'delete' && (
              <>
                <p className="mb-2">Cette action est irréversible.</p>
                <p className="font-medium">Êtes-vous sûr de vouloir supprimer cette leçon ?</p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmOperation}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Confirmer la suppression
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
