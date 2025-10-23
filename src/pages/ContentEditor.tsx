import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, BookOpen, Sparkles, History, ArrowLeft, Shield, GitBranch, Package } from "lucide-react";
import { LessonBrowser } from "@/components/content-editor/LessonBrowser";
import { LessonEditor } from "@/components/content-editor/LessonEditor";
import AIAssistant from "@/components/content-editor/AIAssistant";
import { ChangeLog } from "@/components/content-editor/ChangeLog";
import { RoleManagement } from "@/components/content-editor/RoleManagement";
import { VersionHistory } from "@/components/content-editor/VersionHistory";
import { WorkflowManagement } from "@/components/content-editor/WorkflowManagement";
import { BulkOperations } from "@/components/content-editor/BulkOperations";

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

  // Helper function: Create new lesson
  const createNewLesson = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: newLesson, error } = await supabase
        .from('lessons')
        .insert({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
          subject_id: data.subject_id,
          grade_level: data.grade_level,
          objectif: data.objectif || '',
          introduction: data.introduction || '',
          contenu: data.contenu || '',
          exemples_exercices: data.exemples_exercices || '',
          created_by: user.id,
          workflow_status: 'draft',
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setSelectedLesson(newLesson);
      toast.success(`Leçon "${data.title}" créée avec succès!`);
      return newLesson;
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error("Erreur lors de la création de la leçon");
      throw error;
    }
  };

  // Helper function: Update lesson metadata
  const updateLessonMetadata = async (lessonId: string, updates: any) => {
    try {
      const allowedFields = ['title', 'slug', 'grade_level', 'objectif', 'introduction', 'mois', 'references'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

      const { data, error } = await supabase
        .from('lessons')
        .update({
          ...filteredUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      setSelectedLesson(data);
      toast.success("Métadonnées mises à jour avec succès!");
      return data;
    } catch (error) {
      console.error('Error updating metadata:', error);
      toast.error("Erreur lors de la mise à jour des métadonnées");
      throw error;
    }
  };

  // Helper function: Change workflow status
  const changeWorkflowStatus = async (lessonId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const updates: any = {
        workflow_status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If submitting for review, set reviewed_by
      if (newStatus === 'review') {
        updates.reviewed_by = user.id;
      }

      // If publishing, set is_published and scheduled date
      if (newStatus === 'published') {
        updates.is_published = true;
      }

      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      setSelectedLesson(data);
      toast.success(`Statut changé en "${newStatus}" avec succès!`);
      return data;
    } catch (error) {
      console.error('Error changing workflow status:', error);
      toast.error("Erreur lors du changement de statut");
      throw error;
    }
  };

  // Helper function: Bulk update lessons
  const bulkUpdateLessons = async (lessonIds: string[], updates: any) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', lessonIds)
        .select();

      if (error) throw error;

      toast.success(`${lessonIds.length} leçon(s) mise(s) à jour avec succès!`);
      return data;
    } catch (error) {
      console.error('Error bulk updating lessons:', error);
      toast.error("Erreur lors de la mise à jour en masse");
      throw error;
    }
  };

  // Helper function: Delete lesson
  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
      }
      
      toast.success("Leçon supprimée avec succès!");
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error("Erreur lors de la suppression de la leçon");
      throw error;
    }
  };

  const handleApplyContent = async (content: string, operation: string, data?: any) => {
    try {
      // Handle structural operations
      if (operation === 'create_lesson') {
        if (!data) {
          toast.error("Données manquantes pour créer la leçon");
          return;
        }
        await createNewLesson(data);
        return;
      }

      if (operation === 'update_metadata') {
        if (!selectedLesson || !data) {
          toast.error("Leçon ou données manquantes");
          return;
        }
        await updateLessonMetadata(selectedLesson.id, data);
        return;
      }

      if (operation === 'workflow_change') {
        if (!selectedLesson || !data?.targetStatus) {
          toast.error("Leçon ou statut manquant");
          return;
        }
        await changeWorkflowStatus(selectedLesson.id, data.targetStatus);
        return;
      }

      if (operation === 'delete') {
        if (!selectedLesson) {
          toast.error("Aucune leçon sélectionnée");
          return;
        }
        await deleteLesson(selectedLesson.id);
        return;
      }

      if (operation === 'bulk_update') {
        if (!data?.lessonIds || !data?.updates) {
          toast.error("Données manquantes pour la mise à jour en masse");
          return;
        }
        await bulkUpdateLessons(data.lessonIds, data.updates);
        return;
      }

      // Handle content operations (existing logic)
      if (!selectedLesson) {
        toast.error("Aucune leçon sélectionnée");
        return;
      }

      let updatedLesson = { ...selectedLesson };

      if (operation === 'generate' || operation === 'enhance') {
        const htmlMatch = content.match(/<div[^>]*>[\s\S]*<\/div>|<p>[\s\S]*<\/p>/);
        if (htmlMatch) {
          updatedLesson.contenu = htmlMatch[0];
        } else {
          updatedLesson.contenu = content;
        }
      } else if (operation === 'exercises') {
        updatedLesson.exemples_exercices = (selectedLesson.exemples_exercices || '') + '\n\n' + content;
      } else if (operation === 'translate') {
        updatedLesson.contenu = (selectedLesson.contenu || '') + '\n\n<h3>Traduction créole</h3>\n' + content;
      } else if (operation === 'simplify') {
        updatedLesson.contenu = content;
      } else if (operation === 'quiz') {
        updatedLesson.exemples_exercices = (selectedLesson.exemples_exercices || '') + '\n\n<h3>Quiz</h3>\n' + content;
      } else if (operation === 'youtube') {
        // Extract YouTube URL from content
        const urlMatch = content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        if (urlMatch && urlMatch[0]) {
          updatedLesson.youtube_url = urlMatch[0];
          toast.success("URL YouTube ajoutée avec succès!");
        } else {
          toast.error("URL YouTube invalide");
          return;
        }
      } else {
        updatedLesson.contenu = content;
      }

      const updateData: any = { 
        contenu: updatedLesson.contenu,
        exemples_exercices: updatedLesson.exemples_exercices,
        updated_at: new Date().toISOString()
      };

      // Add youtube_url to update if it was modified
      if (operation === 'youtube' && updatedLesson.youtube_url) {
        updateData.youtube_url = updatedLesson.youtube_url;
      }

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', selectedLesson.id);

      if (error) throw error;

      setSelectedLesson(updatedLesson);
      toast.success("Modifications appliquées avec succès!");
    } catch (error) {
      console.error('Error applying content:', error);
      toast.error("Erreur lors de l'application des modifications");
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="w-full max-w-[1920px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-4 md:mb-6 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-3 md:mb-4"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">Retour</span>
          </Button>
          
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-2 md:gap-3">
                    <Sparkles className="text-primary h-5 w-5 md:h-6 md:w-6" />
                    <span className="break-words">Éditeur de Contenu IA</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Créez et gérez le contenu des cours • Rôle: {userRole}
                  </p>
                </div>
                <FileText className="hidden sm:block h-12 w-12 md:h-16 md:w-16 text-primary/20 flex-shrink-0" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="editor" className="space-y-3 md:space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
            <TabsList className={`grid w-full min-w-[600px] md:min-w-0 ${userRole === 'admin' ? 'grid-cols-7' : 'grid-cols-5'}`}>
              <TabsTrigger value="browser" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Parcourir</span>
                <span className="sm:hidden">Nav</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Éditeur</span>
                <span className="sm:hidden">Édit</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <GitBranch className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Workflow</span>
                <span className="sm:hidden">Flow</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <History className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Versions</span>
                <span className="sm:hidden">Ver</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <History className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Historique</span>
                <span className="sm:hidden">Hist</span>
              </TabsTrigger>
              {userRole === 'admin' && (
                <>
                  <TabsTrigger value="bulk" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                    <Package className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Masse</span>
                    <span className="sm:hidden">Bulk</span>
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                    <Shield className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Rôles</span>
                    <span className="sm:hidden">Rol</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          <TabsContent value="browser" className="space-y-4 flex-1 overflow-auto">
            <LessonBrowser
              onSelectLesson={setSelectedLesson}
              selectedLesson={selectedLesson}
            />
          </TabsContent>

          <TabsContent value="editor" className="space-y-3 md:space-y-4 flex-1 overflow-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4">
              <div className="xl:col-span-2 min-w-0">
                <LessonEditor
                  selectedLesson={selectedLesson}
                  onLessonUpdate={() => {
                    toast.success("Leçon mise à jour avec succès");
                  }}
                />
              </div>
              <div className="xl:col-span-1 min-w-0">
                <AIAssistant 
                  selectedLesson={selectedLesson}
                  onApplyContent={handleApplyContent}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4 flex-1 overflow-auto">
            <WorkflowManagement
              selectedLesson={selectedLesson}
              onUpdate={() => {
                toast.success("Workflow mis à jour");
              }}
            />
          </TabsContent>

          <TabsContent value="versions" className="space-y-4 flex-1 overflow-auto">
            <VersionHistory
              selectedLesson={selectedLesson}
              onRestore={() => {
                toast.success("Version restaurée");
              }}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 flex-1 overflow-auto">
            <ChangeLog selectedLesson={selectedLesson} />
          </TabsContent>

          {userRole === 'admin' && (
            <>
              <TabsContent value="bulk" className="space-y-4 flex-1 overflow-auto">
                <BulkOperations />
              </TabsContent>
              <TabsContent value="roles" className="space-y-4 flex-1 overflow-auto">
                <RoleManagement />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Data Migration Link for Admins */}
        {userRole === 'admin' && (
          <Card className="mt-4 md:mt-6 border-2 border-dashed border-primary/30">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm md:text-base">Migration des données</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Migrez le contenu existant vers la base de données
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/data-migration")}
                  className="w-full sm:w-auto"
                >
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
