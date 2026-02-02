/**
 * ExerciseHeader - Displays Q#/total, concept, and points
 */

import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface ExerciseHeaderProps {
  number: number;
  total: number;
  concept: string;
  points: number;
}

export function ExerciseHeader({ number, total, concept, points }: ExerciseHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
      <Badge variant="outline" className="font-semibold">
        Q{number}/{total}
      </Badge>
      <span className="text-sm font-medium text-muted-foreground truncate mx-2 flex-1 text-center">
        {concept}
      </span>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Trophy className="h-3 w-3" />
        {points} pts
      </Badge>
    </div>
  );
}
