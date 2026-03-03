/**
 * ExamAdminPage - Unified admin interface for both 9AF and NS4 exams
 * Hardened pipeline: cached PDF URL, step indicator, retry logic
 */
import { useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, GraduationCap, RotateCcw } from "lucide-react";

import { TrackToggle } from "./components/TrackToggle";
import { SeriesMultiSelect } from "./components/SeriesMultiSelect";
import { PDFUploader, type ProcessingStep } from "./components/PDFUploader";
import { ExamPreviewCard } from "./components/ExamPreviewCard";
import { ExistingExamsList, type ExistingExam } from "./components/ExistingExamsList";
import { ExamDetailEditor } from "./components/ExamDetailEditor";
import { convertPdfToImages, uploadPdfToStorage, validatePdfFile, type PDFConversionProgress } from "./utils/pdfUtils";
import { saveExamWithExercises, updateExamFromReanalysis, type ParsedPreview } from "./utils/examSaveUtils";
import type { ExamTrack } from "../types/exam.types";

// Subject lists — single source of truth from shared constants
import { SUBJECTS_9AF, NS4_SUBJECTS_BY_SERIES as SUBJECTS_BY_SERIES } from "../constants/ns4Subjects";

const YEARS = Array.from({ length: 15 }, (_, i) => 2025 - i);

const SESSIONS = [
  { value: "principale", label: "Session Principale" },
  { value: "rattrapage", label: "Session de Rattrapage" },
];

