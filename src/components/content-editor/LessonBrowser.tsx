import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, Plus, Book, FileText } from "lucide-react";
import { CreateSubjectDialog } from "./CreateSubjectDialog";
import { CreateLessonDialog } from "./CreateLessonDialog";

interface LessonBrowserProps {
  onSelectLesson: (lesson: any) => void;
  selectedLesson: any;
}

export const LessonBrowser = ({ onSelectLesson, selectedLesson }: LessonBrowserProps) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);

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
                  <Button
                    key={subject.id}
                    variant={selectedSubject === subject.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    <span className="mr-2">{subject.icon_name || "📚"}</span>
                    {subject.name}
                    <Badge variant="secondary" className="ml-auto">
                      {subject.lesson_count || 0}
                    </Badge>
                  </Button>
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
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{lesson.title}</h4>
                          {lesson.objectif && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {lesson.objectif}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant={lesson.is_published ? "default" : "secondary"}>
                              {lesson.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            <Badge variant="outline">{lesson.grade_level}</Badge>
                          </div>
                        </div>
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
    </div>
  );
};
