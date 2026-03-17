import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Mic,
  MicOff,
  Square,
  Play,
  Upload,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown
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
import type { DailyWord } from "@/types/dailyWord";

type TTSProvider = 'openai' | 'elevenlabs';

// Part of speech and category options for the add/edit form
const PART_OF_SPEECH_OPTIONS = [
  'n.m.', 'n.f.', 'adj.', 'v.', 'adv.', 'n.', 'prép.', 'conj.'
];
const CATEGORY_OPTIONS = [
  'Littérature', 'Sciences', 'Philosophie', 'Histoire', 'Arts', 'Psychologie', 'Droit', 'Médecine'
];

// Get today's date string in Haiti timezone (YYYY-MM-DD)
const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'America/Port-au-Prince' 
  });
};

// ─── Deterministic word selection ──────────────────────────────────────────
// MUST match useWordOfTheDay.ts exactly — both systems must compute the same
// display_order on the same Haiti date, ensuring the admin preview shows
// the exact word that students see on their dashboard.
const REFERENCE_DATE = new Date('2026-01-01T00:00:00');

const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSince = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  // Double-mod guards against negative daysSince (pre-reference dates)
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};
// ───────────────────────────────────────────────────────────────────────────

/** Reverse-calculate the next calendar date when a given display_order will be active */
const getScheduledDate = (displayOrder: number, totalActive: number): Date | null => {
  if (!displayOrder || totalActive === 0) return null;
  const haitiDate = getHaitiDate();
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSince = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  const target = displayOrder - 1;
  // Which display_order index is active today
  const currentMod = ((daysSince % totalActive) + totalActive) % totalActive;
  // How many days until target comes up next
  const offset = ((target - currentMod) + totalActive) % totalActive;
  return new Date(today.getTime() + offset * 86400000);
};

