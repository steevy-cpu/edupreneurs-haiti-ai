import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle2, XCircle, Clock, Check } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";

interface SingleLessonGeneratorProps {
  lesson: any;
  onComplete: () => void;
}

type SectionStatus = 'pending' | 'generating' | 'completed' | 'error';

interface SectionProgress {
  name: SectionName | 'quiz_final' | 'youtube_url' | 'explanatory_images';
  status: SectionStatus;
  error?: string;
}

export const SingleLessonGenerator = ({ lesson, onComplete }: SingleLessonGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [generateQuiz, setGenerateQuiz] = useState(false);
  const [generateVideos, setGenerateVideos] = useState(false);
  const [generateImages, setGenerateImages] = useState(false);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [progress, setProgress] = useState<SectionProgress[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const sections: { value: SectionName; label: string }[] = [
    { value: "objectif", label: "Objectif" },
    { value: "introduction", label: "Introduction" },
    { value: "contenu", label: "Contenu principal" },
    { value: "exemples_exercices", label: "Exemples & Exercices" },
    { value: "activites_interactives", label: "Activités Interactives" },
  ];

  const additionalFeatures = [
    { key: 'quiz', label: 'Quiz Final (10-15 questions)' },
    { key: 'videos', label: 'Vidéos YouTube (suggestions IA)' },
    { key: 'images', label: 'Images explicatives (Recraft v3)' },
  ];

  const toggleSection = (section: SectionName) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleGenerate = async () => {
    if (!lesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }

    if (selectedSections.length === 0 && !generateQuiz && !generateVideos && !generateImages) {
      toast.error("Sélectionnez au moins une section ou fonctionnalité");
      return;
    }

    setIsGenerating(true);
    setCurrentSection(0);
    setGeneratedContent({}); // Clear previous content
    
    // Calculate total tasks (sections + quiz + videos + images)
    const totalTasks = selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0) + (generateImages ? 1 : 0);
    
    // Initialize progress for sections and optional features
    const initialProgress: SectionProgress[] = [
      ...selectedSections.map(name => ({ name, status: 'pending' as SectionStatus })),
    ];
    if (generateQuiz) initialProgress.push({ name: 'quiz_final' as SectionName, status: 'pending' });
    if (generateVideos) initialProgress.push({ name: 'youtube_url' as SectionName, status: 'pending' });
    if (generateImages) initialProgress.push({ name: 'explanatory_images' as any, status: 'pending' });
    
    setProgress(initialProgress);

    let successCount = 0;
    let errorCount = 0;
    let currentTask = 0;

    for (let i = 0; i < selectedSections.length; i++) {
      const sectionName = selectedSections[i];
      currentTask++;
      setCurrentSection(currentTask);
      
      // Update status to generating
      setProgress(prev => prev.map(p => 
        p.name === sectionName ? { ...p, status: 'generating' } : p
      ));

      const startTime = Date.now();

      try {
        let generatedContent: string;
        let wordCount: number | undefined;

        // Special handling for activites_interactives section
        if (sectionName === 'activites_interactives') {
          const { data: lessonData } = await supabase
            .from('lessons')
            .select('contenu, exemples_exercices, title, grade_level, subjects(name)')
            .eq('id', lesson.id)
            .single();

          // Combine both contenu and exemples_exercices to get all exercises
          const fullContent = [
            lessonData?.contenu || '',
            lessonData?.exemples_exercices || ''
          ].filter(Boolean).join('\n\n');

          const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
            body: {
              exercisesContent: fullContent,
              lessonTitle: lessonData?.title || lesson.title,
              gradeLevel: lessonData?.grade_level || lesson.grade_level,
              subject: lessonData?.subjects?.name || lesson.subjects?.name || 'Matière',
            }
          });

          if (error) throw error;
          if (!data?.content) throw new Error('Aucun contenu généré');
          generatedContent = data.content;
          wordCount = data.content.split(/\s+/).length;
        } else {
          // Standard generation for other sections
          const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
            body: {
              lessonId: lesson.id,
              sectionName,
              lessonTitle: lesson.title,
              subject: lesson.subjects?.name || 'Matière',
              gradeLevel: lesson.grade_level || '7AF',
              targetWords: wordCounts[sectionName],
              context: globalContext || undefined,
            }
          });

          if (error) throw error;
          if (!data?.content) throw new Error('Aucun contenu généré');
          generatedContent = data.content;
          wordCount = data.wordCount;
        }

        console.log('✅ [Single] Section generated successfully:', {
          sectionName,
          wordCount
        });

        // Store generated content in state for preview
        setGeneratedContent(prev => ({
          ...prev,
          [sectionName]: generatedContent
        }));

        // Log successful generation
        await supabase.from('ai_generation_logs').insert({
          lesson_id: lesson.id,
          section_name: sectionName,
          target_words: wordCounts[sectionName],
          additional_context: globalContext,
          response_content: generatedContent,
          word_count: wordCount,
          generation_time_ms: Date.now() - startTime,
          success: true,
          generated_by: (await supabase.auth.getUser()).data.user?.id,
        });

        setProgress(prev => prev.map(p => 
          p.name === sectionName ? { ...p, status: 'completed' } : p
        ));
        successCount++;

        // Rate limiting: wait 3 seconds between requests
        if (i < selectedSections.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error: any) {
        console.error(`Error generating ${sectionName}:`, error);
        
        // Log failed generation
        await supabase.from('ai_generation_logs').insert({
          lesson_id: lesson.id,
          section_name: sectionName,
          target_words: wordCounts[sectionName],
          additional_context: globalContext,
          success: false,
          error_message: error.message,
          generation_time_ms: Date.now() - startTime,
          generated_by: (await supabase.auth.getUser()).data.user?.id,
        });

        setProgress(prev => prev.map(p => 
          p.name === sectionName ? { ...p, status: 'error', error: error.message } : p
        ));
        errorCount++;
      }
    }

    // Generate Quiz Final if selected
    if (generateQuiz) {
      currentTask++;
      setCurrentSection(currentTask);
      
      setProgress(prev => prev.map(p => 
        p.name === 'quiz_final' ? { ...p, status: 'generating' } : p
      ));

      const startTime = Date.now();
      
      try {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('contenu, exemples_exercices, title, grade_level, subjects(name)')
          .eq('id', lesson.id)
          .single();

        const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
          body: {
            lessonTitle: lessonData?.title || lesson.title,
            contenu: lessonData?.contenu || '',
            exemplesExercices: lessonData?.exemples_exercices || '',
            gradeLevel: lessonData?.grade_level || lesson.grade_level,
            subject: lessonData?.subjects?.name || 'Matière',
          }
        });

        if (error) throw error;
        if (data?.quizContent) {
          setGeneratedContent(prev => ({
            ...prev,
            quiz_final: data.quizContent
          }));
          
          setProgress(prev => prev.map(p => 
            p.name === 'quiz_final' ? { ...p, status: 'completed' } : p
          ));
          successCount++;
        }
      } catch (error: any) {
        console.error('Error generating quiz:', error);
        setProgress(prev => prev.map(p => 
          p.name === 'quiz_final' ? { ...p, status: 'error', error: error.message } : p
        ));
        errorCount++;
      }
    }

    // Suggest YouTube videos if selected
    if (generateVideos) {
      currentTask++;
      setCurrentSection(currentTask);
      
      setProgress(prev => prev.map(p => 
        p.name === 'youtube_url' ? { ...p, status: 'generating' } : p
      ));

      const startTime = Date.now();
      
      try {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('contenu, exemples_exercices, title, grade_level, subjects(name)')
          .eq('id', lesson.id)
          .single();

        const { data, error } = await supabase.functions.invoke('suggest-youtube-videos', {
          body: {
            lessonTitle: lessonData?.title || lesson.title,
            contenu: lessonData?.contenu || '',
            exemplesExercices: lessonData?.exemples_exercices || '',
            gradeLevel: lessonData?.grade_level || lesson.grade_level,
            subject: lessonData?.subjects?.name || 'Matière',
          }
        });

        if (error) throw error;
        if (data?.videos && data.videos.length > 0) {
          setGeneratedContent(prev => ({
            ...prev,
            youtube_url: `https://www.youtube.com/watch?v=${data.videos[0].id}`,
            suggested_videos: JSON.stringify(data.videos)
          }));
          
          setProgress(prev => prev.map(p => 
            p.name === 'youtube_url' ? { ...p, status: 'completed' } : p
          ));
          successCount++;
        } else {
          // No videos found
          setProgress(prev => prev.map(p => 
            p.name === 'youtube_url' ? { ...p, status: 'error', error: 'Aucune vidéo trouvée' } : p
          ));
          errorCount++;
        }
      } catch (error: any) {
        console.error('Error suggesting videos:', error);
        setProgress(prev => prev.map(p => 
          p.name === 'youtube_url' ? { ...p, status: 'error', error: error.message } : p
        ));
        errorCount++;
      }
    }

    // Generate explanatory images if selected
    if (generateImages) {
      currentTask++;
      setCurrentSection(currentTask);
      
      setProgress(prev => prev.map(p => 
        p.name === 'explanatory_images' ? { ...p, status: 'generating' } : p
      ));

      try {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('contenu, exemples_exercices, title, grade_level, subjects(name)')
          .eq('id', lesson.id)
          .single();

        const { data, error } = await supabase.functions.invoke('generate-explanatory-images', {
          body: {
            lessonTitle: lessonData?.title || lesson.title,
            contenu: lessonData?.contenu || '',
            exemplesExercices: lessonData?.exemples_exercices || '',
            gradeLevel: lessonData?.grade_level || lesson.grade_level,
            subject: lessonData?.subjects?.name || 'Matière',
          }
        });

        if (error) throw error;
        if (data?.images && data.images.length > 0) {
          setGeneratedContent(prev => ({
            ...prev,
            explanatory_images: data.images
          }));
          
          setProgress(prev => prev.map(p => 
            p.name === 'explanatory_images' ? { ...p, status: 'completed' } : p
          ));
          successCount++;
        } else {
          setProgress(prev => prev.map(p => 
            p.name === 'explanatory_images' ? { ...p, status: 'error', error: 'Aucune image générée' } : p
          ));
          errorCount++;
        }
      } catch (error: any) {
        console.error('Error generating images:', error);
        setProgress(prev => prev.map(p => 
          p.name === 'explanatory_images' ? { ...p, status: 'error', error: error.message } : p
        ));
        errorCount++;
      }
    }

    setIsGenerating(false);
    
    const totalGenerated = successCount;
    const totalAttempted = totalTasks;
    
    if (successCount > 0) {
      setShowPreview(true);
      if (errorCount > 0) {
        toast.warning(`${successCount} élément(s) généré(s), ${errorCount} erreur(s) - Consultez l'aperçu`);
      } else {
        toast.success(`${successCount} élément(s) généré(s) - Consultez l'aperçu`);
      }
    } else {
      toast.error("Aucun contenu n'a pu être généré");
    }
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    try {
      console.log('🔄 Starting to apply changes...');
      console.log('Generated content:', generatedContent);
      
      // Start with generated content or existing lesson content
      let updatedContenu = generatedContent.contenu || lesson.contenu || '';
      let updatedExemples = generatedContent.exemples_exercices || lesson.exemples_exercices || '';
      
      // Process explanatory images if they exist
      if (generatedContent.explanatory_images) {
        const images = generatedContent.explanatory_images;
        console.log(`📸 Processing ${images.length} images...`);
        
        for (const image of images) {
          try {
            console.log(`🖼️ Processing image: ${image.concept} (insertAt: ${image.insertAt})`);
            
            // Convert base64 to blob
            const base64Data = image.base64Data;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'image/png' });
            console.log(`✅ Blob created, size: ${blob.size} bytes`);
            
            // Upload to Supabase Storage
            const fileName = `${lesson.id}/${image.concept.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
            console.log(`📤 Uploading to: ${fileName}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('lesson-images')
              .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true
              });
            
            if (uploadError) {
              console.error('❌ Error uploading image:', uploadError);
              toast.error(`Erreur lors de l'upload de l'image: ${image.concept}`);
              continue;
            }
            
            console.log('✅ Image uploaded successfully');
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('lesson-images')
              .getPublicUrl(fileName);
            
            console.log(`🔗 Public URL: ${publicUrl}`);
            
            // Create HTML for the image with proper markdown integration
            const imageHtml = `

### 🖼️ ${image.description}

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
            
            // Insert image into appropriate section
            if (image.insertAt === 'contenu') {
              console.log('➕ Adding image to contenu section');
              updatedContenu = updatedContenu + imageHtml;
            } else if (image.insertAt === 'exemples_exercices') {
              console.log('➕ Adding image to exemples_exercices section');
              updatedExemples = updatedExemples + imageHtml;
            }
          } catch (imageError) {
            console.error('❌ Error processing image:', imageError);
            toast.error(`Erreur lors du traitement de l'image: ${image.concept}`);
          }
        }
        
        console.log('✅ All images processed');
      }
      
      // Apply all generated content to the database
      const updates: any = {};
      
      // Add all non-image generated content
      Object.keys(generatedContent).forEach(key => {
        if (key !== 'suggested_videos' && key !== 'explanatory_images') {
          updates[key] = generatedContent[key];
        }
      });
      
      // Always update contenu and exemples if images were generated
      if (generatedContent.explanatory_images) {
        updates.contenu = updatedContenu;
        updates.exemples_exercices = updatedExemples;
        console.log('📝 Updating database with images included');
      } else {
        // Only update if content changed
        if (updatedContenu !== (lesson.contenu || '')) {
          updates.contenu = updatedContenu;
        }
        if (updatedExemples !== (lesson.exemples_exercices || '')) {
          updates.exemples_exercices = updatedExemples;
        }
      }

      console.log('💾 Saving updates to database:', Object.keys(updates));
      
      const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lesson.id);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Database updated successfully');
      toast.success("Contenu appliqué avec succès (images incluses)");
      
      // Reset all states
      setShowPreview(false);
      setGeneratedContent({});
      setProgress([]);
      setCurrentSection(0);
      
      // Close the dialog
      setIsOpen(false);
      
      // Trigger parent refresh after a small delay to ensure dialog is closed
      setTimeout(() => {
        onComplete();
      }, 100);
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
    setProgress([]);
    toast.info("Aperçu fermé");
  };

  const getStatusIcon = (status: SectionStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'generating': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const progressPercentage = selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0) + (generateImages ? 1 : 0) > 0 
    ? (currentSection / (selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0) + (generateImages ? 1 : 0))) * 100 
    : 0;

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
          {/* Section Selection */}
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generate-images"
                    checked={generateImages}
                    onCheckedChange={(checked) => setGenerateImages(checked as boolean)}
                    disabled={isGenerating}
                  />
                  <label htmlFor="generate-images" className="text-sm cursor-pointer">
                    🖼️ Générer images explicatives (Recraft v3)
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

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{currentSection}/{selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0)} éléments</span>
                </div>
                <Progress value={progressPercentage} />
              </div>

              <div className="space-y-2">
                {progress.map((section) => {
                  const displayName = section.name === 'quiz_final' ? 'Quiz Final' :
                                     section.name === 'youtube_url' ? 'Vidéos YouTube' :
                                     section.name;
                  return (
                    <div key={section.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(section.status)}
                        <div>
                          <p className="text-sm font-medium capitalize">{displayName}</p>
                          {section.error && (
                            <p className="text-xs text-destructive">{section.error}</p>
                          )}
                        </div>
                      </div>
                      {section.status === 'completed' && (
                        <Badge variant="default">Terminé</Badge>
                      )}
                      {section.status === 'generating' && (
                        <Badge variant="secondary">En cours...</Badge>
                      )}
                      {section.status === 'error' && (
                        <Badge variant="destructive">Erreur</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (selectedSections.length === 0 && !generateQuiz && !generateVideos)}
            className="w-full"
          >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours... ({currentSection}/{selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0)})
                </>
              ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Démarrer la génération
              </>
            )}
          </Button>

          {!isGenerating && progress.length > 0 && !showPreview && (
            <div className="space-y-2 text-center">
              <div className="text-sm text-muted-foreground">
                {progress.filter(p => p.status === 'completed').length} section(s) générée(s) avec succès
              </div>
              {progress.filter(p => p.status === 'error').length > 0 && (
                <div className="text-sm text-destructive">
                  {progress.filter(p => p.status === 'error').length} erreur(s)
                </div>
              )}
            </div>
          )}

          {/* Preview Section */}
          {showPreview && Object.keys(generatedContent).length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📋 Aperçu du contenu généré</h3>
                <Badge variant="secondary">{Object.keys(generatedContent).filter(k => k !== 'suggested_videos').length} élément(s)</Badge>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-muted/30">
                {Object.entries(generatedContent).map(([key, value]) => {
                  if (key === 'suggested_videos') return null;
                  
                  return (
                    <div key={key} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                      <Label className="text-sm font-semibold capitalize flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {key === 'quiz_final' ? 'Quiz Final' : 
                         key === 'youtube_url' ? 'Vidéos YouTube Suggérées' :
                         key === 'activites_interactives' ? 'Activités Interactives' :
                         key === 'exemples_exercices' ? 'Exemples & Exercices' :
                         key}
                      </Label>
                      
                      {/* Special handling for YouTube videos */}
                      {key === 'youtube_url' ? (
                        <div className="space-y-3">
                          {/* Parse suggested_videos if available */}
                          {generatedContent.suggested_videos ? (
                            (() => {
                              try {
                                const videos = JSON.parse(generatedContent.suggested_videos);
                                return videos.slice(0, 2).map((video: any, idx: number) => (
                                  <div key={idx} className="border rounded-lg p-3 bg-background/50 space-y-2">
                                    <div className="flex items-start gap-3">
                                      <img 
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
                                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      {value}
                                    </a>
                                  </div>
                                );
                              }
                            })()
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {value}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : key === 'quiz_final' ? (
                        /* Show full quiz for better preview */
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none bg-background/50 p-4 rounded border max-h-96 overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: value }}
                        />
                      ) : (
                        /* Show truncated content for other sections */
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none text-xs max-h-32 overflow-y-auto bg-background/50 p-3 rounded border"
                          dangerouslySetInnerHTML={{ __html: value.substring(0, 500) + (value.length > 500 ? '...' : '') }}
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
                      Appliquer les modifications
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleDiscardChanges}
                  disabled={isApplying}
                  variant="outline"
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