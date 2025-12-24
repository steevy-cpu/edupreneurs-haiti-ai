import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle2, Trash2, Eye, RefreshCw, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { normalizeToSlug } from "@/lib/slugNormalization";
import * as pdfjsLib from "pdfjs-dist";
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

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ExistingExam {
  id: string;
  title: string;
  subject: string;
  year: number;
  total_exercises: number;
  total_points: number;
  pdf_url: string | null;
  grade_level: string;
  series: string | null;
  session: string | null;
  is_model_exam: boolean | null;
  version_number: number | null;
  reference_texts?: any[];
}

interface ParsedExercise {
  exerciseNumber: number;
  exerciseType: string;
  questionText: string;
  options: any;
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
  concept: string;
}

const SERIES = [
  { value: "SMP", label: "Sciences-Maths-Physique (SMP)" },
  { value: "SES", label: "Sciences Économiques et Sociales (SES)" },
  { value: "SVT", label: "Sciences de la Vie et de la Terre (SVT)" },
  { value: "LLA", label: "Lettres, Langues et Arts (LLA)" },
];

const SUBJECTS_BY_SERIES: Record<string, string[]> = {
  SMP: ["Mathématiques", "Physique", "Chimie", "Philosophie", "Français", "Anglais"],
  SES: ["Sciences Économiques", "Sociologie", "Mathématiques", "Philosophie", "Français", "Anglais"],
  SVT: ["SVT", "Chimie", "Physique", "Mathématiques", "Philosophie", "Français", "Anglais"],
  LLA: ["Littérature", "Langues", "Philosophie", "Histoire-Géographie", "Français", "Anglais"],
};

const YEARS = Array.from({ length: 11 }, (_, i) => 2025 - i);

const SESSIONS = [
  { value: "principale", label: "Session Principale" },
  { value: "rattrapage", label: "Session de Rattrapage" },
];

