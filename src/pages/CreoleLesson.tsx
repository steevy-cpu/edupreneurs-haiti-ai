import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock,
  CheckCircle2,
  Users
} from "lucide-react";
import { creoleLessons7AF } from "@/data/creoleLessons";
import ReactMarkdown from "react-markdown";

const categoryColors = {
  "Lekti": "from-pink-500 to-pink-600",
  "Kominikasyon Oral": "from-purple-500 to-purple-600",
  "Gramè": "from-blue-500 to-blue-600",
  "Vokabilè": "from-green-500 to-green-600",
  "Òtograf": "from-orange-500 to-orange-600",
  "Pwodiksyon Ekri": "from-red-500 to-red-600"
};

export default function CreoleLesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const lessonId = parseInt(topicId || "1");
  const lesson = creoleLessons7AF.find(l => l.id === lessonId);
  const currentIndex = creoleLessons7AF.findIndex(l => l.id === lessonId);
  
  const previousLesson = currentIndex > 0 ? creoleLessons7AF[currentIndex - 1] : null;
  const nextLesson = currentIndex < creoleLessons7AF.length - 1 ? creoleLessons7AF[currentIndex + 1] : null;

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Leson pa jwenn</h2>
          <Button onClick={() => navigate("/creole-course")}>
            Retounen nan kou a
          </Button>
        </Card>
      </div>
    );
  }

  const colorClass = categoryColors[lesson.category];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/creole-course")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retounen nan kou a</span>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Lesson Header */}
          <Card className="p-8 mb-8">
            <div className={`h-2 bg-gradient-to-r ${colorClass} rounded-full mb-6`} />
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary" className="gap-2">
                <Users className="w-4 h-4" />
                {lesson.category}
              </Badge>
              <Badge variant="outline">{lesson.difficulty}</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-4 h-4" />
                {lesson.duration}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-xl text-muted-foreground">{lesson.description}</p>
          </Card>

          {/* Lesson Content */}
          <Card className="p-8 mb-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          </Card>

          {/* Completion Button */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Make leson sa a kòm konplete?</h3>
                <p className="text-sm text-muted-foreground">
                  Ou pral jwenn pwen pou tèrmine leson sa a
                </p>
              </div>
              <Button size="lg" className="gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Konplte leson an
              </Button>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            {previousLesson ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/creole-lesson/${previousLesson.id}`)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Leson anvan an
              </Button>
            ) : (
              <div />
            )}
            
            {nextLesson ? (
              <Button
                onClick={() => navigate(`/creole-lesson/${nextLesson.id}`)}
                className="gap-2 ml-auto"
              >
                Pwochen leson
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/creole-course")}
                className="gap-2 ml-auto"
              >
                Retounen nan kou a
                <BookOpen className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
