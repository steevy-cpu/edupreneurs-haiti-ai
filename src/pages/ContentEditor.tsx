import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, BookOpen, Sparkles, History, ArrowLeft, Shield } from "lucide-react";
import { LessonBrowser } from "@/components/content-editor/LessonBrowser";
import { LessonEditor } from "@/components/content-editor/LessonEditor";
import { AIAssistant } from "@/components/content-editor/AIAssistant";
import { ChangeLog } from "@/components/content-editor/ChangeLog";
import { RoleManagement } from "@/components/content-editor/RoleManagement";

const ContentEditor = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | null>(null);
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

      if (!['admin', 'editor'].includes(editorRole.role)) {
        toast.error("Accès refusé - Rôle éditeur requis");
        navigate("/dashboard");
        return;
      }

      setUserRole(editorRole.role as 'admin' | 'editor');
      setHasAccess(true);
      toast.success(`Bienvenue dans l'éditeur de contenu (${editorRole.role})`);
    } catch (error) {
      console.error('Access check error:', error);
      toast.error("Erreur lors de la vérification des permissions");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
          
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
                    <Sparkles className="text-primary" />
                    Éditeur de Contenu IA
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Créez et gérez le contenu des cours avec l'assistance de l'IA • Rôle: {userRole}
                  </p>
                </div>
                <FileText className="h-16 w-16 text-primary/20" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="browser" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Parcourir
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-2">
              <FileText className="h-4 w-4" />
              Éditeur
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
            {userRole === 'admin' && (
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="h-4 w-4" />
                Rôles
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browser" className="space-y-4">
            <LessonBrowser
              onSelectLesson={setSelectedLesson}
              selectedLesson={selectedLesson}
            />
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <LessonEditor
                  selectedLesson={selectedLesson}
                  onLessonUpdate={() => {
                    // Refresh lesson data
                    toast.success("Leçon mise à jour avec succès");
                  }}
                />
              </div>
              <div className="lg:col-span-1">
                <AIAssistant selectedLesson={selectedLesson} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ChangeLog selectedLesson={selectedLesson} />
          </TabsContent>

          {userRole === 'admin' && (
            <TabsContent value="roles" className="space-y-4">
              <RoleManagement />
            </TabsContent>
          )}
        </Tabs>

        {/* Data Migration Link for Admins */}
        {userRole === 'admin' && (
          <Card className="mt-6 border-2 border-dashed border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Migration des données</h4>
                  <p className="text-sm text-muted-foreground">
                    Migrez le contenu existant vers la base de données
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate("/data-migration")}>
                  Migrer →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;
