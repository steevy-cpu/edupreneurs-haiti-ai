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
import { Sparkles, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";

interface SingleLessonGeneratorProps {
  lesson: any;
  onComplete: () => void;
}

type SectionStatus = 'pending' | 'generating' | 'completed' | 'error';

interface SectionProgress {
  name: SectionName;
  status: SectionStatus;
  error?: string;
}

export const SingleLessonGenerator = ({ lesson, onComplete }: SingleLessonGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [progress, setProgress] = useState<SectionProgress[]>([]);
  const [currentSection, setCurrentSection] = useState(0);

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

  const handleGenerate = async () => {
    if (!lesson) {
      toast.error("Aucune leçon sélectionnée");
      return;
    }

    if (selectedSections.length === 0) {
      toast.error("Sélectionnez au moins une section");
      return;
    }

    setIsGenerating(true);
    setCurrentSection(0);
    setProgress(selectedSections.map(name => ({ name, status: 'pending' })));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedSections.length; i++) {
      const sectionName = selectedSections[i];
      setCurrentSection(i + 1);
      
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

        // Update lesson in database
        await supabase
          .from('lessons')
          .update({ [sectionName]: generatedContent })
          .eq('id', lesson.id);

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

    setIsGenerating(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} section(s) générée(s)${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`);
      onComplete();
    } else {
      toast.error("Aucune section n'a pu être générée");
    }
  };

  const getStatusIcon = (status: SectionStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'generating': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const progressPercentage = selectedSections.length > 0 
    ? (currentSection / selectedSections.length) * 100 
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
          <div className="space-y-2">
            <Label>Sections à générer</Label>
            <div className="flex flex-wrap gap-2">
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
                  <span>{currentSection}/{selectedSections.length} sections</span>
                </div>
                <Progress value={progressPercentage} />
              </div>

              <div className="space-y-2">
                {progress.map((section) => (
                  <div key={section.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(section.status)}
                      <div>
                        <p className="text-sm font-medium capitalize">{section.name}</p>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedSections.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours... ({currentSection}/{selectedSections.length})
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Démarrer la génération
              </>
            )}
          </Button>

          {!isGenerating && progress.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              {progress.filter(p => p.status === 'completed').length} section(s) générée(s) avec succès
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};