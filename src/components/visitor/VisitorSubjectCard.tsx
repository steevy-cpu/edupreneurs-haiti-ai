import { SubjectCardEnhanced } from "@/components/matieres/SubjectCardEnhanced";
import { LockedOverlay } from "./LockedOverlay";

interface VisitorSubjectCardProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  lessons: number;
  exercises: number;
  color: string;
  progressPercent?: number;
  completedLessons?: number;
  isPopular?: boolean;
  isNew?: boolean;
  estimatedHours?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export function VisitorSubjectCard(props: VisitorSubjectCardProps) {
  return (
    <div className="relative group">
      <SubjectCardEnhanced 
        {...props} 
        disableNavigation={true}
        onToggleFavorite={undefined}
      />
      <LockedOverlay 
        variant="card" 
        title="Créez un compte pour accéder aux leçons"
      />
    </div>
  );
}
