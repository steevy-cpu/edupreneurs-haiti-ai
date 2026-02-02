/**
 * ExamPreviewCard - Preview parsed exam before saving
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, X, FileText, BookOpen } from "lucide-react";
import type { ParsedPreview } from "../utils/examSaveUtils";

interface ExamPreviewCardProps {
  preview: ParsedPreview;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExamPreviewCard({ 
  preview, 
  onConfirm, 
  onCancel,
  isLoading = false
}: ExamPreviewCardProps) {
  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aperçu: {preview.title}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {preview.exercises.length} exercices
            </Badge>
            <Badge variant="outline">
              {preview.totalPoints} points
            </Badge>
            {preview.referenceTexts && preview.referenceTexts.length > 0 && (
              <Badge variant="outline" className="bg-primary/10">
                <BookOpen className="h-3 w-3 mr-1" />
                {preview.referenceTexts.length} texte(s)
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reference Texts Preview */}
        {preview.referenceTexts && preview.referenceTexts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Textes de Référence
            </h4>
            <ScrollArea className="h-32 border rounded-md p-3 bg-muted/30">
              {preview.referenceTexts.map((ref, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <p className="font-medium text-sm">
                    [{ref.section || 'Texte'}] {ref.title || `Texte ${idx + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ref.text}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Exercises Preview */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Exercices Détectés</h4>
          <ScrollArea className="h-48 border rounded-md p-3">
            {preview.exercises.map((ex, idx) => (
              <div 
                key={idx} 
                className="mb-3 pb-3 border-b last:border-0 last:mb-0 last:pb-0"
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">
                    Q{ex.exerciseNumber}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{ex.questionText}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {ex.exerciseType === 'multiple_choice' ? 'QCM' : 'Ouverte'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ex.points} pts
                      </span>
                      {ex.correctAnswer && (
                        <Badge variant="secondary" className="text-xs">
                          Rép: {ex.correctAnswer}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmer et Sauvegarder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
