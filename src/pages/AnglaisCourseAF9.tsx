import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, GraduationCap, ArrowLeft, Trophy, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import ericTeaching from "@/assets/eric-teaching.png";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  mois: string | null;
  order_index: number;
  objectif: string | null;
}

const AnglaisCourseAF9 = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["anglais-af9-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, slug, mois, order_index, objectif")
        .eq("grade_level", "AF9")
        .eq("is_published", true)
        .in("subject_id", (await supabase
          .from("subjects")
          .select("id")
          .eq("slug", "anglais-af9")
          .eq("grade_level", "AF9")
          .single()
        ).data?.id ? [(await supabase
          .from("subjects")
          .select("id")
          .eq("slug", "anglais-af9")
          .eq("grade_level", "AF9")
          .single()
        ).data!.id] : [])
        .order("order_index");

      if (error) throw error;
      return data as Lesson[];
    },
  });

  const groupedLessons = lessons?.reduce((acc, lesson) => {
    const month = lesson.mois || "Sans mois";
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const months = groupedLessons ? Object.keys(groupedLessons).sort((a, b) => {
    const monthOrder = ["Décembre", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  }) : [];

  const filteredLessons = selectedMonth && groupedLessons
    ? groupedLessons[selectedMonth]
    : lessons;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-cyan-950 dark:to-blue-950">
      {/* Hero Header with Eric */}
      <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate("/matieres")}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux matières
          </Button>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left side - Text content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  9ème Année Fondamentale
                </Badge>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                English Language
              </h1>
              <p className="text-xl lg:text-2xl opacity-90 mb-6 font-light">
                Master Grammar, Communication & Comprehension Skills
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-2xl font-bold">{lessons?.length || 0}</div>
                      <div className="text-sm opacity-80">Lessons</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-2xl font-bold">7</div>
                      <div className="text-sm opacity-80">Months</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-2xl font-bold">MENFP</div>
                      <div className="text-sm opacity-80">Certified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Eric image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                <img 
                  src={ericTeaching} 
                  alt="Eric - Your English Teacher" 
                  className="relative w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Learning objectives banner */}
        <Card className="mb-8 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500 rounded-xl text-white">
                <Target className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-cyan-900 dark:text-cyan-100">What You'll Master This Year</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span>Advanced Grammar & Tenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Pronouns & Adjectives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span>Conditional Sentences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full" />
                    <span>Idiomatic Expressions</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            Filter by Month
          </h3>
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={selectedMonth === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              onClick={() => setSelectedMonth(null)}
            >
              All Months
            </Badge>
            {months.map((month) => (
              <Badge
                key={month}
                variant={selectedMonth === month ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                  selectedMonth === month 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                    : 'hover:bg-cyan-50 dark:hover:bg-cyan-950'
                }`}
                onClick={() => setSelectedMonth(month)}
              >
                {month} <span className="ml-1 opacity-60">({groupedLessons![month].length})</span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons?.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer border-2 hover:border-cyan-500 overflow-hidden bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-900 dark:to-cyan-950/30"
              onClick={() => navigate(`/anglais-af9/${lesson.slug}`)}
            >
              <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    {lesson.mois || "N/A"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {lesson.order_index}
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-xl group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                  {lesson.title}
                </CardTitle>
                
                {lesson.objectif && (
                  <CardDescription className="flex items-start gap-2 mt-3 text-sm">
                    <Target className="w-4 h-4 mt-1 flex-shrink-0 text-cyan-600" />
                    <span className="line-clamp-2">{lesson.objectif}</span>
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold group-hover:shadow-lg transition-all"
                >
                  Start Lesson
                  <BookOpen className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredLessons || filteredLessons.length === 0) && (
          <Card className="p-12 text-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-cyan-500 opacity-50" />
            <p className="text-lg text-muted-foreground">
              No lessons available for this filter.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedMonth(null)}
              className="mt-4"
            >
              Show All Lessons
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnglaisCourseAF9;
