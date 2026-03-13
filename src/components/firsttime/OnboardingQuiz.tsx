/**
 * OnboardingQuiz — Jude-guided 7-question quiz for new users.
 * 
 * Collects profile data (name, grade, gender, nickname, school, DOB, referral)
 * that was previously gathered during signup Step 2.
 * 
 * Each answer is saved immediately to profiles table for crash resilience.
 * On mount, checks which fields are already filled and skips to the first unanswered.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, Check, X, Loader2, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';
import { containsProfanity } from '@/lib/textModeration';
import { GRADE_OPTIONS, type AcademicGrade, NON_ACADEMIC_GRADES } from '@/lib/authValidation';
import { toast } from 'sonner';
import SimpleTypewriter from '@/components/visitor/SimpleTypewriter';
import { useJudeAudio } from '@/contexts/JudeAudioContext';

// Jude images — lazy imported for 3G performance
import ericWaving from '@/assets/eric-waving.png';
import ericThumbUp from '@/assets/eric-thumb-up.png';
import ericStudentDesk from '@/assets/eric-student-desk.png';
import ericThinkingPose from '@/assets/eric-thinking-pose.png';
import ericPointingUp from '@/assets/eric-pointing-up.png';
import ericTeaching from '@/assets/eric-teaching.png';
import ericCelebrating from '@/assets/eric-celebrating.png';

// Total quiz steps (0-indexed internally)
const TOTAL_STEPS = 7;

// Referral source options
const REFERRAL_OPTIONS = [
  { value: 'social_media', label: '📱 Réseaux sociaux' },
  { value: 'friend', label: '👫 Un ami' },
  { value: 'family', label: '👨‍👩‍👧 Ma famille' },
  { value: 'school', label: '🏫 Mon école' },
  { value: 'ad', label: '📺 Une publicité' },
  { value: 'other', label: '✨ Autre' },
];

/** Strip diacritics and generate a safe nickname from a full name */
function generateNicknameSuggestion(fullName: string): string {
  const firstName = fullName.split(/\s+/)[0] || '';
  return firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, '_')     // non-alphanumeric → underscore
    .replace(/_+/g, '_')            // collapse consecutive underscores
    .replace(/^_|_$/g, '')          // trim leading/trailing underscores
    .substring(0, 20);
}

