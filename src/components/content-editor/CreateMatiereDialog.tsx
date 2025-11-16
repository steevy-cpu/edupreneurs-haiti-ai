import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CreateMatiereDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatiereCreated: () => void;
}

interface ParsedLesson {
  title: string;
  objectif: string;
  mois: string;
  order_index: number;
  keywords: string[];
}

interface ParsedCurriculum {
  lessons: ParsedLesson[];
  competencies: string[];
}

type Step = 1 | 2 | 3;

export function CreateMatiereDialog({ open, onOpenChange, onMatiereCreated }: CreateMatiereDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Basic Info & Text
  const [subjectName, setSubjectName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("blue");
  const [description, setDescription] = useState("");
  const [curriculumText, setCurriculumText] = useState("");

  // Step 2: AI Parsed Lessons
  const [parsedLessons, setParsedLessons] = useState<ParsedLesson[]>([]);
  const [competencies, setCompetencies] = useState<string[]>([]);

  // Step 3: Generation Results
  const [createdSubjectId, setCreatedSubjectId] = useState<string>("");
  const [createdLessonCount, setCreatedLessonCount] = useState(0);

  const handleAnalyze = async () => {
    if (!curriculumText.trim() || curriculumText.length < 100) {
      toast({
        variant: "destructive",
        title: "Texte insuffisant",
        description: "Veuillez coller un programme plus détaillé (minimum 100 caractères)",
      });
      return;
    }

    if (!subjectName.trim() || !gradeLevel) {
      toast({
        variant: "destructive",
        title: "Informations manquantes",
        description: "Veuillez remplir le nom de la matière et le niveau",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-matiere-structure', {
        body: {
          curriculumText,
          subjectName,
          gradeLevel,
        }
      });

      if (error) throw error;

      const parsed = data as ParsedCurriculum;
      setParsedLessons(parsed.lessons);
      setCompetencies(parsed.competencies || []);
      setCurrentStep(2);
      
      toast({
        title: "Analyse réussie",
        description: `${parsed.lessons.length} leçons extraites du programme`,
      });
    } catch (error) {
      console.error("Error analyzing curriculum:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: "Impossible d'analyser le programme. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Create slug
      const slug = `${subjectName.toLowerCase().replace(/\s+/g, '-')}-${gradeLevel.toLowerCase()}`;

      // Insert subject
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          name: subjectName,
          slug,
          description,
          grade_level: gradeLevel,
          icon_name: icon,
          color,
          lesson_count: parsedLessons.length,
        })
        .select()
        .single();

      if (subjectError) throw subjectError;

      // Insert lessons with all required sections (empty for now, will be filled by content editor)
      const lessonsToInsert = parsedLessons.map((lesson, index) => ({
        subject_id: subject.id,
        title: lesson.title,
        slug: `${slug}-lecon-${index + 1}`,
        objectif: lesson.objectif,
        mois: lesson.mois,
        order_index: lesson.order_index,
        grade_level: gradeLevel,
        is_published: false,
        // Empty sections ready for AI generation via content editor
        introduction: null,
        contenu: null,
        exemples_exercices: null,
        activites_interactives: null,
        quiz_final: null,
        youtube_url: null,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert);

      if (lessonsError) throw lessonsError;

      setCreatedSubjectId(subject.id);
      setCreatedLessonCount(parsedLessons.length);
      setCurrentStep(3);

      toast({
        title: "Matière créée avec succès",
        description: `${parsedLessons.length} leçons créées. Vous pouvez maintenant générer le contenu via le Content Editor.`,
      });

      onMatiereCreated();
    } catch (error) {
      console.error("Error creating matiere:", error);
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: "Impossible de créer la matière. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setCurrentStep(1);
    setSubjectName("");
    setGradeLevel("");
    setIcon("BookOpen");
    setColor("blue");
    setDescription("");
    setCurriculumText("");
    setParsedLessons([]);
    setCompetencies([]);
    setCreatedSubjectId("");
    setCreatedLessonCount(0);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Créer une nouvelle matière (IA)
          </DialogTitle>
        </DialogHeader>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Informations</span>
          </div>
          <div className="flex-1 h-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">Analyse IA</span>
          </div>
          <div className="flex-1 h-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 3 ? <Check className="h-4 w-4" /> : '3'}
            </div>
            <span className="text-sm font-medium">Terminé</span>
          </div>
        </div>

        {/* Step 1: Basic Info & Curriculum Text */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Nom de la matière</Label>
                <Input
                  id="subject-name"
                  placeholder="Ex: Espagnol, Sciences Sociales"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade-level">Niveau</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger id="grade-level">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7AF">7ème AF</SelectItem>
                    <SelectItem value="AF8">AF8</SelectItem>
                    <SelectItem value="AF9">AF9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  placeholder="Ex: BookOpen, Globe"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger id="color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Bleu</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="green">Vert</SelectItem>
                    <SelectItem value="purple">Violet</SelectItem>
                    <SelectItem value="red">Rouge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description courte de la matière"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curriculum-text">Programme MENFP</Label>
              <Textarea
                id="curriculum-text"
                placeholder="Collez le programme MENFP ici...&#10;&#10;Exemple:&#10;Décembre - Leçon 1: Introduction&#10;Objectif: Comprendre les bases...&#10;&#10;Janvier - Leçon 2: Suite du programme&#10;Objectif: Approfondir..."
                value={curriculumText}
                onChange={(e) => setCurriculumText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {curriculumText.length} caractères (minimum 100)
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || curriculumText.length < 100 || !subjectName || !gradeLevel}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  Analyser avec IA
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Review Parsed Lessons */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Leçons extraites ({parsedLessons.length})</h3>
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                ← Retour
              </Button>
            </div>

            {competencies.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Compétences identifiées:</h4>
                <div className="flex flex-wrap gap-2">
                  {competencies.map((comp, index) => (
                    <Badge key={index} variant="secondary">{comp}</Badge>
                  ))}
                </div>
              </Card>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {parsedLessons.map((lesson, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{lesson.order_index}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium">{lesson.title}</h4>
                        <Badge variant="outline">{lesson.mois}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lesson.objectif}</p>
                      {lesson.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lesson.keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Créer la matière
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <div className="space-y-4 text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Matière créée avec succès!</h3>
              <p className="text-muted-foreground">
                {createdLessonCount} leçons ont été créées dans la base de données.
              </p>
            </div>

            <Card className="p-4 text-left">
              <h4 className="font-medium mb-3">Prochaines étapes:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>Les leçons sont maintenant visibles dans le Content Editor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Utilisez la génération par lots pour créer le contenu de toutes les sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Les sections générées incluront: Introduction, Contenu, Exemples/Exercices, Activités Interactives et Quiz Final</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>Révisez et publiez les leçons une fois le contenu généré</span>
                </li>
              </ol>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Fermer
              </Button>
              <Button onClick={resetDialog} className="flex-1">
                Créer une autre matière
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
