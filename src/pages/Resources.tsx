import { useNavigate } from "react-router-dom";
import { BookOpen, FileCheck, GraduationCap, Calendar, ArrowRight, Lock, Star } from "lucide-react";
import { FeatureGate } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserGrade } from "@/hooks/useUserGrade";
import { toast } from "@/hooks/use-toast";

const Resources = () => {
  const navigate = useNavigate();
  const { userGrade, isSuperUser, canAccessGrade, isAuthenticated, isLoading } = useUserGrade();

  const handleSectionClick = (path: string, requiredGrade: string, sectionName: string) => {
    if (!canAccessGrade(requiredGrade)) {
      toast({
        title: "Accès restreint",
        description: `Cette ressource est réservée aux élèves de ${requiredGrade}. Votre compte est enregistré pour ${userGrade || 'un autre niveau'}.`,
        variant: "destructive",
      });
      return;
    }
    navigate(path);
  };

  const can9AF = canAccessGrade('9AF');
  const canNS4 = canAccessGrade('NS4');

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 pt-14 sm:pt-16">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <BookOpen size={24} className="sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Ressources</h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-base opacity-90 leading-relaxed">
            Documents, vidéos et supports pédagogiques
          </p>
        </div>
      </div>

      {/* Content — gated for expired users */}
      <FeatureGate featureName="Ressources">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
        
        {/* Examens Officiels 9ème AF */}
        <Card 
          className={`border-none rounded-[20px] shadow-lg overflow-hidden transition-all duration-200 ${
            can9AF ? 'cursor-pointer hover:shadow-xl hover:scale-[1.01]' : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => handleSectionClick('/exams/9AF', '9AF', 'Examens Officiels 9ème AF')}
        >
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Examens Officiels 9ème AF
                  </h2>
                  <p className="text-xs text-muted-foreground">Préparation aux examens officiels</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {can9AF ? (
                  isSuperUser || userGrade === '9AF' ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : null
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Prépare-toi avec les anciens examens officiels de 2011 à 2025 pour la 9ème année fondamentale. Entraîne-toi avec des exercices corrigés et des explications détaillées.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                Examens complets
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5" />
                2011-2025
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                7 Matières
              </span>
            </div>

            <Button 
              variant={can9AF ? "default" : "secondary"}
              className="w-full sm:w-auto gap-2"
              disabled={!can9AF}
            >
              {can9AF ? (
                <>
                  Accéder aux examens
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Réservé aux élèves de 9AF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Baccalauréat NS4 */}
        <Card 
          className={`border-none rounded-[20px] shadow-lg overflow-hidden transition-all duration-200 ${
            canNS4 ? 'cursor-pointer hover:shadow-xl hover:scale-[1.01]' : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => handleSectionClick('/exams/NS4', 'NS4', 'Baccalauréat NS4')}
        >
          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Baccalauréat NS4
                  </h2>
                  <p className="text-xs text-muted-foreground">Examens du baccalauréat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canNS4 ? (
                  isSuperUser || userGrade === 'NS4' || userGrade === 'NS3' ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : null
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Entraîne-toi avec les examens du baccalauréat pour les 4 séries: SMP, SES, SVT et LLA. Accède à des années d'examens avec corrections.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                Examens complets
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5" />
                2015-2025
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                4 Séries
              </span>
            </div>

            <Button 
              variant={canNS4 ? "default" : "secondary"}
              className="w-full sm:w-auto gap-2"
              disabled={!canNS4}
            >
              {canNS4 ? (
                <>
                  Accéder aux examens
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Réservé aux élèves de NS4
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
      </FeatureGate>
    </div>
  );
};

export default Resources;
