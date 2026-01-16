import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DailyWord {
  id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  definition: string;
  audio_url: string | null;
  is_active: boolean;
}

const WordsModule = () => {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingWordId, setGeneratingWordId] = useState<string | null>(null);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; word: DailyWord | null }>({
    open: false,
    word: null,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("daily_words")
        .select("id, word, phonetic, part_of_speech, definition, audio_url, is_active")
        .eq("is_active", true)
        .order("word", { ascending: true });

      if (error) throw error;
      setWords(data || []);
    } catch (err) {
      console.error("Error fetching words:", err);
      toast.error("Erreur lors du chargement des mots");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (word: DailyWord) => {
    if (!word.audio_url) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingWordId === word.id) {
      setPlayingWordId(null);
      return;
    }

    const audio = new Audio(word.audio_url);
    audioRef.current = audio;

    audio.onplay = () => setPlayingWordId(word.id);
    audio.onended = () => {
      setPlayingWordId(null);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setPlayingWordId(null);
      audioRef.current = null;
      toast.error("Erreur lors de la lecture audio");
    };

    try {
      await audio.play();
    } catch {
      setPlayingWordId(null);
    }
  };

  const handleRegenerateClick = (word: DailyWord) => {
    if (word.audio_url) {
      // Show confirmation dialog for existing audio
      setConfirmDialog({ open: true, word });
    } else {
      // Generate directly if no audio exists
      generateAudio(word);
    }
  };

  const generateAudio = async (word: DailyWord) => {
    setConfirmDialog({ open: false, word: null });
    setGeneratingWordId(word.id);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }

      const response = await supabase.functions.invoke("generate-word-audio", {
        body: { wordId: word.id, word: word.word },
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.success && response.data?.audioUrl) {
        // Update local state
        setWords(prev =>
          prev.map(w =>
            w.id === word.id ? { ...w, audio_url: response.data.audioUrl } : w
          )
        );
        toast.success(`Audio généré pour "${word.word}"`);
      } else {
        throw new Error(response.data?.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("Error generating audio:", err);
      toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de la génération"}`);
    } finally {
      setGeneratingWordId(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const wordsWithAudio = words.filter(w => w.audio_url);
  const wordsWithoutAudio = words.filter(w => !w.audio_url);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestion Audio des Mots</h2>
          <p className="text-sm text-muted-foreground">
            Régénérez la prononciation des mots du jour
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {wordsWithAudio.length} avec audio
          </Badge>
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            {wordsWithoutAudio.length} sans audio
          </Badge>
        </div>
      </div>

      {/* Words without audio first */}
      {wordsWithoutAudio.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Mots sans audio ({wordsWithoutAudio.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wordsWithoutAudio.map(word => (
              <WordRow
                key={word.id}
                word={word}
                isGenerating={generatingWordId === word.id}
                isPlaying={playingWordId === word.id}
                onPlay={() => playAudio(word)}
                onRegenerate={() => handleRegenerateClick(word)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Words with audio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Mots avec audio ({wordsWithAudio.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wordsWithAudio.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun mot avec audio
            </p>
          ) : (
            wordsWithAudio.map(word => (
              <WordRow
                key={word.id}
                word={word}
                isGenerating={generatingWordId === word.id}
                isPlaying={playingWordId === word.id}
                onPlay={() => playAudio(word)}
                onRegenerate={() => handleRegenerateClick(word)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={open => !open && setConfirmDialog({ open: false, word: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer l'audio ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le mot <strong>"{confirmDialog.word?.word}"</strong> a déjà un audio.
              Voulez-vous le remplacer par une nouvelle génération ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.word && generateAudio(confirmDialog.word)}
            >
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface WordRowProps {
  word: DailyWord;
  isGenerating: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRegenerate: () => void;
}

const WordRow = ({ word, isGenerating, isPlaying, onPlay, onRegenerate }: WordRowProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{word.word}</span>
          <span className="text-xs text-muted-foreground font-mono">[{word.phonetic}]</span>
          <Badge variant="secondary" className="text-xs">
            {word.part_of_speech}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{word.definition}</p>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Play button - only if audio exists */}
        {word.audio_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlay}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Generate/Regenerate button */}
        <Button
          variant={word.audio_url ? "outline" : "default"}
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="gap-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Génération...
            </>
          ) : word.audio_url ? (
            <>
              <RefreshCw className="h-3 w-3" />
              Régénérer
            </>
          ) : (
            <>
              <Volume2 className="h-3 w-3" />
              Générer
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WordsModule;
