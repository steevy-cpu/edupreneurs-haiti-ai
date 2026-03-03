/**
 * ExamYearList - Display exams grouped by year
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import { useExamsBySubject, SUBJECT_COLORS } from '../../data/exams.queries';
import type { ExamTrack, ExamSeries, Exam } from '../../types/exam.types';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface ExamYearListProps {
  track: ExamTrack;
  series?: ExamSeries | null;
  subject: string;
}

export function ExamYearList({ track, series, subject }: ExamYearListProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { data: exams, isLoading, error } = useExamsBySubject(track, subject, series);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handlePractice = (examId: string) => {
    if (!user) {
      navigate('/auth/login', { state: { returnTo: `/exams/practice/${examId}` } });
      return;
    }
    navigate(`/exams/practice/${examId}`);
  };

  const getSubjectColor = (subjectName: string) => {
    return SUBJECT_COLORS[subjectName] || 'from-gray-500 to-gray-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          {subject} {series ? `- Série ${series}` : ''}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
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
          Impossible de charger les examens. Veuillez réessayer.
        </p>
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucun examen trouvé</h3>
        <p className="text-muted-foreground">
          Aucun examen disponible pour {subject}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {subject} {series ? `- Série ${series}` : ''}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {exams.map((exam) => (
          <ExamCard 
            key={exam.id} 
            exam={exam} 
            color={getSubjectColor(exam.subject)}
            onPractice={handlePractice}
            isNS4={track === 'NS4'}
          />
        ))}
      </div>
    </div>
  );
}

interface ExamCardProps {
  exam: Exam;
  color: string;
  onPractice: (examId: string) => void;
  isNS4?: boolean;
}

function ExamCard({ exam, color, onPractice, isNS4 }: ExamCardProps) {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-2 ${isNS4 ? 'hover:border-amber-500/50' : 'hover:border-primary/50'}`}>
      <CardHeader>
        <div className={`w-full h-2 rounded-full bg-gradient-to-r ${color} mb-4`} />
        <div className="flex items-center justify-between mb-2">
          <CardTitle className={`text-xl transition-colors ${isNS4 ? 'group-hover:text-amber-500' : 'group-hover:text-primary'}`}>
            {exam.is_model_exam ? (
              <span className="flex items-center gap-2">
                <span className="text-amber-500">⭐ Modèle</span>
                {exam.year && <span className="text-muted-foreground text-sm">({exam.year})</span>}
              </span>
            ) : (
              exam.year
            )}
          </CardTitle>
          <div className="flex gap-1 flex-wrap">
            {exam.is_model_exam && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                Modèle
              </Badge>
            )}
            {exam.session === 'rattrapage' && (
              <Badge variant="destructive">Rattrapage</Badge>
            )}
            {(exam.version || 1) > 1 && (
              <Badge variant="outline">v{exam.version}</Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{exam.subject}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{exam.total_exercises} exercices</span>
          {/* Show MENFP official duration when available */}
          {exam.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exam.duration_minutes >= 60
                ? `${Math.floor(exam.duration_minutes / 60)}h`
                : `${exam.duration_minutes}min`}
            </span>
          )}
          <span>{exam.total_points} points</span>
        </div>

        {exam.pdf_url ? (
          <Button
            onClick={() => onPractice(exam.id)}
            className="w-full group-hover:scale-105 transition-transform"
          >
            Pratiquer avec Jude
          </Button>
        ) : (
          <Button disabled variant="outline" className="w-full">
            Bientôt disponible
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
