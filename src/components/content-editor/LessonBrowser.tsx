import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [lessonsBySubject, setLessonsBySubject] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());

  const gradeLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "7AF", label: "7AF" },
    { value: "AF8", label: "AF8" },
  ];

  // Load subjects when grade level changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel]);

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, slug, grade_level, icon_name')
        .order('name');

      // Filter by grade level if not "all"
      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailableSubjects(data || []);
      
      // Load lessons for these subjects
      if (data && data.length > 0) {
        loadLessons(data.map(s => s.id));
      } else {
        setLessonsBySubject({});
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadLessons = async (subjectIds: string[]) => {
    setIsLoading(true);
    try {
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('*, subjects(id, name)')
        .in('subject_id', subjectIds)
        .order('title');

      if (error) throw error;

      // Group lessons by subject
      const grouped: Record<string, any[]> = {};
      lessonsData?.forEach(lesson => {
        if (!grouped[lesson.subject_id]) {
          grouped[lesson.subject_id] = [];
        }
        grouped[lesson.subject_id].push(lesson);
      });

      setLessonsBySubject(grouped);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error("Erreur lors du chargement des leçons");
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

  const filteredSubjects = availableSubjects.map(subject => {
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
        
        {/* Grade Level Filter */}
        <div className="mt-4 space-y-2">
          <Label>Niveau scolaire</Label>
          <Select value={gradeLevel} onValueChange={setGradeLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gradeLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
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
          {isLoadingSubjects || isLoading ? (
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
