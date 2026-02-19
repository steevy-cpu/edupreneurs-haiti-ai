/**
 * ExistingExamsList - Display and manage existing exams
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Eye, RefreshCw, Trash2, Loader2, FileText, BookOpen, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ExamTrack } from "../../types/exam.types";

interface ExistingExam {
  id: string;
  title: string;
  subject: string;
  year: number;
  total_exercises: number;
  total_points: number;
  pdf_url: string | null;
  grade_level: string;
  series?: string | null;
  session?: string | null;
  is_model_exam?: boolean | null;
  version_number?: number | null;
  reference_texts?: any[];
}

interface ExistingExamsListProps {
  track: ExamTrack;
  selectedSeries?: string[];
  onReanalyze: (exam: ExistingExam) => void;
  reanalyzingExamId?: string | null;
  onEditExam?: (exam: ExistingExam) => void;
  refreshTrigger?: number; // increments after each successful save to trigger reload
}

export function ExistingExamsList({ 
  track, 
  selectedSeries = [],
  onReanalyze,
  reanalyzingExamId,
  onEditExam,
  refreshTrigger = 0,
}: ExistingExamsListProps) {
  const [exams, setExams] = useState<ExistingExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [examToDelete, setExamToDelete] = useState<ExistingExam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-fetch when track, series filter, or save counter changes
  useEffect(() => {
    loadExams();
  }, [track, selectedSeries, refreshTrigger]);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("official_exams")
        .select("id, title, subject, year, total_exercises, total_points, pdf_url, grade_level, series, session, is_model_exam, version_number, reference_texts")
        .eq("grade_level", track)
        .order("year", { ascending: false });

      if (track === 'NS4' && selectedSeries.length > 0) {
        query = query.in("series", selectedSeries);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedData = (data || []).map(exam => ({
        ...exam,
        reference_texts: Array.isArray(exam.reference_texts) ? exam.reference_texts : []
      }));
      
      setExams(mappedData);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error("Erreur lors du chargement des examens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!examToDelete) return;
    
    setIsDeleting(true);
    try {
      // Delete exercises first
      await supabase
        .from("exam_exercises")
        .delete()
        .eq("exam_id", examToDelete.id);

      // Delete exam
      const { error } = await supabase
        .from("official_exams")
        .delete()
        .eq("id", examToDelete.id);

      if (error) throw error;

      toast.success("Examen supprimé avec succès");
      setExamToDelete(null);
      loadExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Aucun examen {track === '9AF' ? '9ème AF' : 'NS4'} trouvé
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Examens Existants ({exams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{exam.title}</span>
                      <Badge variant="outline">{exam.year}</Badge>
                      {exam.series && (
                        <Badge variant="secondary">{exam.series}</Badge>
                      )}
                      {exam.is_model_exam && (
                        <Badge variant="secondary">Modèle</Badge>
                      )}
                      {exam.version_number && exam.version_number > 1 && (
                        <Badge variant="outline">v{exam.version_number}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{exam.total_exercises} exercices</span>
                      <span>{exam.total_points} pts</span>
                      {exam.reference_texts && exam.reference_texts.length > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {exam.reference_texts.length} texte(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEditExam && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditExam(exam)}
                        title="Modifier les exercices"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {exam.pdf_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(exam.pdf_url!, '_blank')}
                        title="Voir le PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReanalyze(exam)}
                      disabled={reanalyzingExamId === exam.id || !exam.pdf_url}
                      title="Ré-analyser"
                    >
                      {reanalyzingExamId === exam.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExamToDelete(exam)}
                      className="text-destructive hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet examen ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'examen "{examToDelete?.title}" et tous ses exercices seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export type { ExistingExam };
