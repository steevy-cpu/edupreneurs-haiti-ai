import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Youtube, Save, Trash2 } from "lucide-react";

interface YouTubeManagerProps {
  lesson: any;
  onUpdate: () => void;
}

export const YouTubeManager = ({ lesson, onUpdate }: YouTubeManagerProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState(lesson?.youtube_url || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Youtube className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour gérer sa vidéo</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          youtube_url: youtubeUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lesson.id);

      if (error) throw error;

      toast.success("Vidéo YouTube mise à jour avec succès");
      onUpdate();
    } catch (error) {
      console.error('Error updating YouTube URL:', error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          youtube_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lesson.id);

      if (error) throw error;

      setYoutubeUrl("");
      toast.success("Vidéo YouTube supprimée");
      onUpdate();
    } catch (error) {
      console.error('Error removing YouTube URL:', error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Vidéo YouTube
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="youtube-url">URL de la vidéo</Label>
          <Input
            id="youtube-url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Collez l'URL complète ou le lien de partage YouTube
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
          {lesson.youtube_url && (
            <Button 
              onClick={handleRemove} 
              disabled={isSaving}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
