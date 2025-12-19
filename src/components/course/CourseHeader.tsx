import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import ericTeaching from "@/assets/eric-teaching.png";
import ericScientist from "@/assets/eric-scientist.png";
import ericBiologist from "@/assets/eric-biologist.png";
import ericComputer from "@/assets/eric-computer.png";
import ericMath from "@/assets/eric-math.png";
import ericEdupreneurs from "@/assets/eric-edupreneurs.png";

interface CourseHeaderProps {
  title: string;
  description?: string;
  gradeLevel: string;
  lessonCount: number;
  subjectName?: string;
  icon?: React.ReactNode;
}

const getEricImage = (subjectName?: string) => {
  if (!subjectName) return ericTeaching;
  const lower = subjectName.toLowerCase();
  
  if (lower.includes('mathématique') || lower.includes('matematik')) return ericMath;
  if (lower.includes('informatique')) return ericComputer;
  if (lower.includes('chimie') || lower.includes('physique')) return ericScientist;
  if (lower.includes('biologie') || lower.includes('géologie') || lower.includes('science')) return ericBiologist;
  if (lower.includes('social') || lower.includes('histoire')) return ericEdupreneurs;
  
  return ericTeaching;
};

export const CourseHeader = ({
  title,
  description,
  gradeLevel,
  lessonCount,
  subjectName,
  icon
}: CourseHeaderProps) => {
  const ericImage = getEricImage(subjectName || title);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
      <div className="flex-1 text-center md:text-left">
        {icon && (
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg">
            {icon}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-xl text-muted-foreground max-w-2xl mb-4">
            {description}
          </p>
        )}
        <div className="flex gap-2 flex-wrap justify-center md:justify-start">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {gradeLevel}
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {lessonCount} {lessonCount === 1 ? 'leçon' : 'leçons'}
          </Badge>
        </div>
      </div>
      <div className="hidden md:block">
        <OptimizedImage 
          src={ericImage}
          alt="Eric - Professeur"
          className="w-64 h-64 object-cover rounded-2xl shadow-lg"
        />
      </div>
    </div>
  );
};
