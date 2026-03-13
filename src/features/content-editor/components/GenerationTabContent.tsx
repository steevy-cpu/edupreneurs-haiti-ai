/**
 * @file GenerationTabContent.tsx
 * @description Generation results tab — options card, progress bar, and results list.
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Download, RefreshCw, Eye, ChevronDown, Volume2,
} from "lucide-react";
import type { SectionName } from "@/lib/lessonPrompts";
import type { GenerationStatus, LessonGenerationStatus } from "@/types/batch-generation.types";

interface GenerationTabContentProps {
  // Section config
  sections: { value: SectionName; label: string }[];
  selectedSections: SectionName[];
  toggleSection: (section: SectionName) => void;
  // Additional features
  generateQuiz: boolean;
  setGenerateQuiz: (v: boolean) => void;
  generateVideos: boolean;
  setGenerateVideos: (v: boolean) => void;
  generateAudio: boolean;
  setGenerateAudio: (v: boolean) => void;
  imageGenerationModel: 'none' | 'openai' | 'lovable';
  setImageGenerationModel: (v: 'none' | 'openai' | 'lovable') => void;
  onlyEmpty: boolean;
  setOnlyEmpty: (v: boolean) => void;
  // Word counts
  wordCounts: Record<string, number>;
  setWordCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  globalContext: string;
  setGlobalContext: (v: string) => void;
  // Progress
  totalLessons: number;
  completedCount: number;
  progress: number;
  lessonStatuses: LessonGenerationStatus[];
  // Actions
  exportGenerationResults: () => void;
  handlePreviewLesson: (lesson: LessonGenerationStatus) => void;
  handleRegenerateSingleLesson: (lessonId: string) => void;
  getStatusIcon: (status: GenerationStatus) => React.ReactNode;
}

export const GenerationTabContent = ({
  sections, selectedSections, toggleSection,
  generateQuiz, setGenerateQuiz,
  generateVideos, setGenerateVideos,
  generateAudio, setGenerateAudio,
  imageGenerationModel, setImageGenerationModel,
  onlyEmpty, setOnlyEmpty,
  wordCounts, setWordCounts,
  globalContext, setGlobalContext,
  totalLessons, completedCount, progress, lessonStatuses,
  exportGenerationResults, handlePreviewLesson, handleRegenerateSingleLesson,
  getStatusIcon,
}: GenerationTabContentProps) => {
  return (
    <div className="space-y-4 mt-4">
      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options de génération</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base">Sections de contenu</Label>
            <div className="flex flex-wrap gap-2">
              {sections.map(section => (
                <div key={section.value} className="flex items-center space-x-2">
                  <Checkbox id={section.value} checked={selectedSections.includes(section.value)} onCheckedChange={() => toggleSection(section.value)} />
                  <label htmlFor={section.value} className="text-sm cursor-pointer">{section.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <Label className="text-base">Fonctionnalités additionnelles</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="batch-quiz-final" checked={generateQuiz} onCheckedChange={(checked) => setGenerateQuiz(checked as boolean)} />
                <label htmlFor="batch-quiz-final" className="text-sm cursor-pointer">📝 Quiz Final</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="batch-video-suggest" checked={generateVideos} onCheckedChange={(checked) => setGenerateVideos(checked as boolean)} />
                <label htmlFor="batch-video-suggest" className="text-sm cursor-pointer">🎥 Vidéos YouTube</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="onlyEmpty" checked={onlyEmpty} onCheckedChange={(checked) => setOnlyEmpty(checked as boolean)} />
                <label htmlFor="onlyEmpty" className="text-sm cursor-pointer">Sections vides uniquement</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="batch-audio-tts" checked={generateAudio} onCheckedChange={(checked) => setGenerateAudio(checked as boolean)} />
                <label htmlFor="batch-audio-tts" className="text-sm cursor-pointer">🔊 Audio TTS (ElevenLabs)</label>
              </div>
            </div>
            <div className="mt-3 max-w-xs">
              <Label htmlFor="batch-image-model" className="text-sm">🖼️ Générer images explicatives</Label>
              <Select 
                value={imageGenerationModel} 
                onValueChange={(value: 'none' | 'openai' | 'lovable') => setImageGenerationModel(value)}
              >
                <SelectTrigger id="batch-image-model" className="mt-1">
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="openai">OpenAI (gpt-image-1)</SelectItem>
                  <SelectItem value="lovable">IA Edupreneurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced parameters — word counts + global context */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto">
                <ChevronDown className="h-4 w-4 mr-2" />
                Paramètres avancés
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
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
                      min={100} max={2000} step={50}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Contexte global (optionnel)</Label>
                <Textarea placeholder="Ajoutez un contexte..." value={globalContext} onChange={(e) => setGlobalContext(e.target.value)} rows={2} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {totalLessons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedCount}/{totalLessons} leçons terminées</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <div className="flex gap-4 text-sm">
              <Badge variant="secondary">{lessonStatuses.filter(l => l.status === 'completed').length} Réussis</Badge>
              <Badge variant="destructive">{lessonStatuses.filter(l => l.status === 'error').length} Erreurs</Badge>
            </div>
            {lessonStatuses.length > 0 && (
              <Button onClick={exportGenerationResults} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Results List */}
      {lessonStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résultats de génération</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {lessonStatuses.map((lessonStatus) => (
                  <div key={lessonStatus.lessonId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(lessonStatus.status)}
                      <div>
                        <p className="font-medium text-sm">{lessonStatus.title}</p>
                        {lessonStatus.sectionsGenerated.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {lessonStatus.sectionsGenerated.length} sections
                            {lessonStatus.audioUrls && Object.values(lessonStatus.audioUrls).some(Boolean) && (
                              <span className="ml-1 text-primary">🔊 Audio</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick audio play button */}
                      {lessonStatus.audioUrls?.objectif && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const audio = new Audio(lessonStatus.audioUrls?.objectif);
                            audio.play();
                          }}
                          title="Écouter l'audio objectif"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                      {lessonStatus.status === 'completed' && (lessonStatus.generatedContent || lessonStatus.audioUrls) && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handlePreviewLesson(lessonStatus)}
                            title="Aperçu"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleRegenerateSingleLesson(lessonStatus.lessonId)}
                            title="Régénérer"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {lessonStatus.error && (
                        <Badge variant="destructive" className="text-xs">{lessonStatus.error.substring(0, 30)}...</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