export function BaccExamManager() {
  const [series, setSeries] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [session, setSession] = useState("principale");
  const [isModelExam, setIsModelExam] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [existingExams, setExistingExams] = useState<ExistingExam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [reanalyzingExamId, setReanalyzingExamId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<ExistingExam | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    totalExercises: number;
    totalPoints: number;
    exercises: ParsedExercise[];
    referenceTexts?: { section?: string; title?: string; text: string }[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reanalyzeExamData, setReanalyzeExamData] = useState<ExistingExam | null>(null);

  useEffect(() => {
    loadExistingExams();
  }, [series]);

  const loadExistingExams = async () => {
    try {
      setIsLoadingExams(true);
      let query = supabase
        .from("official_exams")
        .select("id, title, subject, year, total_exercises, total_points, pdf_url, grade_level, series, session, is_model_exam, version_number, reference_texts")
        .eq("grade_level", "NS4")
        .order("year", { ascending: false });

      if (series) {
        query = query.eq("series", series);
      }

      const { data, error } = await query;

      if (error) throw error;
      const mappedData = (data || []).map(exam => ({
        ...exam,
        reference_texts: Array.isArray(exam.reference_texts) ? exam.reference_texts : []
      }));
      setExistingExams(mappedData);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error("Erreur lors du chargement des examens");
    } finally {
      setIsLoadingExams(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setParsedPreview(null);
      setShowPreview(false);
      toast.success(`PDF "${file.name}" sélectionné`);
    } else {
      toast.error("Veuillez sélectionner un fichier PDF valide");
    }
  };

  const uploadPdfToStorage = async (): Promise<string | null> => {
    if (!pdfFile) return null;

    try {
      setIsUploading(true);
      const safeSubjectSlug = normalizeToSlug(subject || "examen");
      const safeSeriesSlug = normalizeToSlug(series || "bac");
      const sessionSuffix = session === "rattrapage" ? "-rattrapage" : "";
      const modelSuffix = isModelExam ? "-modele" : "";
      const fileName = `bac-${safeSeriesSlug}-${safeSubjectSlug}-${year}${sessionSuffix}${modelSuffix}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("exam-documents")
        .upload(fileName, pdfFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("exam-documents")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Erreur lors du téléversement du PDF");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    setIsConvertingPdf(true);
    setConversionProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      const images: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          // @ts-ignore - canvas property is optional in newer versions
        }).promise;

        const dataUrl = canvas.toDataURL("image/png", 0.95);
        images.push(dataUrl);
        setConversionProgress(Math.round((pageNum / numPages) * 100));
      }

      return images;
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      throw new Error("Erreur lors de la conversion du PDF en images");
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const handleReanalyzeExam = async (exam: ExistingExam) => {
    if (!exam.pdf_url) {
      toast.error("Cet examen n'a pas de PDF associé");
      return;
    }

    setReanalyzingExamId(exam.id);
    setReanalyzeExamData(exam);

    try {
      toast.info("Téléchargement du PDF...");
      const response = await fetch(exam.pdf_url);
      if (!response.ok) {
        throw new Error("Impossible de télécharger le PDF");
      }
      const blob = await response.blob();
      const file = new File([blob], `${exam.subject}-${exam.year}.pdf`, { type: 'application/pdf' });

      toast.info("Conversion du PDF en images...");
      const pageImages = await convertPdfToImages(file);

      if (pageImages.length === 0) {
        toast.error("Aucune page n'a pu être extraite du PDF");
        return;
      }

      toast.info(`${pageImages.length} pages extraites. Analyse par IA en cours...`);
      const { data: parsedData, error: parseError } = await supabase.functions.invoke(
        "parse-exam-vision",
        {
          body: {
            subject: exam.subject,
            year: exam.year,
            pageImages,
            gradeLevel: "NS4",
            series: exam.series,
          },
        }
      );

      if (parseError) {
        throw new Error(parseError.message || "Erreur lors de l'analyse");
      }

      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      setSeries(exam.series || "");
      setSubject(exam.subject);
      setYear(exam.year.toString());
      setSession(exam.session || "principale");
      setIsModelExam(exam.is_model_exam || false);
      setParsedPreview(parsedData);
      setShowPreview(true);
      toast.success(`✅ ${parsedData.totalExercises} exercices et ${parsedData.referenceTexts?.length || 0} textes de référence détectés`);
    } catch (error: any) {
      console.error("Error re-analyzing exam:", error);
      toast.error(error.message || "Erreur lors de la ré-analyse");
      setReanalyzeExamData(null);
    } finally {
      setReanalyzingExamId(null);
    }
  };

  const handleConfirmReanalyze = async () => {
    if (!parsedPreview || !reanalyzeExamData) return;

    setIsAnalyzing(true);

    try {
      const { error: updateError } = await supabase
        .from("official_exams")
        .update({
          title: parsedPreview.title,
          total_exercises: parsedPreview.totalExercises || parsedPreview.exercises.length,
          total_points: parsedPreview.totalPoints || 100,
          reference_texts: parsedPreview.referenceTexts || [],
        })
        .eq("id", reanalyzeExamData.id);

      if (updateError) throw updateError;

      await supabase
        .from("exam_exercises")
        .delete()
        .eq("exam_id", reanalyzeExamData.id);

      const uniqueExercises = parsedPreview.exercises.reduce((acc: any[], ex: any) => {
        if (!acc.some((e) => e.exerciseNumber === ex.exerciseNumber)) {
          acc.push(ex);
        }
        return acc;
      }, []);

      const exercisesToInsert = uniqueExercises.map((ex: any) => ({
        exam_id: reanalyzeExamData.id,
        exercise_number: ex.exerciseNumber,
        exercise_type: ex.exerciseType,
        question_text: ex.questionText,
        options: ex.options || null,
        correct_answer: ex.correctAnswer || null,
        explanation: ex.explanation || null,
        points: typeof ex.points === "number" && Number.isFinite(ex.points) ? ex.points : 5,
        concept: ex.concept || "Général",
      }));

      const { error: exercisesError } = await supabase
        .from("exam_exercises")
        .upsert(exercisesToInsert, { onConflict: "exam_id,exercise_number" });

      if (exercisesError) throw exercisesError;

      const { count: actualCount } = await supabase
        .from("exam_exercises")
        .select("*", { count: "exact", head: true })
        .eq("exam_id", reanalyzeExamData.id);

      await supabase
        .from("official_exams")
        .update({ total_exercises: actualCount || 0 })
        .eq("id", reanalyzeExamData.id);

      toast.success(`Examen ré-analysé avec succès: ${actualCount} exercices`);

      resetForm();
      loadExistingExams();
    } catch (error: any) {
      console.error("Error saving re-analyzed exam:", error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAndSave = async () => {
    if (!series || !subject || (!year && !isModelExam)) {
      toast.error("Veuillez sélectionner une série, une matière et une année");
      return;
    }

    if (!pdfFile) {
      toast.error("Veuillez sélectionner un fichier PDF avant de continuer");
      return;
    }

    setIsAnalyzing(true);

    try {
      toast.info("Téléversement du PDF...");
      const pdfUrl = await uploadPdfToStorage();

      if (!pdfUrl) {
        toast.error("Échec du téléversement du PDF. Veuillez réessayer.");
        setIsAnalyzing(false);
        return;
      }

      toast.info("Conversion du PDF en images haute résolution...");
      const pageImages = await convertPdfToImages(pdfFile);

      if (pageImages.length === 0) {
        toast.error("Aucune page n'a pu être extraite du PDF");
        setIsAnalyzing(false);
        return;
      }

      toast.info(`${pageImages.length} pages extraites. Analyse par IA en cours...`);

      const { data: parsedData, error: parseError } = await supabase.functions.invoke(
        "parse-exam-vision",
        {
          body: {
            subject,
            year: isModelExam ? new Date().getFullYear() : parseInt(year),
            pageImages,
            gradeLevel: "NS4",
            series,
          },
        }
      );

      if (parseError) {
        console.error("Parse error:", parseError);
        throw new Error(parseError.message || "Erreur lors de l'analyse");
      }

      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      setParsedPreview(parsedData);
      setShowPreview(true);
      setIsAnalyzing(false);
      toast.success(`✅ ${parsedData.totalExercises} exercices détectés. Vérifiez l'aperçu ci-dessous.`);
    } catch (error: any) {
      console.error("Error analyzing exam:", error);
      toast.error(error.message || "Erreur lors de l'analyse");
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!parsedPreview) return;

    setIsAnalyzing(true);

    try {
      const pdfUrl = await uploadPdfToStorage();

      if (!pdfUrl) {
        toast.error("Échec du téléversement du PDF. Veuillez réessayer.");
        setIsAnalyzing(false);
        return;
      }

      // Check for existing exam with same criteria
      const { data: existingExam } = await supabase
        .from("official_exams")
        .select("id, version_number")
        .eq("subject", subject)
        .eq("year", isModelExam ? new Date().getFullYear() : parseInt(year))
        .eq("grade_level", "NS4")
        .eq("series", series)
        .eq("session", session)
        .eq("is_model_exam", isModelExam)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      let examId: string;
      const nextVersion = existingExam ? (existingExam.version_number || 1) + 1 : 1;

      const examTitle = isModelExam 
        ? `Modèle - ${subject} ${series}` 
        : `${subject} ${series} ${year} ${session === "rattrapage" ? "(Rattrapage)" : ""}`;

      // Always create a new exam (allowing multiple versions)
      const { data: newExam, error: examError } = await supabase
        .from("official_exams")
        .insert({
          title: parsedPreview.title || examTitle,
          subject,
          year: isModelExam ? new Date().getFullYear() : parseInt(year),
          grade_level: "NS4",
          series,
          session,
          is_model_exam: isModelExam,
          version_number: nextVersion,
          total_exercises: parsedPreview.totalExercises || parsedPreview.exercises.length,
          total_points: parsedPreview.totalPoints || 100,
          pdf_url: pdfUrl,
          reference_texts: parsedPreview.referenceTexts || [],
        })
        .select()
        .single();

      if (examError) throw examError;
      examId = newExam.id;

      toast.success(existingExam ? `Nouvelle version (v${nextVersion}) créée` : "Nouvel examen créé avec succès");

      // Insert exercises
      const uniqueExercises = parsedPreview.exercises.reduce((acc: any[], ex: any) => {
        if (!acc.some((e) => e.exerciseNumber === ex.exerciseNumber)) {
          acc.push(ex);
        }
        return acc;
      }, []);

      const exercisesToInsert = uniqueExercises.map((ex: any) => ({
        exam_id: examId,
        exercise_number: ex.exerciseNumber,
        exercise_type: ex.exerciseType,
        question_text: ex.questionText,
        options: ex.options || null,
        correct_answer: ex.correctAnswer || null,
        explanation: ex.explanation || null,
        points: typeof ex.points === "number" && Number.isFinite(ex.points) ? ex.points : 5,
        concept: ex.concept || "Général",
      }));

      const { error: exercisesError } = await supabase
        .from("exam_exercises")
        .upsert(exercisesToInsert, { onConflict: "exam_id,exercise_number" });

      if (exercisesError) throw exercisesError;

      const { count: actualCount } = await supabase
        .from("exam_exercises")
        .select("*", { count: "exact", head: true })
        .eq("exam_id", examId);

      await supabase
        .from("official_exams")
        .update({ total_exercises: actualCount || 0 })
        .eq("id", examId);

      toast.success(`${actualCount} exercices enregistrés avec succès`);

      resetForm();
      loadExistingExams();
    } catch (error: any) {
      console.error("Error saving exam:", error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;

    try {
      await supabase.from("exam_exercises").delete().eq("exam_id", examToDelete.id);
      await supabase.from("official_exams").delete().eq("id", examToDelete.id);

      toast.success("Examen supprimé avec succès");
      setExamToDelete(null);
      loadExistingExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setSubject("");
    setYear("");
    setPdfFile(null);
    setParsedPreview(null);
    setShowPreview(false);
    setReanalyzeExamData(null);
  };

  const availableSubjects = series ? SUBJECTS_BY_SERIES[series] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <GraduationCap className="h-8 w-8 text-amber-500" />
            Gestion des Examens Baccalauréat NS4
          </CardTitle>
          <p className="text-muted-foreground">
            Uploadez et gérez les examens officiels et modèles du Baccalauréat
          </p>
        </CardHeader>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Ajouter un nouvel examen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Series */}
            <div className="space-y-2">
              <Label htmlFor="series">Série *</Label>
              <Select value={series} onValueChange={(val) => { setSeries(val); setSubject(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une série" />
                </SelectTrigger>
                <SelectContent>
                  {SERIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Matière *</Label>
              <Select value={subject} onValueChange={setSubject} disabled={!series}>
                <SelectTrigger>
                  <SelectValue placeholder={series ? "Sélectionner une matière" : "Choisir une série d'abord"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
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

            {/* Model Exam Toggle */}
            <div className="space-y-2">
              <Label>Type d'examen</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  checked={isModelExam} 
                  onCheckedChange={setIsModelExam}
                />
                <Label className="text-sm">
                  {isModelExam ? "Modèle d'examen" : "Examen officiel"}
                </Label>
              </div>
            </div>

            {/* Year - only shown if not model exam */}
            {!isModelExam && (
              <div className="space-y-2">
                <Label htmlFor="year">Année *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'année" />
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
            )}

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label htmlFor="pdf">Fichier PDF *</Label>
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="cursor-pointer"
              />
              {pdfFile && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {pdfFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Conversion Progress */}
          {isConvertingPdf && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Conversion des pages en images... ({conversionProgress}%)
              </div>
              <Progress value={conversionProgress} />
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleAnalyzeAndSave}
            disabled={!series || !subject || (!year && !isModelExam) || !pdfFile || isAnalyzing || isConvertingPdf}
            className="w-full md:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyser et prévisualiser
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && parsedPreview && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu des exercices détectés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Titre</p>
                <p className="font-semibold">{parsedPreview.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exercices</p>
                <p className="font-semibold">{parsedPreview.exercises.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points totaux</p>
                <p className="font-semibold">{parsedPreview.totalPoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Textes de référence</p>
                <p className="font-semibold">{parsedPreview.referenceTexts?.length || 0}</p>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {parsedPreview.exercises.slice(0, 5).map((ex, idx) => (
                <div key={idx} className="p-3 border rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">Ex. {ex.exerciseNumber}</Badge>
                    <Badge>{ex.exerciseType}</Badge>
                    <span className="text-muted-foreground">{ex.points} pts</span>
                  </div>
                  <p className="line-clamp-2">{ex.questionText}</p>
                </div>
              ))}
              {parsedPreview.exercises.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  + {parsedPreview.exercises.length - 5} autres exercices
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={reanalyzeExamData ? handleConfirmReanalyze : handleConfirmAndSave} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {reanalyzeExamData ? "Confirmer la ré-analyse" : "Confirmer et sauvegarder"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Examens existants ({existingExams.length})</span>
            <Button variant="outline" size="sm" onClick={loadExistingExams}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingExams ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : existingExams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun examen NS4 trouvé. Commencez par en ajouter un!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{exam.subject}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exam.series && <Badge variant="outline">{exam.series}</Badge>}
                        <Badge variant="secondary">{exam.year}</Badge>
                        {exam.is_model_exam && <Badge className="bg-amber-500">Modèle</Badge>}
                        {exam.session === "rattrapage" && <Badge variant="destructive">Rattrapage</Badge>}
                        {(exam.version_number || 1) > 1 && (
                          <Badge variant="outline">v{exam.version_number}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {exam.total_exercises} exercices • {exam.total_points} pts
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReanalyzeExam(exam)}
                      disabled={reanalyzingExamId === exam.id}
                    >
                      {reanalyzingExamId === exam.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    {exam.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(exam.pdf_url!, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setExamToDelete(exam)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet examen?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'examen "{examToDelete?.subject} {examToDelete?.year}"?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}