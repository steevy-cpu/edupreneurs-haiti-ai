/**
 * @file BatchGenerationValidation.tsx
 * @description Orchestrator for batch content generation and validation.
 * Delegates all logic to extracted hooks and renders sub-components.
 * Owns fetchLessons (shared by generation + validation), confirmation dialog state,
 * and the top-level tab layout.
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";
import type { GenerationStatus } from "@/types/batch-generation.types";

// Hooks
import { useBatchFilters } from "@/features/content-editor/hooks/useBatchFilters";
import { useBatchGeneration } from "@/features/content-editor/hooks/useBatchGeneration";
import { useBatchValidation } from "@/features/content-editor/hooks/useBatchValidation";
import { useBatchRegeneration } from "@/features/content-editor/hooks/useBatchRegeneration";
import { useBatchPublishing } from "@/features/content-editor/hooks/useBatchPublishing";

// Components
import { BatchFiltersCard } from "@/features/content-editor/components/BatchFiltersCard";
import { GenerationTabContent } from "@/features/content-editor/components/GenerationTabContent";
import { ValidationTabContent } from "@/features/content-editor/components/ValidationTabContent";
import { GenerationPreviewDialog } from "@/features/content-editor/components/GenerationPreviewDialog";
import { RegenerationPreviewDialog } from "@/features/content-editor/components/RegenerationPreviewDialog";

export const BatchGenerationValidation = () => {
  // === LOCAL ORCHESTRATOR STATE ===
  const [activeInnerTab, setActiveInnerTab] = useState<'generation' | 'validation'>('generation');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'generate' | 'validate' | 'generateThenValidate' | null>(null);
  const [pendingLessonCount, setPendingLessonCount] = useState(0);
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Generation option states (shared between options UI and generation hook)
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [generateQuiz, setGenerateQuiz] = useState(false);
  const [generateVideos, setGenerateVideos] = useState(false);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [imageGenerationModel, setImageGenerationModel] = useState<'none' | 'openai' | 'lovable'>('none');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");

  // Section definitions for options UI
  const sections: { value: SectionName; label: string }[] = [
    { value: "objectif", label: "Objectif" },
    { value: "introduction", label: "Introduction" },
    { value: "contenu", label: "Contenu principal" },
    { value: "exemples_exercices", label: "Exemples & Exercices" },
    { value: "activites_interactives", label: "Activités Interactives" },
  ];

  // Section labels for preview dialog
  const sectionLabels: Record<string, string> = {
    objectif: 'Objectif', introduction: 'Introduction',
    contenu: 'Contenu principal', exemples_exercices: 'Exemples & Exercices',
    activites_interactives: 'Activités Interactives', quiz_final: 'Quiz Final',
  };

  // === HOOKS ===
  const filters = useBatchFilters();

  /** Fetch lessons based on current filters — shared by generation + validation hooks */
  const fetchLessons = useCallback(async () => {
    try {
      if (filters.selectedLessonIds.length > 0) {
        const { data, error } = await supabase.from('lessons')
          .select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name)')
          .in('id', filters.selectedLessonIds);
        if (error) { toast.error("Erreur: " + error.message); return []; }
        return data || [];
      }
      let query = supabase.from('lessons').select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name, series)');
      if (filters.gradeLevel !== "all") query = query.eq('grade_level', filters.gradeLevel);
      if (filters.subject !== "all") query = query.eq('subject_id', filters.subject);
      // Server-side filter: only fetch lessons with empty sections when onlyEmpty is active
      if (onlyEmpty && filters.selectedLessonIds.length === 0 && selectedSections.length > 0) {
        const orClauses = selectedSections.map(s => `${s}.is.null,${s}.eq.`).join(',');
        query = query.or(orClauses);
      }
      const { data, error } = await query.limit(2000);
      if (error) { toast.error("Erreur: " + error.message); return []; }
      let filteredData = data || [];
      if (filteredData.length >= 2000) toast.warning("Plus de 2000 leçons correspondent. Affinez vos filtres.");
      // Client-side series filter for NS3/NS4
      if (filters.isNS3OrNS4 && filters.series.length > 0 && filters.subject === "all") {
        filteredData = filteredData.filter(l => l.subjects && filters.series.includes((l.subjects as any).series));
      }
      return filteredData;
    } catch (error: any) { toast.error("Erreur inattendue: " + error.message); return []; }
  }, [filters.selectedLessonIds, filters.gradeLevel, filters.subject, filters.series, filters.isNS3OrNS4, onlyEmpty, selectedSections]);

  const generation = useBatchGeneration({
    fetchLessons, selectedSections, generateQuiz, generateVideos,
    generateAudio, imageGenerationModel, onlyEmpty, wordCounts, globalContext, setActiveInnerTab,
  });

  const validation = useBatchValidation({
    gradeLevel: filters.gradeLevel, subject: filters.subject, series: filters.series,
    isNS3OrNS4: filters.isNS3OrNS4, startGeneration: generation.startGeneration,
    setActiveInnerTab, fetchLessons,
  });

  const regeneration = useBatchRegeneration({
    allLessons: generation.allLessons, lessonStatuses: generation.lessonStatuses,
    validations: validation.validations, setValidations: validation.setValidations,
    generateLessonSections: generation.generateLessonSections,
  });

  const publishing = useBatchPublishing({ validations: validation.validations });

  // === CONFIRMATION DIALOG HANDLER ===
  const handleConfirmAction = async () => {
    setShowConfirmDialog(false);
    if (pendingAction === 'generate') await generation.startGeneration();
    else if (pendingAction === 'validate') await validation.runValidation();
    else if (pendingAction === 'generateThenValidate') await validation.generateThenValidate();
    setPendingAction(null);
    setPendingLessonCount(0);
  };

  /** Wraps handleStartGeneration to show confirmation for large batches */
  const onStartGeneration = async () => {
    const result = await generation.handleStartGeneration();
    if (result?.needsConfirmation) {
      setPendingLessonCount(result.lessonCount);
      setPendingAction('generate');
      setShowConfirmDialog(true);
    }
  };

  const onGenerateThenValidate = async () => {
    const result = await validation.handleGenerateThenValidate();
    if (result?.needsConfirmation) {
      setPendingLessonCount(result.lessonCount);
      setPendingAction('generateThenValidate');
      setShowConfirmDialog(true);
    }
  };

  const handlePreviewLesson = useCallback((lesson: any) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
  }, []);

  const progress = generation.totalLessons > 0 ? (generation.completedCount / generation.totalLessons) * 100 : 0;

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const toggleSection = (section: SectionName) => {
    setSelectedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  // === RENDER ===
  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'opération</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de {pendingAction === 'generate' ? 'générer du contenu' : pendingAction === 'validate' ? 'valider' : 'générer et valider'} pour <strong>{pendingLessonCount}</strong> leçons.
              {pendingLessonCount >= 50 && (
                <span className="block mt-2 text-warning">⚠️ Attention: Cette opération peut prendre du temps et être limitée par le rate limiting.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
            <Button onClick={handleConfirmAction}>Continuer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generation Preview Dialog */}
      <GenerationPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        previewLesson={previewLesson}
        sectionLabels={sectionLabels}
        onRegenerateSingleLesson={regeneration.handleRegenerateSingleLesson}
      />

      {/* Regeneration Preview Dialog */}
      <RegenerationPreviewDialog
        regenerationPreview={regeneration.regenerationPreview}
        onClose={() => regeneration.setRegenerationPreview(null)}
        onSave={regeneration.saveRegeneratedContent}
        isSaving={regeneration.isSavingRegeneration}
      />

      {/* Filters & Actions */}
      <BatchFiltersCard
        gradeLevel={filters.gradeLevel} setGradeLevel={filters.setGradeLevel}
        subject={filters.subject} setSubject={filters.setSubject}
        series={filters.series} setSeries={filters.setSeries}
        availableLessons={filters.availableLessons} availableSubjects={filters.availableSubjects}
        selectedLessonIds={filters.selectedLessonIds} setSelectedLessonIds={filters.setSelectedLessonIds}
        isLoadingLessons={filters.isLoadingLessons} isLoadingSubjects={filters.isLoadingSubjects}
        isNS3OrNS4={filters.isNS3OrNS4}
        isGenerating={generation.isGenerating} isValidating={validation.isValidating}
        isGeneratingThenValidating={validation.isGeneratingThenValidating}
        isPaused={generation.isPaused} setIsPaused={generation.setIsPaused}
        onStartGeneration={onStartGeneration} onRunValidation={validation.runValidation}
        onGenerateThenValidate={onGenerateThenValidate}
      />

      {/* Inner Tabs for Results */}
      <Tabs value={activeInnerTab} onValueChange={(v) => setActiveInnerTab(v as 'generation' | 'validation')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Génération {generation.lessonStatuses.length > 0 && `(${generation.completedCount}/${generation.totalLessons})`}
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Validation {validation.validations.length > 0 && `(${validation.validations.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generation">
          <GenerationTabContent
            sections={sections} selectedSections={selectedSections} toggleSection={toggleSection}
            generateQuiz={generateQuiz} setGenerateQuiz={setGenerateQuiz}
            generateVideos={generateVideos} setGenerateVideos={setGenerateVideos}
            generateAudio={generateAudio} setGenerateAudio={setGenerateAudio}
            imageGenerationModel={imageGenerationModel} setImageGenerationModel={setImageGenerationModel}
            onlyEmpty={onlyEmpty} setOnlyEmpty={setOnlyEmpty}
            wordCounts={wordCounts} setWordCounts={setWordCounts}
            globalContext={globalContext} setGlobalContext={setGlobalContext}
            totalLessons={generation.totalLessons} completedCount={generation.completedCount}
            progress={progress} lessonStatuses={generation.lessonStatuses}
            exportGenerationResults={generation.exportGenerationResults}
            handlePreviewLesson={handlePreviewLesson}
            handleRegenerateSingleLesson={regeneration.handleRegenerateSingleLesson}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="validation">
          <ValidationTabContent
            validations={validation.validations} validationStats={validation.validationStats}
            isValidating={validation.isValidating} expandedLessons={validation.expandedLessons}
            toggleExpanded={validation.toggleExpanded}
            regenerateQuiz={regeneration.regenerateQuiz} regenerateActivities={regeneration.regenerateActivities}
            isRegenerating={regeneration.isRegenerating}
            publishLesson={publishing.publishLesson} publishAllValidLessons={publishing.publishAllValidLessons}
            isPublishing={publishing.isPublishing} publishedLessons={publishing.publishedLessons}
            validLessonsCount={publishing.validLessonsCount}
            exportValidationCSV={validation.exportValidationCSV}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
