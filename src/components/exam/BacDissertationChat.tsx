import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  BookOpen,
  Lightbulb,
  PenLine,
  Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ericAiHelper from "@/assets/eric-ai-helper.png";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface DissertationStep {
  step: string;
  label: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BacDissertationChatProps {
  examId: string;
  subjects: string[]; // The 3 dissertation topics
  onComplete?: (score: number) => void;
}

const DEFAULT_STEPS: DissertationStep[] = [
  { step: 'choosing_subject', label: 'Choix du sujet' },
  { step: 'introduction', label: 'Introduction' },
  { step: 'development_1', label: 'Développement I' },
  { step: 'development_2', label: 'Développement II' },
  { step: 'development_3', label: 'Développement III' },
  { step: 'conclusion', label: 'Conclusion' },
  { step: 'review', label: 'Révision finale' },
];

export function BacDissertationChat({ examId, subjects, onComplete }: BacDissertationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [studentText, setStudentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("choosing_subject");
  const [chosenSubjectIndex, setChosenSubjectIndex] = useState<number | undefined>(undefined);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [dissertationParts, setDissertationParts] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting from Eric
    const initialMessage = `Bienvenue à la préparation de ta dissertation de philosophie ! 📚\n\nVoici les 3 sujets proposés:\n\n${subjects.map((s, i) => `**${i + 1}.** "${s}"`).join('\n\n')}\n\nQuel sujet te parle le plus ? Dis-moi le numéro (1, 2 ou 3) et explique-moi pourquoi tu le choisis.`;
    
    setMessages([{ role: "assistant", content: initialMessage }]);
  }, [subjects]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userMessage: string, includeStudentText?: boolean) => {
    if (!userMessage.trim() && !includeStudentText) return;

    const messageToSend = userMessage.trim();
    setMessages(prev => [...prev, { role: "user", content: messageToSend }]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Check if user is choosing a subject
      let newChosenIndex = chosenSubjectIndex;
      if (currentStep === 'choosing_subject') {
        if (messageToSend.includes('1')) newChosenIndex = 0;
        else if (messageToSend.includes('2')) newChosenIndex = 1;
        else if (messageToSend.includes('3')) newChosenIndex = 2;
        
        if (newChosenIndex !== undefined) {
          setChosenSubjectIndex(newChosenIndex);
        }
      }

      const { data, error } = await supabase.functions.invoke('bac-philosophy-tutor', {
        body: {
          subjects,
          userMessage: messageToSend,
          conversationHistory: messages.map(m => ({
            message_role: m.role,
            message_content: m.content
          })),
          currentStep,
          studentText: includeStudentText ? studentText : undefined,
          chosenSubjectIndex: newChosenIndex,
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);

      // Handle step progression
      if (data.suggestNextStep && data.nextStep) {
        // Mark current step as completed
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps(prev => [...prev, currentStep]);
        }
        
        // Save dissertation part if text was submitted
        if (includeStudentText && studentText) {
          setDissertationParts(prev => ({ ...prev, [currentStep]: studentText }));
          setStudentText("");
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    const currentIndex = DEFAULT_STEPS.findIndex(s => s.step === currentStep);
    if (currentIndex < DEFAULT_STEPS.length - 1) {
      const nextStep = DEFAULT_STEPS[currentIndex + 1];
      setCurrentStep(nextStep.step);
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }

      // Add a transition message
      sendMessage(`Je suis prêt pour l'étape suivante: ${nextStep.label}`);
    }
  };

  const handleSubmitText = () => {
    if (!studentText.trim()) {
      toast.error("Écris ton texte avant de le soumettre");
      return;
    }
    sendMessage(`Voici mon texte pour ${DEFAULT_STEPS.find(s => s.step === currentStep)?.label}:\n\n${studentText}`, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const currentStepInfo = DEFAULT_STEPS.find(s => s.step === currentStep);
  const isTextStep = currentStep !== 'choosing_subject' && currentStep !== 'review';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Panel - Progress & Writing */}
      <div className="lg:w-1/3 space-y-4">
        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEFAULT_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.step);
              const isCurrent = step.step === currentStep;
              
              return (
                <div
                  key={step.step}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isCurrent ? 'bg-amber-500/10 border border-amber-500/30' : 
                    isCompleted ? 'bg-muted' : ''
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Circle className="h-5 w-5 text-amber-500 fill-amber-500/30" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Chosen Subject */}
        {chosenSubjectIndex !== undefined && (
          <Card className="border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Sujet choisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic">"{subjects[chosenSubjectIndex]}"</p>
            </CardContent>
          </Card>
        )}

        {/* Writing Area - Only for text steps */}
        {isTextStep && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                {currentStepInfo?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
                placeholder={`Écris ton ${currentStepInfo?.label.toLowerCase()} ici...`}
                className="min-h-[200px] resize-none"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitText}
                  disabled={isLoading || !studentText.trim()}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Soumettre pour feedback
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {studentText.split(/\s+/).filter(Boolean).length} mots
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Step Button */}
        {completedSteps.includes(currentStep) && currentStep !== 'review' && (
          <Button 
            onClick={handleNextStep}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
          >
            Passer à l'étape suivante
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right Panel - Chat */}
      <Card className="lg:w-2/3 flex flex-col h-[600px]">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <img src={ericAiHelper} alt="Jude" className="w-10 h-10 rounded-full" />
            <div>
              <CardTitle className="text-lg">Jude - Professeur de Philosophie</CardTitle>
              <p className="text-sm text-muted-foreground">
                Je te guide dans ta dissertation
              </p>
            </div>
            <Badge className="ml-auto bg-amber-500">
              {currentStepInfo?.label}
            </Badge>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {(() => {
                        // Split content by LaTeX delimiters and render accordingly
                        const parts = message.content.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+\$)/g);
                        return parts.map((part, idx) => {
                          if (part.startsWith('$$') && part.endsWith('$$')) {
                            const math = part.slice(2, -2).trim();
                            return <BlockMath key={idx} math={math} />;
                          } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                            const math = part.slice(1, -1);
                            return <InlineMath key={idx} math={math} />;
                          } else if (part.trim()) {
                            return (
                              <ReactMarkdown
                                key={idx}
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                }}
                              >
                                {part}
                              </ReactMarkdown>
                            );
                          }
                          return null;
                        });
                      })()}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Jude réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pose une question ou réponds à Jude..."
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}