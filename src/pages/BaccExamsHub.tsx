import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  FileCheck, 
  ArrowLeft, 
  Calculator, 
  Beaker, 
  Globe, 
  Languages, 
  BookText,
  GraduationCap,
  FlaskConical,
  DollarSign,
  Users,
  Palette,
  Music
} from "lucide-react";
import judeProfile from "@/assets/eric-new-profile.png";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserGrade, isNonAcademicGrade, type AllGradeTypes } from "@/hooks/useUserGrade";
import { NonAcademicLockedOverlay } from "@/components/shared/NonAcademicLockedOverlay";
import type { Exam } from "@/features/exams/types/exam.types";

const SERIES = [
  { value: "SMP", label: "Sciences-Maths-Physique", color: "from-blue-500 to-blue-600", icon: Calculator },
  { value: "SES", label: "Sciences Éco. et Sociales", color: "from-green-500 to-green-600", icon: DollarSign },
  { value: "SVT", label: "Sciences de la Vie et Terre", color: "from-emerald-500 to-emerald-600", icon: FlaskConical },
  { value: "LLA", label: "Lettres, Langues et Arts", color: "from-purple-500 to-purple-600", icon: BookText },
];

const SUBJECT_ICONS: Record<string, any> = {
  "Mathématiques": Calculator,
  "Physique": Beaker,
  "Chimie": FlaskConical,
  "SVT": FlaskConical,
  "Philosophie": BookText,
  "Français": BookOpen,
  "Anglais": Languages,
  "Sciences Économiques": DollarSign,
  "Sociologie": Users,
  "Littérature": BookOpen,
  "Langues": Languages,
  "Histoire-Géographie": Globe,
  "Arts": Palette,
  "Musique": Music,
};

const SUBJECT_COLORS: Record<string, string> = {
  "Mathématiques": "from-blue-500 to-blue-600",
  "Physique": "from-indigo-500 to-indigo-600",
  "Chimie": "from-pink-500 to-pink-600",
  "SVT": "from-emerald-500 to-emerald-600",
  "Philosophie": "from-amber-500 to-amber-600",
  "Français": "from-purple-500 to-purple-600",
  "Anglais": "from-red-500 to-red-600",
  "Sciences Économiques": "from-green-500 to-green-600",
  "Sociologie": "from-cyan-500 to-cyan-600",
  "Littérature": "from-violet-500 to-violet-600",
  "Langues": "from-orange-500 to-orange-600",
  "Histoire-Géographie": "from-teal-500 to-teal-600",
};

