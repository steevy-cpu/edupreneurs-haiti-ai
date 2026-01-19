import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Sparkles, Zap, Flame, BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VALID_GRADES, gradeLevels, iconMap, colorMap } from '@/lib/matieresConstants';

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
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(true);

  // Series options for NS3/NS4
  const seriesOptions = [
    { id: 'LLA', label: 'LLA', fullName: 'Lettres, Langues et Arts' },
    { id: 'SES', label: 'SES', fullName: 'Sciences Économiques et Sociales' },
    { id: 'SMP', label: 'SMP', fullName: 'Sciences Mathématiques et Physiques' },
    { id: 'SVT', label: 'SVT', fullName: 'Sciences de la Vie et de la Terre' },
  ];

  const isNS3orNS4 = selectedGrade === 'NS3' || selectedGrade === 'NS4';

  // Helper to render subject icons
  const renderSubjectIcon = (iconName: string | null) => {
    const IconComponent = iconMap[iconName || 'BookOpen'] || BookOpen;
    return <IconComponent className="w-6 h-6" />;
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      
      // For NS3/NS4, require series selection before fetching
      if (isNS3orNS4 && !selectedSeries) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }

      // Build query with optional series filter
      let query = supabase
        .from('lessons')
        .select('subject_id, subjects!inner(id, name, slug, icon_name, color, series)')
        .eq('grade_level', selectedGrade)
        .eq('is_published', true);

      // Add series filter for NS3/NS4
      if (selectedSeries) {
        query = query.eq('subjects.series', selectedSeries);
      }

      const { data: lessons, error } = await query;

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
  }, [selectedGrade, selectedSeries, isNS3orNS4]);

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
                  setSelectedSeries(null);
                }}
                title={grade.fullName}
              >
                {grade.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Series Selection - Only for NS3/NS4 */}
      {isNS3orNS4 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Choisis ta série
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {seriesOptions.map((series) => (
                <Button
                  key={series.id}
                  variant={selectedSeries === series.id ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col"
                  onClick={() => {
                    setSelectedSeries(series.id);
                    setSelectedSubject(null);
                  }}
                >
                  <span className="font-medium">{series.label}</span>
                  <span className="text-xs opacity-80">{series.fullName}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Choisis ta matière</CardTitle>
        </CardHeader>
        <CardContent>
          {isNS3orNS4 && !selectedSeries ? (
            <p className="text-muted-foreground text-center py-4">
              Sélectionne d'abord ta série pour voir les matières
            </p>
          ) : isLoading ? (
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
                  <span className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                    subject.color ? `bg-gradient-to-br ${colorMap[subject.color] || 'from-primary to-primary/80'} text-white` : 'bg-primary/10 text-primary'
                  )}>
                    {renderSubjectIcon(subject.icon)}
                  </span>
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
