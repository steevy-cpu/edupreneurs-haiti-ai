import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { normalizeToSlug } from "@/lib/slugNormalization";

interface ExistingExam {
  id: string;
  title: string;
  subject: string;
  year: number;
  total_exercises: number;
  total_points: number;
  pdf_url: string | null;
  grade_level: string;
}

const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Sciences Expérimentales",
  "Sciences Sociales",
  "Anglais",
  "Espagnol",
  "Créole",
];

const YEARS = Array.from({ length: 15 }, (_, i) => 2025 - i);

export function ExamManager() {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [existingExams, setExistingExams] = useState<ExistingExam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  useEffect(() => {
    loadExistingExams();
  }, []);

  const loadExistingExams = async () => {
    try {
      const { data, error } = await supabase
        .from("official_exams")
        .select("*")
        .eq("grade_level", "9AF")
        .order("year", { ascending: false });

      if (error) throw error;
      setExistingExams(data || []);
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
      const fileName = `${safeSubjectSlug}-${year}-9af.pdf`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("exam-documents")
        .upload(filePath, pdfFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("exam-documents")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Erreur lors du téléversement du PDF");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeAndSave = async () => {
    if (!subject || !year) {
      toast.error("Veuillez sélectionner une matière et une année");
      return;
    }

    if (!pdfFile) {
      toast.error("Veuillez sélectionner un fichier PDF avant de continuer");
      return;
    }

    if (!extractedText.trim()) {
      toast.error("Veuillez coller le texte extrait du PDF");
      return;
    }

    if (extractedText.trim().length < 200) {
      toast.error("Le texte semble trop court. Veuillez coller le contenu complet de l'examen.");
      return;
    }

    setIsAnalyzing(true);

    try {
      // 1. Upload PDF first
      const pdfUrl = await uploadPdfToStorage();
      
      if (!pdfUrl) {
        toast.error("Échec du téléversement du PDF. Veuillez réessayer.");
        setIsAnalyzing(false);
        return;
      }

      // 2. Parse the extracted text using AI
      const { data: parsedData, error: parseError } = await supabase.functions.invoke(
        "parse-exam-text",
        {
          body: {
            subject,
            year: parseInt(year),
            extractedText,
          },
        }
      );

      if (parseError) throw parseError;

      // 3. Check if exam already exists
      const { data: existingExam } = await supabase
        .from("official_exams")
        .select("id")
        .eq("subject", subject)
        .eq("year", parseInt(year))
        .eq("grade_level", "9AF")
        .maybeSingle();

      let examId: string;

      if (existingExam) {
        // Update existing exam
        const { error: updateError } = await supabase
          .from("official_exams")
          .update({
            title: parsedData.title,
            total_exercises: parsedData.totalExercises,
            total_points: parsedData.totalPoints,
            pdf_url: pdfUrl,
          })
          .eq("id", existingExam.id);

        if (updateError) throw updateError;

        // Delete old exercises
        await supabase
          .from("exam_exercises")
          .delete()
          .eq("exam_id", existingExam.id);

        examId = existingExam.id;
        toast.success("Examen mis à jour avec succès");
      } else {
        // Create new exam
        const { data: newExam, error: examError } = await supabase
          .from("official_exams")
          .insert({
            title: parsedData.title,
            subject,
            year: parseInt(year),
            grade_level: "9AF",
            total_exercises: parsedData.totalExercises,
            total_points: parsedData.totalPoints,
            pdf_url: pdfUrl,
          })
          .select()
          .single();

        if (examError) throw examError;
        examId = newExam.id;
        toast.success("Nouvel examen créé avec succès");
      }

      // 4. Insert exercises (deduplicate by exerciseNumber to avoid constraint errors)
      const uniqueExercises = parsedData.exercises.reduce((acc: any[], ex: any) => {
        if (!acc.some((e) => e.exerciseNumber === ex.exerciseNumber)) {
          acc.push(ex);
        } else {
          console.warn(
            "Duplicate exerciseNumber detected, skipping duplicate:",
            ex.exerciseNumber
          );
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
        points: ex.points,
        concept: ex.concept,
      }));

      const { error: exercisesError } = await supabase
        .from("exam_exercises")
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      toast.success(
        `${parsedData.totalExercises} exercices enregistrés avec succès`
      );

      // 5. Reset form and reload
      setSubject("");
      setYear("");
      setPdfFile(null);
      setExtractedText("");
      loadExistingExams();
    } catch (error: any) {
      console.error("Error analyzing and saving exam:", error);
      toast.error(error.message || "Erreur lors de l'analyse et de l'enregistrement");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteExam = async (examId: string, examTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${examTitle}" ?`)) {
      return;
    }

    try {
      // Delete exercises first
      await supabase.from("exam_exercises").delete().eq("exam_id", examId);

      // Delete exam
      const { error } = await supabase
        .from("official_exams")
        .delete()
        .eq("id", examId);

      if (error) throw error;

      toast.success("Examen supprimé avec succès");
      loadExistingExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Erreur lors de la suppression de l'examen");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Exam Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Ajouter un nouvel examen officiel 9AF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matière *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Année *</Label>
              <Select value={year} onValueChange={setYear}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf-upload">PDF de l'examen</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="flex-1"
              />
              {pdfFile && (
                <Badge variant="secondary" className="whitespace-nowrap">
                  {pdfFile.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extracted-text">
              Texte extrait du PDF * (copier-coller)
            </Label>
            <Textarea
              id="extracted-text"
              placeholder="Collez ici le contenu textuel complet de l'examen..."
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {extractedText.length} caractères
            </p>
          </div>

          <Button
            onClick={handleAnalyzeAndSave}
            disabled={
              isAnalyzing ||
              isUploading ||
              !subject ||
              !year ||
              !extractedText.trim()
            }
            className="w-full"
            size="lg"
          >
            {isAnalyzing || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Téléversement PDF..." : "Analyse en cours..."}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyser et Sauvegarder
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Examens officiels 9AF existants</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingExams ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : existingExams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun examen enregistré pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {existingExams.map((exam) => (
                <Card key={exam.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{exam.title}</h4>
                          {exam.pdf_url ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{exam.subject}</Badge>
                          <Badge variant="outline">{exam.year}</Badge>
                          <Badge variant="secondary">
                            {exam.total_exercises} exercices
                          </Badge>
                          <Badge variant="secondary">
                            {exam.total_points} points
                          </Badge>
                          {exam.pdf_url ? (
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                              PDF disponible
                            </Badge>
                          ) : (
                            <Badge variant="destructive">PDF manquant</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExam(exam.id, exam.title)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
