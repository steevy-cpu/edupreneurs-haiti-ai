import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

const LOADING_TIPS = [
  "Conseil: Lis bien chaque question avant de répondre",
  "Astuce: Le temps compte pour les bonus XP!",
  "Savais-tu? Plus tu pratiques, plus tu montes en niveau!",
  "Rappel: 70% de bonnes réponses = victoire!",
  "Conseil: Réponds rapidement pour plus de points!",
];

export const QuizLoadingState = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      {/* Animated brain icon */}
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-bounce" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 rounded-full blur-sm animate-pulse"></div>
      </div>
      
      {/* Title */}
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Génération des questions...</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Notre IA prépare tes questions
        </p>
      </div>
      
      {/* Animated progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-primary/70 to-primary rounded-full animate-loading-bar"></div>
        </div>
      </div>
      
      {/* Fun loading tips */}
      <p 
        key={currentTip} 
        className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs animate-fade-in"
      >
        💡 {LOADING_TIPS[currentTip]}
      </p>
    </div>
  );
};
