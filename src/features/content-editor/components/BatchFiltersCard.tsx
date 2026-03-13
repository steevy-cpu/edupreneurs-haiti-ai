/**
 * @file BatchFiltersCard.tsx
 * @description Filter controls for batch operations — grade level, series, subject,
 * lesson selection, and action buttons (generate, validate, generate+validate).
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wand2, CheckCircle2, Sparkles, PlayCircle, PauseCircle, Volume2 } from "lucide-react";
import { gradeLevels, seriesOptions } from "@/features/content-editor/hooks/useBatchFilters";

interface BatchFiltersCardProps {
  // Filter state
  gradeLevel: string;
  setGradeLevel: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  series: string[];
  setSeries: (v: string[]) => void;
  availableLessons: any[];
  availableSubjects: any[];
  selectedLessonIds: string[];
  setSelectedLessonIds: (v: string[]) => void;
  isLoadingLessons: boolean;
  isLoadingSubjects: boolean;
  isNS3OrNS4: boolean;
  // Action state
  isGenerating: boolean;
  isValidating: boolean;
  isGeneratingThenValidating: boolean;
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
  // Action handlers
  onStartGeneration: () => void;
  onRunValidation: () => void;
  onGenerateThenValidate: () => void;
}

export const BatchFiltersCard = ({
  gradeLevel, setGradeLevel,
  subject, setSubject,
  series, setSeries,
  availableLessons, availableSubjects,
  selectedLessonIds, setSelectedLessonIds,
  isLoadingLessons, isLoadingSubjects, isNS3OrNS4,
  isGenerating, isValidating, isGeneratingThenValidating,
  isPaused, setIsPaused,
  onStartGeneration, onRunValidation, onGenerateThenValidate,
}: BatchFiltersCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtres & Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Grade Level */}
          <div className="space-y-2">
            <Label>Niveau</Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Series (NS3/NS4 only) */}
          {isNS3OrNS4 && (
            <div className="space-y-2">
              <Label>Série</Label>
              <div className="border rounded-md p-3 space-y-2 bg-background">
                {seriesOptions.map((s) => (
                  <div key={s.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`series-${s.value}`}
                      checked={series.includes(s.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSeries([...series, s.value]);
                        } else {
                          setSeries(series.filter(x => x !== s.value));
                        }
                      }}
                    />
                    <label htmlFor={`series-${s.value}`} className="text-xs cursor-pointer">{s.label}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label>Matière</Label>
            <Select value={subject} onValueChange={setSubject} disabled={isLoadingSubjects}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingSubjects ? "Chargement..." : "Sélectionner"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {availableSubjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lesson Selection */}
          <div className="space-y-2">
            <Label>Leçons spécifiques (optionnel)</Label>
            <Select
              value={selectedLessonIds.length > 0 ? "selected" : "all"}
              onValueChange={(value) => {
                if (value === "all") setSelectedLessonIds([]);
              }}
              disabled={isLoadingLessons || availableLessons.length === 0}
            >
              <SelectTrigger>
                <SelectValue>
                  {isLoadingLessons ? "Chargement..." : 
                   selectedLessonIds.length > 0 ? `${selectedLessonIds.length} sélectionnée(s)` : 
                   availableLessons.length > 0 ? `${availableLessons.length} disponibles` : "Sélectionner un niveau/matière"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les leçons du filtre</SelectItem>
              </SelectContent>
            </Select>
            {availableLessons.length > 0 && (
              <ScrollArea className="h-32 border rounded-md mt-2">
                <div className="p-2 space-y-1">
                  {/* Select All checkbox */}
                  <div className="flex items-center space-x-2 pb-1 mb-1 border-b border-border">
                    <Checkbox
                      id="select-all-lessons"
                      checked={selectedLessonIds.length === availableLessons.length && availableLessons.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLessonIds(availableLessons.map(l => l.id));
                        } else {
                          setSelectedLessonIds([]);
                        }
                      }}
                    />
                    <label htmlFor="select-all-lessons" className="text-xs cursor-pointer font-medium">
                      Tout sélectionner ({availableLessons.length})
                    </label>
                  </div>
                  {availableLessons.map(lesson => {
                    const hasAudio = lesson.audio_objectif_url || lesson.audio_introduction_url || 
                                     lesson.audio_contenu_url || lesson.audio_exemples_url;
                    return (
                      <div key={lesson.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lesson-${lesson.id}`}
                          checked={selectedLessonIds.includes(lesson.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLessonIds([...selectedLessonIds, lesson.id]);
                            } else {
                              setSelectedLessonIds(selectedLessonIds.filter(id => id !== lesson.id));
                            }
                          }}
                        />
                        <label htmlFor={`lesson-${lesson.id}`} className="text-xs cursor-pointer truncate flex items-center gap-1">
                          {lesson.title}
                          {hasAudio && (
                            <span title="Audio disponible">
                              <Volume2 className="h-3 w-3 text-primary flex-shrink-0" />
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onStartGeneration} disabled={isGenerating || isValidating || isGeneratingThenValidating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Lancer génération
          </Button>
          <Button onClick={onRunValidation} variant="outline" disabled={isGenerating || isValidating || isGeneratingThenValidating}>
            {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Lancer validation
          </Button>
          <Button onClick={onGenerateThenValidate} variant="secondary" disabled={isGenerating || isValidating || isGeneratingThenValidating}>
            {isGeneratingThenValidating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Générer puis valider
          </Button>
          {isGenerating && (
            <Button onClick={() => setIsPaused(!isPaused)} variant="outline">
              {isPaused ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
              {isPaused ? 'Reprendre' : 'Pause'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
