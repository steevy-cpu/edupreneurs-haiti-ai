/**
 * @file GenerationPreviewDialog.tsx
 * @description Preview dialog for generated lesson content with save and publish actions.
 * Contains the complex handleSaveOnly and handleSaveAndPublish logic extracted
 * from inline onClick handlers in the original BatchGenerationValidation.
 */

import { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadBase64ImageToStorage } from "@/utils/uploadBase64ImageToStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Loader2, Download, CheckCircle2, Volume2 } from "lucide-react";
import type { LessonGenerationStatus } from "@/types/batch-generation.types";

interface GenerationPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  previewLesson: LessonGenerationStatus | null;
  sectionLabels: Record<string, string>;
  onRegenerateSingleLesson: (lessonId: string) => void;
}

export const GenerationPreviewDialog = ({
  isOpen,
  onOpenChange,
  previewLesson,
  sectionLabels,
  onRegenerateSingleLesson,
}: GenerationPreviewDialogProps) => {
  const [isApplying, setIsApplying] = useState(false);

  /** Build common content updates and handle image uploads for both save paths */
  const buildUpdatesWithImages = async (): Promise<Record<string, string> | null> => {
    if (!previewLesson) return null;
    
    const updates: Record<string, string> = {};
    const content = previewLesson.generatedContent || {};
    
    if (content?.introduction) updates.introduction = content.introduction;
    if (content?.objectif) updates.objectif = content.objectif;
    if (content?.contenu) updates.contenu = content.contenu;
    if (content?.exemples_exercices) updates.exemples_exercices = content.exemples_exercices;
    if (content?.quiz_final) updates.quiz_final = content.quiz_final;
    if (content?.activites_interactives) updates.activites_interactives = content.activites_interactives;
    
    // Process image uploads if present
    if (content?.images && Array.isArray(content.images)) {
      const contenuImages = content.images.filter((img: any) => 
        !img.insertAt || img.insertAt === 'contenu'
      );
      const exemplesImages = content.images.filter((img: any) => 
        img.insertAt === 'exemples_exercices'
      );
      
      toast.info("Téléchargement des images en cours...");
      
      // Fetch current lesson data for both sections
      const { data: currentLesson } = await supabase
        .from('lessons')
        .select('contenu, exemples_exercices')
        .eq('id', previewLesson.lessonId)
        .single();
      
      // Upload and append images to contenu section
      if (contenuImages.length > 0) {
        let updatedContenu = updates.contenu || currentLesson?.contenu || '';
        for (let i = 0; i < contenuImages.length; i++) {
          const img = contenuImages[i];
          if (img.base64Data) {
            const imageUrl = await uploadBase64ImageToStorage(img.base64Data, previewLesson.lessonId, img.concept || 'image', i);
            if (imageUrl) {
              updatedContenu += `\n\n<figure class="my-4"><img src="${imageUrl}" alt="${img.concept || 'Image explicative'}" class="rounded-lg max-w-full" /><figcaption class="text-sm text-muted-foreground mt-2">${img.concept || ''}</figcaption></figure>`;
            }
          }
        }
        updates.contenu = updatedContenu;
      }
      
      // Upload and append images to exemples section
      if (exemplesImages.length > 0) {
        let updatedExemples = updates.exemples_exercices || currentLesson?.exemples_exercices || '';
        for (let i = 0; i < exemplesImages.length; i++) {
          const img = exemplesImages[i];
          if (img.base64Data) {
            const imageUrl = await uploadBase64ImageToStorage(img.base64Data, previewLesson.lessonId, img.concept || 'exemple', i);
            if (imageUrl) {
              updatedExemples += `\n\n<figure class="my-4"><img src="${imageUrl}" alt="${img.concept || 'Image explicative'}" class="rounded-lg max-w-full" /><figcaption class="text-sm text-muted-foreground mt-2">${img.concept || ''}</figcaption></figure>`;
            }
          }
        }
        updates.exemples_exercices = updatedExemples;
      }
    }

    return updates;
  };

  /** Build audio update payload from preview lesson audio URLs */
  const buildAudioUpdates = () => {
    if (!previewLesson?.audioUrls) return {};
    const audioUpdates: Record<string, string | null> = {};
    if (previewLesson.audioUrls.objectif) audioUpdates.audio_objectif_url = previewLesson.audioUrls.objectif;
    if (previewLesson.audioUrls.introduction) audioUpdates.audio_introduction_url = previewLesson.audioUrls.introduction;
    if (previewLesson.audioUrls.contenu) audioUpdates.audio_contenu_url = previewLesson.audioUrls.contenu;
    if (previewLesson.audioUrls.exemples) audioUpdates.audio_exemples_url = previewLesson.audioUrls.exemples;
    return audioUpdates;
  };

  /** Save content + audio without publishing */
  const handleSaveOnly = async () => {
    if (!previewLesson) return;
    setIsApplying(true);
    try {
      const updates = await buildUpdatesWithImages();
      if (!updates) return;

      const hasAudio = previewLesson?.audioUrls && Object.values(previewLesson.audioUrls).some(Boolean);
      const hasContent = Object.keys(updates).length > 0;

      if (hasContent || hasAudio) {
        const audioUpdates = buildAudioUpdates();

        const updatePayload = {
          ...updates,
          ...audioUpdates,
          audio_generated_at: hasAudio ? new Date().toISOString() : undefined,
        };
        
        const { error } = await supabase
          .from('lessons')
          .update(updatePayload)
          .eq('id', previewLesson.lessonId);
        
        if (error) throw error;

        // Verification check
        const { data: savedLesson } = await supabase
          .from('lessons')
          .select('audio_objectif_url, audio_introduction_url, audio_contenu_url, audio_exemples_url')
          .eq('id', previewLesson.lessonId)
          .single();
        
        const expectedAudioCount = Object.values(audioUpdates).filter(Boolean).length;
        const savedAudioCount = savedLesson ? Object.values(savedLesson).filter(Boolean).length : 0;
        
        if (hasAudio && savedAudioCount < expectedAudioCount) {
          toast.warning("Audio partiellement sauvegardé. Vérifiez la base de données.");
        } else {
          toast.success(hasAudio && hasContent 
            ? "Contenu et audio sauvegardés!" 
            : hasAudio 
              ? "Audio sauvegardé!" 
              : "Contenu sauvegardé!");
        }
      } else {
        toast.error("Aucun contenu ou audio à sauvegarder");
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  /** Save content + audio and publish the lesson with retry logic */
  const handleSaveAndPublish = async () => {
    if (!previewLesson) return;
    setIsApplying(true);
    try {
      const updates = await buildUpdatesWithImages();
      if (!updates) return;

      const hasAudio = previewLesson?.audioUrls && Object.values(previewLesson.audioUrls).some(Boolean);
      const hasContent = Object.keys(updates).length > 0;

      if (hasContent || hasAudio) {
        const audioUpdates = buildAudioUpdates();

        // PHASE 1: Save content + audio (triggers lesson_version_trigger)
        const contentPayload = {
          ...updates,
          ...audioUpdates,
          audio_generated_at: hasAudio ? new Date().toISOString() : undefined,
        };
        
        const phase1Start = Date.now();
        
        toast.info("Sauvegarde du contenu en cours...");
        
        const { error: contentError } = await supabase
          .from('lessons')
          .update(contentPayload)
          .eq('id', previewLesson.lessonId);
        
        if (contentError) throw contentError;

        // PHASE 2: Set publish flags only (lightweight, no version trigger)
        const phase2Start = Date.now();
        
        // Retry logic for publish flags (in case of transient lock)
        let publishSuccess = false;
        let publishError: any = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error: flagError } = await supabase
            .from('lessons')
            .update({
              is_published: true, 
              workflow_status: 'published' as const
            })
            .eq('id', previewLesson.lessonId);
          
          if (!flagError) {
            publishSuccess = true;
            break;
          }
          publishError = flagError;
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!publishSuccess) {
          throw publishError || new Error('Failed to set publish flags');
        }

        // Verification check
        const { data: savedLesson } = await supabase
          .from('lessons')
          .select('audio_objectif_url, audio_introduction_url, audio_contenu_url, audio_exemples_url, is_published')
          .eq('id', previewLesson.lessonId)
          .single();
        
        const expectedAudioCount = Object.values(audioUpdates).filter(Boolean).length;
        const savedAudioCount = savedLesson ? Object.values({
          audio_objectif_url: savedLesson.audio_objectif_url,
          audio_introduction_url: savedLesson.audio_introduction_url,
          audio_contenu_url: savedLesson.audio_contenu_url,
          audio_exemples_url: savedLesson.audio_exemples_url
        }).filter(Boolean).length : 0;
        
        if (hasAudio && savedAudioCount < expectedAudioCount) {
          toast.warning("Audio partiellement sauvegardé. Vérifiez la base de données.");
        } else if (!savedLesson?.is_published) {
          toast.warning("Contenu sauvegardé mais publication échouée. Réessayez.");
        } else {
          toast.success(hasAudio && hasContent 
            ? "Contenu et audio publiés avec succès!" 
            : hasAudio 
              ? "Audio publié avec succès!" 
              : "Contenu publié avec succès!");
        }
        onOpenChange(false);
      } else {
        toast.error("Aucun contenu ou audio à publier");
      }
    } catch (error: any) {
      console.error('Error publishing:', error);
      toast.error("Erreur lors de la publication: " + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu du contenu généré</DialogTitle>
          <DialogDescription>{previewLesson?.title}</DialogDescription>
        </DialogHeader>
        {/* Show content if we have generated text content OR audio */}
        {((previewLesson?.generatedContent && Object.keys(previewLesson.generatedContent).length > 0) || 
          (previewLesson?.audioUrls && Object.values(previewLesson.audioUrls).some(Boolean))) ? (
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-4">
              {/* Text content sections */}
              {previewLesson?.generatedContent && Object.entries(previewLesson.generatedContent).map(([section, content]) => (
                <Card key={section}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{sectionLabels[section] || section}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Special handling for images array — grouped by insertAt */}
                    {section === 'images' && Array.isArray(content) ? (
                      <div className="space-y-4">
                        {/* Contenu images */}
                        {content.filter((img: any) => !img.insertAt || img.insertAt === 'contenu').length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-primary">📝 Images pour Contenu:</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {content.filter((img: any) => !img.insertAt || img.insertAt === 'contenu').map((img: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                  {img.base64Data && (
                                    <img 
                                      src={`data:image/png;base64,${img.base64Data}`} 
                                      alt={img.concept || `Image ${idx + 1}`}
                                      className="w-full rounded-lg border"
                                    />
                                  )}
                                  {img.concept && (
                                    <p className="text-xs text-muted-foreground text-center">{img.concept}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Exemples images */}
                        {content.filter((img: any) => img.insertAt === 'exemples_exercices').length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-400">📚 Images pour Exemples:</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {content.filter((img: any) => img.insertAt === 'exemples_exercices').map((img: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                  {img.base64Data && (
                                    <img 
                                      src={`data:image/png;base64,${img.base64Data}`} 
                                      alt={img.concept || `Image ${idx + 1}`}
                                      className="w-full rounded-lg border"
                                    />
                                  )}
                                  {img.concept && (
                                    <p className="text-xs text-muted-foreground text-center">{img.concept}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert text-sm"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(content).substring(0, 2000) + (String(content).length > 2000 ? '...' : '')) }} 
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Audio Preview Section — renders independently of text content */}
              {previewLesson?.audioUrls && Object.values(previewLesson.audioUrls).some(Boolean) && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Audio TTS Généré
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {previewLesson.audioUrls.objectif && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-28">Objectif:</span>
                        <audio controls src={previewLesson.audioUrls.objectif} className="h-8 flex-1" />
                      </div>
                    )}
                    {previewLesson.audioUrls.introduction && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-28">Introduction:</span>
                        <audio controls src={previewLesson.audioUrls.introduction} className="h-8 flex-1" />
                      </div>
                    )}
                    {previewLesson.audioUrls.contenu && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-28">Contenu:</span>
                        <audio controls src={previewLesson.audioUrls.contenu} className="h-8 flex-1" />
                      </div>
                    )}
                    {previewLesson.audioUrls.exemples && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-28">Exemples:</span>
                        <audio controls src={previewLesson.audioUrls.exemples} className="h-8 flex-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-4">Aucun contenu généré à afficher</p>
        )}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              if (previewLesson) onRegenerateSingleLesson(previewLesson.lessonId);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Régénérer
          </Button>
          {/* Save without publishing */}
          <Button 
            variant="secondary"
            disabled={isApplying}
            onClick={handleSaveOnly}
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
          {/* Save and publish */}
          <Button 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={isApplying}
            onClick={handleSaveAndPublish}
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Sauvegarder & Publier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
