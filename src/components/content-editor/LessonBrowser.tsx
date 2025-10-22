import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Plus, Book, FileText, Trash2 } from "lucide-react";
import { CreateSubjectDialog } from "./CreateSubjectDialog";
import { CreateLessonDialog } from "./CreateLessonDialog";
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";

interface LessonBrowserProps {
  onSelectLesson: (lesson: any) => void;
  selectedLesson: any;
}

export const LessonBrowser = ({ onSelectLesson, selectedLesson }: LessonBrowserProps) => {
  const { canDelete } = useContentEditorPermissions();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchLessons(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessons = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error("Erreur lors du chargement des leçons");
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', deleteSubjectId);

      if (error) throw error;

      toast.success("Matière supprimée avec succès");
      fetchSubjects();
      if (selectedSubject === deleteSubjectId) {
        setSelectedSubject(null);
        setLessons([]);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error("Erreur lors de la suppression de la matière");
    } finally {
      setDeleteSubjectId(null);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', deleteLessonId);

      if (error) throw error;

      toast.success("Leçon supprimée avec succès");
      if (selectedSubject) {
        fetchLessons(selectedSubject);
      }
      if (selectedLesson?.id === deleteLessonId) {
        onSelectLesson(null);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error("Erreur lors de la suppression de la leçon");
    } finally {
      setDeleteLessonId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Matières
            </span>
            <Button size="sm" variant="ghost" onClick={() => setShowCreateSubject(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Chargement...</div>
            ) : subjects.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                Aucune matière disponible
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div 
                    key={subject.id}
                    className="flex items-center gap-2 group"
                  >
                    <Button
                      variant={selectedSubject === subject.id ? "default" : "ghost"}
                      className="flex-1 justify-start overflow-hidden"
                      onClick={() => setSelectedSubject(subject.id)}
                    >
                      <span className="mr-2 flex-shrink-0">{subject.icon_name || "📚"}</span>
                      <span className="truncate flex-1 text-left">{subject.name}</span>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {subject.lesson_count || 0}
                      </Badge>
                    </Button>
                    {canDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteSubjectId(subject.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leçons
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              disabled={!selectedSubject}
              onClick={() => setShowCreateLesson(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une leçon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {!selectedSubject ? (
              <div className="text-center text-muted-foreground p-8">
                Sélectionnez une matière pour voir les leçons
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                Aucune leçon trouvée
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLesson?.id === lesson.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => onSelectLesson(lesson)}
                        >
                          <h4 className="font-semibold truncate">{lesson.title}</h4>
                          {lesson.objectif && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {lesson.objectif}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant={lesson.is_published ? "default" : "secondary"}>
                              {lesson.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            <Badge variant="outline">{lesson.grade_level}</Badge>
                          </div>
                        </div>
                        {canDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteLessonId(lesson.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Subject Dialog */}
      <CreateSubjectDialog
        open={showCreateSubject}
        onOpenChange={setShowCreateSubject}
        onSubjectCreated={fetchSubjects}
      />

      {/* Create Lesson Dialog */}
      {selectedSubject && (
        <CreateLessonDialog
          open={showCreateLesson}
          onOpenChange={setShowCreateLesson}
          subjectId={selectedSubject}
          onLessonCreated={(lesson) => {
            fetchLessons(selectedSubject);
            onSelectLesson(lesson);
          }}
        />
      )}

      {/* Delete Subject Confirmation */}
      <AlertDialog open={!!deleteSubjectId} onOpenChange={(open) => !open && setDeleteSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la matière?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les leçons associées seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Confirmation */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={(open) => !open && setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la leçon?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le contenu de la leçon sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLesson} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
