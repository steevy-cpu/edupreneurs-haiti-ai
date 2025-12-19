import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";

interface CourseLayoutProps {
  children: ReactNode;
  backPath?: string;
  backLabel?: string;
  showMusicSelector?: boolean;
}

export const CourseLayout = ({
  children,
  backPath = "/matieres",
  backLabel = "Retour aux matières",
  showMusicSelector = true
}: CourseLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(backPath)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{backLabel}</span>
            <span className="sm:hidden">Retour</span>
          </Button>
          <div className="flex items-center gap-2">
            {showMusicSelector && <MusicSelector />}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
};
