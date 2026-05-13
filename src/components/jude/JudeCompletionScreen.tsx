/**
 * JudeCompletionScreen Component
 * 
 * Shows Jude congratulating the user based on their score
 * with randomized messages per tier.
 */

import { useMemo } from 'react';
const judeChairDesk = "/images/eric-chair-desk-200w.webp";

const TIER_MESSAGES = {
  perfect: ["Parfait ! Tu es un champion ! 🏆"],
  high: [
    "Excellent travail ! Tu maîtrises ce sujet ! 🌟",
    "Impressionnant ! Tu es sur la bonne voie ! ⭐",
    "Bravo ! Tu gères vraiment bien ! 🔥",
  ],
  medium: [
    "Bien joué ! Continue comme ça ! 💪",
    "Pas mal du tout ! Un peu de révision et ce sera parfait ! 📖",
    "Tu progresses bien ! Continue tes efforts ! 🚀",
  ],
  low: [
    "Ne lâche pas ! Révise la leçon et réessaye ! 📖",
    "C'est en forgeant qu'on devient forgeron ! Continue ! 💡",
    "Chaque erreur est une occasion d'apprendre ! 😊",
  ],
};

interface JudeCompletionScreenProps {
  score: number;
  total: number;
}

export function JudeCompletionScreen({ score, total }: JudeCompletionScreenProps) {
  const percentage = Math.round((score / total) * 100);

  const message = useMemo(() => {
    const pool =
      percentage === 100 ? TIER_MESSAGES.perfect :
      percentage >= 80 ? TIER_MESSAGES.high :
      percentage >= 60 ? TIER_MESSAGES.medium :
      TIER_MESSAGES.low;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [percentage]);

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
        <img
          src={judeChairDesk}
          srcSet="/images/eric-chair-desk-200w.webp 200w, /images/eric-chair-desk-400w.webp 400w"
          sizes="(max-width: 640px) 96px, 128px"
          alt="Jude te félicite"
          className="relative w-24 h-24 sm:w-32 sm:h-32 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div>
        <div className="text-5xl sm:text-6xl font-bold text-primary mb-1">{percentage}%</div>
        <p className="text-lg font-semibold">
          {score} / {total} bonnes réponses
        </p>
      </div>
      
      <div className="p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-xl max-w-sm">
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-primary">Jude :</span>{' '}
          {message}
        </p>
      </div>
    </div>
  );
}
