import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Download
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonValidation {
  lesson: {
    id: string;
    title: string;
    slug: string;
    grade_level: string;
    subject_name: string;
  };
  quizParsed: ParsedQuestion[];
  quizErrors: string[];
  activitiesParsed: any[];
  activityErrors: string[];
  aiValidation?: {
    confidence: number;
    issues: Array<{
      questionIndex: number;
      issue: string;
      suggestedFix?: string;
    }>;
  };
}

interface ValidationStats {
  total: number;
  quizValid: number;
  quizInvalid: number;
  activitiesValid: number;
  activitiesInvalid: number;
}

export const QuizActivityValidator = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [validations, setValidations] = useState<LessonValidation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingAI, setIsValidatingAI] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ValidationStats>({
    total: 0,
    quizValid: 0,
    quizInvalid: 0,
    activitiesValid: 0,
    activitiesInvalid: 0,
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const { data } = await supabase
      .from('subjects')
      .select('id, name, slug, grade_level')
      .order('name');
    
    if (data) {
      setSubjects(data);
    }
  };

  const parseQuizQuestions = (content: string): { questions: ParsedQuestion[], errors: string[] } => {
    const questions: ParsedQuestion[] = [];
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      return { questions, errors: ['Contenu vide'] };
    }

    // Check if HTML format
    if (content.includes('<div class="quiz-question"')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const questionDivs = doc.querySelectorAll('.quiz-question');
        
        questionDivs.forEach((questionDiv, idx) => {
          const questionText = questionDiv.querySelector('p')?.textContent?.trim() || '';
          const options: string[] = [];
          const optionDivs = questionDiv.querySelectorAll('.option');
          
          optionDivs.forEach((optionDiv) => {
            const text = optionDiv.textContent?.trim() || '';
            const cleanText = text.replace(/^[A-D]\)\s*/, '').trim();
            if (cleanText) options.push(cleanText);
          });
          
          const correctAnswerDiv = questionDiv.querySelector('.correct-answer');
          const correctAnswerText = correctAnswerDiv?.querySelector('strong')?.textContent?.trim() || '';
          const correctMatch = correctAnswerText.match(/Réponse\s+correcte\s*:\s*([A-D])/i);
          const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : 'A';
          const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
          
          const explanationParagraphs = correctAnswerDiv?.querySelectorAll('p');
          let explanation = '';
          if (explanationParagraphs && explanationParagraphs.length > 1) {
            explanation = Array.from(explanationParagraphs)
              .slice(1)
              .map(p => p.textContent?.trim() || '')
              .join(' ');
          }
          
          if (questionText && options.length === 4 && explanation) {
            questions.push({ question: questionText, options, correctAnswer: correctIndex, explanation });
          } else {
            errors.push(`Question ${idx + 1}: ${
              !questionText ? 'texte manquant' : 
              options.length !== 4 ? `${options.length}/4 options` : 
              !explanation ? 'explication manquante' : 'format invalide'
            }`);
          }
        });
      } catch (e) {
        errors.push('Erreur de parsing HTML');
      }
    } else {
      // Markdown format
      let sections = content.split(/#{2,3}\s*✅?\s*Question\s+\d+/i);
      if (sections.length <= 1) {
        sections = content.split(/Question\s+\d+/i);
      }
      
      sections.slice(1).forEach((section, idx) => {
        const questionMatch = section.match(/^\s*(.+?)(?=\n\s*[A-D][\):\.])/is);
        if (!questionMatch) {
          errors.push(`Question ${idx + 1}: texte non trouvé`);
          return;
        }
        
        const questionText = questionMatch[1].trim().replace(/\*\*/g, '').replace(/#{1,3}/g, '');
        
        const optionMatches = section.matchAll(/([A-D])[\):\.]\s*(.+?)(?=\n\s*[A-D][\):\.]|\n\s*#{2,3}|\n\n|$)/gis);
        const options: string[] = [];
        Array.from(optionMatches).forEach(match => {
          const optionText = match[2]?.trim().replace(/\*\*/g, '');
          if (optionText && optionText.length > 0 && optionText.length < 300) {
            options.push(optionText);
          }
        });
        
        let correctMatch = section.match(/#{2,3}\s*Réponse\s+correcte\s*:?\s*([A-D])/i);
        if (!correctMatch) correctMatch = section.match(/Réponse\s*:?\s*([A-D])/i);
        if (!correctMatch) correctMatch = section.match(/Correct[e]?\s*:?\s*([A-D])/i);
        
        if (!correctMatch) {
          errors.push(`Question ${idx + 1}: réponse correcte non trouvée`);
          return;
        }
        
        if (options.length !== 4) {
          errors.push(`Question ${idx + 1}: ${options.length}/4 options`);
          return;
        }
        
        const correctLetter = correctMatch[1].toUpperCase();
        const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
        
        const explanationMatch = section.match(/#{2,3}\s*Explication\s*:?\s*\n?\s*(.+?)(?=#{2,3}|$)/is);
        const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : "";
        
        if (!explanation) {
          errors.push(`Question ${idx + 1}: explication manquante`);
        }
        
        if (questionText && options.length === 4 && correctIndex >= 0 && correctIndex < 4) {
          questions.push({ question: questionText, options, correctAnswer: correctIndex, explanation: explanation || 'Pas d\'explication' });
        }
      });
    }

    return { questions, errors };
  };

  const parseActivities = (content: string): { activities: any[], errors: string[] } => {
    const activities: any[] = [];
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      return { activities, errors: ['Contenu vide'] };
    }

    // Similar parsing logic for activities
    const activityPatterns = [
      /Activité\s*\d+/gi,
      /Exercice\s*\d+/gi,
      /Question\s*\d+/gi
    ];

    let found = false;
    for (const pattern of activityPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        found = true;
        activities.push({ count: matches.length, type: 'detected' });
        break;
      }
    }

    if (!found && content.length > 100) {
      // Try to detect structured content
      if (content.includes('A)') || content.includes('A.') || content.includes('<div')) {
        activities.push({ count: 1, type: 'structured' });
      } else {
        errors.push('Format d\'activité non reconnu');
      }
    }

    return { activities, errors };
  };

  const runValidation = async () => {
    setIsLoading(true);
    setValidations([]);

    try {
      let query = supabase
        .from('lessons')
        .select('id, title, slug, grade_level, quiz_final, activites_interactives, subjects(id, name)')
        .or('quiz_final.neq.null,activites_interactives.neq.null');

      if (selectedGrade !== 'all') {
        query = query.eq('grade_level', selectedGrade);
      }

      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }

      const { data: lessonsData, error } = await query.order('title');

      if (error) throw error;

      const results: LessonValidation[] = [];
      let quizValid = 0, quizInvalid = 0, activitiesValid = 0, activitiesInvalid = 0;

      for (const lesson of lessonsData || []) {
        const quizResult = lesson.quiz_final 
          ? parseQuizQuestions(lesson.quiz_final)
          : { questions: [], errors: [] };
        
        const activityResult = lesson.activites_interactives
          ? parseActivities(lesson.activites_interactives)
          : { activities: [], errors: [] };

        if (lesson.quiz_final) {
          if (quizResult.questions.length > 0 && quizResult.errors.length === 0) {
            quizValid++;
          } else {
            quizInvalid++;
          }
        }

        if (lesson.activites_interactives) {
          if (activityResult.activities.length > 0 && activityResult.errors.length === 0) {
            activitiesValid++;
          } else {
            activitiesInvalid++;
          }
        }

        results.push({
          lesson: {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            grade_level: lesson.grade_level,
            subject_name: lesson.subjects?.name || 'N/A',
          },
          quizParsed: quizResult.questions,
          quizErrors: quizResult.errors,
          activitiesParsed: activityResult.activities,
          activityErrors: activityResult.errors,
        });
      }

      setValidations(results);
      setStats({
        total: results.length,
        quizValid,
        quizInvalid,
        activitiesValid,
        activitiesInvalid,
      });

      toast.success(`Validation terminée: ${results.length} leçons analysées`);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error("Erreur lors de la validation");
    } finally {
      setIsLoading(false);
    }
  };

  const runAIValidation = async (lessonId: string) => {
    setIsValidatingAI(true);

    try {
      const lesson = validations.find(v => v.lesson.id === lessonId);
      if (!lesson || lesson.quizParsed.length === 0) {
        toast.error("Pas de quiz à valider");
        return;
      }

      const { data, error } = await supabase.functions.invoke('validate-quiz-accuracy', {
        body: {
          lessonId,
          questions: lesson.quizParsed.slice(0, 5), // Limit to 5 questions
        }
      });

      if (error) throw error;

      // Update the validation with AI results
      setValidations(prev => prev.map(v => {
        if (v.lesson.id === lessonId) {
          return {
            ...v,
            aiValidation: data,
          };
        }
        return v;
      }));

      if (data.issues?.length > 0) {
        toast.warning(`${data.issues.length} problème(s) potentiel(s) détecté(s)`);
      } else {
        toast.success(`Confiance IA: ${Math.round(data.confidence * 100)}%`);
      }
    } catch (error) {
      console.error('AI validation error:', error);
      toast.error("Erreur lors de la validation IA");
    } finally {
      setIsValidatingAI(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Leçon', 'Matière', 'Niveau', 'Quiz Questions', 'Quiz Erreurs', 'Activités', 'Erreurs Activités'];
    const rows = validations.map(v => [
      v.lesson.title,
      v.lesson.subject_name,
      v.lesson.grade_level,
      v.quizParsed.length,
      v.quizErrors.join('; '),
      v.activitiesParsed.length,
      v.activityErrors.join('; '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-quiz-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Export CSV téléchargé");
  };

  const toggleExpanded = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const grades = [...new Set(subjects.map(s => s.grade_level))];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Validation des Quiz et Activités
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.grade_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={runValidation} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Valider le contenu
            </Button>

            {validations.length > 0 && (
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {validations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Leçons analysées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.quizValid}</div>
              <div className="text-sm text-muted-foreground">Quiz valides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.quizInvalid}</div>
              <div className="text-sm text-muted-foreground">Quiz invalides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activitiesValid}</div>
              <div className="text-sm text-muted-foreground">Activités valides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.activitiesInvalid}</div>
              <div className="text-sm text-muted-foreground">Activités invalides</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress bar during loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Analyse en cours...</p>
              <Progress value={33} className="animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {validations.length > 0 && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tous ({validations.length})</TabsTrigger>
            <TabsTrigger value="errors">
              Avec erreurs ({validations.filter(v => v.quizErrors.length > 0 || v.activityErrors.length > 0).length})
            </TabsTrigger>
            <TabsTrigger value="valid">
              Valides ({validations.filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && (v.quizParsed.length > 0 || v.activitiesParsed.length > 0)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {validations.map(validation => (
                  <ValidationItem
                    key={validation.lesson.id}
                    validation={validation}
                    isExpanded={expandedLessons.has(validation.lesson.id)}
                    onToggle={() => toggleExpanded(validation.lesson.id)}
                    onAIValidate={() => runAIValidation(validation.lesson.id)}
                    isValidatingAI={isValidatingAI}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {validations
                  .filter(v => v.quizErrors.length > 0 || v.activityErrors.length > 0)
                  .map(validation => (
                    <ValidationItem
                      key={validation.lesson.id}
                      validation={validation}
                      isExpanded={expandedLessons.has(validation.lesson.id)}
                      onToggle={() => toggleExpanded(validation.lesson.id)}
                      onAIValidate={() => runAIValidation(validation.lesson.id)}
                      isValidatingAI={isValidatingAI}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="valid" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {validations
                  .filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && (v.quizParsed.length > 0 || v.activitiesParsed.length > 0))
                  .map(validation => (
                    <ValidationItem
                      key={validation.lesson.id}
                      validation={validation}
                      isExpanded={expandedLessons.has(validation.lesson.id)}
                      onToggle={() => toggleExpanded(validation.lesson.id)}
                      onAIValidate={() => runAIValidation(validation.lesson.id)}
                      isValidatingAI={isValidatingAI}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

interface ValidationItemProps {
  validation: LessonValidation;
  isExpanded: boolean;
  onToggle: () => void;
  onAIValidate: () => void;
  isValidatingAI: boolean;
}

const ValidationItem = ({ validation, isExpanded, onToggle, onAIValidate, isValidatingAI }: ValidationItemProps) => {
  const hasQuizErrors = validation.quizErrors.length > 0;
  const hasActivityErrors = validation.activityErrors.length > 0;
  const hasAnyContent = validation.quizParsed.length > 0 || validation.activitiesParsed.length > 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={`border ${hasQuizErrors || hasActivityErrors ? 'border-destructive/50' : hasAnyContent ? 'border-green-500/50' : 'border-muted'}`}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasQuizErrors || hasActivityErrors ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : hasAnyContent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">{validation.lesson.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {validation.lesson.subject_name} • {validation.lesson.grade_level}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {validation.quizParsed.length > 0 && (
                  <Badge variant={hasQuizErrors ? "destructive" : "default"}>
                    Quiz: {validation.quizParsed.length}Q
                  </Badge>
                )}
                {validation.activitiesParsed.length > 0 && (
                  <Badge variant={hasActivityErrors ? "destructive" : "secondary"}>
                    Activités: {validation.activitiesParsed.length}
                  </Badge>
                )}
                {validation.aiValidation && (
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {Math.round(validation.aiValidation.confidence * 100)}%
                  </Badge>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Quiz Details */}
            {validation.quizParsed.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Questions du Quiz
                  </h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => { e.stopPropagation(); onAIValidate(); }}
                    disabled={isValidatingAI}
                  >
                    {isValidatingAI ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    Vérifier avec IA
                  </Button>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  {validation.quizParsed.map((q, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted/30 rounded">
                      <p className="font-medium">Q{idx + 1}: {q.question.substring(0, 100)}...</p>
                      <p className="text-muted-foreground">
                        Réponse: {String.fromCharCode(65 + q.correctAnswer)}) {q.options[q.correctAnswer]?.substring(0, 50)}...
                      </p>
                      {validation.aiValidation?.issues?.find(i => i.questionIndex === idx) && (
                        <p className="text-destructive text-xs mt-1">
                          ⚠️ {validation.aiValidation.issues.find(i => i.questionIndex === idx)?.issue}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {(hasQuizErrors || hasActivityErrors) && (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">Erreurs détectées</h4>
                {validation.quizErrors.map((err, idx) => (
                  <p key={idx} className="text-sm text-destructive pl-4">• {err}</p>
                ))}
                {validation.activityErrors.map((err, idx) => (
                  <p key={idx} className="text-sm text-destructive pl-4">• {err}</p>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default QuizActivityValidator;
