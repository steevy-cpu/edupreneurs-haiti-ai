import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  { value: "inappropriate", label: "Contenu inapproprié", description: "Contenu offensant, violent ou explicite" },
  { value: "harassment", label: "Harcèlement", description: "Intimidation ou harcèlement ciblé" },
  { value: "spam", label: "Spam", description: "Contenu répétitif, publicités non sollicitées" },
  { value: "misinformation", label: "Fausses informations", description: "Information trompeuse ou fausse" },
  { value: "other", label: "Autre", description: "Autre problème non listé" },
];

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  reportedUserId: string;
  reportedUserName?: string;
}

export function ReportDialog({
  isOpen,
  onClose,
  postId,
  reportedUserId,
  reportedUserName = "cet utilisateur",
}: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour signaler");
        return;
      }

      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        post_id: postId,
        reason,
        description: description.trim() || null,
      });

      if (error) {
        // Check for duplicate report
        if (error.code === "23505") {
          toast.error("Vous avez déjà signalé ce contenu");
        } else {
          throw error;
        }
        return;
      }

      // Fire-and-forget: send confirmation email to reporter
      supabase.functions.invoke('send-report-confirmation', {}).catch(err => {
        console.error('Report confirmation email failed:', err);
      });

      toast.success("Signalement envoyé", {
        description: "Merci de nous aider à maintenir une communauté saine.",
      });
      handleClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Erreur lors de l'envoi du signalement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Signaler un contenu
          </DialogTitle>
          <DialogDescription>
            Signaler {reportedUserName} pour comportement inapproprié. Nos modérateurs examineront ce signalement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Reason Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pourquoi signalez-vous ce contenu ?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{option.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Détails supplémentaires (optionnel)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez pourquoi ce contenu pose problème..."
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || isSubmitting}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              "Envoyer le signalement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
