import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

interface LessonBrowserProps {
  onSelectLesson: (lesson: any) => void;
  selectedLesson: any;
}

export const LessonBrowser = ({ onSelectLesson, selectedLesson }: LessonBrowserProps) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessonsBySubject, setLessonsBySubject] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;

      // Fetch all lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Group lessons by subject
      const grouped: Record<string, any[]> = {};
      lessonsData?.forEach(lesson => {
        if (!grouped[lesson.subject_id]) {
          grouped[lesson.subject_id] = [];
        }
        grouped[lesson.subject_id].push(lesson);
      });

      setSubjects(subjectsData || []);
      setLessonsBySubject(grouped);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    const newOpenSubjects = new Set(openSubjects);
    if (newOpenSubjects.has(subjectId)) {
      newOpenSubjects.delete(subjectId);
    } else {
      newOpenSubjects.add(subjectId);
    }
    setOpenSubjects(newOpenSubjects);
  };

  const filteredSubjects = subjects.map(subject => {
    const subjectLessons = lessonsBySubject[subject.id] || [];
    const filteredLessons = subjectLessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...subject,
      lessons: filteredLessons
    };
  }).filter(subject => 
    searchQuery === "" || 
    subject.lessons.length > 0 || 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg">Parcourir les Leçons</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Chargement...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSubjects.map((subject) => (
                <Collapsible
                  key={subject.id}
                  open={openSubjects.has(subject.id)}
                  onOpenChange={() => toggleSubject(subject.id)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md transition-colors">
                    {openSubjects.has(subject.id) ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="flex-shrink-0">{subject.icon_name || "📚"}</span>
                    <span className="flex-1 text-left font-medium text-sm leading-tight">
                      {subject.name}
                    </span>
                    <Badge variant="secondary" className="flex-shrink-0 ml-auto">
                      {subject.lessons.length}
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-6 mt-1 space-y-1">
                      {subject.lessons.map((lesson: any) => (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className={`p-2 rounded-md cursor-pointer transition-colors ${
                            selectedLesson?.id === lesson.id
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium flex-1 line-clamp-2">
                              {lesson.title}
                            </span>
                            <Badge 
                              variant={lesson.is_published ? "default" : "secondary"}
                              className="flex-shrink-0 text-xs"
                            >
                              {lesson.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {lesson.grade_level}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
