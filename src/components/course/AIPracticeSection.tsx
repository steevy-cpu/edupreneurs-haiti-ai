import { useState } from "react";
import { MessageCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import ericAiHelper from "@/assets/eric-ai-helper.png";
import { cn } from "@/lib/utils";

interface AIPracticeSectionProps {
  subjectName: string;
  subjectSlug: string;
  gradeLevel: string;
  onStartPractice?: () => void;
}

const getLanguageConfig = (subjectName: string) => {
  const lower = subjectName.toLowerCase();
  
  if (lower.includes('anglais') || lower.includes('english')) {
    return {
      language: 'Anglais',
      title: 'Practice English with Eric AI',
      description: 'Improve your speaking and comprehension through interactive conversations.',
      gradient: 'from-blue-500/20 via-indigo-500/10 to-purple-500/20',
      borderColor: 'border-blue-500/30',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    };
  }
  
  if (lower.includes('espagnol') || lower.includes('spanish')) {
    return {
      language: 'Espagnol',
      title: 'Practica Español con Eric AI',
      description: 'Mejora tu español a través de conversaciones interactivas.',
      gradient: 'from-orange-500/20 via-red-500/10 to-yellow-500/20',
      borderColor: 'border-orange-500/30',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    };
  }
  
  if (lower.includes('français') || lower.includes('francais') || lower.includes('french')) {
    return {
      language: 'Français',
      title: 'Pratique le Français avec Eric AI',
      description: 'Améliore ton expression et ta compréhension par des conversations.',
      gradient: 'from-sky-500/20 via-blue-500/10 to-indigo-500/20',
      borderColor: 'border-sky-500/30',
      buttonColor: 'bg-sky-600 hover:bg-sky-700'
    };
  }
  
  return null;
};

export const AIPracticeSection = ({
  subjectName,
  subjectSlug,
  gradeLevel,
  onStartPractice
}: AIPracticeSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getLanguageConfig(subjectName);

  // Only render for language subjects
  if (!config) return null;

  return (
    <Card className={cn(
      "relative overflow-hidden mb-8 border-2 transition-all duration-300",
      `bg-gradient-to-r ${config.gradient}`,
      config.borderColor,
      "hover:shadow-lg"
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full" />
      
      <CardContent className="relative p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {/* Eric Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <OptimizedImage
              src={ericAiHelper}
              alt="Eric AI Assistant"
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background shadow-lg object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-success text-success-foreground rounded-full p-1.5 shadow-md">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-bold">{config.title}</h3>
              <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-semibold rounded-full">
                AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 md:mb-0">
              {config.description}
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onStartPractice}
            className={cn(
              "flex-shrink-0 gap-2 text-white shadow-md",
              config.buttonColor
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Start Practice</span>
          </Button>
        </div>

        {/* Expandable tips section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto md:mx-0"
        >
          <span>Tips for practice</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <div className="mt-3 p-3 bg-background/50 rounded-lg text-sm">
            <ul className="space-y-1 text-muted-foreground">
              <li>• Start with simple greetings and introductions</li>
              <li>• Don't be afraid to make mistakes - Eric will help you!</li>
              <li>• Try to use vocabulary from your lessons</li>
              <li>• Practice for at least 5 minutes each session</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
