import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Sparkles, GraduationCap, BookOpen } from "lucide-react";
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
  completedCount?: number;
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

const getSubjectGradient = (subjectName?: string) => {
  if (!subjectName) return "from-primary via-primary/80 to-secondary/60";
  const lower = subjectName.toLowerCase();
  
  if (lower.includes('anglais') || lower.includes('english')) return "from-blue-600 via-indigo-500 to-purple-500";
  if (lower.includes('espagnol') || lower.includes('spanish')) return "from-orange-500 via-red-500 to-yellow-500";
  if (lower.includes('français') || lower.includes('francais')) return "from-sky-500 via-blue-500 to-indigo-500";
  if (lower.includes('mathématique') || lower.includes('matematik')) return "from-emerald-500 via-teal-500 to-cyan-500";
  if (lower.includes('science')) return "from-green-500 via-emerald-500 to-teal-500";
  if (lower.includes('histoire') || lower.includes('social')) return "from-amber-500 via-orange-500 to-red-500";
  
  return "from-primary via-primary/80 to-secondary/60";
};

const getMotivationalMessage = (completedCount: number, totalCount: number) => {
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;
  
  if (ratio === 0) return "Prêt à commencer cette aventure ? 🚀";
  if (ratio < 0.25) return "Excellent début ! Continue comme ça ! 💪";
  if (ratio < 0.5) return "Tu progresses bien ! La moitié approche ! 🌟";
  if (ratio < 0.75) return "Incroyable ! Tu es sur la bonne voie ! 🔥";
  if (ratio < 1) return "Presque fini ! Tu y es presque ! 🎯";
  return "Félicitations ! Cours complété ! 🏆";
};

export const CourseHeader = ({
  title,
  description,
  gradeLevel,
  lessonCount,
  subjectName,
  icon,
  completedCount = 0
}: CourseHeaderProps) => {
  const ericImage = getEricImage(subjectName || title);
  const gradientClass = getSubjectGradient(subjectName || title);
  const motivationalMessage = getMotivationalMessage(completedCount, lessonCount);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background with gradient and pattern */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-10`} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-tr-full blur-2xl" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left z-10">
          {icon && (
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} mb-4 shadow-lg`}>
              {icon}
            </div>
          )}
          
          {/* Title with gradient */}
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
            {title}
          </h1>
          
          {description && (
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-4">
              {description}
            </p>
          )}

          {/* Motivational message */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">{motivationalMessage}</span>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap justify-center md:justify-start">
            <Badge variant="secondary" className="text-sm px-4 py-2 gap-2 bg-primary/10 text-primary border border-primary/20">
              <GraduationCap className="w-3.5 h-3.5" />
              {gradeLevel}
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2 gap-2 bg-secondary/10 text-secondary border border-secondary/20">
              <BookOpen className="w-3.5 h-3.5" />
              {lessonCount} {lessonCount === 1 ? 'leçon' : 'leçons'}
            </Badge>
          </div>
        </div>

        {/* Eric Image */}
        <div className="hidden md:block relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-2xl animate-pulse" />
          <OptimizedImage 
            src={ericImage}
            alt="Eric - Professeur"
            className="relative w-56 h-56 lg:w-64 lg:h-64 object-cover rounded-2xl shadow-2xl border-4 border-background"
          />
        </div>
      </div>
    </div>
  );
};