const OnboardingQuiz = () => {
  const { isPendingGift, ...firstTimeUser } = useFirstTimeUser();
  const { shouldAnimate } = useNetworkAwareAnimations();
  const queryClient = useQueryClient();
  // Voice — fire-and-forget TTS via existing generate-jude-voice edge function
  const { speak, stop, isSpeaking } = useJudeAudio();
  // Ref-stable speak/stop to avoid stale closures in voice useEffects
  const speakRef = useRef(speak);
  const stopRef = useRef(stop);
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { stopRef.current = stop; }, [stop]);

  // Stability guard — same pattern as FirstTimeUserWelcome
  const [isStable, setIsStable] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReaction, setShowReaction] = useState(false);
  const [reactionText, setReactionText] = useState('');
  const [isOutro, setIsOutro] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Answers state
  const [fullName, setFullName] = useState('');
  const [academicGrade, setAcademicGrade] = useState('');
  const [gender, setGender] = useState('');
  const [nickname, setNickname] = useState('');
  const [school, setSchool] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [referralSource, setReferralSource] = useState('');

  // Nickname availability state
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const nicknameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived firstName for speech bubbles
  const firstName = fullName.split(/\s+/)[0] || 'ami(e)';

  // Stability guard
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsStable(true));
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // On mount: load existing profile data to determine which questions to skip
  useEffect(() => {
    if (!firstTimeUser.showOnboardingQuiz || !firstTimeUser.userId) return;

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, nickname, academic_grade, gender, school, date_of_birth, referral_source')
        .eq('user_id', firstTimeUser.userId!)
        .maybeSingle();

      if (!profile) {
        setProfileLoaded(true);
        return;
      }

      // Pre-fill answers from existing data
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.academic_grade) setAcademicGrade(profile.academic_grade);
      if (profile.gender) setGender(profile.gender);
      if (profile.nickname) setNickname(profile.nickname);
      if (profile.school) setSchool(profile.school);
      if (profile.date_of_birth) setDateOfBirth(profile.date_of_birth);
      if (profile.referral_source) setReferralSource(profile.referral_source);

      // Find first unanswered question
      const fields = [
        profile.full_name,      // Q1
        profile.academic_grade,  // Q2
        profile.gender,          // Q3
        profile.nickname,        // Q4
        profile.school,          // Q5
        profile.date_of_birth,   // Q6
        profile.referral_source, // Q7
      ];

      // If all fields are populated, skip the entire quiz
      const allFilled = fields.every(f => f !== null && f !== undefined && f !== '');
      if (allFilled) {
        firstTimeUser.completeOnboardingQuiz();
        return;
      }

      // Skip to first unanswered question
      const firstEmpty = fields.findIndex(f => !f);
      if (firstEmpty > 0) setCurrentStep(firstEmpty);

      setProfileLoaded(true);
    };

    loadProfile();
  }, [firstTimeUser.showOnboardingQuiz, firstTimeUser.userId]);

  // Save field to localStorage as backup when DB writes fail on 3G
  const saveFieldBackup = useCallback((field: string, value: string) => {
    if (!firstTimeUser.userId) return;
    const key = `onboarding_backup_${firstTimeUser.userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[field] = value;
    localStorage.setItem(key, JSON.stringify(existing));
  }, [firstTimeUser.userId]);

  // Flush any localStorage backup to DB — called before quiz completion
  const flushBackupToDb = useCallback(async () => {
    if (!firstTimeUser.userId) return;
    const key = `onboarding_backup_${firstTimeUser.userId}`;
    const backup = localStorage.getItem(key);
    if (!backup) return;
    try {
      const fields = JSON.parse(backup);
      if (Object.keys(fields).length === 0) return;
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update(fields as any)
        .eq('user_id', firstTimeUser.userId);
      if (!error) {
        localStorage.removeItem(key);
        // Invalidate profile cache after successful flush
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    } catch {
      // Best-effort — data stays in localStorage for next attempt
    } finally {
      setIsSaving(false);
    }
  }, [firstTimeUser.userId, queryClient]);

  // Save a single field to the profiles table with 3x retry for 3G resilience
  const saveField = useCallback(async (field: string, value: string) => {
    if (!firstTimeUser.userId) return;
    setIsSaving(true);
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ [field]: value } as any)
          .eq('user_id', firstTimeUser.userId);
        if (error) throw error;
        setIsSaving(false);
        return; // Success on this attempt
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          // Wait 1s before retrying on slow connections
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    // All 3 attempts failed — save to localStorage backup so data isn't lost
    saveFieldBackup(field, value);
    toast.warning('Connexion lente détectée. Tes données sont sauvegardées localement.', { duration: 3000 });
    setIsSaving(false);
  }, [firstTimeUser.userId, saveFieldBackup]);

  // Show thumb-up reaction then advance to next step
  const showReactionAndAdvance = useCallback((text: string) => {
    setReactionText(text);
    setShowReaction(true);
    setTimeout(() => {
      setShowReaction(false);
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Show outro after last question — flush any backup before completing
        setIsOutro(true);
        setTimeout(async () => {
          await flushBackupToDb();
          firstTimeUser.completeOnboardingQuiz();
        }, 2500);
      }
    }, 1500);
  }, [currentStep, firstTimeUser]);

  // Handle Q1 — full_name confirmed
  const handleNameConfirm = useCallback(() => {
    if (!fullName.trim() || fullName.trim().length < 1) return;
    if (containsProfanity(fullName)) {
      toast.error('Ce nom contient des termes inappropriés');
      return;
    }
    saveField('full_name', fullName.trim());
    showReactionAndAdvance(`Enchanté(e), ${fullName.split(/\s+/)[0]}! 🎉`);
  }, [fullName, saveField, showReactionAndAdvance]);

  // Handle Q2 — academic_grade selected
  const handleGradeSelect = useCallback((grade: string) => {
    setAcademicGrade(grade);
    saveField('academic_grade', grade);
    showReactionAndAdvance('Super choix! 👍');
  }, [saveField, showReactionAndAdvance]);

  // Handle Q3 — gender selected
  const handleGenderSelect = useCallback((g: string) => {
    setGender(g);
    saveField('gender', g);
    showReactionAndAdvance('Parfait! 👍');
  }, [saveField, showReactionAndAdvance]);

  // Handle Q4 — nickname confirmed
  const handleNicknameConfirm = useCallback(async () => {
    if (!nickname || nickname.length < 3) return;
    if (nicknameAvailable !== true) return;
    saveField('nickname', nickname);
    showReactionAndAdvance('Excellent pseudo! 🎉');
  }, [nickname, nicknameAvailable, saveField, showReactionAndAdvance]);

  // Handle Q5 — school confirmed
  const handleSchoolConfirm = useCallback(() => {
    if (!school.trim()) return;
    saveField('school', school.trim());
    showReactionAndAdvance('Top! 👍');
  }, [school, saveField, showReactionAndAdvance]);

  // Handle Q5 — "not in school" shortcut
  const handleNoSchool = useCallback(() => {
    setSchool('N/A');
    saveField('school', 'N/A');
    showReactionAndAdvance('Pas de souci! 👍');
  }, [saveField, showReactionAndAdvance]);

  // Handle Q6 — date of birth confirmed
  const handleDobConfirm = useCallback(() => {
    if (!dateOfBirth) return;
    saveField('date_of_birth', dateOfBirth);
    showReactionAndAdvance('Noté! 🎂');
  }, [dateOfBirth, saveField, showReactionAndAdvance]);

  // Handle Q7 — referral source selected
  const handleReferralSelect = useCallback((source: string) => {
    setReferralSource(source);
    saveField('referral_source', source);
    // This is the last question — show outro
    setReactionText('Merci! 🌟');
    setShowReaction(true);
    setTimeout(() => {
      setShowReaction(false);
      setIsOutro(true);
      setTimeout(async () => {
        await flushBackupToDb();
        firstTimeUser.completeOnboardingQuiz();
      }, 2500);
    }, 1500);
  }, [saveField, firstTimeUser]);

  // Skip current question (for optional questions)
  const handleSkip = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsOutro(true);
      setTimeout(async () => {
        await flushBackupToDb();
        firstTimeUser.completeOnboardingQuiz();
      }, 2500);
    }
  }, [currentStep, firstTimeUser]);

  // Nickname availability check with debounce
  useEffect(() => {
    if (nicknameCheckTimer.current) clearTimeout(nicknameCheckTimer.current);
    if (!nickname || nickname.length < 3 || !/^[a-zA-Z0-9_]+$/.test(nickname)) {
      setNicknameAvailable(null);
      return;
    }
    setIsCheckingNickname(true);
    nicknameCheckTimer.current = setTimeout(async () => {
      try {
        const { data } = await supabase.rpc('check_nickname_available', { nickname_input: nickname });
        setNicknameAvailable(data === true);
      } catch {
        setNicknameAvailable(null);
      } finally {
        setIsCheckingNickname(false);
      }
    }, 500);
    return () => { if (nicknameCheckTimer.current) clearTimeout(nicknameCheckTimer.current); };
  }, [nickname]);

  // Auto-suggest nickname when entering Q4 for the first time
  useEffect(() => {
    if (currentStep === 3 && !nickname && fullName) {
      const suggested = generateNicknameSuggestion(fullName);
      if (suggested.length >= 3) setNickname(suggested);
    }
  }, [currentStep, fullName]);

  // --- Voice: fetch audio from generate-jude-voice and play via JudeAudioContext ---
  /** Fire-and-forget voice fetch — reads mute from localStorage for fresh value, uses refs */
  const fetchAndSpeak = async (text: string, storageKey: string) => {
    const isMutedNow = localStorage.getItem('jude-voice-muted') === 'true';
    if (isMutedNow) return;
    try {
      const { data } = await supabase.functions.invoke('generate-jude-voice', {
        body: { text, storageKey, context: 'onboarding' }
      });
      if (data?.url) {
        stopRef.current();
        speakRef.current(data.url);
      }
    } catch {
      // Silent fail — typing sounds serve as fallback
    }
  };

  // Voice question text when currentStep changes — guarded by phase to prevent race
  useEffect(() => {
    if (!firstTimeUser.showOnboardingQuiz) return;
    if (showReaction || isOutro) return;
    // Build clean text for TTS (strip emojis — ElevenLabs ignores them anyway)
    const speechTexts: Record<number, string> = {
      0: "Salut! Comment tu t'appelles?",
      1: "Et maintenant, tu es en quelle classe?",
      2: "Tu préfères qu'on te parle comment?",
      3: "Quel est ton pseudo? C'est comme ça que les autres étudiants vont te voir!",
      4: "Dans quelle école tu étudies?",
      5: "C'est quand ton anniversaire? Je t'enverrai un email spécial ce jour-là!",
      6: "Dernière question! Comment tu as entendu parler d'Edupreneurs?",
    };
    const text = speechTexts[currentStep];
    if (!text) return;
    // All question keys are static — pre-generated CDN cache hits
    const key = `onboarding/quiz-q${currentStep}`;
    fetchAndSpeak(text, key);
  }, [currentStep, firstTimeUser.showOnboardingQuiz]);

  // Voice reactions when they appear — guarded by phase
  useEffect(() => {
    if (!firstTimeUser.showOnboardingQuiz) return;
    if (!showReaction || !reactionText) return;
    // Static reaction keys — pre-generated CDN cache hits
    const key = `onboarding/quiz-reaction-${currentStep}`;
    fetchAndSpeak(reactionText, key);
  }, [showReaction, reactionText, currentStep, firstTimeUser.showOnboardingQuiz]);

  // Voice the outro — guarded by phase
  useEffect(() => {
    if (!firstTimeUser.showOnboardingQuiz) return;
    if (!isOutro) return;
    fetchAndSpeak(
      "Parfait! On se connaît mieux maintenant. Créons ton avatar!",
      'onboarding/quiz-outro'
    );
  }, [isOutro, firstTimeUser.showOnboardingQuiz]);

  // Stop voice on unmount — use ref to avoid stale closure
  useEffect(() => () => stopRef.current(), []);

  // Early returns AFTER all hooks
  if (!isStable) return null;
  if (!firstTimeUser.showOnboardingQuiz || firstTimeUser.isLoading || !firstTimeUser.userId) return null;
  if (!profileLoaded) return null;

  // Pending gift users see a waiting message instead of the quiz
  if (isPendingGift) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl p-8 max-w-md text-center space-y-4">
          <img src={ericWaving} alt="Jude" className="w-24 h-24 mx-auto" />
          <div className="w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-foreground">Votre paiement cadeau est en cours de confirmation...</p>
          <p className="text-sm text-muted-foreground">Vous pourrez compléter votre profil dans quelques instants.</p>
        </div>
      </div>
    );
  }

  // Steps 0-2 (full_name, academic_grade, gender) are required — gender affects Jude's speech
  const isSkippable = currentStep >= 3;
  // Q5 (school) is required for academic grades, optional for UNIV/NONE
  const schoolRequired = academicGrade && !NON_ACADEMIC_GRADES.includes(academicGrade as AcademicGrade);

  // Get Jude image and speech bubble for current step
  const getStepContent = () => {
    if (isOutro) {
      return {
        image: ericCelebrating,
        speech: `Parfait! On se connaît mieux maintenant. Créons ton avatar! 🎨✨`,
      };
    }
    if (showReaction) {
      return { image: ericThumbUp, speech: reactionText };
    }
    switch (currentStep) {
      case 0: return { image: ericWaving, speech: 'Salut! Comment tu t\'appelles? 😊' };
      case 1: return { image: ericStudentDesk, speech: `Et maintenant, ${firstName}, tu es en quelle classe?` };
      case 2: return { image: ericThinkingPose, speech: 'Tu préfères qu\'on te parle comment? 😊' };
      case 3: return { image: ericStudentDesk, speech: 'Quel est ton pseudo? C\'est comme ça que les autres étudiants vont te voir! 😎' };
      case 4: return { image: ericStudentDesk, speech: 'Dans quelle école tu étudies? 🏫' };
      case 5: return { image: ericPointingUp, speech: 'C\'est quand ton anniversaire? 🎂 Je t\'enverrai un email spécial ce jour-là!' };
      case 6: return { image: ericTeaching, speech: 'Dernière question! Comment tu as entendu parler d\'Edupreneurs? 🌟' };
      default: return { image: ericWaving, speech: '' };
    }
  };

  const { image, speech } = getStepContent();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="onboarding-quiz"
        initial={shouldAnimate ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        exit={shouldAnimate ? { opacity: 0 } : undefined}
        className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto"
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-primary/10 to-black/70 backdrop-blur-sm" />

        {/* Skip button — top right, hidden for required questions (Q1, Q2) */}
        {isSkippable && !showReaction && !isOutro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
            >
              Passer
              <X className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        )}

        {/* Progress dots — top center */}
        {!isOutro && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
            {/* Progress dots */}
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary ring-2 ring-primary/50 ring-offset-1 ring-offset-transparent' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            {/* Step counter */}
            <span className="text-xs text-white/50 mt-2">
              {currentStep + 1} / 7
            </span>
          </div>
        )}

        {/* Main content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 p-4 sm:p-8 max-w-2xl w-full">
          {/* Jude image — top on mobile, left on desktop */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`jude-${showReaction ? 'reaction' : isOutro ? 'outro' : currentStep}`}
              initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : undefined}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldAnimate ? { scale: 0.8, opacity: 0 } : undefined}
              transition={{ type: 'spring', damping: 20 }}
              className="flex-shrink-0"
            >
              <img
                src={image}
                alt="Jude"
                className="h-32 md:h-64 object-contain drop-shadow-2xl"
                /* Only eager-load the first step image; lazy-load the rest for 3G perf */
                loading={currentStep === 0 && !showReaction && !isOutro ? 'eager' : 'lazy'}
                /* Explicit dimensions prevent CLS while images load on slow connections */
                width={256}
                height={256}
              />
            </motion.div>
          </AnimatePresence>

          {/* Speech bubble + input area */}
          <motion.div
            key={`content-${showReaction ? 'reaction' : isOutro ? 'outro' : currentStep}`}
            initial={shouldAnimate ? { opacity: 0, x: 20 } : undefined}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldAnimate ? { opacity: 0, x: -20 } : undefined}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full"
          >
            {/* Speech bubble */}
            <div className="relative bg-card/95 backdrop-blur-md rounded-2xl px-5 py-4 sm:px-6 sm:py-5 shadow-xl border border-border/50 mb-4">
              <div className="absolute -top-3 left-8 md:-left-3 md:top-8 w-0 h-0 
                border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-card/95
                md:border-t-[12px] md:border-t-transparent md:border-b-[12px] md:border-b-transparent md:border-r-[12px] md:border-r-card/95 md:border-l-0" 
              />
              <p className="text-base sm:text-lg text-foreground font-medium">
                {showReaction || isOutro ? (
                  <SimpleTypewriter text={speech} speed={50} enableSound={typeof window !== 'undefined' && localStorage.getItem('jude-voice-muted') === 'true'} soundVolume={0.04} />
                ) : (
                  <SimpleTypewriter key={`speech-${currentStep}`} text={speech} speed={50} enableSound={typeof window !== 'undefined' && localStorage.getItem('jude-voice-muted') === 'true'} soundVolume={0.04} />
                )}
              </p>
            </div>

            {/* Input area — only show when not in reaction or outro */}
            {!showReaction && !isOutro && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {/* "Optionnel" badge for skippable steps (Q4–Q7) */}
                {currentStep >= 3 && (
                  <span className="text-xs text-white/50 font-medium tracking-wide uppercase">
                    Optionnel
                  </span>
                )}

                {/* Q1: Full Name */}
                {currentStep === 0 && (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Ton prénom et nom"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={100}
                      autoFocus
                      className="bg-card/80 border-border/50 text-foreground text-base h-12"
                      onKeyDown={(e) => e.key === 'Enter' && handleNameConfirm()}
                    />
                    {/* Helper — reassures user about privacy */}
                    <p className="text-xs text-white/50">On gardera ça entre nous 🔒</p>
                    <Button
                      onClick={handleNameConfirm}
                      disabled={!fullName.trim() || isSaving}
                      className="w-full gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Continuer
                    </Button>
                  </div>
                )}

                {/* Q2: Academic Grade — card grid */}
                {currentStep === 1 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {GRADE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleGradeSelect(opt.value)}
                          disabled={isSaving}
                          className={`p-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 
                            ${academicGrade === opt.value 
                              ? 'border-primary bg-primary/20 text-primary' 
                              : 'border-border/50 bg-card/60 text-foreground hover:border-primary/50 hover:bg-primary/10'
                            }`}
                        >
                          {opt.value === 'NONE' ? 'Autodidacte' : opt.value === 'UNIV' ? 'Université' : opt.value}
                        </button>
                      ))}
                    </div>
                    {/* Non-academic grade warning */}
                    {academicGrade && NON_ACADEMIC_GRADES.includes(academicGrade as AcademicGrade) && (
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        ℹ️ Les matières scolaires et examens ne seront pas disponibles pour ce niveau
                      </p>
                    )}
                  </div>
                )}

                {/* Q3: Gender — two large buttons */}
                {currentStep === 2 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGenderSelect('male')}
                      disabled={isSaving}
                      className={`flex-1 p-4 rounded-xl text-base font-medium border-2 transition-all
                        ${gender === 'male' 
                          ? 'border-primary bg-primary/20' 
                          : 'border-border/50 bg-card/60 hover:border-primary/50'
                        }`}
                    >
                      Je suis un garçon 👦
                    </button>
                    <button
                      onClick={() => handleGenderSelect('female')}
                      disabled={isSaving}
                      className={`flex-1 p-4 rounded-xl text-base font-medium border-2 transition-all
                        ${gender === 'female' 
                          ? 'border-primary bg-primary/20' 
                          : 'border-border/50 bg-card/60 hover:border-primary/50'
                        }`}
                    >
                      Je suis une fille 👧
                    </button>
                  </div>
                )}

                {/* Q4: Nickname */}
                {currentStep === 3 && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Choisis un pseudo unique"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        maxLength={30}
                        autoFocus
                        className="bg-card/80 border-border/50 text-foreground text-base h-12 pr-10"
                      />
                      {/* Availability indicator */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingNickname && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {!isCheckingNickname && nicknameAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                        {!isCheckingNickname && nicknameAvailable === false && <X className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                    {nicknameAvailable === false && (
                      <p className="text-xs text-destructive">Ce pseudo est déjà pris</p>
                    )}
                    {nickname && nickname.length < 3 && (
                      <p className="text-xs text-muted-foreground">Minimum 3 caractères</p>
                    )}
                    {/* Helper — explains what nicknames are for */}
                    <p className="text-xs text-white/50">Choisis un pseudo unique — c'est comme ça que les autres te verront</p>
                    <Button
                      onClick={handleNicknameConfirm}
                      disabled={!nickname || nickname.length < 3 || nicknameAvailable !== true || isSaving}
                      className="w-full gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Continuer
                    </Button>
                  </div>
                )}

                {/* Q5: School */}
                {currentStep === 4 && (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Nom de ton école ou université"
                      value={school === 'N/A' ? '' : school}
                      onChange={(e) => setSchool(e.target.value)}
                      maxLength={100}
                      autoFocus
                      className="bg-card/80 border-border/50 text-foreground text-base h-12"
                      onKeyDown={(e) => e.key === 'Enter' && handleSchoolConfirm()}
                    />
                    {/* Helper — guides user to start typing */}
                    <p className="text-xs text-white/50">Commence à taper et on trouvera ton école</p>
                    <Button
                      onClick={handleSchoolConfirm}
                      disabled={(!school.trim() || school === 'N/A') && !!schoolRequired || isSaving}
                      className="w-full gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Continuer
                    </Button>
                    {/* More visible "not in school" option with icon */}
                    <Button
                      variant="outline"
                      onClick={handleNoSchool}
                      className="w-full border-2 border-white/30 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/50 transition-all duration-200 mt-1"
                    >
                      <GraduationCap className="w-4 h-4 mr-2 opacity-70" />
                      Je ne suis plus à l'école
                    </Button>
                  </div>
                )}

                {/* Q6: Date of Birth */}
                {currentStep === 5 && (
                  <div className="space-y-3">
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-card/80 border-border/50 text-foreground text-base h-12"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <Button
                      onClick={handleDobConfirm}
                      disabled={!dateOfBirth || isSaving}
                      className="w-full gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Continuer
                    </Button>
                  </div>
                )}

                {/* Q7: Referral Source — option cards */}
                {currentStep === 6 && (
                  <div className="grid grid-cols-2 gap-2">
                    {REFERRAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleReferralSelect(opt.value)}
                        disabled={isSaving}
                        className={`p-3 rounded-xl text-sm font-medium border-2 transition-all
                          ${referralSource === opt.value 
                            ? 'border-primary bg-primary/20' 
                            : 'border-border/50 bg-card/60 hover:border-primary/50 hover:bg-primary/10'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingQuiz;