const BaccExamsHub = () => {
  const navigate = useNavigate();
  const { series: urlSeries, subject: urlSubject } = useParams();
  const { userGrade, isAuthenticated: authFromHook, isLoading: gradeLoading } = useUserGrade();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(urlSeries || null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(urlSubject || null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check if user has a non-academic grade
  const isNonAcademic = authFromHook && isNonAcademicGrade(userGrade);

  useEffect(() => {
    checkAuthAndLoadExams();
  }, []);

  useEffect(() => {
    if (urlSeries) setSelectedSeries(urlSeries);
    if (urlSubject) setSelectedSubject(decodeURIComponent(urlSubject));
  }, [urlSeries, urlSubject]);

  const checkAuthAndLoadExams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    loadExams();
  };

  const loadExams = async () => {
    try {
      const { data: examsData, error } = await supabase
        .from("official_exams")
        .select("*")
        .eq("grade_level", "NS4")
        .order("year", { ascending: false })
        .order("subject");

      if (error) throw error;

      const examsWithActualCounts = await Promise.all(
        (examsData || []).map(async (exam) => {
          const { count } = await supabase
            .from("exam_exercises")
            .select("*", { count: "exact", head: true })
            .eq("exam_id", exam.id);

          return {
            ...exam,
            total_exercises: count || 0,
          };
        })
      );

      setExams(examsWithActualCounts);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = (examId: string) => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { returnTo: `/exam-preparation/${examId}` } });
      return;
    }
    navigate(`/exam-preparation/${examId}`);
  };

  const handleSeriesClick = (seriesValue: string) => {
    setSelectedSeries(seriesValue);
    setSelectedSubject(null);
    navigate(`/baccalaureat/${seriesValue}`);
  };

  const handleSubjectClick = (subjectName: string) => {
    setSelectedSubject(subjectName);
    navigate(`/baccalaureat/${selectedSeries}/${encodeURIComponent(subjectName)}`);
  };

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
      navigate(`/baccalaureat/${selectedSeries}`);
    } else if (selectedSeries) {
      setSelectedSeries(null);
      navigate('/baccalaureat');
    } else {
      navigate('/matieres');
    }
  };

  // Filter exams based on selection
  const seriesExams = selectedSeries ? exams.filter(e => e.series === selectedSeries) : [];
  const subjectExams = selectedSubject ? seriesExams.filter(e => e.subject === selectedSubject) : [];

  // Get unique subjects for selected series
  const availableSubjects = [...new Set(seriesExams.map(e => e.subject))];

  // Count exams per series
  const seriesCounts = SERIES.map(s => ({
    ...s,
    examCount: exams.filter(e => e.series === s.value).length
  }));

  // Count exams per subject
  const subjectCounts = availableSubjects.map(subj => ({
    name: subj,
    examCount: seriesExams.filter(e => e.subject === subj).length,
    icon: SUBJECT_ICONS[subj] || BookOpen,
    color: SUBJECT_COLORS[subj] || "from-gray-500 to-gray-600",
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-24 lg:pb-8">
      {/* Non-Academic User Locked State */}
      {isNonAcademic && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/matieres")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux matières
            </Button>
            <ThemeToggle />
          </div>
          <NonAcademicLockedOverlay 
            userGrade={userGrade as AllGradeTypes}
            title="Examens du Baccalauréat non disponibles"
            description="Cette section est réservée aux élèves de NS3 et NS4. Explorez nos autres fonctionnalités!"
          />
        </div>
      )}

      {/* Main content - only show if not non-academic */}
      {!isNonAcademic && (
        <>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {selectedSubject ? "Retour aux matières" : selectedSeries ? "Retour aux séries" : "Retour aux matières"}
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-10 w-10 text-amber-500" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Baccalauréat NS4
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Prépare-toi avec les anciens et modèles d'examens
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">{exams.length} Examens</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">2015-2025</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">4 Séries</span>
                </div>
              </div>
            </div>
            <img
          loading="lazy"
          decoding="async"
              src={judeProfile}
              alt="Jude"
              className="w-64 h-64 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Series Selection */}
        {!selectedSeries && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Choisissez une série
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {seriesCounts.map((series) => {
                  const SeriesIcon = series.icon;
                  return (
                    <Card
                      key={series.value}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      onClick={() => handleSeriesClick(series.value)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${series.color}`} />
                      <CardHeader className="pb-4 text-center">
                        <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${series.color} flex items-center justify-center mb-4`}>
                          <SeriesIcon className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {series.value}
                        </CardTitle>
                        <CardDescription>
                          {series.label}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                          {series.examCount} examens disponibles
                        </p>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Subject Selection */}
        {selectedSeries && !selectedSubject && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Matières - Série {selectedSeries}
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-12 w-12 rounded-full mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : subjectCounts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun examen trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun examen disponible pour la série {selectedSeries}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectCounts.map((subject) => {
                  const SubjectIcon = subject.icon;
                  return (
                    <Card
                      key={subject.name}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      onClick={() => handleSubjectClick(subject.name)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${subject.color}`} />
                      <CardHeader className="pb-4">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center mb-4`}>
                          <SubjectIcon className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {subject.name}
                        </CardTitle>
                        <CardDescription>
                          {subject.examCount} examens disponibles
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Exams List */}
        {selectedSeries && selectedSubject && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {selectedSubject} - Série {selectedSeries}
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : subjectExams.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun examen trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun examen disponible pour {selectedSubject}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subjectExams.map((exam) => (
                  <Card
                    key={exam.id}
                    className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-500/50"
                  >
                    <CardHeader>
                      <div className={`w-full h-2 rounded-full bg-gradient-to-r ${SUBJECT_COLORS[exam.subject] || "from-gray-500 to-gray-600"} mb-4`} />
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl group-hover:text-amber-500 transition-colors">
                          {exam.is_model_exam ? (
                            <span className="flex items-center gap-2">
                              <span className="text-amber-500">⭐ Modèle</span>
                              {exam.year && <span className="text-muted-foreground text-sm">({exam.year})</span>}
                            </span>
                          ) : (
                            exam.year
                          )}
                        </CardTitle>
                        <div className="flex gap-1">
                          {exam.is_model_exam && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">Modèle</Badge>
                          )}
                          {exam.session === "rattrapage" && (
                            <Badge variant="destructive">Rattrapage</Badge>
                          )}
                          {(exam.version_number || 1) > 1 && (
                            <Badge variant="outline">v{exam.version_number}</Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{exam.session === "principale" ? "Session Principale" : "Rattrapage"}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{exam.total_exercises} exercices</span>
                        <span>{exam.total_points} points</span>
                      </div>

                      {exam.pdf_url ? (
                        <Button
                          onClick={() => handlePractice(exam.id)}
                          className="w-full group-hover:scale-105 transition-transform bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Pratiquer avec Jude
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full"
                        >
                          Bientôt disponible
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default BaccExamsHub;