import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Save, Eye, FileText, Users, AlertTriangle } from "lucide-react";
import { useContentEditorRealtime } from "@/hooks/useContentEditorRealtime";

interface LessonEditorProps {
  selectedLesson: any;
  onLessonUpdate: () => void;
}

export const LessonEditor = ({ selectedLesson, onLessonUpdate }: LessonEditorProps) => {
  const [lessonData, setLessonData] = useState({
    title: "",
    slug: "",
    objectif: "",
    introduction: "",
    contenu: "",
    exemples_exercices: "",
    grade_level: "",
    is_published: false,
    youtube_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [currentUserId, setCurrentUserId] = useState<string>();

  // Get realtime collaboration features
  const { activeEditors, hasConflict } = useContentEditorRealtime(
    currentUserId,
    selectedLesson?.id
  );

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      setLessonData({
        title: selectedLesson.title || "",
        slug: selectedLesson.slug || "",
        objectif: selectedLesson.objectif || "",
        introduction: selectedLesson.introduction || "",
        contenu: selectedLesson.contenu || "",
        exemples_exercices: selectedLesson.exemples_exercices || "",
        grade_level: selectedLesson.grade_level || "",
        is_published: selectedLesson.is_published || false,
        youtube_url: selectedLesson.youtube_url || "",
      });
    }
  }, [selectedLesson]);

  const handleSave = async () => {
    if (!selectedLesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Get previous content for change log
      const previousContent = {
        title: selectedLesson.title,
        objectif: selectedLesson.objectif,
        introduction: selectedLesson.introduction,
        contenu: selectedLesson.contenu,
        exemples_exercices: selectedLesson.exemples_exercices,
      };

      // Update lesson
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          ...lessonData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLesson.id);

      if (updateError) throw updateError;

      // Log the change
      const { error: logError } = await supabase
        .from('content_change_log')
        .insert({
          lesson_id: selectedLesson.id,
          subject_id: selectedLesson.subject_id,
          changed_by: user.id,
          change_type: 'update',
          previous_content: previousContent,
          new_content: lessonData,
        });

      if (logError) console.error('Error logging change:', logError);

      toast.success("Leçon enregistrée avec succès");
      onLessonUpdate();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedLesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon dans le navigateur pour commencer l'édition</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full max-h-[calc(100vh-16rem)]">
      <CardHeader className="p-4 md:p-6 flex-shrink-0">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="break-words">Éditeur de Leçon</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Switch
                  checked={lessonData.is_published}
                  onCheckedChange={(checked) =>
                    setLessonData({ ...lessonData, is_published: checked })
                  }
                />
                <span className="text-xs md:text-sm whitespace-nowrap">Publié</span>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
              </Button>
            </div>
          </div>

          {/* Active Editors Display */}
          {activeEditors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>Éditeurs actifs:</span>
              <div className="flex -space-x-2">
                {activeEditors.slice(0, 3).map((editor) => (
                  <Avatar key={editor.user_id} className="h-5 w-5 md:h-6 md:w-6 border-2 border-background">
                    <AvatarImage src={editor.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {editor.nickname?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {activeEditors.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{activeEditors.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Conflict Warning */}
          {hasConflict && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Un autre éditeur modifie actuellement cette leçon. Vos modifications pourraient
                entrer en conflit.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6 flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="edit" className="text-xs md:text-sm">
              <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span>Éditer</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs md:text-sm">
              <Eye className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span>Aperçu</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-3 md:space-y-4 mt-3 md:mt-4 flex-1 overflow-auto">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs md:text-sm">Titre de la leçon</Label>
              <Input
                id="title"
                value={lessonData.title}
                onChange={(e) =>
                  setLessonData({ ...lessonData, title: e.target.value })
                }
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectif" className="text-xs md:text-sm">Objectif d'apprentissage</Label>
              <Textarea
                id="objectif"
                value={lessonData.objectif}
                onChange={(e) =>
                  setLessonData({ ...lessonData, objectif: e.target.value })
                }
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction" className="text-xs md:text-sm">Introduction</Label>
              <Textarea
                id="introduction"
                value={lessonData.introduction}
                onChange={(e) =>
                  setLessonData({ ...lessonData, introduction: e.target.value })
                }
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenu" className="text-xs md:text-sm">Contenu principal (HTML)</Label>
              <Textarea
                id="contenu"
                value={lessonData.contenu}
                onChange={(e) =>
                  setLessonData({ ...lessonData, contenu: e.target.value })
                }
                rows={10}
                className="font-mono text-xs md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exemples" className="text-xs md:text-sm">Exemples et Exercices (HTML)</Label>
              <Textarea
                id="exemples"
                value={lessonData.exemples_exercices}
                onChange={(e) =>
                  setLessonData({ ...lessonData, exemples_exercices: e.target.value })
                }
                rows={8}
                className="font-mono text-xs md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url" className="text-xs md:text-sm">Vidéo YouTube personnalisée (optionnel)</Label>
              <Input
                id="youtube_url"
                value={lessonData.youtube_url || ""}
                onChange={(e) =>
                  setLessonData({ ...lessonData, youtube_url: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Copiez l'URL complète ou le lien de partage YouTube pour ajouter une vidéo spécifique à cette leçon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-3 md:mt-4 flex-1 overflow-auto">
            <div className="prose prose-sm md:prose dark:prose-invert max-w-none">
              <h1 className="text-xl md:text-3xl">{lessonData.title}</h1>
              {lessonData.introduction && (
                <div className="mb-4" dangerouslySetInnerHTML={{ __html: lessonData.introduction }} />
              )}
              {lessonData.contenu && (
                <div
                  className="mb-4"
                  dangerouslySetInnerHTML={{ __html: lessonData.contenu }}
                />
              )}
              {lessonData.exemples_exercices && (
                <div dangerouslySetInnerHTML={{ __html: lessonData.exemples_exercices }} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
