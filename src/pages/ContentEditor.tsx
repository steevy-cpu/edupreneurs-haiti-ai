import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, BookOpen } from "lucide-react";
import { LessonBrowser } from "@/components/content-editor/LessonBrowser";
import { LessonPreview } from "@/components/content-editor/LessonPreview";
import { YouTubeManager } from "@/components/content-editor/YouTubeManager";
import { LessonComments } from "@/components/content-editor/LessonComments";

const ContentEditor = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      // Check if user has content editor role
      const { data: editorRole, error } = await supabase
        .from('content_editor_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || !editorRole) {
        toast.error("Accès refusé - Vous n'avez pas les permissions nécessaires");
        navigate("/dashboard");
        return;
      }

      if (!['admin', 'editor', 'viewer'].includes(editorRole.role)) {
        toast.error("Accès refusé");
        navigate("/dashboard");
        return;
      }

      setHasAccess(true);
      toast.success("Bienvenue dans la révision des leçons");
    } catch (error) {
      console.error('Access check error:', error);
      toast.error("Erreur lors de la vérification des permissions");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLesson = async () => {
    if (!selectedLesson) return;
    
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', selectedLesson.id)
        .single();

      if (error) throw error;
      setSelectedLesson(data);
    } catch (error) {
      console.error('Error refreshing lesson:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl flex items-center gap-3">
                <BookOpen className="text-primary h-8 w-8" />
                Révision des Leçons
              </CardTitle>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Révisez le contenu, ajoutez des vidéos YouTube et laissez des commentaires
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
          {/* Lesson Browser - Left Sidebar */}
          <div className="lg:col-span-4 h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]">
            <LessonBrowser
              onSelectLesson={setSelectedLesson}
              selectedLesson={selectedLesson}
            />
          </div>

          {/* Content - Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Lesson Preview - Student View */}
            <LessonPreview 
              key={selectedLesson?.id || 'no-lesson'} 
              lesson={selectedLesson} 
            />

            {/* YouTube Manager and Comments */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <YouTubeManager 
                lesson={selectedLesson}
                onUpdate={refreshLesson}
              />
              <LessonComments lesson={selectedLesson} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
