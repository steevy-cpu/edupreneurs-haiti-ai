import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RefreshCw, GraduationCap, Undo2, Clock, BarChart3, Lock } from 'lucide-react';
import type { DifficultyLevel, TimeControl } from '@/hooks/useChessGame';

interface ChessGameControlsProps {
  difficulty: DifficultyLevel;
  timeControl: TimeControl;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onTimeControlChange: (timeControl: TimeControl) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onRequestTutorial: () => void;
  onShowStats: () => void;
  canUndo: boolean;
  isThinking: boolean;
  isGameOver: boolean;
  isVisitor?: boolean;
}

const ChessGameControls: React.FC<ChessGameControlsProps> = ({
  difficulty,
  timeControl,
  onDifficultyChange,
  onTimeControlChange,
  onNewGame,
  onUndo,
  onRequestTutorial,
  onShowStats,
  canUndo,
  isThinking,
  isGameOver,
  isVisitor = false
}) => {
  return (
    <div className="space-y-3">
      {/* Settings Row */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Niveau:</span>
          <Select 
            value={difficulty} 
            onValueChange={(value) => onDifficultyChange(value as DifficultyLevel)}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">🌱 Débutant</SelectItem>
              <SelectItem value="intermediate">🎯 Intermédiaire</SelectItem>
              <SelectItem value="advanced">💪 Avancé</SelectItem>
              <SelectItem value="expert">🏆 Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Control Selector */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground hidden sm:inline" />
          <Select 
            value={timeControl} 
            onValueChange={(value) => onTimeControlChange(value as TimeControl)}
          >
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Temps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="untimed">♾️ Sans limite</SelectItem>
              <SelectItem value="bullet">⚡ Bullet (1 min)</SelectItem>
              <SelectItem value="blitz">🔥 Blitz (3 min)</SelectItem>
              <SelectItem value="rapid">⏱️ Rapide (10 min)</SelectItem>
              <SelectItem value="classic">🏛️ Classique (30 min)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          className="gap-1.5 h-8"
          disabled={!canUndo || isThinking}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Annuler</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNewGame}
          className="gap-1.5 h-8"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouvelle partie</span>
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onRequestTutorial}
          className="gap-1.5 h-8"
          disabled={isThinking}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tutoriel</span>
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={isVisitor ? undefined : onShowStats}
          disabled={isVisitor}
          className="gap-1.5 h-8"
          title={isVisitor ? "Créez un compte pour voir vos stats" : undefined}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stats</span>
          {isVisitor && <Lock className="w-3 h-3 ml-0.5 text-muted-foreground" />}
        </Button>
      </div>
    </div>
  );
};

export default ChessGameControls;
