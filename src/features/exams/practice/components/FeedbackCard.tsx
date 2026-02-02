/**
 * FeedbackCard - Compact Jude response card
 */

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ContentBlocksRenderer } from '../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import judeProfile from '@/assets/jude-profile.jpeg';
import type { TutorResponse } from '../../types/exam.types';
import type { RunnerState } from '../types';
import { CheckCircle2, XCircle, Lightbulb, Eye } from 'lucide-react';

interface FeedbackCardProps {
  feedback: TutorResponse;
  state: RunnerState;
}

export function FeedbackCard({ feedback, state }: FeedbackCardProps) {
  const isCorrect = state === 'correct';
  const isIncorrect = state === 'incorrect';
  const isRevealed = state === 'revealed';
  const isHint = state === 'idle' && feedback.blocks?.length > 0;

  // Determine icon and border color
  const getStateStyles = () => {
    if (isCorrect) {
      return {
        border: 'border-green-500/50',
        bg: 'bg-green-500/5',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      };
    }
    if (isIncorrect) {
      return {
        border: 'border-red-500/50',
        bg: 'bg-red-500/5',
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      };
    }
    if (isRevealed) {
      return {
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/5',
        icon: <Eye className="h-4 w-4 text-amber-500" />,
      };
    }
    // Hint state
    return {
      border: 'border-blue-500/50',
      bg: 'bg-blue-500/5',
      icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
    };
  };

  const styles = getStateStyles();

  return (
    <Card className={cn('p-4 mt-4 border-2', styles.border, styles.bg)}>
      <div className="flex items-start gap-3">
        {/* Jude Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0 border border-primary/30">
          <AvatarImage src={judeProfile} alt="Jude" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">J</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-2">
            {styles.icon}
            <span className="text-sm font-medium">
              {isCorrect && 'Correct! 🎉'}
              {isIncorrect && 'Pas tout à fait...'}
              {isRevealed && 'Réponse révélée'}
              {isHint && 'Indice'}
            </span>
            {feedback.grading?.pointsAwarded && feedback.grading.pointsAwarded > 0 && (
              <span className="text-sm font-semibold text-green-600">
                +{feedback.grading.pointsAwarded} pts
              </span>
            )}
          </div>

          {/* Jude's response */}
          <div className="text-sm leading-relaxed">
            {feedback.blocks && feedback.blocks.length > 0 ? (
              <ContentBlocksRenderer blocks={feedback.blocks} />
            ) : feedback.response ? (
              <MathText text={feedback.response} />
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