/** Render audio source badge based on audio_source column */
const AudioSourceBadge = ({ source }: { source: string | null }) => {
  if (!source) return null;
  if (source === 'elevenlabs') return <Badge className="text-[10px] px-1 py-0 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">EL</Badge>;
  if (source === 'openai') return <Badge className="text-[10px] px-1 py-0 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">OAI</Badge>;
  if (source === 'recording') return <Badge className="text-[10px] px-1 py-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">🎙️</Badge>;
  return null;
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
    type: 'regenerate' | 'notification' | 'delete';
  }>({
    open: false,
    word: null,
    type: 'regenerate',
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Recording state (Plan B — browser voice recording) ────────────────
  const [recordingWord, setRecordingWord] = useState<DailyWord | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Batch audio generation state ──────────────────────────────────────
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ processed: 0, total: 0 });
  const [batchFailed, setBatchFailed] = useState<{ id: string; word: string; error: string }[]>([]);

  // ─── CRUD state ────────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<DailyWord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Form fields
  const [formWord, setFormWord] = useState('');
  const [formPhonetic, setFormPhonetic] = useState('');
  const [formPartOfSpeech, setFormPartOfSpeech] = useState('adj.');
  const [formDefinition, setFormDefinition] = useState('');
  const [formExample, setFormExample] = useState('');
  const [formCategory, setFormCategory] = useState('');

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setIsLoading(true);
      // Fetch ALL words (including inactive) so founders can manage everything
      const { data, error } = await supabase
        .from("daily_words")
        .select("*")
        .order("display_order", { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      const wordsList = (data || []) as DailyWord[];
      setWords(wordsList);
      
      // Deterministic selection — only considers active words
      const activeWords = wordsList.filter(w => w.is_active);
      if (activeWords.length > 0) {
        const haitiDate = getHaitiDate();
        const displayOrder = computeDisplayOrder(haitiDate, activeWords.length);
        const todayWord = activeWords.find(w => w.display_order === displayOrder);
        // Fallback to first active word if display_order has a gap
        setTodaysWord(todayWord ?? activeWords[0]);
      }
    } catch (err) {
      console.error("Error fetching words:", err);
      toast.error("Erreur lors du chargement des mots");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── CRUD handlers ─────────────────────────────────────────────────────

  const resetForm = () => {
    setFormWord('');
    setFormPhonetic('');
    setFormPartOfSpeech('adj.');
    setFormDefinition('');
    setFormExample('');
    setFormCategory('');
    setEditingWord(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
        // UPDATE existing word
        const { error } = await supabase
          .from('daily_words')
          .update(wordData)
          .eq('id', editingWord.id);

        if (error) throw error;
        toast.success('Mot modifié avec succès');
      } else {
        // Get next display_order via RPC for schedulability
        const { data: nextOrder } = await supabase.rpc('get_next_display_order');

        const { error } = await supabase
          .from('daily_words')
          .insert({
            ...wordData,
            is_active: true,
            display_order: nextOrder ?? 1,
          });

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
        toast.error("Erreur lors de l'enregistrement");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const wordToDelete = confirmDialog.word;
    if (!wordToDelete) return;
    setConfirmDialog({ open: false, word: null, type: 'delete' });

    try {
      const { error } = await supabase
        .from('daily_words')
        .delete()
        .eq('id', wordToDelete.id);

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

  // ─── Reorder handlers (Plan C — display order management) ───────────────

  /** Swap display_order between two adjacent words */
  const swapDisplayOrder = async (wordA: DailyWord, wordB: DailyWord) => {
    try {
      const { error: errA } = await supabase
        .from('daily_words')
        .update({ display_order: wordB.display_order })
        .eq('id', wordA.id);
      if (errA) throw errA;

      const { error: errB } = await supabase
        .from('daily_words')
        .update({ display_order: wordA.display_order })
        .eq('id', wordB.id);
      if (errB) throw errB;

      toast.success('Ordre mis à jour');
      fetchWords();
    } catch (err) {
      console.error('Swap error:', err);
      toast.error("Erreur lors du réordonnancement");
    }
  };

  // ─── Recording handlers (Plan B — browser mic) ─────────────────────────

  /** Open the recording dialog for a specific word */
  const openRecordingDialog = (word: DailyWord) => {
    setRecordingWord(word);
  };

  /** Release mic, revoke URLs, clear timers — safe to call multiple times */
  const cleanupRecording = () => {
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* already stopped */ }
    }
    mediaRecorderRef.current = null;

    // Release microphone tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    // Stop preview audio
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    // Revoke object URL to prevent memory leaks
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    // Clear timers
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (maxDurationRef.current) { clearTimeout(maxDurationRef.current); maxDurationRef.current = null; }

    chunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  /** Request mic permission and start recording (max 30s) */
  const startRecording = async () => {
    // Clean up any previous session first
    cleanupRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Pick best supported mime type — webm preferred, ogg fallback
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Combine chunks into single blob for preview/upload
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (maxDurationRef.current) { clearTimeout(maxDurationRef.current); maxDurationRef.current = null; }
      };

      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Duration counter — ticks every second
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Auto-stop at 30 seconds to keep file sizes reasonable
      maxDurationRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);

    } catch (err) {
      console.error('Mic access error:', err);
      toast.error("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.");
    }
  };

  /** Stop an active recording */
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  /** Upload the recorded blob to storage and update the word's audio_url */
  const uploadRecording = async () => {
    if (!recordedBlob || !recordingWord) return;

    setIsUploading(true);
    try {
      const ext = recordedBlob.type.includes('ogg') ? 'ogg' : 'webm';
      const filePath = `word-of-day/${recordingWord.id}.${ext}`;
      const file = new File([recordedBlob], `${recordingWord.id}.${ext}`, { type: recordedBlob.type });

      // Upload to existing lesson-audio bucket (upsert replaces previous file)
      const { error: uploadError } = await supabase.storage
        .from('lesson-audio')
        .upload(filePath, file, { upsert: true, contentType: recordedBlob.type });

      if (uploadError) throw uploadError;

      // Build public URL with cache-busting timestamp (same pattern as edge function)
      const { data: publicUrlData } = supabase.storage
        .from('lesson-audio')
        .getPublicUrl(filePath);

      const audioUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      // Persist URL and source in daily_words table
      const { error: updateError } = await supabase
        .from('daily_words')
        .update({ audio_url: audioUrl, audio_source: 'recording' })
        .eq('id', recordingWord.id);

      if (updateError) throw updateError;

      toast.success('Enregistrement sauvegardé !');
      closeRecordingDialog();
      fetchWords();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Erreur: ${err instanceof Error ? err.message : "Échec de l'upload"}`);
    } finally {
      setIsUploading(false);
    }
  };

  /** Close dialog and release all recording resources */
  const closeRecordingDialog = () => {
    cleanupRecording();
    setRecordingWord(null);
  };

  // ─── Audio handlers (unchanged from original) ──────────────────────────

  const playAudio = async (word: DailyWord) => {
    if (!word.audio_url) return;

    // Stop any currently playing audio before starting a new one
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
      setConfirmDialog({ open: true, word, type: 'regenerate' });
    } else {
      generateAudio(word);
    }
  };

  const generateAudio = async (word: DailyWord) => {
    setConfirmDialog({ open: false, word: null, type: 'regenerate' });
    setGeneratingWordId(word.id);

    try {
      const response = await supabase.functions.invoke("generate-word-audio", {
        body: { 
          wordId: word.id, 
          word: word.word,
          provider: selectedProvider
        },
      });

      if (response.error) throw response.error;

      if (response.data?.success && response.data?.audioUrl) {
        // Update local state with new audio URL and source provider
        const provider = response.data.provider || selectedProvider;
        setWords(prev =>
          prev.map(w =>
            w.id === word.id ? { ...w, audio_url: response.data.audioUrl, audio_source: provider } : w
          )
        );
        
        if (todaysWord?.id === word.id) {
          setTodaysWord(prev => prev ? { ...prev, audio_url: response.data.audioUrl, audio_source: provider } : null);
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

  // ─── Notification handlers (unchanged) ─────────────────────────────────

  const handleSendNotificationClick = () => {
    setConfirmDialog({ open: true, word: null, type: 'notification' });
  };

  const sendDailyWordNotification = async () => {
    setConfirmDialog({ open: false, word: null, type: 'notification' });
    setSendingNotification(true);
    setNotificationResult(null);

    try {
      const response = await supabase.functions.invoke("send-daily-word-notification", {
        body: {}
      });

      if (response.error) throw response.error;

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

  // ─── Batch audio generation — loops until all missing words have audio ──
  const startBatchGeneration = async () => {
    setIsBatchGenerating(true);
    setBatchProgress({ processed: 0, total: wordsWithoutAudio.length });
    setBatchFailed([]);

    let totalProcessed = 0;
    let allFailed: { id: string; word: string; error: string }[] = [];
    let remaining = wordsWithoutAudio.length;

    try {
      // Loop in batches of 30 until no words remain without audio
      while (remaining > 0) {
        const response = await supabase.functions.invoke('batch-generate-word-audio', {
          headers: { 'x-internal-secret': 'founder-batch-call' },
          body: {},
        });

        if (response.error) throw response.error;

        const data = response.data;
        if (!data || typeof data.processed !== 'number') {
          throw new Error('Invalid response from batch function');
        }

        totalProcessed += data.processed;
        if (data.failed?.length) {
          allFailed = [...allFailed, ...data.failed];
        }
        remaining = data.remaining;

        // Update progress for the UI bar
        setBatchProgress({ processed: totalProcessed, total: totalProcessed + remaining });
        setBatchFailed(allFailed);

        // If nothing was processed and nothing remains, we're done
        if (data.processed === 0 && remaining === 0) break;
        // Safety: if nothing processed but remaining > 0, all are failing — stop
        if (data.processed === 0 && data.failed?.length > 0) {
          console.warn('Batch stalled — all words in batch failed');
          break;
        }
      }

      // Refresh word list to reflect new audio_url values
      await fetchWords();

      if (allFailed.length > 0) {
        toast.warning(`${totalProcessed} audios générés, ${allFailed.length} échec(s)`);
      } else {
        toast.success(`${totalProcessed} audios générés avec succès !`);
      }
    } catch (err) {
      console.error('Batch generation error:', err);
      toast.error(`Erreur batch: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Release mic/recording resources if component unmounts mid-recording
      cleanupRecording();
    };
  }, []);

  const wordsWithAudio = words.filter(w => w.audio_url);
  const wordsWithoutAudio = words.filter(w => !w.audio_url && w.is_active);
  const activeCount = words.filter(w => w.is_active).length;

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
          
          {/* Today's word preview — deterministic algorithm, matches what students see */}
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
              ? '✨ Volume plus élevé, meilleur français, voix naturelle (Eric)' 
              : '🔉 Volume plus bas, voix Nova, alternative rapide'}
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* ─── Word Management Section ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Mots du Jour</h2>
          <p className="text-sm text-muted-foreground">
            Ajoutez, modifiez et gérez tous les mots
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            Total: {words.length}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Actifs: {activeCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Volume2 className="h-3 w-3 text-primary" />
            Audio: {wordsWithAudio.length}
          </Badge>
          {wordsWithoutAudio.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Sans audio: {wordsWithoutAudio.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Add word button */}
      <Button onClick={openAddDialog} className="gap-2">
        <Plus className="h-4 w-4" />
        Ajouter un mot
      </Button>

      {/* Words Table */}
      <Card>
        <CardContent className="p-0">
          {words.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-2" />
              <p>Aucun mot ajouté</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Ordre</TableHead>
                    <TableHead>Date prévue</TableHead>
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
                  {words.map((word, index) => {
                    const activeWords = words.filter(w => w.is_active);
                    const scheduledDate = word.is_active && word.display_order
                      ? getScheduledDate(word.display_order, activeWords.length)
                      : null;
                    const isToday = scheduledDate && scheduledDate.toDateString() === new Date(getHaitiDate() + 'T00:00:00').toDateString();

                    return (
                    <TableRow key={word.id} className={!word.is_active ? 'opacity-50' : ''}>
                      {/* display_order column */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {word.display_order ?? '–'}
                      </TableCell>
                      {/* Reorder arrows */}
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => swapDisplayOrder(word, words[index - 1])}
                            title="Monter"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === words.length - 1}
                            onClick={() => swapDisplayOrder(word, words[index + 1])}
                            title="Descendre"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      {/* Scheduled date column — shows next appearance for active words */}
                      <TableCell className="text-xs">
                        {word.is_active && scheduledDate ? (
                          isToday ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                              Aujourd'hui
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              {scheduledDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
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
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => playAudio(word)}
                            >
                              {playingWordId === word.id ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRegenerateClick(word)}
                              disabled={generatingWordId === word.id}
                            >
                              {generatingWordId === word.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                            </Button>
                            {/* Mic recording — third audio option alongside TTS */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openRecordingDialog(word)}
                              title="Enregistrer avec le micro"
                            >
                              <Mic className="h-3 w-3 text-amber-600" />
                            </Button>
                            <AudioSourceBadge source={word.audio_source} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={() => generateAudio(word)}
                              disabled={generatingWordId === word.id}
                            >
                              {generatingWordId === word.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3" />
                                  Générer
                                </>
                              )}
                            </Button>
                            {/* Mic fallback for words without TTS audio */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openRecordingDialog(word)}
                              title="Enregistrer avec le micro"
                            >
                              <Mic className="h-3 w-3 text-amber-600" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={word.is_active ?? false}
                          onCheckedChange={() => toggleActive(word.id, word.is_active ?? false)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(word)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setConfirmDialog({ open: true, word, type: 'delete' })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}

                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Add/Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
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

      {/* ─── Recording Dialog (Plan B — browser voice recording) ──────────── */}
      <Dialog
        open={recordingWord !== null}
        onOpenChange={(open) => { if (!open) closeRecordingDialog(); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-amber-600" />
              Enregistrer
            </DialogTitle>
          </DialogHeader>

          {recordingWord && (
            <div className="space-y-5">
              {/* Word reference so the recorder knows what to say */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="font-semibold text-lg text-foreground">« {recordingWord.word} »</p>
                <p className="text-sm text-muted-foreground font-mono">[{recordingWord.phonetic}]</p>
                <p className="text-sm text-muted-foreground mt-1">{recordingWord.definition}</p>
              </div>

              {/* Recording controls */}
              <div className="flex flex-col items-center gap-3">
                {!recordedBlob ? (
                  <>
                    {/* Large circular record/stop button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30'
                          : 'bg-muted hover:bg-muted/80 border-2 border-amber-500'
                      }`}
                      title={isRecording ? 'Arrêter' : 'Commencer'}
                    >
                      {isRecording ? (
                        <Square className="h-6 w-6 text-white" />
                      ) : (
                        <Mic className="h-6 w-6 text-amber-600" />
                      )}
                    </button>

                    {/* Duration counter */}
                    <p className="text-sm text-muted-foreground font-mono">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')} / 0:30
                    </p>

                    {isRecording && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Enregistrement en cours…
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Playback preview after recording */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          if (previewAudioRef.current) {
                            previewAudioRef.current.pause();
                            previewAudioRef.current = null;
                          }
                          if (recordedUrl) {
                            const audio = new Audio(recordedUrl);
                            previewAudioRef.current = audio;
                            audio.play();
                          }
                        }}
                      >
                        <Play className="h-4 w-4" />
                        Écouter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          // Discard recording and allow re-record
                          if (recordedUrl) URL.revokeObjectURL(recordedUrl);
                          setRecordedBlob(null);
                          setRecordedUrl(null);
                          setRecordingDuration(0);
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refaire
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Durée: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </p>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeRecordingDialog}>
                  Annuler
                </Button>
                {recordedBlob && (
                  <Button
                    onClick={uploadRecording}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Utiliser cet enregistrement
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Confirmation Dialog — shared for regenerate, notification, and delete */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={open => !open && setConfirmDialog({ open: false, word: null, type: 'regenerate' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'notification' 
                ? 'Envoyer la notification ?' 
                : confirmDialog.type === 'delete'
                ? 'Supprimer ce mot ?'
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
              ) : confirmDialog.type === 'delete' ? (
                <>
                  Le mot <strong>"{confirmDialog.word?.word}"</strong> sera supprimé définitivement.
                  Cette action est irréversible.
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
                } else if (confirmDialog.type === 'delete') {
                  handleDeleteConfirm();
                } else if (confirmDialog.word) {
                  generateAudio(confirmDialog.word);
                }
              }}
              className={confirmDialog.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmDialog.type === 'notification' ? 'Envoyer' : confirmDialog.type === 'delete' ? 'Supprimer' : 'Régénérer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WordsModule;
