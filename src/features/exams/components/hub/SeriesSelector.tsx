/**
 * SeriesSelector - Choose between NS4 series (SMP, SES, SVT, LLA)
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calculator, 
  DollarSign, 
  FlaskConical, 
  BookText 
} from 'lucide-react';
import { useExams } from '../../data/exams.queries';
import type { ExamSeries, SeriesInfo } from '../../types/exam.types';

const SERIES_CONFIG: Omit<SeriesInfo, 'examCount'>[] = [
  { 
    value: 'SMP', 
    label: 'Sciences-Maths-Physique', 
    color: 'from-blue-500 to-blue-600', 
    icon: Calculator 
  },
  { 
    value: 'SES', 
    label: 'Sciences Éco. et Sociales', 
    color: 'from-green-500 to-green-600', 
    icon: DollarSign 
  },
  { 
    value: 'SVT', 
    label: 'Sciences de la Vie et Terre', 
    color: 'from-emerald-500 to-emerald-600', 
    icon: FlaskConical 
  },
  { 
    value: 'LLA', 
    label: 'Lettres, Langues et Arts', 
    color: 'from-purple-500 to-purple-600', 
    icon: BookText 
  },
];

interface SeriesSelectorProps {
  track: string;
}

export function SeriesSelector({ track }: SeriesSelectorProps) {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useExams('NS4');

  const handleSeriesClick = (series: ExamSeries) => {
    navigate(`/exams/${track}/${series}`);
  };

  // Count exams per series
  const seriesWithCounts: SeriesInfo[] = SERIES_CONFIG.map(series => ({
    ...series,
    examCount: exams?.filter(e => e.series === series.value).length || 0,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Choisissez une série</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="text-center">
                <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        Choisissez une série
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seriesWithCounts.map((series) => {
          const SeriesIcon = series.icon;
          const hasExams = series.examCount > 0;
          
          return (
            <Card
              key={series.value}
              className={`group transition-all duration-300 overflow-hidden ${
                hasExams 
                  ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => hasExams && handleSeriesClick(series.value)}
            >
              <div className={`h-2 bg-gradient-to-r ${series.color}`} />
              <CardHeader className="text-center py-6">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${series.color} flex items-center justify-center mb-4 ${hasExams ? 'group-hover:scale-110' : ''} transition-transform`}>
                  <SeriesIcon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className={`text-xl ${hasExams ? 'group-hover:text-primary' : ''} transition-colors`}>
                  {series.value}
                </CardTitle>
                <CardDescription>
                  {series.label}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-2">
                  {hasExams 
                    ? `${series.examCount} examens disponibles`
                    : 'Bientôt disponible'
                  }
                </p>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
