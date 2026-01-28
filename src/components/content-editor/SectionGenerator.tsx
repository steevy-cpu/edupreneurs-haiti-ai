import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Check, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { DEFAULT_WORD_COUNTS, SECTION_RANGES, SECTION_DESCRIPTIONS, SectionName } from "@/lib/lessonPrompts";
import { validateGeneratedContent, getGradeColor, getScoreLabel, QualityMetrics } from "@/lib/contentValidation";
import { sanitizeHtml } from "@/lib/sanitize";

interface SectionGeneratorProps {
  lesson: any;
  sectionName: SectionName;
  currentContent: string;
  onContentGenerated: (newContent: string) => void;
}

export const SectionGenerator = ({
  lesson,
  sectionName,
  currentContent,
  onContentGenerated,
}: SectionGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetWords, setTargetWords] = useState<number>(DEFAULT_WORD_COUNTS[sectionName]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);

  const hasExistingContent = currentContent && currentContent.trim().length > 0;

  // Debug: Log lesson data when component mounts or lesson changes
  console.log('🔍 SectionGenerator lesson data:', {
    hasLesson: !!lesson,
    lessonId: lesson?.id,
    lessonTitle: lesson?.title,
    subject: lesson?.subjects,
    gradeLevel: lesson?.grade_level
  });

  const handleGenerate = async () => {
    if (!lesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setQualityMetrics(null);

    const startTime = Date.now();

    try {
      // Fetch complete lesson data with subject to ensure we have the subject name
      const { data: fullLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('*, subjects(name)')
        .eq('id', lesson.id)
        .single();

      if (fetchError) {
        console.error('Error fetching lesson:', fetchError);
        toast.error("Erreur lors de la récupération de la leçon");
        setIsGenerating(false);
        return;
      }

      const subjectName = fullLesson.subjects?.name || 'Général';
      console.log('🔵 Generating with:', { 
        lessonId: lesson.id, 
        sectionName, 
        subjectName, 
        gradeLevel: lesson.grade_level 
      });

      const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
        body: {
          lessonId: lesson.id,
          sectionName,
          lessonTitle: lesson.title,
          subject: subjectName,
          gradeLevel: lesson.grade_level || '7AF',
          targetWords,
          context: additionalContext || undefined,
          currentContent: hasExistingContent ? currentContent : undefined,
        },
      });

      if (error) {
        console.error('Generation error:', error);
        
        // Log failed generation
        await supabase.from('ai_generation_logs').insert({
          lesson_id: lesson.id,
          section_name: sectionName,
          target_words: targetWords,
          additional_context: additionalContext,
          success: false,
          error_message: error.message,
          generation_time_ms: Date.now() - startTime,
          generated_by: (await supabase.auth.getUser()).data.user?.id,
        });

        if (error.message?.includes('429')) {
          toast.error("Trop de requêtes. Veuillez attendre quelques secondes.");
        } else if (error.message?.includes('402')) {
          toast.error("Crédits IA épuisés. Veuillez recharger votre compte.");
        } else {
          toast.error("Erreur lors de la génération");
        }
        return;
      }

      if (!data?.content) {
        toast.error("Aucun contenu généré");
        return;
      }

      setGeneratedContent(data.content);
      setShowPreview(true);

      // Validate quality
      const metrics = validateGeneratedContent(data.content, {
        minWords: SECTION_RANGES[sectionName].min,
        maxWords: SECTION_RANGES[sectionName].max,
        requireHtml: true,
        requireEmojis: true,
        requireHaitianContext: true,
      });
      setQualityMetrics(metrics);

      // Log successful generation
      await supabase.from('ai_generation_logs').insert({
        lesson_id: lesson.id,
        section_name: sectionName,
        target_words: targetWords,
        additional_context: additionalContext,
        response_content: data.content,
        word_count: metrics.wordCount,
        generation_time_ms: Date.now() - startTime,
        quality_score: metrics.overallScore,
        has_html_tags: metrics.hasHtmlTags,
        has_tailwind_classes: metrics.hasTailwindClasses,
        has_emojis: metrics.hasEmojis,
        mentions_haiti: metrics.mentionsHaiti,
        success: true,
        generated_by: (await supabase.auth.getUser()).data.user?.id,
      });

      toast.success(`Section générée (${data.wordCount} mots, ${data.generationTimeMs}ms)`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      toast.success("Contenu appliqué");
      setIsOpen(false);
      setGeneratedContent("");
      setQualityMetrics(null);
    }
  };

  const handleCancel = () => {
    setGeneratedContent("");
    setQualityMetrics(null);
    setShowPreview(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🔵 Dialog state changing:', open);
      setIsOpen(open);
      if (!open) {
        // Reset state when closing
        setGeneratedContent("");
        setQualityMetrics(null);
        setShowPreview(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            console.log('🔵 Generate button clicked for lesson:', lesson?.id);
            if (!lesson) {
              toast.error("Aucune leçon sélectionnée - veuillez sélectionner une leçon dans la liste");
              return;
            }
          }}
        >
          {hasExistingContent ? (
            <>
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Régénérer</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Générer avec IA</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {hasExistingContent ? 'Régénérer' : 'Générer'} - {SECTION_DESCRIPTIONS[sectionName]}
          </DialogTitle>
          <DialogDescription>
            Leçon: {lesson?.title || 'Sans titre'} | 
            Matière: {lesson?.subjects?.name || 'Inconnue'} | 
            Niveau: {lesson?.grade_level || 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Configuration */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Nombre de mots cible: {targetWords}</Label>
                <Badge variant="outline">
                  {SECTION_RANGES[sectionName].min} - {SECTION_RANGES[sectionName].max} mots
                </Badge>
              </div>
              <Slider
                value={[targetWords]}
                onValueChange={(value) => setTargetWords(value[0])}
                min={100}
                max={1500}
                step={50}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexte additionnel (optionnel)</Label>
              <Textarea
                id="context"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Ex: Ajouter plus d'exemples pratiques, Focus sur les applications quotidiennes..."
                rows={2}
                className="text-sm"
              />
            </div>

            <Button
              onClick={() => {
                console.log('🔵 Générer button clicked in dialog');
                handleGenerate();
              }}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {hasExistingContent ? 'Régénérer le contenu' : 'Générer le contenu'}
                </>
              )}
            </Button>
          </div>

          {/* Quality Metrics */}
          {qualityMetrics && (
            <div className={`border rounded-lg p-4 ${getGradeColor(qualityMetrics.grade).split(' ')[2]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Qualité du contenu:</span>
                  <Badge className={getGradeColor(qualityMetrics.grade)}>
                    {qualityMetrics.grade} - {getScoreLabel(qualityMetrics.overallScore)}
                  </Badge>
                </div>
                <Badge variant="outline">
                  {qualityMetrics.wordCount} mots
                </Badge>
              </div>

              {qualityMetrics.warnings.length > 0 && (
                <Alert variant="destructive" className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {qualityMetrics.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {qualityMetrics.suggestions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Suggestions d'amélioration:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {qualityMetrics.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Aperçu du contenu généré</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? 'Masquer' : 'Afficher'} l'aperçu
                </Button>
              </div>

              {showPreview && (
                <div className="border rounded-lg p-4 bg-background max-h-[400px] overflow-y-auto">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(generatedContent) }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleApply} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Appliquer
                </Button>
                <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Régénérer
                </Button>
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
