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
import { Save, Eye, FileText, Users, AlertTriangle, Sparkles, Loader2, ToggleLeft } from "lucide-react";
import { useContentEditorRealtime } from "@/hooks/useContentEditorRealtime";
import { SectionGenerator } from "./SectionGenerator";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { createSanitizedMarkup } from "@/lib/sanitize";
import { useLessonPublishable } from "@/features/content-editor/hooks/useLessonPublishable";
import { PublishGateIndicator } from "@/features/content-editor/components/PublishGateIndicator";

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
    activites_interactives: "",
    grade_level: "",
    is_published: false,
    youtube_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showActivitiesPreview, setShowActivitiesPreview] = useState(false);

  // Get realtime collaboration features
  const { activeEditors, hasConflict } = useContentEditorRealtime(
    currentUserId,
    selectedLesson?.id
  );

  // Get publish gate status for selected lesson
  const { 
    isLoading: gateLoading, 
    blockers, 
    quizAsset, 
    activitiesAsset 
  } = useLessonPublishable(selectedLesson?.id);

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
        activites_interactives: selectedLesson.activites_interactives || "",
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

    const handleGenerateAllSections = async () => {
    if (!selectedLesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }

    setIsGeneratingAll(true);
    const sections = ['objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'] as const;
    let successCount = 0;
    let errorCount = 0;

    for (const section of sections) {
      try {
        toast.info(`Génération de ${section}...`);
        
        let generatedContent: string;

        if (section === 'activites_interactives') {
          // Special handling for interactive activities
          // Combine both contenu and exemples_exercices to get all exercises
          const fullContent = [
            lessonData.contenu || selectedLesson.contenu || '',
            lessonData.exemples_exercices || selectedLesson.exemples_exercices || ''
          ].filter(Boolean).join('\n\n');
          
          const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
            body: {
              exercisesContent: fullContent,
              lessonTitle: selectedLesson.title,
              gradeLevel: selectedLesson.grade_level || '7AF',
              subject: selectedLesson.subjects?.name || 'Matière',
            }
          });

          if (error) throw error;
          if (!data?.content) throw new Error('Aucun contenu généré');
          generatedContent = data.content;
        } else {
          // Standard generation for other sections
          const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
            body: {
              lessonId: selectedLesson.id,
              sectionName: section,
              lessonTitle: selectedLesson.title,
              subject: selectedLesson.subjects?.name || 'Matière',
              gradeLevel: selectedLesson.grade_level || '7AF',
              targetWords: section === 'contenu' ? 1000 : section === 'exemples_exercices' ? 500 : section === 'introduction' ? 300 : 200,
            },
          });

          if (error) throw error;
          if (!data?.content) throw new Error('Aucun contenu généré');
          generatedContent = data.content;
        }

        setLessonData(prev => ({ ...prev, [section]: generatedContent }));
        successCount++;
        
        // Rate limiting: wait 3 seconds between requests
        if (section !== sections[sections.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Error generating ${section}:`, error);
        errorCount++;
        toast.error(`Erreur lors de la génération de ${section}`);
      }
    }

    setIsGeneratingAll(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} sections générées avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`);
    } else {
      toast.error("Aucune section n'a pu être générée");
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
                <PublishGateIndicator
                  blockers={blockers}
                  quizAsset={quizAsset}
                  activitiesAsset={activitiesAsset}
                  isLoading={gateLoading}
                  compact={true}
                />
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
                    <AvatarImage src={editor.avatar_url} loading="lazy" decoding="async" />
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
            {/* Generate All Sections Button */}
            <Button 
              onClick={handleGenerateAllSections}
              disabled={isGeneratingAll}
              variant="outline"
              className="w-full"
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer toutes les sections avec IA
                </>
              )}
            </Button>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="objectif" className="text-xs md:text-sm">Objectif d'apprentissage</Label>
                <SectionGenerator
                  lesson={selectedLesson}
                  sectionName="objectif"
                  currentContent={lessonData.objectif}
                  onContentGenerated={(content) => 
                    setLessonData({ ...lessonData, objectif: content })
                  }
                />
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="introduction" className="text-xs md:text-sm">Introduction</Label>
                <SectionGenerator
                  lesson={selectedLesson}
                  sectionName="introduction"
                  currentContent={lessonData.introduction}
                  onContentGenerated={(content) => 
                    setLessonData({ ...lessonData, introduction: content })
                  }
                />
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="contenu" className="text-xs md:text-sm">Contenu principal (HTML)</Label>
                <SectionGenerator
                  lesson={selectedLesson}
                  sectionName="contenu"
                  currentContent={lessonData.contenu}
                  onContentGenerated={(content) => 
                    setLessonData({ ...lessonData, contenu: content })
                  }
                />
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="exemples" className="text-xs md:text-sm">Exemples et Exercices (HTML)</Label>
                <SectionGenerator
                  lesson={selectedLesson}
                  sectionName="exemples_exercices"
                  currentContent={lessonData.exemples_exercices}
                  onContentGenerated={(content) => 
                    setLessonData({ ...lessonData, exemples_exercices: content })
                  }
                />
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="activites" className="text-xs md:text-sm">Activités Interactives</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActivitiesPreview(!showActivitiesPreview)}
                  >
                    <ToggleLeft className="mr-1 h-4 w-4" />
                    {showActivitiesPreview ? "Édition" : "Vue"}
                  </Button>
                  <SectionGenerator
                    lesson={selectedLesson}
                    sectionName="activites_interactives"
                    currentContent={lessonData.activites_interactives}
                    onContentGenerated={(content) => 
                      setLessonData({ ...lessonData, activites_interactives: content })
                    }
                  />
                </div>
              </div>
              {showActivitiesPreview ? (
                <div className="border rounded-lg p-4 bg-muted/30">
                  {lessonData.activites_interactives ? (
                    <InteractiveActivitiesEnhanced 
                      content={lessonData.activites_interactives}
                      isLoading={false}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucune activité interactive générée pour cette leçon
                    </p>
                  )}
                </div>
              ) : (
                <Textarea
                  id="activites"
                  value={lessonData.activites_interactives}
                  onChange={(e) =>
                    setLessonData({ ...lessonData, activites_interactives: e.target.value })
                  }
                  rows={8}
                  className="font-mono text-xs md:text-sm"
                  placeholder="Génère des activités interactives à partir des exercices..."
                />
              )}
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
              {lessonData.objectif && (
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Objectif</h2>
                  <div dangerouslySetInnerHTML={createSanitizedMarkup(lessonData.objectif)} />
                </div>
              )}
              {lessonData.introduction && (
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Introduction</h2>
                  <div dangerouslySetInnerHTML={createSanitizedMarkup(lessonData.introduction)} />
                </div>
              )}
              {lessonData.contenu && (
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Contenu</h2>
                  <div dangerouslySetInnerHTML={createSanitizedMarkup(lessonData.contenu)} />
                </div>
              )}
              {lessonData.exemples_exercices && (
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Exemples & Exercices</h2>
                  <div dangerouslySetInnerHTML={createSanitizedMarkup(lessonData.exemples_exercices)} />
                </div>
              )}
              {lessonData.activites_interactives && (
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Activités Interactives</h2>
                  <InteractiveActivitiesEnhanced 
                    content={lessonData.activites_interactives}
                    isLoading={false}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
