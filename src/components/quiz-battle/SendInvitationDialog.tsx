import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OnlinePlayer } from '@/hooks/useOnlinePlayers';
import { QuizInvitation, useQuizInvitations } from '@/hooks/useQuizInvitations';
import { getAvatarUrl } from '@/lib/avatarMap';
import { normalizeGrade } from '@/hooks/useUserGrade';
import { 
  Loader2, 
  Swords, 
  Clock, 
  X, 
  CheckCircle, 
  XCircle,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
}

interface SendInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: OnlinePlayer | null;
  userId: string;
  userGrade: string;
}

type DialogStep = 'configure' | 'waiting' | 'result';
type InvitationResult = 'accepted' | 'declined' | 'expired' | 'cancelled';

export const SendInvitationDialog = ({
  open,
  onOpenChange,
  player,
  userId,
  userGrade,
}: SendInvitationDialogProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<DialogStep>('configure');
  const [result, setResult] = useState<InvitationResult | null>(null);
  
  // Config state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  const { 
    sendInvitation, 
    cancelInvitation, 
    sentInvitation,
    isSending 
  } = useQuizInvitations({ userId, enabled: open });

  // Fetch subjects when dialog opens
  useEffect(() => {
    if (!open || !userGrade) return;
    
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      
      // Normalize the grade to match lessons table format (e.g., "Philo" → "NS4")
      const normalizedGrade = normalizeGrade(userGrade) || userGrade;
      
      const { data, error } = await supabase
        .from('lessons')
        .select('subject_id, subjects!inner(id, name)')
        .eq('grade_level', normalizedGrade)
        .eq('is_published', true);

      if (error) {
        console.error('Error fetching subjects:', error);
        setIsLoadingSubjects(false);
        return;
      }

      // Get unique subjects
      const uniqueSubjects = new Map<string, Subject>();
      data?.forEach(lesson => {
        const subject = lesson.subjects as unknown as Subject;
        if (subject && !uniqueSubjects.has(subject.id)) {
          uniqueSubjects.set(subject.id, subject);
        }
      });

      setSubjects(Array.from(uniqueSubjects.values()));
      setIsLoadingSubjects(false);
    };

    fetchSubjects();
  }, [open, userGrade]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('configure');
      setResult(null);
      setSelectedSubject('');
      setSelectedDifficulty('medium');
      setTimeLeft(120);
    }
  }, [open]);

  // Handle sent invitation status changes
  useEffect(() => {
    if (!sentInvitation) return;

    if (sentInvitation.status === 'accepted' && sentInvitation.battle_id) {
      setResult('accepted');
      setStep('result');
      // Navigate to battle after short delay
      setTimeout(() => {
        navigate(`/quiz-battle/multiplayer/${sentInvitation.battle_id}`);
        onOpenChange(false);
      }, 1500);
    } else if (sentInvitation.status === 'declined') {
      setResult('declined');
      setStep('result');
    } else if (sentInvitation.status === 'expired') {
      setResult('expired');
      setStep('result');
    }
  }, [sentInvitation, navigate, onOpenChange]);

  // Countdown timer when waiting
  useEffect(() => {
    if (step !== 'waiting') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setResult('expired');
          setStep('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const handleSendInvitation = async () => {
    if (!player || !selectedSubject) return;

    // Normalize grade for database consistency
    const normalizedGrade = normalizeGrade(userGrade) || userGrade;

    const invitation = await sendInvitation(
      player.user_id,
      player.nickname,
      {
        subjectId: selectedSubject,
        gradeLevel: normalizedGrade,
        difficulty: selectedDifficulty,
      }
    );

    if (invitation) {
      setStep('waiting');
      setTimeLeft(120);
    }
  };

  const handleCancel = async () => {
    if (sentInvitation) {
      await cancelInvitation(sentInvitation.id);
    }
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedSubjectName = useMemo(() => {
    return subjects.find(s => s.id === selectedSubject)?.name || '';
  }, [subjects, selectedSubject]);

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Configure Step */}
        {step === 'configure' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" />
                Défier {player.nickname}
              </DialogTitle>
              <DialogDescription>
                Configure les paramètres du quiz battle
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Player Card */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-success">
                    <AvatarImage src={player.avatar_url ? getAvatarUrl(player.avatar_url) : undefined} />
                    <AvatarFallback>{player.nickname?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{player.nickname}</p>
                  {player.academic_grade && (
                    <p className="text-sm text-muted-foreground">{player.academic_grade}</p>
                  )}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                  disabled={isLoadingSubjects}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingSubjects ? "Chargement..." : "Choisir une matière"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 && !isLoadingSubjects && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Aucune matière disponible pour ton niveau
                      </div>
                    )}
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <Label>Difficulté</Label>
                <RadioGroup
                  value={selectedDifficulty}
                  onValueChange={(val) => setSelectedDifficulty(val as 'easy' | 'medium' | 'hard')}
                  className="grid grid-cols-3 gap-2"
                >
                  {[
                    { value: 'easy', label: 'Facile', color: 'text-success' },
                    { value: 'medium', label: 'Moyen', color: 'text-warning' },
                    { value: 'hard', label: 'Difficile', color: 'text-destructive' },
                  ].map(option => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedDifficulty === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                      <span className={selectedDifficulty === option.value ? option.color : ''}>
                        {option.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={handleSendInvitation} 
                disabled={!selectedSubject || isSending}
                className="flex-1"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Swords className="w-4 h-4 mr-2" />
                )}
                Envoyer le défi
              </Button>
            </div>
          </>
        )}

        {/* Waiting Step */}
        {step === 'waiting' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary animate-pulse" />
                En attente de réponse...
              </DialogTitle>
              <DialogDescription>
                {player.nickname} a reçu ton invitation
              </DialogDescription>
            </DialogHeader>

            <div className="py-8 text-center space-y-6">
              {/* Timer */}
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <span className={cn(
                    "text-3xl font-bold",
                    timeLeft <= 30 ? "text-destructive" : "text-primary"
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-spin" />
              </div>

              {/* Info */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Matière: <span className="font-medium text-foreground">{selectedSubjectName}</span></p>
                <p>Difficulté: <span className="font-medium text-foreground capitalize">{selectedDifficulty}</span></p>
              </div>
            </div>

            <Button variant="outline" onClick={handleCancel} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Annuler l'invitation
            </Button>
          </>
        )}

        {/* Result Step */}
        {step === 'result' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {result === 'accepted' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    Défi accepté!
                  </>
                ) : result === 'declined' ? (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    Défi refusé
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Invitation expirée
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="py-8 text-center">
              {result === 'accepted' ? (
                <div className="space-y-4">
                  <Swords className="w-16 h-16 mx-auto text-primary animate-pulse" />
                  <p className="text-lg font-medium">La partie va commencer...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {result === 'declined' 
                      ? `${player.nickname} a refusé ton invitation.`
                      : `${player.nickname} n'a pas répondu à temps.`
                    }
                  </p>
                </div>
              )}
            </div>

            {result !== 'accepted' && (
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Fermer
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
