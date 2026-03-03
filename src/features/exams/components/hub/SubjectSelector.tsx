/**
 * SubjectSelector - Data-driven subject selection with "coming soon" support for NS4
 * For NS4: merges DB results with known subjects list so all subjects always appear
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { useExamSubjects } from '../../data/exams.queries';
import { SUBJECT_ICONS, SUBJECT_COLORS } from '../../data/exams.queries';
import { NS4_SUBJECTS_BY_SERIES } from '../../constants/ns4Subjects';
import type { ExamTrack, ExamSeries, SubjectInfo } from '../../types/exam.types';

interface SubjectSelectorProps {
  track: ExamTrack;
  series?: ExamSeries | null;
}

export function SubjectSelector({ track, series }: SubjectSelectorProps) {
  const navigate = useNavigate();
  const { data: subjects, isLoading, error } = useExamSubjects(track, series);

  /** Merge DB subjects with known NS4 subjects to show "coming soon" cards */
  const mergedSubjects = useMemo(() => {
    if (!subjects) return null;

    // For NS4 with a selected series, merge with known subject list
    if (track === 'NS4' && series && NS4_SUBJECTS_BY_SERIES[series]) {
      const knownSubjects = NS4_SUBJECTS_BY_SERIES[series];
      const uploadedNames = new Set(subjects.map((s) => s.name));

      // Build merged list: uploaded subjects keep their data, others get count=0
      const merged: SubjectInfo[] = knownSubjects.map((name) => {
        const existing = subjects.find((s) => s.name === name);
        if (existing) return existing;

        // Coming soon subject — no exams yet
        return {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          count: 0,
          icon: SUBJECT_ICONS[name] || BookOpen,
          color: SUBJECT_COLORS[name] || 'from-gray-500 to-gray-600',
        };
      });

      // Append any DB subjects not in the known list (safety net)
      subjects.forEach((s) => {
        if (!knownSubjects.includes(s.name)) merged.push(s);
      });

      return merged;
    }

    // For 9AF or NS4 without series, use DB results as-is
    return subjects;
  }, [subjects, track, series]);

  const handleSubjectClick = (subject: SubjectInfo) => {
    // Block navigation for subjects with no exams
    if (subject.count === 0) return;
    
    const encodedSubject = encodeURIComponent(subject.name);
    if (series) {
      navigate(`/exams/${track}/${series}/${encodedSubject}`);
    } else {
      navigate(`/exams/${track}/${encodedSubject}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Choisissez une matière</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger les matières. Veuillez réessayer.
        </p>
      </div>
    );
  }

  if (!mergedSubjects || mergedSubjects.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucune matière trouvée</h3>
        <p className="text-muted-foreground">
          {series 
            ? `Aucun examen disponible pour la série ${series}`
            : `Aucun examen disponible pour ${track}`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        {series ? `Matières - Série ${series}` : 'Choisissez une matière'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mergedSubjects.map((subject) => {
          const SubjectIcon = subject.icon;
          const hasExams = subject.count > 0;

          return (
            <Card
              key={subject.name}
              className={`group transition-all duration-300 overflow-hidden relative ${
                hasExams 
                  ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => handleSubjectClick(subject)}
            >
              {/* "Bientôt" badge for coming soon subjects */}
              {!hasExams && (
                <span className="absolute top-2 right-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full z-10">
                  Bientôt
                </span>
              )}
              <div className={`h-2 bg-gradient-to-r ${subject.color}`} />
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center mb-4 ${hasExams ? 'group-hover:scale-110' : ''} transition-transform`}>
                  <SubjectIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className={`text-xl text-center ${hasExams ? 'group-hover:text-primary' : ''} transition-colors`}>
                  {subject.name}
                </CardTitle>
                <CardDescription className="text-center">
                  {hasExams 
                    ? `${subject.count} examens disponibles`
                    : 'Bientôt disponible'
                  }
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
