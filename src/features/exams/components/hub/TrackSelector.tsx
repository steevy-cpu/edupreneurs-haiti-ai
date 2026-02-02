/**
 * TrackSelector - Choose between 9AF and NS4 exam tracks
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, BookOpen } from 'lucide-react';
import type { ExamTrack } from '../../types/exam.types';

interface TrackInfo {
  value: ExamTrack;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

const TRACKS: TrackInfo[] = [
  {
    value: '9AF',
    title: '9ème Année Fondamentale',
    description: 'Examens officiels de fin de cycle fondamental',
    icon: BookOpen,
    color: 'text-primary',
    gradient: 'from-primary/10 via-primary/5 to-background',
  },
  {
    value: 'NS4',
    title: 'Baccalauréat (NS4)',
    description: 'Examens du baccalauréat haïtien',
    icon: GraduationCap,
    color: 'text-amber-500',
    gradient: 'from-amber-500/10 via-orange-500/5 to-background',
  },
];

export function TrackSelector() {
  const navigate = useNavigate();

  const handleTrackClick = (track: ExamTrack) => {
    navigate(`/exams/${track}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        Choisissez votre niveau
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {TRACKS.map((track) => {
          const TrackIcon = track.icon;
          return (
            <Card
              key={track.value}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onClick={() => handleTrackClick(track.value)}
            >
              <div className={`h-2 bg-gradient-to-r ${track.gradient}`} />
              <CardHeader className="text-center py-8">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${track.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <TrackIcon className={`h-10 w-10 ${track.color}`} />
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {track.title}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {track.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
