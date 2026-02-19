import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Check, X, Eye } from "lucide-react";
import { DEFAULT_WORD_COUNTS, SECTION_RANGES, SECTION_DESCRIPTIONS, SectionName } from "@/lib/lessonPrompts";
import { sanitizeHtml } from "@/lib/sanitize";
import { useGenerationJob, GenerationJobProgress, type JobConfig } from "@/features/content-editor";

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
  const [targetWords, setTargetWords] = useState<number>(DEFAULT_WORD_COUNTS[sectionName]);
  const [additionalContext, setAdditionalContext] = useState("");
  // pendingContent holds the generated result awaiting user approval (preview-before-apply)
  const [pendingContent, setPendingContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const hasExistingContent = currentContent && currentContent.trim().length > 0;

  // Called when the background job completes — store result for user preview
  const handleJobComplete = useCallback((result: Record<string, any> | null) => {
    if (!result) return;
    const content = result[sectionName];
    if (content) {
      setPendingContent(content);
      setShowPreview(true); // Auto-show preview when content arrives
    }
  }, [sectionName]);

  const {
    activeJob,
    existingJob,
    isGenerating,
    isPending,
    progress,
    progressPercentage,
    currentSection: activeSection,
    startJob,
    cancelJob,
    resumeJob,
    canResume,
  } = useGenerationJob({
    lessonId: lesson?.id || '',
    onJobComplete: handleJobComplete,
  });

  // Scope isGenerating and canResume to only this section's jobs.
  // Prevents all 5 SectionGenerators from appearing disabled when one section is running.
  const isOwnJob = (job: typeof activeJob | typeof existingJob) =>
    !!job?.config?.selectedSections?.includes(sectionName);

  const isThisSectionGenerating = isGenerating && isOwnJob(activeJob);
  const canResumeThisSection = canResume && isOwnJob(existingJob);

  const handleGenerate = () => {
    if (!lesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }
    // Clear any previous pending content before starting a new job
    setPendingContent("");
    setShowPreview(false);

    const config: JobConfig = {
      selectedSections: [sectionName],
      // Pass per-section word count; other sections default via DEFAULT_WORD_COUNTS in the edge fn
      wordCounts: { ...DEFAULT_WORD_COUNTS, [sectionName]: targetWords },
      generateQuiz: false,
      generateVideos: false,
      generateAudio: false,
      imageGenerationModel: 'none',
      globalContext: additionalContext || undefined,
    };
    startJob(config);
  };

  const handleApply = () => {
    if (pendingContent) {
      // Write generated content to parent's lessonData — user still saves explicitly via "Enregistrer"
      onContentGenerated(pendingContent);
      toast.success("Contenu appliqué");
      setIsOpen(false);
      setPendingContent("");
      setShowPreview(false);
    }
  };

  const handleDiscard = () => {
    setPendingContent("");
    setShowPreview(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset preview state when closing — generation job continues in background
        setPendingContent("");
        setShowPreview(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            if (!lesson) {
              toast.error("Aucune leçon sélectionnée — veuillez sélectionner une leçon dans la liste");
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
              onClick={handleGenerate}
              disabled={isThisSectionGenerating || isPending}
              className="w-full"
            >
              {isThisSectionGenerating || isPending ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
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

          {/* System A job progress — only shown for this section's job */}
          {isThisSectionGenerating && (
            <GenerationJobProgress
              job={activeJob}
              progress={progress}
              currentSection={activeSection}
              progressPercentage={progressPercentage}
              onCancel={cancelJob}
            />
          )}

          {/* Resume banner — shown only when this section has a resumable job */}
          {canResumeThisSection && existingJob && !isThisSectionGenerating && (
            <GenerationJobProgress
              job={null}
              progress={existingJob.progress}
              currentSection={existingJob.current_section}
              progressPercentage={0}
              existingJob={existingJob}
              canResume={true}
              onResume={() => resumeJob(existingJob)}
            />
          )}

          {/* Generated Content Preview — shown when job completes and content is ready */}
          {pendingContent && (
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
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(pendingContent) }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleApply} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Appliquer
                </Button>
                <Button variant="outline" onClick={handleGenerate} disabled={isThisSectionGenerating || isPending}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Régénérer
                </Button>
                <Button variant="ghost" onClick={handleDiscard}>
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
