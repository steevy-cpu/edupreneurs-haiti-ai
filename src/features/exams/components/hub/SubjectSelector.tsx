/**
 * SubjectSelector - Data-driven subject selection (no hardcoding)
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { useExamSubjects } from '../../data/exams.queries';
import type { ExamTrack, ExamSeries, SubjectInfo } from '../../types/exam.types';

interface SubjectSelectorProps {
  track: ExamTrack;
  series?: ExamSeries | null;
}

export function SubjectSelector({ track, series }: SubjectSelectorProps) {
  const navigate = useNavigate();
  const { data: subjects, isLoading, error } = useExamSubjects(track, series);

  const handleSubjectClick = (subject: SubjectInfo) => {
    if (subject.count === 0) return;
    
    // Build the navigation path
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

  if (!subjects || subjects.length === 0) {
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
        {subjects.map((subject) => {
          const SubjectIcon = subject.icon;
          const hasExams = subject.count > 0;

          return (
            <Card
              key={subject.name}
              className={`group transition-all duration-300 overflow-hidden ${
                hasExams 
                  ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => handleSubjectClick(subject)}
            >
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
