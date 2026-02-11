/**
 * JudeCompletionScreen Component
 * 
 * Shows Jude congratulating the user based on their score.
 * Used in both quiz and activities completion screens.
 */

import judeChairDesk from "@/assets/eric-chair-desk.png";

interface JudeCompletionScreenProps {
  score: number;
  total: number;
}

export function JudeCompletionScreen({ score, total }: JudeCompletionScreenProps) {
  const percentage = Math.round((score / total) * 100);
  
  const getMessage = () => {
    if (percentage >= 80) return "Excellent travail ! Tu maîtrises ce sujet ! 🌟";
    if (percentage >= 60) return "Bien joué ! Continue comme ça ! 💪";
    return "Ne lâche pas ! Révise la leçon et réessaye ! 📖";
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Jude avatar */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
        <img
          src={judeChairDesk}
          alt="Jude te félicite"
          className="relative w-24 h-24 sm:w-32 sm:h-32 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Score */}
      <div>
        <div className="text-5xl sm:text-6xl font-bold text-primary mb-1">{percentage}%</div>
        <p className="text-lg font-semibold">
          {score} / {total} bonnes réponses
        </p>
      </div>
      
      {/* Jude's personalized message */}
      <div className="p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-xl max-w-sm">
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-primary">Jude :</span>{' '}
          {getMessage()}
        </p>
      </div>
    </div>
  );
}
