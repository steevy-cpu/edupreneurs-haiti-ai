/**
 * ExamsHubPage - Unified hub for all exam tracks
 * One component, multiple "products" (9AF, NS4)
 */
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserGrade, isNonAcademicGrade, type AllGradeTypes } from '@/hooks/useUserGrade';
import { NonAcademicLockedOverlay } from '@/components/shared/NonAcademicLockedOverlay';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  TrackSelector,
  SeriesSelector,
  SubjectSelector,
  ExamYearList,
  ExamHubHeader,
} from '../components/hub';
import type { ExamTrack, ExamSeries, HubStep } from '../types/exam.types';

export function ExamsHubPage() {
  const navigate = useNavigate();
  const { track, series, subject } = useParams<{
    track?: string;
    series?: string;
    subject?: string;
  }>();
  
  const { userGrade, isAuthenticated } = useUserGrade();
  
  // Check if user has a non-academic grade
  const isNonAcademic = isAuthenticated && isNonAcademicGrade(userGrade);

  // Normalize params
  const normalizedTrack = track as ExamTrack | undefined;
  const normalizedSeries = series as ExamSeries | undefined;
  const decodedSubject = subject ? decodeURIComponent(subject) : undefined;

  // Determine which series param is actually the subject (for 9AF routes like /exams/9AF/Mathématiques)
  const is9AFWithSubject = normalizedTrack === '9AF' && series && !['SMP', 'SES', 'SVT', 'LLA'].includes(series);
  const actualSeries = is9AFWithSubject ? undefined : normalizedSeries;
  const actualSubject = is9AFWithSubject ? decodeURIComponent(series!) : decodedSubject;

  // Determine current step in the hub flow
  const step: HubStep = useMemo(() => {
    if (!normalizedTrack) return 'track';
    if (normalizedTrack === 'NS4' && !actualSeries && !actualSubject) return 'series';
    if (!actualSubject) return 'subject';
    return 'exams';
  }, [normalizedTrack, actualSeries, actualSubject]);

  // Non-academic users see locked overlay
  if (isNonAcademic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-24 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/matieres')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux matières
            </Button>
            <ThemeToggle />
          </div>
          <NonAcademicLockedOverlay
            userGrade={userGrade as AllGradeTypes}
            title="Examens officiels non disponibles"
            description="Cette section est réservée aux élèves. Explorez nos autres fonctionnalités!"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-24 lg:pb-8">
      {/* Header - always visible */}
      <ExamHubHeader 
        track={normalizedTrack} 
        series={actualSeries} 
        subject={actualSubject}
      />

      {/* Content area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {step === 'track' && <TrackSelector />}
        
        {step === 'series' && normalizedTrack && (
          <SeriesSelector track={normalizedTrack} />
        )}
        
        {step === 'subject' && normalizedTrack && (
          <SubjectSelector 
            track={normalizedTrack as ExamTrack} 
            series={actualSeries} 
          />
        )}
        
        {step === 'exams' && normalizedTrack && actualSubject && (
          <ExamYearList
            track={normalizedTrack as ExamTrack}
            series={actualSeries}
            subject={actualSubject}
          />
        )}
      </div>
    </div>
  );
}

export default ExamsHubPage;
