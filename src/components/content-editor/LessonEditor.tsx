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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Éditeur de Leçon
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={lessonData.is_published}
                onCheckedChange={(checked) =>
                  setLessonData({ ...lessonData, is_published: checked })
                }
              />
              <span className="text-sm">Publié</span>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>

          {/* Active Editors Display */}
          {activeEditors.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Éditeurs actifs:</span>
              <div className="flex -space-x-2">
                {activeEditors.slice(0, 3).map((editor) => (
                  <Avatar key={editor.user_id} className="h-6 w-6 border-2 border-background">
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
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">
              <FileText className="mr-2 h-4 w-4" />
              Éditer
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la leçon</Label>
              <Input
                id="title"
                value={lessonData.title}
                onChange={(e) =>
                  setLessonData({ ...lessonData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectif">Objectif d'apprentissage</Label>
              <Textarea
                id="objectif"
                value={lessonData.objectif}
                onChange={(e) =>
                  setLessonData({ ...lessonData, objectif: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={lessonData.introduction}
                onChange={(e) =>
                  setLessonData({ ...lessonData, introduction: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenu">Contenu principal (HTML)</Label>
              <Textarea
                id="contenu"
                value={lessonData.contenu}
                onChange={(e) =>
                  setLessonData({ ...lessonData, contenu: e.target.value })
                }
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exemples">Exemples et Exercices (HTML)</Label>
              <Textarea
                id="exemples"
                value={lessonData.exemples_exercices}
                onChange={(e) =>
                  setLessonData({ ...lessonData, exemples_exercices: e.target.value })
                }
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="prose dark:prose-invert max-w-none">
              <h1>{lessonData.title}</h1>
              {lessonData.objectif && (
                <div className="bg-primary/10 p-4 rounded-lg mb-4">
                  <h3 className="mt-0">🎯 Objectif</h3>
                  <p>{lessonData.objectif}</p>
                </div>
              )}
              {lessonData.introduction && (
                <div className="mb-4">
                  <h3>Introduction</h3>
                  <p>{lessonData.introduction}</p>
                </div>
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
