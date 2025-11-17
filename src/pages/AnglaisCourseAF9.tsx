import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, GraduationCap, ArrowLeft, Trophy, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import ericWelcome from "@/assets/eric-welcome.png";
import DOMPurify from 'dompurify';
import { EricChatbot } from "@/components/EricChatbot";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        .eq("grade_level", "9AF")
        .eq("is_published", true)
        .in("subject_id", (await supabase
          .from("subjects")
          .select("id")
          .eq("slug", "anglais-af9")
          .eq("grade_level", "9AF")
          .single()
        ).data?.id ? [(await supabase
          .from("subjects")
          .select("id")
          .eq("slug", "anglais-af9")
          .eq("grade_level", "9AF")
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-950 dark:to-violet-950">
      {/* Hero Header with Eric */}
      <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left side - Text content */}
            <div className="flex-1 space-y-6">
              <Badge variant="secondary" className="text-base px-5 py-2 bg-white/20 border-white/30">
                <GraduationCap className="w-5 h-5 mr-2" />
                9ème Année Fondamentale
              </Badge>
              
              <div>
                <h1 className="text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg tracking-tight">
                  English Language
                </h1>
                <p className="text-2xl lg:text-3xl opacity-95 font-light leading-relaxed">
                  Master Grammar, Communication & Comprehension Skills
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
                  <BookOpen className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-bold">{lessons?.length || 0}</div>
                  <div className="text-sm opacity-90">Lessons</div>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
                  <Calendar className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-bold">7</div>
                  <div className="text-sm opacity-90">Months</div>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
                  <Trophy className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-bold">A+</div>
                  <div className="text-sm opacity-90">MENFP</div>
                </div>
              </div>
            </div>

            {/* Right side - Eric image */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400 to-purple-500 rounded-full blur-3xl opacity-40 animate-pulse" />
              <img 
                src={ericWelcome} 
                alt="Eric - Your English Teacher" 
                className="relative w-80 h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Learning objectives banner */}
        <Card className="mb-10 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 border-purple-200 dark:border-purple-800 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl text-white shadow-lg">
                <Target className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">What You'll Master This Year</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0" />
                    <span className="text-foreground">Advanced Grammar & Tenses</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-2.5 h-2.5 bg-violet-500 rounded-full flex-shrink-0" />
                    <span className="text-foreground">Pronouns & Adjectives</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-2.5 h-2.5 bg-fuchsia-500 rounded-full flex-shrink-0" />
                    <span className="text-foreground">Conditional Sentences</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-2.5 h-2.5 bg-purple-600 rounded-full flex-shrink-0" />
                    <span className="text-foreground">Idiomatic Expressions</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month Filter */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            Filter by Month
          </h3>
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={selectedMonth === null ? "default" : "outline"}
              className="cursor-pointer px-5 py-2.5 text-sm transition-all hover:scale-105 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-md"
              onClick={() => setSelectedMonth(null)}
            >
              All Months
            </Badge>
            {months.map((month) => (
              <Badge
                key={month}
                variant={selectedMonth === month ? "default" : "outline"}
                className={`cursor-pointer px-5 py-2.5 text-sm transition-all hover:scale-105 ${
                  selectedMonth === month 
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 shadow-md' 
                    : 'hover:bg-purple-50 dark:hover:bg-purple-950 border-purple-200 dark:border-purple-800'
                }`}
                onClick={() => setSelectedMonth(month)}
              >
                {month} <span className="ml-1 opacity-70">({groupedLessons![month].length})</span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons?.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer border-2 hover:border-purple-500 overflow-hidden bg-card hover:-translate-y-1"
              onClick={() => navigate(`/anglais-af9/${lesson.slug}`)}
            >
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500" />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 shadow-sm">
                    {lesson.mois || "N/A"}
                  </Badge>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {lesson.order_index}
                  </div>
                </div>
                
                <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight mb-3">
                  {lesson.title}
                </CardTitle>
                
                {lesson.objectif && (
                  <CardDescription className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {lesson.objectif.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}
                    </span>
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold group-hover:shadow-lg transition-all"
                >
                  Start Lesson
                  <BookOpen className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredLessons || filteredLessons.length === 0) && (
          <Card className="p-12 text-center bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-50" />
            <p className="text-lg text-muted-foreground">
              No lessons available for this filter.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedMonth(null)}
              className="mt-4 border-purple-300 dark:border-purple-700"
            >
              Show All Lessons
            </Button>
          </Card>
        )}
      </div>
      
      <EricChatbot />
    </div>
  );
};

export default AnglaisCourseAF9;
