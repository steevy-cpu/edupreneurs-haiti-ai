/**
 * JudeFeedback Component
 * 
 * Shows Jude's avatar next to feedback text after answering a question.
 * Provides a personalized "Jude says..." experience.
 */

import judeChairDesk from "@/assets/eric-chair-desk.png";

interface JudeFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  children?: React.ReactNode;
}

export function JudeFeedback({ isCorrect, explanation, children }: JudeFeedbackProps) {
  return (
    <div className={`
      p-4 sm:p-5 rounded-lg border-2 animate-fade-in
      ${isCorrect
        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700' 
        : 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
      }
    `}>
      <div className="flex items-start gap-3">
        <img
          src={judeChairDesk}
          alt="Jude"
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full bg-primary/5 p-1 flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold mb-1 text-sm sm:text-base">
            {isCorrect
              ? '🎉 Bravo !' 
              : '📚 Pas tout à fait...'}
          </p>
          {children || (
            <p className="text-xs sm:text-sm leading-relaxed break-words text-muted-foreground">
              {explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
