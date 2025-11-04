import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/matieres")}
            className="mb-4"
          >
            ← Retour aux matières
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                Anglais - AF9
              </h1>
              <p className="text-muted-foreground">
                English language course - Grammar, comprehension, and communication
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{lessons?.length || 0} leçons disponibles</span>
          </div>
        </div>

        {/* Month Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge
            variant={selectedMonth === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedMonth(null)}
          >
            Tous les mois
          </Badge>
          {months.map((month) => (
            <Badge
              key={month}
              variant={selectedMonth === month ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedMonth(month)}
            >
              {month} ({groupedLessons![month].length})
            </Badge>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons?.map((lesson) => (
            <Card
              key={lesson.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/anglais-af9/${lesson.slug}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{lesson.mois || "N/A"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Leçon {lesson.order_index}
                  </span>
                </div>
                <CardTitle className="group-hover:text-purple-500 transition-colors">
                  {lesson.title}
                </CardTitle>
                {lesson.objectif && (
                  <CardDescription className="flex items-start gap-2">
                    <Target className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{lesson.objectif}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Commencer la leçon →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredLessons || filteredLessons.length === 0) && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Aucune leçon disponible pour le moment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnglaisCourseAF9;
