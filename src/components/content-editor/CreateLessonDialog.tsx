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

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  onLessonCreated: (lesson: any) => void;
}

export const CreateLessonDialog = ({
  open,
  onOpenChange,
  subjectId,
  onLessonCreated,
}: CreateLessonDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    objectif: "",
    grade_level: "",
  });

  const handleCreate = async () => {
    if (!formData.title || !formData.grade_level) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Auto-generate slug if not provided
      const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-');

      // Get the next order index
      const { data: lessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('subject_id', subjectId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = lessons && lessons.length > 0 ? lessons[0].order_index + 1 : 0;

      const { data, error } = await supabase
        .from('lessons')
        .insert({
          subject_id: subjectId,
          title: formData.title,
          slug,
          objectif: formData.objectif,
          grade_level: formData.grade_level,
          order_index: nextOrderIndex,
          created_by: user.id,
          workflow_status: 'draft',
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the creation
      await supabase
        .from('content_change_log')
        .insert({
          lesson_id: data.id,
          subject_id: subjectId,
          changed_by: user.id,
          change_type: 'create',
          new_content: formData,
        });

      toast.success("Leçon créée avec succès");
      onLessonCreated(data);
      onOpenChange(false);
      setFormData({
        title: "",
        slug: "",
        objectif: "",
        grade_level: "",
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error("Erreur lors de la création de la leçon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle leçon</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle leçon à cette matière
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la leçon *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Les fractions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Ex: les-fractions"
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
            <Label htmlFor="objectif">Objectif d'apprentissage</Label>
            <Textarea
              id="objectif"
              value={formData.objectif}
              onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
              placeholder="Qu'est-ce que les élèves apprendront?"
              rows={3}
            />
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
