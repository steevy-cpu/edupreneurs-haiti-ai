/**
 * @file RegenerationPreviewDialog.tsx
 * @description Preview dialog for AI-corrected quiz/activity content before saving.
 */

import { sanitizeHtml } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Check, X } from "lucide-react";
import type { RegenerationPreview } from "@/types/batch-generation.types";

interface RegenerationPreviewDialogProps {
  regenerationPreview: RegenerationPreview | null;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const RegenerationPreviewDialog = ({
  regenerationPreview,
  onClose,
  onSave,
  isSaving,
}: RegenerationPreviewDialogProps) => {
  return (
    <Dialog open={!!regenerationPreview} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu des corrections - {regenerationPreview?.lessonTitle}</DialogTitle>
          <DialogDescription>
            {regenerationPreview?.issuesFixed || 0} éléments corrigés. Vérifiez avant de sauvegarder.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh]">
          {regenerationPreview?.newContent && (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(regenerationPreview.newContent) }}
            />
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Sauvegarder les corrections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
