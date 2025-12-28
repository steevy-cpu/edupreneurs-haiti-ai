import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  X, 
  Loader2,
  BookOpen,
  Target,
  Plus,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface CurriculumAnalyzerProps {
  subjectId: string;
  subjectName: string;
  gradeLevel: string;
  existingLessons: Array<{ id: string; title: string; slug: string }>;
  onCreateLesson?: (title: string, description: string) => void;
}

interface AnalysisResult {
  documentTitle: string;
  gradeLevel: string;
  subject: string;
  chapters: Array<{
    name: string;
    topics: Array<{
      name: string;
      description: string;
      objectives: string[];
      keyNotions: string[];
      pageReference?: string;
    }>;
  }>;
  coveredTopics: Array<{
    pdfTopic: string;
    matchedLesson: string;
    matchConfidence: 'exact' | 'partial';
  }>;
  missingTopics: Array<{
    name: string;
    chapter: string;
    priority: 'high' | 'medium' | 'low';
    suggestedLessonTitle: string;
    description: string;
  }>;
  partiallyCoovered: Array<{
    pdfTopic: string;
    existingLesson: string;
    missingAspects: string[];
  }>;
  recommendations: string[];
  statistics: {
    totalTopicsInPDF: number;
    coveredCount: number;
    missingCount: number;
    partialCount: number;
    coveragePercentage: number;
  };
}

export const CurriculumAnalyzer: React.FC<CurriculumAnalyzerProps> = ({
  subjectId,
  subjectName,
  gradeLevel,
  existingLessons,
  onCreateLesson
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertPDFToImages = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const images: string[] = [];

    for (let i = 1; i <= Math.min(numPages, 20); i++) {
      setProgressText(`Conversion page ${i}/${Math.min(numPages, 20)}...`);
      setProgress((i / Math.min(numPages, 20)) * 40);

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      } as any).promise;

      images.push(canvas.toDataURL('image/jpeg', 0.8));
    }

    return images;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setPdfName(file.name);
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
      // Step 1: Convert PDF to images
      setProgressText('Conversion du PDF en images...');
      const pageImages = await convertPDFToImages(file);
      
      // Step 2: Send to AI for analysis
      setProgressText('Analyse par l\'IA en cours...');
      setProgress(50);

      const { data, error } = await supabase.functions.invoke('analyze-curriculum-pdf', {
        body: {
          pageImages,
          subjectName,
          gradeLevel,
          existingLessons: existingLessons.map(l => l.title)
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProgress(90);
      setProgressText('Finalisation...');

      setResult(data);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('curriculum_analysis_logs').insert({
          subject_id: subjectId,
          pdf_name: file.name,
          grade_level: gradeLevel,
          topics_found: data.chapters,
          existing_lessons: data.coveredTopics,
          missing_topics: data.missingTopics,
          partial_matches: data.partiallyCoovered,
          suggestions: data.recommendations,
          analyzed_by: user.id
        });
      }

      setProgress(100);
      toast.success('Analyse terminée!');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateLesson = (topic: AnalysisResult['missingTopics'][0]) => {
    if (onCreateLesson) {
      onCreateLesson(topic.suggestedLessonTitle, topic.description);
      toast.success(`Leçon "${topic.suggestedLessonTitle}" ajoutée à la liste`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analyse du Programme (PDF)
              </CardTitle>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge variant={result.statistics.coveragePercentage >= 80 ? 'default' : 'secondary'}>
                    {result.statistics.coveragePercentage}% couvert
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Upload Section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Téléchargez un PDF du programme officiel pour identifier les topics manquants dans vos leçons.
              </p>
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {pdfName || 'Sélectionner un PDF'}
                </Button>
                
                {result && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Réanalyser"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{progressText}</p>
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-4 gap-3">
                  <Card className="p-3">
                    <div className="text-2xl font-bold">{result.statistics.totalTopicsInPDF}</div>
                    <div className="text-xs text-muted-foreground">Topics trouvés</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-2xl font-bold text-green-600">{result.statistics.coveredCount}</div>
                    <div className="text-xs text-muted-foreground">Couverts</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-2xl font-bold text-yellow-600">{result.statistics.partialCount}</div>
                    <div className="text-xs text-muted-foreground">Partiels</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-2xl font-bold text-red-600">{result.statistics.missingCount}</div>
                    <div className="text-xs text-muted-foreground">Manquants</div>
                  </Card>
                </div>

                {/* Missing Topics */}
                {result.missingTopics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Topics Manquants ({result.missingTopics.length})
                    </h4>
                    <ScrollArea className="h-[200px] rounded border p-2">
                      <div className="space-y-2">
                        {result.missingTopics.map((topic, idx) => (
                          <div key={idx} className="flex items-start justify-between p-2 bg-destructive/5 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{topic.name}</span>
                                <Badge variant={getPriorityColor(topic.priority)} className="text-xs">
                                  {topic.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                              <p className="text-xs text-muted-foreground">Chapitre: {topic.chapter}</p>
                            </div>
                            {onCreateLesson && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCreateLesson(topic)}
                                className="ml-2"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Partially Covered */}
                {result.partiallyCoovered.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-yellow-600">
                      <Target className="h-4 w-4" />
                      Partiellement Couverts ({result.partiallyCoovered.length})
                    </h4>
                    <ScrollArea className="h-[150px] rounded border p-2">
                      <div className="space-y-2">
                        {result.partiallyCoovered.map((topic, idx) => (
                          <div key={idx} className="p-2 bg-yellow-500/5 rounded">
                            <div className="font-medium text-sm">{topic.pdfTopic}</div>
                            <div className="text-xs text-muted-foreground">
                              Leçon existante: {topic.existingLesson}
                            </div>
                            <div className="text-xs text-yellow-700 mt-1">
                              Manque: {topic.missingAspects.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Covered Topics */}
                {result.coveredTopics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      Topics Couverts ({result.coveredTopics.length})
                    </h4>
                    <ScrollArea className="h-[150px] rounded border p-2">
                      <div className="space-y-1">
                        {result.coveredTopics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-1.5 bg-green-500/5 rounded text-sm">
                            <Check className="h-3 w-3 text-green-600" />
                            <span>{topic.pdfTopic}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-muted-foreground">{topic.matchedLesson}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Recommandations
                    </h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
