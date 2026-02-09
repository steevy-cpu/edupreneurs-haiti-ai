import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Music, Image } from 'lucide-react';

interface StudyMusicTrack {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/** Extract YouTube video ID from a URL or return the raw string if it's already an ID */
const extractYoutubeId = (input: string): string => {
  const trimmed = input.trim();
  // Already a bare ID (no slashes, no dots)
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    // youtube.com/watch?v=xxx
    if (url.searchParams.has('v')) return url.searchParams.get('v')!;
    // youtu.be/xxx
    if (url.hostname === 'youtu.be') return url.pathname.slice(1);
    // youtube.com/embed/xxx
    const embedMatch = url.pathname.match(/\/embed\/([A-Za-z0-9_-]+)/);
    if (embedMatch) return embedMatch[1];
  } catch {
    // not a URL — return as-is
  }
  return trimmed;
};

export const StudyMusicManager = () => {
  const [tracks, setTracks] = useState<StudyMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formYoutubeInput, setFormYoutubeInput] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const derivedYoutubeId = extractYoutubeId(formYoutubeInput);
  const derivedThumbnail = derivedYoutubeId
    ? `https://i.ytimg.com/vi/${derivedYoutubeId}/hqdefault.jpg`
    : '';

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('study_music_tracks')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTracks(data || []);
    } catch (err) {
      console.error('Error fetching tracks:', err);
      toast.error('Erreur lors du chargement des pistes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = () => {
    setFormYoutubeInput('');
    setFormTitle('');
    setFormSortOrder(tracks.length + 1);
  };

  const handleSave = async () => {
    if (!derivedYoutubeId || !formTitle.trim()) {
      toast.error('Veuillez remplir le YouTube ID et le titre');
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('study_music_tracks')
        .insert({
          youtube_id: derivedYoutubeId,
          title: formTitle.trim(),
          thumbnail_url: derivedThumbnail,
          sort_order: formSortOrder,
        });

      if (error) throw error;
      toast.success('Piste ajoutée avec succès');
      setIsDialogOpen(false);
      resetForm();
      fetchTracks();
    } catch (err: any) {
      console.error('Error saving track:', err);
      toast.error("Erreur lors de l'ajout de la piste");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (trackId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette piste ?')) return;

    try {
      const { error } = await supabase
        .from('study_music_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
      toast.success('Piste supprimée');
      fetchTracks();
    } catch (err) {
      console.error('Error deleting track:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (trackId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('study_music_tracks')
        .update({ is_active: !currentState })
        .eq('id', trackId);

      if (error) throw error;
      fetchTracks();
    } catch (err) {
      console.error('Error toggling active state:', err);
      toast.error('Erreur lors de la modification');
    }
  };

  const stats = {
    total: tracks.length,
    active: tracks.filter((t) => t.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Gestion de la Musique d'Étude
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="secondary">Total: {stats.total}</Badge>
            <Badge variant="default" className="bg-green-500">
              Actifs: {stats.active}
            </Badge>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
              else setFormSortOrder(tracks.length + 1);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une piste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter une piste musicale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtubeInput">YouTube URL ou ID *</Label>
                  <Input
                    id="youtubeInput"
                    value={formYoutubeInput}
                    onChange={(e) => setFormYoutubeInput(e.target.value)}
                    placeholder="ex: dQw4w9WgXcQ ou https://youtube.com/watch?v=..."
                  />
                  {derivedYoutubeId && formYoutubeInput && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ID détecté : <code className="bg-muted px-1 rounded">{derivedYoutubeId}</code>
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="ex: Mozart - Sonate au Clair de Lune"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Ordre de tri</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
                {/* Thumbnail preview */}
                {derivedThumbnail && formYoutubeInput && (
                  <div>
                    <Label>Aperçu miniature</Label>
                    <img
                      src={derivedThumbnail}
                      alt="Aperçu"
                      className="w-full max-w-[200px] rounded-md mt-1 border"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Tracks Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Music className="h-12 w-12 mb-2" />
              <p>Aucune piste ajoutée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>YouTube ID</TableHead>
                    <TableHead className="w-20">Ordre</TableHead>
                    <TableHead className="w-20">Actif</TableHead>
                    <TableHead className="text-right w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell>
                        <img
                          src={track.thumbnail_url}
                          alt={track.title}
                          className="w-12 h-9 object-cover rounded"
                          loading="lazy"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {track.title}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {track.youtube_id}
                        </code>
                      </TableCell>
                      <TableCell>{track.sort_order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={track.is_active}
                          onCheckedChange={() => toggleActive(track.id, track.is_active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(track.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
