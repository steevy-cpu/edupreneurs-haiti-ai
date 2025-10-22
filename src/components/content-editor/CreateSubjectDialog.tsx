import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectCreated: () => void;
}

export const CreateSubjectDialog = ({
  open,
  onOpenChange,
  onSubjectCreated,
}: CreateSubjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    grade_level: "",
    icon_name: "📚",
    color: "#3B82F6",
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.grade_level) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Auto-generate slug if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');

      const { error } = await supabase
        .from('subjects')
        .insert({
          ...formData,
          slug,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success("Matière créée avec succès");
      onSubjectCreated();
      onOpenChange(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        grade_level: "",
        icon_name: "📚",
        color: "#3B82F6",
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error("Erreur lors de la création de la matière");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle matière</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle matière au programme
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la matière *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Mathématiques"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Ex: mathematiques"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade_level">Niveau scolaire *</Label>
            <Select
              value={formData.grade_level}
              onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
            >
              <SelectTrigger id="grade_level">
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6eme">6ème</SelectItem>
                <SelectItem value="5eme">5ème</SelectItem>
                <SelectItem value="4eme">4ème</SelectItem>
                <SelectItem value="3eme">3ème</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de la matière"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icône (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                placeholder="📚"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
