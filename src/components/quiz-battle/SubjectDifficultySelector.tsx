import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Sparkles, Zap, Flame, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VALID_GRADES, gradeLevels } from '@/lib/matieresConstants';

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface SubjectDifficultySelectorProps {
  defaultGrade: string | null;
  onStart: (subjectId: string, gradeLevel: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  onBack: () => void;
}

export const SubjectDifficultySelector = ({
  defaultGrade,
  onStart,
  onBack,
}: SubjectDifficultySelectorProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const initialGrade = defaultGrade && VALID_GRADES.includes(defaultGrade as any) ? defaultGrade : '9AF';
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      // Fetch lessons to find subjects with content for the selected grade
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('subject_id, subjects(id, name, slug, icon_name, color)')
        .eq('grade_level', selectedGrade)
        .eq('is_published', true);

      if (!error && lessons) {
        // Get unique subjects from lessons
        const subjectMap = new Map<string, Subject>();
        lessons.forEach((l: any) => {
          if (l.subjects && !subjectMap.has(l.subjects.id)) {
            subjectMap.set(l.subjects.id, {
              ...l.subjects,
              icon: l.subjects.icon_name // Map icon_name to icon for compatibility
            });
          }
        });
        setSubjects(Array.from(subjectMap.values()));
      }
      setIsLoading(false);
    };

    fetchSubjects();
  }, [selectedGrade]);

  // Use centralized grade levels from matieresConstants

  const difficultyOptions = [
    { value: 'easy', label: 'Facile', icon: Sparkles, color: 'text-success', bg: 'bg-success/10', time: 30 },
    { value: 'medium', label: 'Moyen', icon: Zap, color: 'text-accent', bg: 'bg-accent/10', time: 20 },
    { value: 'hard', label: 'Difficile', icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10', time: 15 },
  ];

  const handleStart = () => {
    if (selectedSubject) {
      onStart(selectedSubject, selectedGrade, selectedDifficulty);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Mode Solo</h1>
          <p className="text-muted-foreground">Configure ton quiz</p>
        </div>
      </div>

      {/* Grade Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Niveau scolaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {gradeLevels.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGrade === grade.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedGrade(grade.id);
                  setSelectedSubject(null);
                }}
                title={grade.fullName}
              >
                {grade.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Choisis ta matière</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune matière disponible pour ce niveau
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    selectedSubject === subject.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20"
                  )}
                >
                  <span className="text-2xl mb-1">{subject.icon || '📚'}</span>
                  <span className="text-sm font-medium text-center line-clamp-2">
                    {subject.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Difficulté</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedDifficulty}
            onValueChange={(v) => setSelectedDifficulty(v as 'easy' | 'medium' | 'hard')}
            className="grid grid-cols-3 gap-3"
          >
            {difficultyOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                  selectedDifficulty === option.value
                    ? `border-current ${option.bg} ${option.color}`
                    : "border-transparent bg-muted/50 hover:bg-muted"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                <option.icon className={cn("w-6 h-6 mb-1", option.color)} />
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.time}s / question</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        size="lg"
        className="w-full"
        disabled={!selectedSubject}
        onClick={handleStart}
      >
        Commencer le Quiz
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};
