import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GitBranch, CheckCircle, XCircle, Send, Calendar } from "lucide-react";
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";
import { useLessonPublishable } from "@/features/content-editor/hooks/useLessonPublishable";
import { PublishGateIndicator } from "@/features/content-editor/components/PublishGateIndicator";

interface WorkflowManagementProps {
  selectedLesson: any;
  onUpdate: () => void;
}

type WorkflowStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'rejected';

export const WorkflowManagement = ({ selectedLesson, onUpdate }: WorkflowManagementProps) => {
  const { role } = useContentEditorPermissions();
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLesson) {
      setReviewNotes(selectedLesson.review_notes || "");
    }
  }, [selectedLesson]);

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'in_review':
        return 'default';
      case 'approved':
        return 'default';
      case 'published':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'in_review':
        return 'En révision';
      case 'approved':
        return 'Approuvé';
      case 'published':
        return 'Publié';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const updateWorkflowStatus = async (newStatus: WorkflowStatus, notes?: string) => {
    if (!selectedLesson) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const updates: any = {
        workflow_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (notes !== undefined) {
        updates.review_notes = notes;
      }

      if (newStatus === 'approved' || newStatus === 'rejected') {
        updates.reviewed_by = user.id;
      }

      if (newStatus === 'published') {
        updates.is_published = true;
      }

      const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', selectedLesson.id);

      if (error) throw error;

      toast.success(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
      onUpdate();
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedLesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour gérer son workflow</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = selectedLesson.workflow_status || 'draft';
  const canSubmitForReview = role === 'editor' || role === 'admin';
  const canApprove = role === 'admin';
  
  // Publishing gate check
  const { canPublish, isLoading: gateLoading, blockers, quizAsset, activitiesAsset } = useLessonPublishable(selectedLesson?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Gestion du Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div>
          <Label className="text-sm text-muted-foreground">Statut actuel</Label>
          <div className="mt-2">
            <Badge variant={getStatusColor(currentStatus)} className="text-sm px-3 py-1">
              {getStatusLabel(currentStatus)}
            </Badge>
          </div>
        </div>

        {/* Review Notes */}
        <div className="space-y-2">
          <Label htmlFor="review-notes">Notes de révision</Label>
          <Textarea
            id="review-notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Ajoutez des notes de révision..."
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Submit for Review */}
          {currentStatus === 'draft' && canSubmitForReview && (
            <Button
              className="w-full"
              onClick={() => updateWorkflowStatus('in_review', reviewNotes)}
              disabled={isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              Soumettre pour révision
            </Button>
          )}

          {/* Admin Actions */}
          {currentStatus === 'in_review' && canApprove && (
            <>
              <Button
                className="w-full"
                onClick={() => updateWorkflowStatus('approved', reviewNotes)}
                disabled={isSubmitting}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => updateWorkflowStatus('rejected', reviewNotes)}
                disabled={isSubmitting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            </>
          )}

          {/* Publish */}
          {currentStatus === 'approved' && canApprove && (
            <>
              <PublishGateIndicator
                blockers={blockers}
                quizAsset={quizAsset}
                activitiesAsset={activitiesAsset}
                isLoading={gateLoading}
                className="mb-2"
              />
              <Button
                className="w-full"
                onClick={() => updateWorkflowStatus('published', reviewNotes)}
                disabled={isSubmitting || !canPublish}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Publier
              </Button>
            </>
          )}

          {/* Return to Draft */}
          {(currentStatus === 'rejected' || currentStatus === 'in_review') && canSubmitForReview && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => updateWorkflowStatus('draft', reviewNotes)}
              disabled={isSubmitting}
            >
              Retour au brouillon
            </Button>
          )}
        </div>

        {/* Workflow Timeline */}
        <div className="border-t pt-4">
          <Label className="text-sm text-muted-foreground mb-3 block">
            Étapes du workflow
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentStatus === 'draft' ? 'bg-primary' : 'bg-muted'}`} />
              <span className="text-sm">Brouillon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentStatus === 'in_review' ? 'bg-primary' : 'bg-muted'}`} />
              <span className="text-sm">En révision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentStatus === 'approved' ? 'bg-primary' : 'bg-muted'}`} />
              <span className="text-sm">Approuvé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentStatus === 'published' ? 'bg-primary' : 'bg-muted'}`} />
              <span className="text-sm">Publié</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
