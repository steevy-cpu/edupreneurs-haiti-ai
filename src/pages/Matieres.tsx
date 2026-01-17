import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  ChevronLeft,
  GraduationCap,
  Lock,
  Star,
  Construction,
  Award
} from "lucide-react";

import menfpLogo from "@/assets/menfp-logo.webp";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMatieresData } from "@/hooks/useMatieresData";
import { GRADE_LABELS, isNonAcademicGrade, type AllGradeTypes } from "@/hooks/useUserGrade";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { toast } from "sonner";
import { useVisitor } from "@/contexts/VisitorContext";
import { LockedOverlay, VisitorSubjectCard } from "@/components/visitor";
import { MatieresSearchFilter, type SortOption, type FilterOption } from "@/components/matieres";
import { 
  type GradeLevel, 
  type Series, 
  VALID_GRADES, 
  gradeLevels, 
  iconMap, 
  colorMap 
} from "@/lib/matieresConstants";
import { MatieresGridSkeleton } from "@/components/shared/SkeletonLoaders";
import { NonAcademicLockedOverlay } from "@/components/shared/NonAcademicLockedOverlay";

// Lazy-load heavy sub-components for 3G optimization
const ContinueLearningSection = lazy(() => 
  import("@/components/matieres/ContinueLearningSection").then(m => ({ default: m.ContinueLearningSection }))
);
const SubjectCardEnhanced = lazy(() => 
  import("@/components/matieres/SubjectCardEnhanced").then(m => ({ default: m.SubjectCardEnhanced }))
);
const SeriesComparisonCards = lazy(() => 
  import("@/components/matieres/SeriesComparisonCards").then(m => ({ default: m.SeriesComparisonCards }))
);
const UserStatsWidget = lazy(() => 
  import("@/components/matieres/UserStatsWidget").then(m => ({ default: m.UserStatsWidget }))
);

