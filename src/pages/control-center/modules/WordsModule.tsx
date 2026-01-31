import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Send,
  Bell,
  Mic
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
  display_order: number | null;
}

type TTSProvider = 'openai' | 'elevenlabs';

const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'America/Port-au-Prince' 
  });
};

const WordsModule = () => {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingWordId, setGeneratingWordId] = useState<string | null>(null);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [todaysWord, setTodaysWord] = useState<DailyWord | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<TTSProvider>('elevenlabs');
  const [notificationResult, setNotificationResult] = useState<{
    success: boolean;
    word?: string;
    sentCount?: number;
    eligibleUsers?: number;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    open: boolean; 
    word: DailyWord | null;
    type: 'regenerate' | 'notification';
  }>({
    open: false,
    word: null,
    type: 'regenerate',
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setIsLoading(true);
      // Fetch with display_order for sequential rotation
      const { data, error } = await supabase
        .from("daily_words")
        .select("id, word, phonetic, part_of_speech, definition, audio_url, is_active, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      const wordsList = data || [];
      setWords(wordsList);
      
      // Calculate today's word using sequential rotation
      if (wordsList.length > 0) {
        await calculateTodaysWord(wordsList);
      }
    } catch (err) {
      console.error("Error fetching words:", err);
      toast.error("Erreur lors du chargement des mots");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTodaysWord = async (wordsList: DailyWord[]) => {
    try {
      const haitiDate = getHaitiDate();
      
      // Get current rotation state from app_settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'word_of_day')
        .single();
      
      const settingsValue = settings?.value as { last_date?: string; last_order?: number } | null;
      const lastDate = settingsValue?.last_date;
      const lastOrder = settingsValue?.last_order || 0;
      
      let currentOrder = lastOrder;
      
      // If it's a new day, we show the next word
      if (lastDate !== haitiDate) {
        const maxOrder = Math.max(...wordsList.map(w => w.display_order || 0));
        currentOrder = (lastOrder % maxOrder) + 1;
      }
      
      // Find the word with this display_order
      const todayWord = wordsList.find(w => w.display_order === currentOrder);
      if (todayWord) {
        setTodaysWord(todayWord);
      } else {
        // Fallback to first word if display_order not found
        setTodaysWord(wordsList[0]);
      }
    } catch (err) {
      console.error("Error calculating today's word:", err);
      // Fallback to first word
      if (wordsList.length > 0) {
        setTodaysWord(wordsList[0]);
      }
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
      setConfirmDialog({ open: true, word, type: 'regenerate' });
    } else {
      // Generate directly if no audio exists
      generateAudio(word);
    }
  };

  const generateAudio = async (word: DailyWord) => {
    setConfirmDialog({ open: false, word: null, type: 'regenerate' });
    setGeneratingWordId(word.id);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }

      const response = await supabase.functions.invoke("generate-word-audio", {
        body: { 
          wordId: word.id, 
          word: word.word,
          provider: selectedProvider
        },
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
        
        // Update today's word if it matches
        if (todaysWord?.id === word.id) {
          setTodaysWord(prev => prev ? { ...prev, audio_url: response.data.audioUrl } : null);
        }
        
        toast.success(`Audio généré pour "${word.word}" (${response.data.provider})`);
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

  const handleSendNotificationClick = () => {
    // Show confirmation dialog for sending notification
    setConfirmDialog({ open: true, word: null, type: 'notification' });
  };

  const sendDailyWordNotification = async () => {
    setConfirmDialog({ open: false, word: null, type: 'notification' });
    setSendingNotification(true);
    setNotificationResult(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }

      const response = await supabase.functions.invoke("send-daily-word-notification", {
        body: {}
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.success) {
        setNotificationResult({
          success: true,
          word: response.data.word,
          sentCount: response.data.sentCount,
          eligibleUsers: response.data.eligibleUsers
        });
        toast.success(`Notification envoyée à ${response.data.sentCount} utilisateur(s)!`);
      } else {
        throw new Error(response.data?.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de l'envoi"}`);
      setNotificationResult({ success: false });
    } finally {
      setSendingNotification(false);
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
      {/* Daily Notification Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notification Quotidienne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envoyer une notification push avec le mot du jour à tous les utilisateurs 
            qui ont activé cette catégorie de notification.
          </p>
          
          {/* Today's word preview */}
          {todaysWord && (
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-xs text-muted-foreground mb-1">Mot du jour (sera envoyé) :</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{todaysWord.word}</span>
                <span className="text-xs text-muted-foreground font-mono">[{todaysWord.phonetic}]</span>
                {todaysWord.display_order && (
                  <Badge variant="secondary" className="text-xs">
                    #{todaysWord.display_order}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{todaysWord.definition}</p>
            </div>
          )}
          
          <Button
            onClick={handleSendNotificationClick}
            disabled={sendingNotification}
            className="w-full sm:w-auto gap-2"
          >
            {sendingNotification ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer le mot du jour
              </>
            )}
          </Button>

          {notificationResult && (
            <div className={`p-3 rounded-lg text-sm ${
              notificationResult.success 
                ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {notificationResult.success ? (
                <>
                  <p className="font-medium">✅ Notification envoyée !</p>
                  <p>Mot: <strong>{notificationResult.word}</strong></p>
                  <p>Utilisateurs éligibles: {notificationResult.eligibleUsers}</p>
                  <p>Notifications envoyées: {notificationResult.sentCount}</p>
                </>
              ) : (
                <p>❌ Échec de l'envoi. Vérifiez les logs.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* TTS Provider Selection */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4 text-amber-500" />
            Fournisseur TTS (Text-to-Speech)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choisissez le fournisseur pour générer l'audio des mots. Testez les deux pour comparer la qualité.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedProvider === 'elevenlabs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProvider('elevenlabs')}
              className="gap-2"
            >
              <CheckCircle2 className={`h-4 w-4 ${selectedProvider === 'elevenlabs' ? '' : 'opacity-0'}`} />
              ElevenLabs (Recommandé)
            </Button>
            <Button
              variant={selectedProvider === 'openai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProvider('openai')}
              className="gap-2"
            >
              <CheckCircle2 className={`h-4 w-4 ${selectedProvider === 'openai' ? '' : 'opacity-0'}`} />
              OpenAI
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {selectedProvider === 'elevenlabs' 
              ? '✨ Volume plus élevé, meilleur français, voix naturelle (Sarah)' 
              : '🔉 Volume plus bas, voix Nova, alternative rapide'}
          </p>
        </CardContent>
      </Card>

      <Separator />

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
        onOpenChange={open => !open && setConfirmDialog({ open: false, word: null, type: 'regenerate' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'notification' 
                ? 'Envoyer la notification ?' 
                : "Régénérer l'audio ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'notification' ? (
                <>
                  Une notification push sera envoyée à tous les utilisateurs qui ont 
                  activé la catégorie "Mot du jour".
                  {todaysWord && (
                    <span className="block mt-2 font-medium">
                      Mot: <strong className="text-primary">{todaysWord.word}</strong> [{todaysWord.phonetic}]
                    </span>
                  )}
                </>
              ) : (
                <>
                  Le mot <strong>"{confirmDialog.word?.word}"</strong> a déjà un audio.
                  Voulez-vous le remplacer par une nouvelle génération avec{' '}
                  <strong>{selectedProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'}</strong> ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === 'notification') {
                  sendDailyWordNotification();
                } else if (confirmDialog.word) {
                  generateAudio(confirmDialog.word);
                }
              }}
            >
              {confirmDialog.type === 'notification' ? 'Envoyer' : 'Régénérer'}
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
          {word.display_order && (
            <Badge variant="outline" className="text-xs h-5 min-w-[24px] justify-center">
              {word.display_order}
            </Badge>
          )}
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
