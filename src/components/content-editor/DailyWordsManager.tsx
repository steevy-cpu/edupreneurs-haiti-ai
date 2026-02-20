import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Volume2, Loader2, BookOpen, CheckCircle, XCircle } from 'lucide-react';

import type { DailyWord } from '@/types/dailyWord';

const PART_OF_SPEECH_OPTIONS = [
  'n.m.', 'n.f.', 'adj.', 'v.', 'adv.', 'n.', 'prép.', 'conj.'
];

const CATEGORY_OPTIONS = [
  'Littérature', 'Sciences', 'Philosophie', 'Histoire', 'Arts', 'Psychologie', 'Droit', 'Médecine'
];

export const DailyWordsManager = () => {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<DailyWord | null>(null);
  const [generatingAudioFor, setGeneratingAudioFor] = useState<string | null>(null);

  // Form state
  const [formWord, setFormWord] = useState('');
  const [formPhonetic, setFormPhonetic] = useState('');
  const [formPartOfSpeech, setFormPartOfSpeech] = useState('adj.');
  const [formDefinition, setFormDefinition] = useState('');
  const [formExample, setFormExample] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('daily_words')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (err) {
      console.error('Error fetching words:', err);
      toast.error('Erreur lors du chargement des mots');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormWord('');
    setFormPhonetic('');
    setFormPartOfSpeech('adj.');
    setFormDefinition('');
    setFormExample('');
    setFormCategory('');
    setEditingWord(null);
  };

  const openEditDialog = (word: DailyWord) => {
    setEditingWord(word);
    setFormWord(word.word);
    setFormPhonetic(word.phonetic);
    setFormPartOfSpeech(word.part_of_speech);
    setFormDefinition(word.definition);
    setFormExample(word.example);
    setFormCategory(word.category || '');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formWord || !formPhonetic || !formDefinition || !formExample) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSaving(true);

      const wordData = {
        word: formWord.trim(),
        phonetic: formPhonetic.trim(),
        part_of_speech: formPartOfSpeech,
        definition: formDefinition.trim(),
        example: formExample.trim(),
        category: formCategory || null,
      };

      if (editingWord) {
        const { error } = await supabase
          .from('daily_words')
          .update(wordData)
          .eq('id', editingWord.id);

        if (error) throw error;
        toast.success('Mot modifié avec succès');
      } else {
        const { error } = await supabase
          .from('daily_words')
          .insert(wordData);

        if (error) throw error;
        toast.success('Mot ajouté avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchWords();
    } catch (err: any) {
      console.error('Error saving word:', err);
      if (err.code === '23505') {
        toast.error('Ce mot existe déjà');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (wordId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce mot ?')) return;

    try {
      const { error } = await supabase
        .from('daily_words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;
      toast.success('Mot supprimé');
      fetchWords();
    } catch (err) {
      console.error('Error deleting word:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (wordId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_words')
        .update({ is_active: !currentState })
        .eq('id', wordId);

      if (error) throw error;
      fetchWords();
    } catch (err) {
      console.error('Error toggling active state:', err);
      toast.error('Erreur lors de la modification');
    }
  };

  const generateAudio = async (word: DailyWord) => {
    try {
      setGeneratingAudioFor(word.id);
      
      const { data, error } = await supabase.functions.invoke('generate-word-audio', {
        body: {
          wordId: word.id,
          word: word.word,
        },
      });

      if (error) throw error;

      toast.success(`Audio généré pour "${word.word}"`);
      fetchWords();
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error('Erreur lors de la génération de l\'audio');
    } finally {
      setGeneratingAudioFor(null);
    }
  };

  const generateAllMissingAudio = async () => {
    const wordsWithoutAudio = words.filter(w => !w.audio_url && w.is_active);
    
    if (wordsWithoutAudio.length === 0) {
      toast.info('Tous les mots ont déjà un audio');
      return;
    }

    toast.info(`Génération de ${wordsWithoutAudio.length} audios...`);

    for (const word of wordsWithoutAudio) {
      await generateAudio(word);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    toast.success('Génération terminée');
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const stats = {
    total: words.length,
    active: words.filter(w => w.is_active).length,
    withAudio: words.filter(w => w.audio_url).length,
    withoutAudio: words.filter(w => !w.audio_url && w.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Gestion des Mots du Jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="secondary">Total: {stats.total}</Badge>
            <Badge variant="default" className="bg-green-500">Actifs: {stats.active}</Badge>
            <Badge variant="default" className="bg-blue-500">Avec audio: {stats.withAudio}</Badge>
            {stats.withoutAudio > 0 && (
              <Badge variant="destructive">Sans audio: {stats.withoutAudio}</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un mot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingWord ? 'Modifier le mot' : 'Ajouter un mot du jour'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="word">Mot *</Label>
                    <Input
                      id="word"
                      value={formWord}
                      onChange={(e) => setFormWord(e.target.value)}
                      placeholder="ex: Éphémère"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phonetic">Phonétique *</Label>
                    <Input
                      id="phonetic"
                      value={formPhonetic}
                      onChange={(e) => setFormPhonetic(e.target.value)}
                      placeholder="ex: e.fe.mɛʁ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partOfSpeech">Type grammatical *</Label>
                    <Select value={formPartOfSpeech} onValueChange={setFormPartOfSpeech}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PART_OF_SPEECH_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="definition">Définition *</Label>
                    <Textarea
                      id="definition"
                      value={formDefinition}
                      onChange={(e) => setFormDefinition(e.target.value)}
                      placeholder="Qui ne dure qu'un temps très court"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="example">Exemple *</Label>
                    <Textarea
                      id="example"
                      value={formExample}
                      onChange={(e) => setFormExample(e.target.value)}
                      placeholder="La beauté des fleurs est éphémère."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingWord ? 'Modifier' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {stats.withoutAudio > 0 && (
              <Button variant="outline" onClick={generateAllMissingAudio}>
                <Volume2 className="mr-2 h-4 w-4" />
                Générer tous les audios manquants ({stats.withoutAudio})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Words Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : words.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-2" />
              <p>Aucun mot ajouté</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mot</TableHead>
                    <TableHead>Phonétique</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Audio</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium">{word.word}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {word.phonetic}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{word.part_of_speech}</Badge>
                      </TableCell>
                      <TableCell>
                        {word.category && (
                          <Badge variant="secondary">{word.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {word.audio_url ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => playAudio(word.audio_url!)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateAudio(word)}
                            disabled={generatingAudioFor === word.id}
                            className="text-muted-foreground hover:text-primary"
                          >
                            {generatingAudioFor === word.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={word.is_active}
                          onCheckedChange={() => toggleActive(word.id, word.is_active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(word)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(word.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
