import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Package, Trash2, Eye, EyeOff, Download, Upload } from "lucide-react";
// Context replaces independent hook call — reads from the shared provider in ContentEditor
import { useContentEditorPermissionsContext } from "@/contexts/ContentEditorPermissionsContext";

export const BulkOperations = () => {
  const { role } = useContentEditorPermissionsContext();
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, is_published, grade_level, workflow_status')
        .order('title');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Erreur lors du chargement des leçons');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (lessonId: string) => {
    setSelectedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const selectAll = () => {
    if (selectedLessons.length === lessons.length) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons(lessons.map((l) => l.id));
    }
  };

  const bulkPublish = async () => {
    if (selectedLessons.length === 0) {
      toast.error('Aucune leçon sélectionnée');
      return;
    }

    try {
      // Check publishability for each selected lesson
      const publishableResults = await Promise.all(
        selectedLessons.map(id =>
          supabase.rpc('check_lesson_publishable', { p_lesson_id: id })
        )
      );

      const publishableIds = selectedLessons.filter((_, i) => publishableResults[i].data === true);
      const blockedCount = selectedLessons.length - publishableIds.length;

      if (publishableIds.length === 0) {
        toast.error('Aucune leçon ne peut être publiée (quiz/activités non validés)');
        return;
      }

      if (blockedCount > 0) {
        toast.warning(`${blockedCount} leçon(s) ignorée(s) (validation manquante)`);
      }

      const { error } = await supabase
        .from('lessons')
        .update({ is_published: true, workflow_status: 'published' })
        .in('id', publishableIds);

      if (error) throw error;

      toast.success(`${publishableIds.length} leçon(s) publiée(s)`);
      setSelectedLessons([]);
      fetchLessons();
    } catch (error) {
      console.error('Error publishing lessons:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  const bulkUnpublish = async () => {
    if (selectedLessons.length === 0) {
      toast.error('Aucune leçon sélectionnée');
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: false, workflow_status: 'draft' })
        .in('id', selectedLessons);

      if (error) throw error;

      toast.success(`${selectedLessons.length} leçon(s) dépubliée(s)`);
      setSelectedLessons([]);
      fetchLessons();
    } catch (error) {
      console.error('Error unpublishing lessons:', error);
      toast.error('Erreur lors de la dépublication');
    }
  };

  const bulkDelete = async () => {
    if (selectedLessons.length === 0) {
      toast.error('Aucune leçon sélectionnée');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedLessons.length} leçon(s) ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .in('id', selectedLessons);

      if (error) throw error;

      toast.success(`${selectedLessons.length} leçon(s) supprimée(s)`);
      setSelectedLessons([]);
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lessons:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportLessons = async () => {
    if (selectedLessons.length === 0) {
      toast.error('Aucune leçon sélectionnée');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .in('id', selectedLessons);

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lessons-export-${new Date().toISOString()}.json`;
      a.click();

      toast.success('Export réussi');
    } catch (error) {
      console.error('Error exporting lessons:', error);
      toast.error("Erreur lors de l'export");
    }
  };

  const canDelete = role === 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Opérations en masse
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gérez plusieurs leçons simultanément
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={selectAll}>
            {selectedLessons.length === lessons.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
          <Button size="sm" onClick={bulkPublish} disabled={selectedLessons.length === 0}>
            <Eye className="mr-2 h-4 w-4" />
            Publier ({selectedLessons.length})
          </Button>
          <Button size="sm" variant="secondary" onClick={bulkUnpublish} disabled={selectedLessons.length === 0}>
            <EyeOff className="mr-2 h-4 w-4" />
            Dépublier ({selectedLessons.length})
          </Button>
          <Button size="sm" variant="outline" onClick={exportLessons} disabled={selectedLessons.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={bulkDelete}
              disabled={selectedLessons.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({selectedLessons.length})
            </Button>
          )}
        </div>

        {/* Lessons List */}
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="text-center p-4">Chargement...</div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedLessons.includes(lesson.id)}
                    onCheckedChange={() => toggleSelection(lesson.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{lesson.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {lesson.grade_level}
                      </Badge>
                      {lesson.is_published ? (
                        <Badge variant="default" className="text-xs">
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Non publié
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
