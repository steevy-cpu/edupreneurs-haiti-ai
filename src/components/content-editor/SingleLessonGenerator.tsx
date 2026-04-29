import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle2, Check } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";
import { createSanitizedMarkup } from "@/lib/sanitize";
import { useGenerationJob, GenerationJobProgress, type JobConfig } from "@/features/content-editor";

interface SingleLessonGeneratorProps {
  lesson: any;
  onComplete: () => void;
}

export const SingleLessonGenerator = ({ lesson, onComplete }: SingleLessonGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [generateQuiz, setGenerateQuiz] = useState(false);
  const [generateVideos, setGenerateVideos] = useState(false);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [imageGenerationModel, setImageGenerationModel] = useState<'none' | 'openai' | 'lovable'>('none');
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Use the async job hook
  const {
    activeJob,
    existingJob,
    isGenerating,
    isPending,
    progress,
    currentSection,
    progressPercentage,
    resultContent,
    startJob,
    cancelJob,
    resumeJob,
    canResume,
  } = useGenerationJob({
    lessonId: lesson?.id,
    onJobComplete: (result) => {
      if (result) {
        setGeneratedContent(result);
        setShowPreview(true);
      }
    },
  });

  // Update generatedContent when resultContent changes
  useEffect(() => {
    if (resultContent && Object.keys(resultContent).length > 0) {
      setGeneratedContent(resultContent);
      setShowPreview(true);
    }
  }, [resultContent]);

  const sections: { value: SectionName; label: string }[] = [
    { value: "objectif", label: "Objectif" },
    { value: "introduction", label: "Introduction" },
    { value: "contenu", label: "Contenu principal" },
    { value: "exemples_exercices", label: "Exemples & Exercices" },
    { value: "activites_interactives", label: "Activités Interactives" },
  ];

  const toggleSection = (section: SectionName) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Helper function to extract image URLs from HTML content
  const extractImageUrls = (htmlContent: string): string[] => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
      const url = match[1];
      if (url.includes('/storage/v1/object/public/lesson-images/')) {
        urls.push(url);
      }
    }
    return urls;
  };

  // Helper function to delete old images from storage
  const deleteOldImages = async (imageUrls: string[]) => {
    if (imageUrls.length === 0) return;
    for (const url of imageUrls) {
      try {
        const urlParts = url.split('/lesson-images/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          const { error } = await supabase.storage
            .from('lesson-images')
            .remove([filePath]);

          if (error) {
            console.error(`Failed to delete ${filePath}:`, error);
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  // Helper function to remove all image HTML from content
  const removeAllImageHtml = (htmlContent: string): string => {
    let cleaned = htmlContent.replace(/<div class="my-6 flex justify-center">[\s\S]*?<\/div>\s*<\/div>/g, '');
    cleaned = cleaned.replace(/<img[^>]*>/g, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    return cleaned;
  };

  const handleGenerate = async () => {
    if (!lesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }

    if (selectedSections.length === 0 && !generateQuiz && !generateVideos && imageGenerationModel === 'none' && !generateAudio) {
      toast.error("Sélectionnez au moins une section ou fonctionnalité");
      return;
    }

    // Build job config
    const config: JobConfig = {
      selectedSections,
      wordCounts,
      generateQuiz,
      generateVideos,
      generateAudio,
      imageGenerationModel,
      globalContext: globalContext || undefined,
    };

    // Start the async job
    startJob(config);
  };

  const handleResume = () => {
    if (existingJob) {
      resumeJob(existingJob);
    }
  };

  const handleCancel = () => {
    cancelJob();
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    try {
      let updatedContenu = generatedContent.contenu || lesson.contenu || '';
      let updatedExemples = generatedContent.exemples_exercices || lesson.exemples_exercices || '';

      // Clean old images before processing new ones
      if (generatedContent.explanatory_images) {
        updatedContenu = removeAllImageHtml(updatedContenu);
        updatedExemples = removeAllImageHtml(updatedExemples);
      }

      // Process explanatory images if they exist
      if (generatedContent.explanatory_images) {
        const images = generatedContent.explanatory_images;

        const contenuImages: any[] = [];
        const exemplesImages: any[] = [];

        for (const image of images) {
          if (image.insertAt === 'contenu') {
            contenuImages.push(image);
          } else if (image.insertAt === 'exemples_exercices') {
            exemplesImages.push(image);
          }
        }

        for (const image of images) {
          try {
            
            const base64Data = image.base64Data;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            const blob = new Blob([bytes], { type: 'image/png' });
            const imageBitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(imageBitmap, 0, 0);
            
            const webpBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.85);
            });
            
            const sanitizedConcept = image.concept
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9\s-]/gi, '')
              .replace(/\s+/g, '-')
              .toLowerCase()
              .substring(0, 100);
            
            const fileName = `${lesson.id}/${sanitizedConcept}-${Date.now()}.webp`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('lesson-images')
              .upload(fileName, webpBlob, {
                contentType: 'image/webp',
                upsert: true
              });
            
            if (uploadError) {
              console.error('❌ Error uploading image:', uploadError);
              toast.error(`Erreur lors de l'upload de l'image: ${image.concept}`);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('lesson-images')
              .getPublicUrl(fileName);
            
            const imageHtml = `
<div class="my-6 flex justify-center">
  <div class="max-w-2xl">
    <img 
      src="${publicUrl}" 
      alt="${image.description}"
      class="w-full rounded-lg shadow-lg border border-border"
      loading="lazy"
    />
    <p class="text-sm text-center text-muted-foreground mt-2 italic">
      ${image.description}
    </p>
  </div>
</div>
`;
            
            if (image.insertAt === 'contenu') {
              const paragraphs = updatedContenu.split('\n\n');
              const insertIndex = Math.floor(paragraphs.length / (contenuImages.length + 1)) * (contenuImages.indexOf(image) + 1);
              paragraphs.splice(insertIndex, 0, imageHtml);
              updatedContenu = paragraphs.join('\n\n');
            } else if (image.insertAt === 'exemples_exercices') {
              const paragraphs = updatedExemples.split('\n\n');
              const insertIndex = Math.floor(paragraphs.length / (exemplesImages.length + 1)) * (exemplesImages.indexOf(image) + 1);
              paragraphs.splice(insertIndex, 0, imageHtml);
              updatedExemples = paragraphs.join('\n\n');
            }
          } catch (imageError) {
            console.error('❌ Error processing image:', imageError);
            toast.error(`Erreur lors du traitement de l'image: ${image.concept}`);
          }
        }
        
      }

      const cleanImageDescriptions = (text: string): string => {
        return text.replace(/###\s*[\u{1F300}-\u{1F9FF}]\s*[^\n]+\n\n?/gu, '');
      };
      
      updatedContenu = cleanImageDescriptions(updatedContenu);
      updatedExemples = cleanImageDescriptions(updatedExemples);
      
      const updates: any = {};
      
      Object.keys(generatedContent).forEach(key => {
        if (key !== 'suggested_videos' && key !== 'explanatory_images') {
          updates[key] = generatedContent[key];
        }
      });
      
      if (generatedContent.explanatory_images) {
        updates.contenu = updatedContenu;
        updates.exemples_exercices = updatedExemples;
      } else {
        if (updatedContenu !== (lesson.contenu || '')) {
          updates.contenu = updatedContenu;
        }
        if (updatedExemples !== (lesson.exemples_exercices || '')) {
          updates.exemples_exercices = updatedExemples;
        }
      }

      const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lesson.id);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      await onComplete();
      
      toast.success("Contenu appliqué avec succès");
      
      setShowPreview(false);
      setGeneratedContent({});
      setIsOpen(false);
    } catch (error) {
      console.error('Error applying changes:', error);
      toast.error("Erreur lors de l'application des changements");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDiscardChanges = () => {
    setGeneratedContent({});
    setShowPreview(false);
    toast.info("Aperçu fermé");
  };

  const audioSectionCount = generateAudio ? 4 : 0;
  const totalProgressItems = selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0) + (imageGenerationModel !== 'none' ? 1 : 0) + audioSectionCount;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Générer les sections de cette leçon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générer le contenu de la leçon
          </DialogTitle>
          <DialogDescription>
            Leçon: {lesson?.title || 'Sans titre'} | 
            Niveau: {lesson?.grade_level || 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resume existing job banner */}
          <GenerationJobProgress
            job={activeJob}
            progress={progress}
            currentSection={currentSection}
            progressPercentage={progressPercentage}
            onCancel={handleCancel}
            onResume={handleResume}
            existingJob={existingJob}
            canResume={canResume}
          />

          {/* Section Selection - hide when generating */}
          {!isGenerating && !showPreview && (
            <>
              <div className="space-y-3">
                <div>
                  <Label className="text-base">Sections de contenu</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sections.map(section => (
                      <div key={section.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={section.value}
                          checked={selectedSections.includes(section.value)}
                          onCheckedChange={() => toggleSection(section.value)}
                          disabled={isGenerating}
                        />
                        <label htmlFor={section.value} className="text-sm cursor-pointer">
                          {section.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <Label className="text-base">Fonctionnalités additionnelles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quiz-final"
                        checked={generateQuiz}
                        onCheckedChange={(checked) => setGenerateQuiz(checked as boolean)}
                        disabled={isGenerating}
                      />
                      <label htmlFor="quiz-final" className="text-sm cursor-pointer">
                        📝 Quiz Final (10-15 questions)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="video-suggest"
                        checked={generateVideos}
                        onCheckedChange={(checked) => setGenerateVideos(checked as boolean)}
                        disabled={isGenerating}
                      />
                      <label htmlFor="video-suggest" className="text-sm cursor-pointer">
                        🎥 Suggérer vidéos YouTube
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="image-model-single" className="text-sm font-medium">
                        🖼️ Générer images explicatives
                      </label>
                      <Select value={imageGenerationModel} onValueChange={(value: 'none' | 'openai' | 'lovable') => setImageGenerationModel(value)} disabled={isGenerating}>
                        <SelectTrigger id="image-model-single">
                          <SelectValue placeholder="Sélectionner un modèle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          <SelectItem value="openai">OpenAI (gpt-image-1)</SelectItem>
                          <SelectItem value="lovable">Lovable AI (Nano banana)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="audio-tts"
                        checked={generateAudio}
                        onCheckedChange={(checked) => setGenerateAudio(checked as boolean)}
                        disabled={isGenerating}
                      />
                      <label htmlFor="audio-tts" className="text-sm cursor-pointer">
                        🔊 Audio TTS (ElevenLabs)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Word Count Sliders */}
              <div className="space-y-4">
                <Label>Nombre de mots par section</Label>
                {sections.map(section => (
                  <div key={section.value} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{section.label}</span>
                      <span className="text-sm font-medium">{wordCounts[section.value]} mots</span>
                    </div>
                    <Slider
                      value={[wordCounts[section.value]]}
                      onValueChange={([value]) => setWordCounts(prev => ({ ...prev, [section.value]: value }))}
                      min={100}
                      max={1500}
                      step={50}
                      disabled={isGenerating}
                    />
                  </div>
                ))}
              </div>

              {/* Global Context */}
              <div className="space-y-2">
                <Label>Contexte additionnel (optionnel)</Label>
                <Textarea
                  placeholder="Ex: Ajouter plus d'exemples pratiques, Focus sur les applications quotidiennes en Haïti..."
                  value={globalContext}
                  onChange={(e) => setGlobalContext(e.target.value)}
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              {/* Action Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isPending || (selectedSections.length === 0 && !generateQuiz && !generateVideos && imageGenerationModel === 'none' && !generateAudio)}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Démarrer la génération
                  </>
                )}
              </Button>
            </>
          )}

          {/* Preview Section */}
          {showPreview && Object.keys(generatedContent).length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📋 Aperçu du contenu généré</h3>
                <Badge variant="secondary">{Object.keys(generatedContent).filter(k => k !== 'suggested_videos' && k !== 'explanatory_images').length + (generatedContent.explanatory_images ? 1 : 0)} élément(s)</Badge>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-muted/30">
                {Object.entries(generatedContent).map(([key, value]) => {
                  if (key === 'suggested_videos') return null;
                  
                  // Handle audio URLs in preview
                  if (key.startsWith('audio_') && key.endsWith('_url')) {
                    const sectionName = key.replace('audio_', '').replace('_url', '');
                    const displayName = sectionName === 'objectif' ? 'Audio Objectif' :
                                       sectionName === 'introduction' ? 'Audio Introduction' :
                                       sectionName === 'contenu' ? 'Audio Contenu' :
                                       sectionName === 'exemples' ? 'Audio Exemples' :
                                       sectionName;
                    return (
                      <div key={key} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          🔊 {displayName}
                        </Label>
                        <audio controls src={value as string} className="w-full h-10" preload="metadata">
                          Votre navigateur ne supporte pas l'audio.
                        </audio>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={key} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                      <Label className="text-sm font-semibold capitalize flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {key === 'quiz_final' ? 'Quiz Final' : 
                         key === 'youtube_url' ? 'Vidéos YouTube Suggérées' :
                         key === 'activites_interactives' ? 'Activités Interactives' :
                         key === 'exemples_exercices' ? 'Exemples & Exercices' :
                         key === 'explanatory_images' ? 'Images Explicatives Générées' :
                         key}
                      </Label>
                      
                      {/* Special handling for explanatory images */}
                      {key === 'explanatory_images' ? (
                        <div className="space-y-3">
                          {Array.isArray(value) && value.length > 0 ? (
                            value.map((image: any, idx: number) => (
                              <div key={idx} className="border rounded-lg p-3 bg-background/50 space-y-2">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium">{image.concept}</p>
                                      <p className="text-xs text-muted-foreground">{image.description}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {image.insertAt === 'contenu' ? 'Contenu' : 'Exemples'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-center bg-background/80 rounded-lg p-2">
                                    <img
          loading="lazy"
          decoding="async" 
                                      src={`data:image/png;base64,${image.base64Data}`}
                                      alt={image.description}
                                      className="max-w-full h-auto max-h-64 rounded shadow-md border border-border"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Aucune image générée</p>
                          )}
                        </div>
                      ) : key === 'youtube_url' ? (
                        <div className="space-y-3">
                          {generatedContent.suggested_videos ? (
                            (() => {
                              try {
                                const videos = JSON.parse(generatedContent.suggested_videos);
                                return videos.slice(0, 2).map((video: any, idx: number) => (
                                  <div key={idx} className="border rounded-lg p-3 bg-background/50 space-y-2">
                                    <div className="flex items-start gap-3">
                                      <img
          loading="lazy"
          decoding="async" 
                                        src={video.thumbnail} 
                                        alt={video.title}
                                        className="w-24 h-18 object-cover rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                                        <a 
                                          href={`https://www.youtube.com/watch?v=${video.id}`}
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-xs text-primary hover:underline mt-1 inline-block"
                                        >
                                          Voir la vidéo →
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                ));
                              } catch (e) {
                                return (
                                  <div className="text-sm text-muted-foreground">
                                    <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      {value as string}
                                    </a>
                                  </div>
                                );
                              }
                            })()
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {value as string}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : key === 'quiz_final' ? (
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none bg-background/50 p-4 rounded border max-h-96 overflow-y-auto"
                          dangerouslySetInnerHTML={createSanitizedMarkup(value as string)}
                        />
                      ) : (
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none text-xs max-h-32 overflow-y-auto bg-background/50 p-3 rounded border"
                          dangerouslySetInnerHTML={createSanitizedMarkup((value as string).substring(0, 500) + ((value as string).length > 500 ? '...' : ''))}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleApplyChanges}
                  disabled={isApplying}
                  className="flex-1"
                  variant="default"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Application en cours...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Appliquer les changements
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleDiscardChanges}
                  variant="outline"
                  disabled={isApplying}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
