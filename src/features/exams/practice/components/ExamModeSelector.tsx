/**
 * ExamModeSelector — Full-screen modal for choosing practice vs timed mode.
 * Shown before session creation when no active session exists.
 */

import { motion } from 'framer-motion';
import { BookOpen, Timer, Star, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExamModeSelectorProps {
  examTitle: string;
  /** Duration in minutes for timed mode display */
  durationMinutes: number;
  onSelectMode: (mode: 'practice' | 'timed') => void;
}

export function ExamModeSelector({ examTitle, durationMinutes, onSelectMode }: ExamModeSelectorProps) {
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationLabel = mins > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${hours}h`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Comment veux-tu pratiquer ?
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {examTitle}
          </p>
        </motion.div>

        {/* Mode cards — side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Practice Mode */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              onClick={() => onSelectMode('practice')}
              className={cn(
                'cursor-pointer transition-all duration-200 border-2 hover:border-primary/60',
                'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                'h-full'
              )}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Star className="h-3 w-3 mr-1" />
                    Recommandé
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-foreground">Mode Pratique</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Prends ton temps, consulte Jude, et apprends à ton rythme. 
                    Pas de limite de temps.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>✅ Indices illimités</span>
                  <span>·</span>
                  <span>✅ Pas de stress</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timed Mode */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              onClick={() => onSelectMode('timed')}
              className={cn(
                'cursor-pointer transition-all duration-200 border-2 hover:border-amber-500/60',
                'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                'h-full'
              )}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Timer className="h-6 w-6 text-amber-500" />
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    <Trophy className="h-3 w-3 mr-1" />
                    Comme au bac
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-foreground">
                    Mode Chrono ⏱️
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Simule les conditions réelles du baccalauréat. 
                    <strong className="text-foreground"> {durationLabel}</strong> pour compléter l'examen.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>⏱️ {durationLabel} chrono</span>
                  <span>·</span>
                  <span>🎯 Conditions réelles</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