export default function Matieres() {
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
  const { shouldAnimate, animationLevel, shouldShowGlow } = useNetworkAwareAnimations();
  const isSlowConnection = animationLevel === 'minimal' || animationLevel === 'reduced';
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>("7AF");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [showContent, setShowContent] = useState(false);

  // New state for enhanced features
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  
  // Lazy-loaded images for 3G optimization
  const [lazyImages, setLazyImages] = useState<{
    ericPointing?: string;
    edupreneursBg?: string;
  }>({});
  
  // Load heavy images after initial render
  useEffect(() => {
    const loadImages = async () => {
      // Only load background on fast connections
      if (!isSlowConnection) {
        const bgMod = await import("@/assets/edupreneurs-bg.png");
        setLazyImages(prev => ({ ...prev, edupreneursBg: bgMod.default }));
      }
      // Always load Eric image but after initial render
      const ericMod = await import("@/assets/eric-right-pointing.png");
      setLazyImages(prev => ({ ...prev, ericPointing: ericMod.default }));
    };
    loadImages();
  }, [isSlowConnection]);

  // UNIFIED DATA HOOK - single source of all data with parallel fetching
  const {
    userId,
    isAuthenticated,
    userGrade,
    isSuperUser,
    subjects: dbSubjects,
    isLoadingSubjects: isLoading,
    lessonCounts,
    exerciseCounts,
    progressMap,
    recentSubjects,
    isLoadingProgress: progressLoading,
    favorites,
    toggleFavorite,
    isFavorite,
    userStats,
    officialExamCount,
    baccExamCount,
    canAccessGrade,
    getProgress
  } = useMatieresData(selectedGrade, selectedSeries);

  const currentGrade = gradeLevels.find(g => g.id === selectedGrade);
  const isNS3OrNS4 = selectedGrade === "NS3" || selectedGrade === "NS4";
  
  // Check if user has a non-academic grade (UNIV or NONE)
  const isNonAcademic = isAuthenticated && isNonAcademicGrade(userGrade);

  // Auto-select user's grade on initial load with toast notification
  useEffect(() => {
    if (userGrade && isAuthenticated) {
      // Only set if userGrade is a valid academic grade level (not UNIV/NONE)
      if (VALID_GRADES.includes(userGrade as GradeLevel)) {
        setSelectedGrade(userGrade as GradeLevel);
        // Show toast notification confirming auto-detection
        const gradeLabel = gradeLevels.find(g => g.id === userGrade)?.fullName || userGrade;
        toast.success(`Niveau détecté: ${gradeLabel}`, {
          description: "Votre niveau a été automatiquement sélectionné",
          duration: 3000,
        });
      }
      // If non-academic grade (UNIV/NONE), keep default "7AF" but show locked overlay
    }
  }, []); // Only run once on mount

  const filteredSubjects = dbSubjects.filter(s => {
    if (s.grade_level !== selectedGrade) return false;
    if (isNS3OrNS4 && selectedSeries) return s.series === selectedSeries;
    return true;
  });

  // Apply search, filter, and sort
  const processedSubjects = useMemo(() => {
    let subjects = filteredSubjects.map(s => ({
      id: s.slug,
      title: s.name,
      description: s.description || '',
      icon: iconMap[s.icon_name || 'BookOpen'] || BookOpen,
      lessons: lessonCounts[s.slug] || 0,
      exercises: exerciseCounts[s.slug] || 0,
      color: colorMap[s.color || 'blue'] || 'from-blue-500 to-blue-600',
      progress: getProgress(s.slug)
    }));

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      subjects = subjects.filter(s => 
        s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterOption === "with-content") {
      subjects = subjects.filter(s => s.lessons > 0);
    } else if (filterOption === "favorites") {
      subjects = subjects.filter(s => isFavorite(s.id));
    }

    // Sort
    subjects.sort((a, b) => {
      switch (sortOption) {
        case "name-asc": return a.title.localeCompare(b.title);
        case "name-desc": return b.title.localeCompare(a.title);
        case "lessons-desc": return b.lessons - a.lessons;
        case "lessons-asc": return a.lessons - b.lessons;
        case "progress-desc": return (b.progress?.progressPercent || 0) - (a.progress?.progressPercent || 0);
        default: return 0;
      }
    });

    return subjects;
  }, [filteredSubjects, searchQuery, filterOption, sortOption, lessonCounts, exerciseCounts, getProgress, isFavorite]);

  // Continue learning subjects
  const continueLearningSubjects = useMemo(() => {
    return recentSubjects
      .map(slug => {
        const subject = filteredSubjects.find(s => s.slug === slug);
        const progress = getProgress(slug);
        if (!subject || !progress || progress.progressPercent === 0) return null;
        return {
          slug,
          name: subject.name,
          icon: iconMap[subject.icon_name || 'BookOpen'] || BookOpen,
          color: colorMap[subject.color || 'blue'] || 'from-blue-500 to-blue-600',
          ...progress
        };
      })
      .filter(Boolean) as any[];
  }, [recentSubjects, filteredSubjects, getProgress]);

  const totalLessons = processedSubjects.reduce((sum, s) => sum + s.lessons, 0);
  const totalExercises = processedSubjects.reduce((sum, s) => sum + s.exercises, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold hidden sm:inline">EDUPRENEURS</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Header - Network-aware with lazy-loaded background */}
      <div className="relative pt-20 pb-12 md:pt-24 md:pb-16 overflow-hidden">
        {/* Background image - only show if loaded and not slow connection */}
        {lazyImages.edupreneursBg && !isSlowConnection && (
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105" 
            style={{ backgroundImage: `url(${lazyImages.edupreneursBg})` }} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background" />
        {/* Blur effects - only show on fast connections */}
        {shouldShowGlow && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent mix-blend-overlay" />
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/15 rounded-full blur-3xl animate-pulse delay-700" />
          </>
        )}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/30 mb-6 animate-fade-in">
              <img src={menfpLogo} alt="MENFP" className="w-6 h-6 rounded-full" />
              <span className="text-sm font-semibold text-white drop-shadow-md">Programme officiel MENFP</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight">
              <span className="inline-flex items-center gap-3 justify-center flex-wrap">
                <span className="p-2 rounded-xl bg-primary/30 backdrop-blur-sm border border-primary/40 animate-fade-in">
                  <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </span>
                <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] animate-fade-in">Programmes</span>
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-primary to-teal-300 bg-clip-text text-transparent drop-shadow-lg animate-fade-in">
                Académiques
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-8 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Contenu aligné sur le programme officiel du Ministère de l'Éducation Nationale d'Haïti
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span className="text-sm font-bold text-white">7 niveaux</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                <Award className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-bold text-white">4 séries Bac</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-white">Certifié MENFP</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Non-Academic User Locked State */}
        {isNonAcademic && (
          <NonAcademicLockedOverlay 
            userGrade={userGrade as AllGradeTypes}
            title="Matières scolaires non disponibles"
            description="Cette section est réservée aux élèves inscrits dans le système éducatif haïtien (7AF - NS4). Explorez nos autres fonctionnalités!"
          />
        )}

        {/* Main content - only show if not non-academic */}
        {!isNonAcademic && (
          <>
        {/* Grade Level Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Sélectionnez votre niveau</h3>
          <div 
            className="flex overflow-x-auto pb-2 gap-2 justify-start sm:justify-center scrollbar-hide"
            style={{ touchAction: 'pan-x' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {gradeLevels.map((grade) => {
              const isUserGrade = userGrade === grade.id;
              const isLocked = isAuthenticated && !canAccessGrade(grade.id);
              
              return (
                <Button
                  key={grade.id}
                  variant={selectedGrade === grade.id ? "default" : "outline"}
                  onClick={() => {
                    if (isLocked) {
                      toast.error(
                        `Ce niveau est verrouillé. Votre compte est enregistré pour ${GRADE_LABELS[userGrade!] || userGrade}. Contactez le support pour changer de niveau.`
                      );
                      return;
                    }
                    setSelectedGrade(grade.id);
                    setSelectedSeries(null);
                    setShowContent(false);
                  }}
                  className={`min-w-[70px] flex-shrink-0 transition-all duration-200 gap-1.5 ${
                    selectedGrade === grade.id 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' 
                      : isLocked 
                        ? 'opacity-50 cursor-not-allowed hover:bg-muted' 
                        : 'hover:border-primary/50'
                  }`}
                  size="sm"
                >
                  {isUserGrade && <Star className="w-3 h-3 fill-current" />}
                  {isLocked && <Lock className="w-3 h-3" />}
                  {grade.label}
                </Button>
              );
            })}
          </div>
          {isAuthenticated && userGrade && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              <Star className="w-3 h-3 inline mr-1 fill-primary text-primary" />
              Votre niveau: <span className="font-semibold text-primary">{GRADE_LABELS[userGrade]}</span>
              {isSuperUser && <span className="ml-2 text-amber-500">(Accès complet)</span>}
            </p>
          )}
        </div>

        {/* Series Selection for NS3/NS4 - only shows after clicking Explorer */}
        {isNS3OrNS4 && !selectedSeries && showContent && (
          <SeriesComparisonCards onSelectSeries={(series) => setSelectedSeries(series)} />
        )}

        {/* Back to series button */}
        {isNS3OrNS4 && selectedSeries && (
          <div className="mb-6">
            <Button variant="outline" onClick={() => setSelectedSeries(null)} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Retour aux séries
            </Button>
          </div>
        )}

        {/* Current Grade Display */}
        {(!isNS3OrNS4 || selectedSeries) && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {currentGrade?.fullName} ({currentGrade?.label})
            </h2>
            <p className="text-muted-foreground">
              Découvrez les matières qui préparent à l'excellence académique
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-none rounded-xl overflow-hidden">
                <div className="p-0">
                  <div className="h-32 w-full bg-muted animate-pulse" />
                  <div className="p-4">
                    <div className="h-5 w-3/4 mb-2 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full mb-3 bg-muted animate-pulse rounded" />
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Content in Development Overlay - shows when content is hidden */}
        {!isLoading && !showContent && selectedGrade && (
          <div className="animate-fade-in">
            <Card className="p-8 sm:p-12 md:p-16 mb-8 border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              
              <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/30 flex items-center justify-center border-2 border-amber-500/30">
                    <Construction className="w-12 h-12 sm:w-16 sm:h-16 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  🚧 Contenu en cours de développement
                </h2>
                
                {/* Description */}
                <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
                  Notre équipe travaille activement sur le contenu pour <span className="font-semibold text-foreground">{currentGrade?.fullName}</span>. 
                  De nouvelles matières et leçons sont régulièrement ajoutées pour enrichir votre expérience d'apprentissage.
                </p>
                
                {/* Stats preview */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {processedSubjects.length} matières disponibles
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {totalLessons} leçons
                  </Badge>
                </div>
                
                {/* CTA Button */}
                <Button 
                  size="lg"
                  onClick={() => setShowContent(true)}
                  className="gap-3 text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <GraduationCap className="w-5 h-5" />
                  Explorer {selectedGrade}
                  {isNS3OrNS4 && selectedSeries && ` - ${selectedSeries}`}
                </Button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Cliquez pour découvrir le contenu disponible
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content - only visible after clicking Explorer */}
        {((!isNS3OrNS4 && processedSubjects.length > 0) || (isNS3OrNS4 && selectedSeries)) && !isLoading && showContent ? (
          <div className="animate-fade-in">
            {/* User Stats Widget */}
            <UserStatsWidget gradeLevel={selectedGrade} stats={userStats} isLoading={isLoading} isAuthenticated={isAuthenticated} />

            {/* Continue Learning Section */}
            <ContinueLearningSection subjects={continueLearningSubjects} isLoading={progressLoading} />

            {/* Stats Section */}
            <Card className="p-4 sm:p-6 mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{processedSubjects.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Matières</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{totalLessons > 0 ? `${totalLessons}+` : '0'}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Leçons</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{totalExercises > 0 ? `${totalExercises}+` : '0'}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Exercices</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">∞</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Possibilités</div>
                </div>
              </div>
            </Card>

            {/* 9AF Exam Section */}
            {selectedGrade === '9AF' && (
              <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-lg bg-white flex items-center justify-center p-2 shadow-md">
                    <img src={menfpLogo} alt="MENFP Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">Préparation aux Examens Officiels</h3>
                    <p className="text-muted-foreground mb-4">
                      Prépare-toi pour l'examen officiel de 9ème AF avec Jude!
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Badge variant="secondary">{officialExamCount} examens officiels</Badge>
                      <Badge variant="secondary">Tuteur IA Jude</Badge>
                    </div>
                  </div>
                  <Button size="lg" onClick={() => navigate('/examens-officiels')} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold">
                    Commencer la préparation
                  </Button>
                </div>
              </Card>
            )}

            {/* Bac Exam Section */}
            {(selectedGrade === 'NS3' || selectedGrade === 'NS4') && selectedSeries && (
              <Card className="p-6 mb-8 bg-gradient-to-br from-amber-500/5 to-orange-500/10 border-amber-500/20">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">Examens du Baccalauréat NS4</h3>
                    <p className="text-muted-foreground mb-4">
                      Prépare-toi avec les anciens et modèles d'examens.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">📚 {baccExamCount} examens</Badge>
                      <Badge variant="secondary">🤖 Tuteur IA Jude</Badge>
                    </div>
                  </div>
                  <Button size="lg" onClick={() => navigate(`/baccalaureat${selectedSeries ? `/${selectedSeries}` : ''}`)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Commencer
                  </Button>
                </div>
              </Card>
            )}

            {/* Search and Filter */}
            <MatieresSearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
              filterOption={filterOption}
              onFilterChange={setFilterOption}
              totalResults={processedSubjects.length}
            />

            {/* Subjects Grid */}
            <div id="subjects-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {processedSubjects.map((subject) => (
                isVisitor ? (
                  <VisitorSubjectCard
                    key={subject.id}
                    id={subject.id}
                    title={subject.title}
                    description={subject.description}
                    icon={subject.icon}
                    lessons={subject.lessons}
                    exercises={subject.exercises}
                    color={subject.color}
                    progressPercent={subject.progress?.progressPercent}
                    completedLessons={subject.progress?.completedLessons}
                    isPopular={subject.lessons > 20}
                    estimatedHours={Math.round(subject.lessons * 0.5)}
                  />
                ) : (
                  <SubjectCardEnhanced
                    key={subject.id}
                    id={subject.id}
                    title={subject.title}
                    description={subject.description}
                    icon={subject.icon}
                    lessons={subject.lessons}
                    exercises={subject.exercises}
                    color={subject.color}
                    isFavorite={isFavorite(subject.id)}
                    onToggleFavorite={() => toggleFavorite(subject.id)}
                    progressPercent={subject.progress?.progressPercent}
                    completedLessons={subject.progress?.completedLessons}
                    isPopular={subject.lessons > 20}
                    estimatedHours={Math.round(subject.lessons * 0.5)}
                  />
                )
              ))}
            </div>
          </div>
        ) : null}

        {/* No subjects message */}
        {!isLoading && processedSubjects.length === 0 && (!isNS3OrNS4 || selectedSeries) && (
          <Card className="p-8 sm:p-12 text-center mb-8 border-dashed">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || filterOption !== "all" ? "Aucun résultat" : "Contenu en préparation"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {searchQuery || filterOption !== "all" 
                    ? "Essayez de modifier vos critères de recherche" 
                    : "Les matières pour ce niveau sont en cours de développement."}
                </p>
              </div>
              {(searchQuery || filterOption !== "all") ? (
                <Button variant="outline" onClick={() => { setSearchQuery(""); setFilterOption("all"); }}>
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setSelectedGrade("7AF")}>
                  Explorer 7AF
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Jude Mascot Section */}
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            <div className="flex-shrink-0">
              <div className="relative">
                {shouldShowGlow && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                )}
                {lazyImages.ericPointing ? (
                  <img src={lazyImages.ericPointing} alt="Jude - Assistant IA" className="w-32 h-32 sm:w-48 sm:h-48 object-contain relative z-10" loading="lazy" />
                ) : (
                  <Skeleton className="w-32 h-32 sm:w-48 sm:h-48 rounded-full" />
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">Besoin d'aide pour choisir ?</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Jude, votre guide pédagogique, est là pour vous aider à choisir les bonnes matières et à comprendre le programme.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary">✨ Conseils personnalisés</Badge>
                <Badge variant="secondary">🎯 Orientation académique</Badge>
                <Badge variant="secondary">🤖 Support 24/7</Badge>
              </div>
            </div>
          </div>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}
