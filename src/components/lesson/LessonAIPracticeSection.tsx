import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EnglishPracticeChat } from "@/components/EnglishPracticeChat";
import { SpanishPracticeChat } from "@/components/SpanishPracticeChat";
const judeChairDesk = "/images/eric-chair-desk-200w.webp";

interface LessonAIPracticeSectionProps {
  subjectName: string;
  lessonTitle: string;
  lessonObjective: string;
  lessonSlug: string;
  gradeLevel: string;
}

type SupportedLanguage = 'anglais' | 'espagnol';

const getLanguageConfig = (subjectName: string): { language: SupportedLanguage; title: string; description: string } | null => {
  const subjectLower = subjectName.toLowerCase();
  
  if (subjectLower.includes('anglais') || subjectLower.includes('english')) {
    return {
      language: 'anglais',
      title: 'Practice Your English with Jude AI',
      description: 'Have a conversation in English to practice what you learned!'
    };
  }
  
  if (subjectLower.includes('espagnol') || subjectLower.includes('spanish')) {
    return {
      language: 'espagnol',
      title: 'Practica tu Español con Jude AI',
      description: '¡Practica español conversando con Jude!'
    };
  }
  
  return null;
};

export const LessonAIPracticeSection = ({
  subjectName,
  lessonTitle,
  lessonObjective,
  lessonSlug,
  gradeLevel
}: LessonAIPracticeSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userNickname, setUserNickname] = useState('Student');
  
  const languageConfig = getLanguageConfig(subjectName);
  
  useEffect(() => {
    const fetchUserNickname = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.nickname) {
          setUserNickname(profile.nickname);
        }
      }
    };
    
    fetchUserNickname();
  }, []);
  
  // Don't render if not a supported language subject
  if (!languageConfig) {
    return null;
  }
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors p-3 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <img
                    src={judeChairDesk}
                    srcSet="/images/eric-chair-desk-200w.webp 200w, /images/eric-chair-desk-400w.webp 400w"
                    sizes="(max-width: 640px) 48px, 64px"
                    alt="Jude AI Assistant"
                    className="relative w-12 h-12 sm:w-16 sm:h-16 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{languageConfig.title}</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {languageConfig.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-0 sm:p-2">
            {languageConfig.language === 'anglais' ? (
              <EnglishPracticeChat
                lessonTitle={lessonTitle}
                lessonObjective={lessonObjective}
                lessonSlug={lessonSlug}
                gradeLevel={gradeLevel}
                userNickname={userNickname}
              />
            ) : (
              <SpanishPracticeChat
                lessonTitle={lessonTitle}
                lessonObjective={lessonObjective}
                lessonSlug={lessonSlug}
                gradeLevel={gradeLevel}
                userNickname={userNickname}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
