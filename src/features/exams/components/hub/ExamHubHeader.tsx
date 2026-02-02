/**
 * ExamHubHeader - Dynamic header for the exam hub
 */
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, BookOpen, Calendar, FileCheck, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExamStats } from '../../data/exams.queries';
import type { ExamTrack, ExamSeries } from '../../types/exam.types';
import judeProfile from '@/assets/eric-new-profile.png';

interface ExamHubHeaderProps {
  track?: ExamTrack;
  series?: ExamSeries | null;
  subject?: string;
}

export function ExamHubHeader({ track, series, subject }: ExamHubHeaderProps) {
  const navigate = useNavigate();
  const { data: stats } = useExamStats(track || '9AF');

  const handleBack = () => {
    if (subject) {
      // Go back to subject selection
      if (series) {
        navigate(`/exams/${track}/${series}`);
      } else {
        navigate(`/exams/${track}`);
      }
    } else if (series) {
      // Go back to series selection
      navigate(`/exams/${track}`);
    } else if (track) {
      // Go back to track selection
      navigate('/exams');
    } else {
      // Go to matieres
      navigate('/matieres');
    }
  };

  const getBackLabel = () => {
    if (subject) return series ? 'Retour aux matières' : 'Retour aux matières';
    if (series) return 'Retour aux séries';
    if (track) return 'Retour aux niveaux';
    return 'Retour aux matières';
  };

  const isNS4 = track === 'NS4';
  const accentColor = isNS4 ? 'amber-500' : 'primary';
  const gradientFrom = isNS4 ? 'from-amber-500/10' : 'from-primary/10';
  const gradientVia = isNS4 ? 'via-orange-500/5' : 'via-primary/5';

  const getTitle = () => {
    if (track === 'NS4') return 'Baccalauréat NS4';
    if (track === '9AF') return 'Examens Officiels 9ème AF';
    return 'Examens Officiels';
  };

  const getSubtitle = () => {
    if (track === 'NS4') return "Prépare-toi avec les anciens et modèles d'examens";
    if (track === '9AF') return 'Prépare-toi avec les anciens examens officiels de 2011 à 2025';
    return 'Choisissez votre niveau pour commencer';
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${gradientFrom} ${gradientVia} to-background border-b`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {getBackLabel()}
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              {isNS4 && <GraduationCap className={`h-10 w-10 text-${accentColor}`} />}
              <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${isNS4 ? 'from-amber-500 to-orange-500' : 'from-primary to-primary/60'} bg-clip-text text-transparent`}>
                {getTitle()}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getSubtitle()}
            </p>
            
            {track && stats && (
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <BookOpen className={`h-5 w-5 text-${accentColor}`} />
                  <span className="font-semibold">{stats.totalExams} Examens</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <Calendar className={`h-5 w-5 text-${accentColor}`} />
                  <span className="font-semibold">{stats.yearRange}</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <FileCheck className={`h-5 w-5 text-${accentColor}`} />
                  <span className="font-semibold">
                    {isNS4 ? `${stats.seriesCount} Séries` : '7 Matières'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <img
            src={judeProfile}
            alt="Jude"
            className="w-64 h-64 object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
