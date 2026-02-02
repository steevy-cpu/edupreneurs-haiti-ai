/**
 * TrackToggle - Toggle between 9AF and NS4 tracks
 */
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen } from "lucide-react";
import type { ExamTrack } from "../../types/exam.types";

interface TrackToggleProps {
  value: ExamTrack;
  onChange: (track: ExamTrack) => void;
}

export function TrackToggle({ value, onChange }: TrackToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={value === '9AF' ? 'default' : 'outline'}
        onClick={() => onChange('9AF')}
        className="flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" />
        9ème AF
      </Button>
      <Button
        type="button"
        variant={value === 'NS4' ? 'default' : 'outline'}
        onClick={() => onChange('NS4')}
        className="flex items-center gap-2"
      >
        <GraduationCap className="h-4 w-4" />
        Baccalauréat (NS4)
      </Button>
    </div>
  );
}
