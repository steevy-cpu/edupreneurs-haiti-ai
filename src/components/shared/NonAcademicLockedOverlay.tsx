import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  GraduationCap, 
  BookOpen, 
  MessageCircle, 
  Library, 
  Gamepad2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GRADE_LABELS, type AllGradeTypes } from "@/hooks/useUserGrade";

interface NonAcademicLockedOverlayProps {
  userGrade: AllGradeTypes | null;
  title?: string;
  description?: string;
}

export function NonAcademicLockedOverlay({ 
  userGrade, 
  title = "Contenu réservé aux élèves",
  description = "Cette fonctionnalité est réservée aux élèves inscrits dans le système éducatif haïtien (7AF - NS4)."
}: NonAcademicLockedOverlayProps) {
  const navigate = useNavigate();
  
  const gradeLabel = userGrade ? GRADE_LABELS[userGrade] : 'Non défini';
  
  const availableFeatures = [
    { icon: MessageCircle, label: "Communauté", path: "/community", description: "Discutez avec d'autres utilisateurs" },
    { icon: Library, label: "Bibliothèque", path: "/library", description: "Accédez aux e-books" },
    { icon: Gamepad2, label: "Jeux", path: "/games", description: "Jouez aux échecs avec Jude" },
    { icon: Sparkles, label: "Passion Discovery", path: "/passion-discovery", description: "Découvrez vos passions" },
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 border-amber-500/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Lock Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/30 flex items-center justify-center border-2 border-amber-500/30">
              <Lock className="w-12 h-12 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground mb-4 max-w-md">
            {description}
          </p>
          
          {/* Current Grade Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <GraduationCap className="w-4 h-4 mr-2" />
            Votre niveau: {gradeLabel}
          </Badge>
          
          {/* Available Features */}
          <div className="w-full mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Fonctionnalités disponibles pour vous:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {availableFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Button
                    key={feature.path}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={() => navigate(feature.path)}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                    <span className="font-medium">{feature.label}</span>
                    <span className="text-xs text-muted-foreground">{feature.description}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Tableau de bord
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={() => navigate("/feed")}
            >
              Explorer le Feed
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Besoin d'accéder au contenu scolaire? Contactez le support pour mettre à jour votre niveau.
          </p>
        </div>
      </Card>
    </div>
  );
}