export function ExamAdminPage() {
  // Form state
  const [track, setTrack] = useState<ExamTrack>('9AF');
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [session, setSession] = useState("principale");
  const [isModelExam, setIsModelExam] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reanalyzingExamId, setReanalyzingExamId] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cache state to avoid double upload and enable retry
  const cachedPdfUrlRef = useRef<string | null>(null);
  const cachedPageImagesRef = useRef<string[] | null>(null);
  const [canRetryAnalysis, setCanRetryAnalysis] = useState(false);

  // Trigger ExistingExamsList reload after successful save (avoids stale data)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Preview state
  const [parsedPreview, setParsedPreview] = useState<ParsedPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Editor state
  const [selectedExam, setSelectedExam] = useState<ExistingExam | null>(null);
  const [reanalyzeExamData, setReanalyzeExamData] = useState<ExistingExam | null>(null);

  // Dynamic subject list based on track/series
  const availableSubjects = useMemo(() => {
    if (track === '9AF') return SUBJECTS_9AF;
    if (selectedSeries.length > 0) {
      return SUBJECTS_BY_SERIES[selectedSeries[0]] || [];
    }
    return [];
  }, [track, selectedSeries]);

  // Reset form when track changes — pre-select all NS4 series for immediate usable list
  const handleTrackChange = useCallback((newTrack: ExamTrack) => {
    setTrack(newTrack);
    setSelectedSeries(newTrack === 'NS4' ? ["SMP", "SES", "SVT", "LLA"] : []);
    setSubject("");
    setSession("principale");
    setIsModelExam(false);
    setPdfFile(null);
    setParsedPreview(null);
    setShowPreview(false);
    cachedPdfUrlRef.current = null;
    cachedPageImagesRef.current = null;
    setCanRetryAnalysis(false);
  }, []);

  // Handle conversion progress
  const handleConversionProgress = useCallback((progress: PDFConversionProgress) => {
    setConversionProgress(progress.percent);
    setTotalPages(progress.totalPages);
  }, []);

  // Run only the AI analysis step (used for initial + retry)
  const runAiAnalysis = async (pageImages: string[]): Promise<any> => {
    setProcessingStep("analyzing");
    const { data: parsedData, error: parseError } = await supabase.functions.invoke(
      "parse-exam-vision",
      {
        body: {
          subject,
          year: isModelExam ? new Date().getFullYear() : parseInt(year),
          pageImages,
          gradeLevel: track,
          series: track === 'NS4' ? selectedSeries[0] : undefined,
        },
      }
    );

    if (parseError) throw new Error(parseError.message || "Erreur lors de l'analyse");
    if (parsedData.error) throw new Error(parsedData.error);
    return parsedData;
  };

  // Analyze and save a new exam
  const handleAnalyzeAndSave = async () => {
    // Validation
    if (track === 'NS4' && selectedSeries.length === 0) {
      toast.error("Veuillez sélectionner au moins une série");
      return;
    }
    if (!subject) {
      toast.error("Veuillez sélectionner une matière");
      return;
    }
    if (!year && !isModelExam) {
      toast.error("Veuillez sélectionner une année");
      return;
    }
    if (!pdfFile) {
      toast.error("Veuillez sélectionner un fichier PDF");
      return;
    }

    // Validate file
    const validationError = validatePdfFile(pdfFile);
    if (validationError) {
      toast.error(validationError.message);
      return;
    }

    setIsAnalyzing(true);
    setCanRetryAnalysis(false);

    try {
      // 1. Upload PDF (with progress)
      setProcessingStep("uploading");
      const pdfUrl = await uploadPdfToStorage(pdfFile, {
        track,
        subject,
        year: isModelExam ? new Date().getFullYear() : parseInt(year),
        series: selectedSeries[0],
        session,
        isModelExam,
      }, (progress) => setUploadProgress(progress.progress));

      if (!pdfUrl) {
        toast.error("Échec du téléversement du PDF");
        setIsAnalyzing(false);
        setProcessingStep("idle");
        return;
      }
      cachedPdfUrlRef.current = pdfUrl;

      // 2. Convert PDF to images
      setProcessingStep("converting");
      setIsConverting(true);
      const pageImages = await convertPdfToImages(pdfFile, handleConversionProgress);
      setIsConverting(false);

      if (pageImages.length === 0) {
        toast.error("Aucune page n'a pu être extraite du PDF");
        setIsAnalyzing(false);
        setProcessingStep("idle");
        return;
      }
      cachedPageImagesRef.current = pageImages;

      // 3. AI Analysis
      const parsedData = await runAiAnalysis(pageImages);

      // 4. Show preview
      setParsedPreview(parsedData);
      setShowPreview(true);
      setProcessingStep("idle");
      toast.success(`✅ ${parsedData.totalExercises} exercices détectés. Vérifiez l'aperçu.`);
    } catch (error: any) {
      console.error("Error analyzing exam:", error);
      toast.error(error.message || "Erreur lors de l'analyse");
      // Enable retry if we have cached images
      if (cachedPageImagesRef.current && cachedPageImagesRef.current.length > 0) {
        setCanRetryAnalysis(true);
      }
    } finally {
      setIsAnalyzing(false);
      setIsConverting(false);
      setProcessingStep("idle");
    }
  };

  // Retry only the AI analysis step
  const handleRetryAnalysis = async () => {
    const pageImages = cachedPageImagesRef.current;
    if (!pageImages || pageImages.length === 0) {
      toast.error("Aucune image en cache. Veuillez re-téléverser le PDF.");
      setCanRetryAnalysis(false);
      return;
    }

    setIsAnalyzing(true);
    setCanRetryAnalysis(false);

    try {
      const parsedData = await runAiAnalysis(pageImages);
      setParsedPreview(parsedData);
      setShowPreview(true);
      toast.success(`✅ ${parsedData.totalExercises} exercices détectés. Vérifiez l'aperçu.`);
    } catch (error: any) {
      console.error("Error retrying analysis:", error);
      toast.error(error.message || "Erreur lors de la ré-analyse");
      setCanRetryAnalysis(true);
    } finally {
      setIsAnalyzing(false);
      setProcessingStep("idle");
    }
  };

  // Confirm and save the parsed preview (no double upload!)
  const handleConfirmAndSave = async () => {
    if (!parsedPreview) return;

    setIsAnalyzing(true);
    setProcessingStep("saving");

    try {
      // Use cached PDF URL instead of re-uploading
      let pdfUrl = cachedPdfUrlRef.current;

      if (!pdfUrl && reanalyzeExamData) {
        pdfUrl = reanalyzeExamData.pdf_url;
      }

      if (!pdfUrl) {
        toast.error("Aucun PDF disponible");
        setIsAnalyzing(false);
        setProcessingStep("idle");
        return;
      }

      if (reanalyzeExamData) {
        const result = await updateExamFromReanalysis(reanalyzeExamData.id, parsedPreview);
        toast.success(`Examen ré-analysé: ${result.exerciseCount} exercices`);
      } else {
        const result = await saveExamWithExercises(
          {
            track,
            subject,
            year: isModelExam ? new Date().getFullYear() : parseInt(year),
            pdfUrl,
            series: selectedSeries[0],
            session,
            isModelExam,
          },
          parsedPreview
        );

        toast.success(
          result.isUpdate
            ? `Examen mis à jour: ${result.exerciseCount} exercices`
            : `Nouvel examen créé: ${result.exerciseCount} exercices`
        );
      }

      resetForm();
      // Increment to signal ExistingExamsList to reload without page remount
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error saving exam:", error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsAnalyzing(false);
      setProcessingStep("idle");
    }
  };

  // Re-analyze an existing exam
  const handleReanalyze = async (exam: ExistingExam) => {
    if (!exam.pdf_url) {
      toast.error("Cet examen n'a pas de PDF associé");
      return;
    }

    setReanalyzingExamId(exam.id);
    setReanalyzeExamData(exam);

    try {
      // 1. Fetch PDF
      setProcessingStep("uploading");
      toast.info("Téléchargement du PDF...");
      const response = await fetch(exam.pdf_url);
      if (!response.ok) {
        throw new Error("Impossible de télécharger le PDF");
      }
      const blob = await response.blob();
      const file = new File([blob], `${exam.subject}-${exam.year}.pdf`, { type: 'application/pdf' });

      // Cache the existing URL (no need to re-upload)
      cachedPdfUrlRef.current = exam.pdf_url;

      // 2. Convert to images
      setProcessingStep("converting");
      setIsConverting(true);
      const pageImages = await convertPdfToImages(file, handleConversionProgress);
      setIsConverting(false);

      if (pageImages.length === 0) {
        toast.error("Aucune page n'a pu être extraite du PDF");
        return;
      }
      cachedPageImagesRef.current = pageImages;

      // 3. AI Analysis
      setProcessingStep("analyzing");
      toast.info(`${pageImages.length} pages extraites. Analyse par IA en cours...`);
      const { data: parsedData, error: parseError } = await supabase.functions.invoke(
        "parse-exam-vision",
        {
          body: {
            subject: exam.subject,
            year: exam.year,
            pageImages,
            gradeLevel: exam.grade_level,
            series: exam.series,
          },
        }
      );

      if (parseError) throw new Error(parseError.message || "Erreur lors de l'analyse");
      if (parsedData.error) throw new Error(parsedData.error);

      // 4. Set form state from exam
      setTrack(exam.grade_level as ExamTrack);
      setSelectedSeries(exam.series ? [exam.series] : []);
      setSubject(exam.subject);
      setYear(exam.year.toString());
      setSession(exam.session || 'principale');
      setIsModelExam(exam.is_model_exam || false);

      // 5. Show preview
      setParsedPreview(parsedData);
      setShowPreview(true);
      toast.success(`✅ ${parsedData.totalExercises} exercices détectés`);
    } catch (error: any) {
      console.error("Error re-analyzing exam:", error);
      toast.error(error.message || "Erreur lors de la ré-analyse");
      setReanalyzeExamData(null);
      if (cachedPageImagesRef.current && cachedPageImagesRef.current.length > 0) {
        setCanRetryAnalysis(true);
      }
    } finally {
      setReanalyzingExamId(null);
      setIsConverting(false);
      setProcessingStep("idle");
    }
  };

  const resetForm = () => {
    setSubject("");
    setYear("");
    setSession("principale");
    setIsModelExam(false);
    setPdfFile(null);
    setParsedPreview(null);
    setShowPreview(false);
    setReanalyzeExamData(null);
    cachedPdfUrlRef.current = null;
    cachedPageImagesRef.current = null;
    setCanRetryAnalysis(false);
  };

  const handleCancelPreview = () => {
    setParsedPreview(null);
    setShowPreview(false);
    setReanalyzeExamData(null);
  };

  const handleEditExam = useCallback((exam: ExistingExam) => {
    setSelectedExam(exam);
  }, []);

  const handleBackFromEdit = useCallback(() => {
    setSelectedExam(null);
  }, []);

  // Show editor view when an exam is selected
  if (selectedExam) {
    return (
      <div className="space-y-6">
        <ExamDetailEditor
          exam={selectedExam}
          onBack={handleBackFromEdit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Gestion des Examens Officiels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Track Selector */}
          <div className="space-y-2">
            <Label>Type d'examen</Label>
            <TrackToggle value={track} onChange={handleTrackChange} />
          </div>

          {/* Series Selector (NS4 only) */}
          {track === 'NS4' && (
            <div className="space-y-2">
              <Label>Série(s)</Label>
              <SeriesMultiSelect
                value={selectedSeries}
                onChange={setSelectedSeries}
              />
            </div>
          )}

          {/* Subject, Year, Session selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.length === 0 ? (
                    // Guidance when no NS4 series is selected yet
                    <SelectItem value="__placeholder__" disabled>
                      Sélectionnez d'abord une série
                    </SelectItem>
                  ) : (
                    availableSubjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Année</Label>
              <Select value={year} onValueChange={setYear} disabled={isModelExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {track === 'NS4' && (
              <div className="space-y-2">
                <Label>Session</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Model exam toggle (NS4 only) */}
          {track === 'NS4' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="model-exam"
                checked={isModelExam}
                onCheckedChange={setIsModelExam}
              />
              <Label htmlFor="model-exam">
                Examen modèle (pas une année spécifique)
              </Label>
            </div>
          )}

          {/* PDF Upload */}
          <PDFUploader
            file={pdfFile}
            onChange={setPdfFile}
            isConverting={isConverting}
            conversionProgress={conversionProgress}
            totalPages={totalPages}
            processingStep={processingStep}
            uploadProgress={uploadProgress}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAnalyzeAndSave}
              disabled={isAnalyzing || isConverting}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Analyser et Sauvegarder
                </>
              )}
            </Button>

            {canRetryAnalysis && (
              <Button
                onClick={handleRetryAnalysis}
                disabled={isAnalyzing}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réessayer l'analyse
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {showPreview && parsedPreview && (
        <ExamPreviewCard
          preview={parsedPreview}
          onConfirm={handleConfirmAndSave}
          onCancel={handleCancelPreview}
          isLoading={isAnalyzing}
        />
      )}

      {/* Existing Exams List — refreshTrigger causes reload after each successful save */}
      <ExistingExamsList
        track={track}
        selectedSeries={selectedSeries}
        onReanalyze={handleReanalyze}
        reanalyzingExamId={reanalyzingExamId}
        onEditExam={handleEditExam}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
