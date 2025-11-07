import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";

interface TextToSpeechButtonProps {
  text: string;
  sectionName: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export const TextToSpeechButton = ({ 
  text, 
  sectionName, 
  className,
  size = "sm" 
}: TextToSpeechButtonProps) => {
  const { isSpeaking, isPaused, currentSection, isSupported, speak, pause, resume, stop } = useTTS();

  const isThisSection = currentSection === sectionName;
  const isOtherSectionPlaying = isSpeaking && !isThisSection;

  const handleClick = () => {
    if (isThisSection) {
      if (isPaused) {
        resume();
      } else if (isSpeaking) {
        pause();
      } else {
        speak(text, sectionName);
      }
    } else {
      // Stop other section and start this one
      stop();
      speak(text, sectionName);
    }
  };

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size={size} 
              disabled
              className={cn("shrink-0", className)}
              aria-label="Lecture audio non supportée"
            >
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>La lecture audio n'est pas supportée par votre navigateur</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getTooltipText = () => {
    if (isThisSection && isSpeaking && !isPaused) return "Pause la lecture";
    if (isThisSection && isPaused) return "Reprendre la lecture";
    if (isOtherSectionPlaying) return "Une autre section est en cours de lecture";
    return "Écouter cette section";
  };

  const getIcon = () => {
    if (isThisSection && isPaused) {
      return <VolumeX className="h-4 w-4" />;
    }
    return <Volume2 className={cn("h-4 w-4", isThisSection && isSpeaking && "animate-pulse")} />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleClick}
            className={cn(
              "shrink-0 transition-colors",
              isThisSection && isSpeaking && "text-primary",
              isOtherSectionPlaying && "text-muted-foreground opacity-50",
              className
            )}
            aria-label={getTooltipText()}
          >
            {getIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
