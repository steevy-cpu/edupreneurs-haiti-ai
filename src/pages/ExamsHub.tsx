import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, FileCheck, ArrowLeft } from "lucide-react";
import ericTeaching from "@/assets/eric-teaching.png";

interface Exam {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  year: number;
  total_exercises: number;
  total_points: number;
  pdf_url: string | null;
}

const SUBJECTS = [
  { name: "Mathématiques", color: "from-blue-500 to-blue-600" },
  { name: "Français", color: "from-purple-500 to-purple-600" },
  { name: "Sciences Expérimentales", color: "from-green-500 to-green-600" },
  { name: "Sciences Sociales", color: "from-amber-500 to-amber-600" },
  { name: "Anglais", color: "from-red-500 to-red-600" },
  { name: "Espagnol", color: "from-orange-500 to-orange-600" },
  { name: "Créole", color: "from-cyan-500 to-cyan-600" },
];

const ExamsHub = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const { data, error } = await supabase
        .from("official_exams")
        .select("*")
        .eq("grade_level", "9AF")
        .order("year", { ascending: false })
        .order("subject");

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = selectedSubject === "all" 
    ? exams 
    : exams.filter(exam => exam.subject === selectedSubject);

  const getSubjectColor = (subject: string) => {
    return SUBJECTS.find(s => s.name === subject)?.color || "from-gray-500 to-gray-600";
  };

  const handlePractice = (examId: string) => {
    navigate(`/exam-preparation/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/matieres")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux matières
          </Button>
          
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Examens Officiels 9ème AF
              </h1>
              <p className="text-xl text-muted-foreground">
                Prépare-toi avec les anciens examens officiels de 2011 à 2025
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{exams.length} Examens</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">2011-2025</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span className="font-semibold">7 Matières</span>
                </div>
              </div>
            </div>
            <img 
              src={ericTeaching} 
              alt="Eric" 
              className="w-64 h-64 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subject Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Filtrer par matière</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubject === "all" ? "default" : "outline"}
              onClick={() => setSelectedSubject("all")}
              className="rounded-full"
            >
              Toutes les matières
            </Button>
            {SUBJECTS.map((subject) => (
              <Button
                key={subject.name}
                variant={selectedSubject === subject.name ? "default" : "outline"}
                onClick={() => setSelectedSubject(subject.name)}
                className="rounded-full"
              >
                {subject.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
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
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun examen trouvé</h3>
            <p className="text-muted-foreground">
              Aucun examen disponible pour cette sélection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExams.map((exam) => (
              <Card 
                key={exam.id} 
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${getSubjectColor(exam.subject)} mb-4`} />
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {exam.subject}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-lg font-bold">{exam.year}</span>
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
                      className="w-full group-hover:scale-105 transition-transform"
                    >
                      Pratiquer avec Eric
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
    </div>
  );
};

export default ExamsHub;
