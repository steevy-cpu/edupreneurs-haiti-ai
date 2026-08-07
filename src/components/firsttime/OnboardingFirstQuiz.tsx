/**
 * OnboardingFirstQuiz — the "first success moment" that closes the onboarding tour.
 *
 * A single multiple-choice question built from today's "mot du jour" (the same word
 * the student will later receive in notifications, so the push ask that follows feels
 * earned). Gold is awarded for PARTICIPATION, not correctness — this is a welcome
 * moment, not a test.
 *
 * Failure is always non-blocking: if the word cannot be fetched (offline / 3G timeout)
 * the component immediately calls onFinish so the tour still completes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { GoldBadge } from '@/components/shared/GoldBadge';
import { supabase } from '@/integrations/supabase/client';
import { celebrateFirstGold } from '@/hooks/useFirstGoldCelebration';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';

const ericCelebrating = '/images/eric-celebrating-400w.webp';

/** Gold granted for completing the first quiz.
 *  Sits between the per-activity award (1) and a full lesson quiz (score + 50):
 *  meaningful as a first win, but not inflationary. increment_gold rejects <1 or >100. */
const FIRST_QUIZ_GOLD = 10;

/** Reserved slug in lesson_completions — durable anti-farming guard (survives
 *  localStorage clears, unlike a device-local flag). */
const ONBOARDING_QUIZ_SLUG = 'onboarding-first-quiz';

/** Same reference date + rotation used by useWordOfTheDay so the quiz word matches
 *  exactly the word shown everywhere else today. */
const REFERENCE_DATE = new Date('2026-01-01T00:00:00');
const getHaitiDate = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Port-au-Prince' });
const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSince = Math.floor((today.getTime() - REFERENCE_DATE.getTime()) / 86_400_000);
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};

/** Keep all options visually comparable so length doesn't leak the answer. */
const truncate = (s: string, max = 90) =>
  s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;

interface QuizData {
  word: string;
  phonetic: string | null;
  options: string[];
  correctIndex: number;
}

interface OnboardingFirstQuizProps {
  userId: string | null;
  /** Called when the moment is over (answered, skipped, or unavailable). */
  onFinish: () => void;
}

export default function OnboardingFirstQuiz({ userId, onFinish }: OnboardingFirstQuizProps) {
  const { shouldAnimate } = useNetworkAwareAnimations();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [awarded, setAwarded] = useState(false);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  // Build the question client-side — no AI, no edge function (cold starts on 3G).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const haitiDate = getHaitiDate();
        const { count } = await supabase
          .from('daily_words')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (!count) { finish(); return; }

        const displayOrder = computeDisplayOrder(haitiDate, count);
        const { data: word } = await supabase
          .from('daily_words')
          .select('id, word, phonetic, definition')
          .eq('is_active', true)
          .eq('display_order', displayOrder)
          .maybeSingle();

        if (!word?.definition) { finish(); return; }

        const { data: others } = await supabase
          .from('daily_words')
          .select('id, definition')
          .eq('is_active', true)
          .neq('id', word.id)
          .limit(40);

        const pool = (others ?? []).filter(o => !!o.definition);
        if (pool.length < 3) { finish(); return; }

        // Random 3 distractors
        const shuffledPool = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
        const correct = truncate(word.definition);
        const options = [correct, ...shuffledPool.map(o => truncate(o.definition))]
          .sort(() => Math.random() - 0.5);

        if (cancelled) return;
        setQuiz({
          word: word.word,
          phonetic: word.phonetic ?? null,
          options,
          correctIndex: options.indexOf(correct),
        });
      } catch {
        // Never block tour completion on the quiz.
        finish();
      }
    };

    load();
    return () => { cancelled = true; };
  }, [finish]);

  /** Award gold for participating. Guarded by a durable lesson_completions row. */
  const awardGold = useCallback(async () => {
    if (!userId) return;
    try {
      const { data: existing } = await supabase
        .from('lesson_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_slug', ONBOARDING_QUIZ_SLUG)
        .maybeSingle();

      if (existing) return; // already earned once — no farming

      const { error } = await supabase.rpc('increment_gold', {
        p_user_id: userId,
        amount: FIRST_QUIZ_GOLD,
      });
      if (error) throw error;

      await supabase.from('lesson_completions').upsert(
        {
          user_id: userId,
          lesson_slug: ONBOARDING_QUIZ_SLUG,
          subject: 'onboarding',
          score: 100,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_slug' }
      );

      setAwarded(true);
      celebrateFirstGold();
    } catch (err) {
      // A gold failure must never trap the student in onboarding.
      console.error('[OnboardingFirstQuiz] gold award failed:', err);
    }
  }, [userId]);

  const handleAnswer = async (index: number) => {
    if (selected !== null) return;
    setSelected(index);

    // The DB trigger update_streak_on_activity starts the streak when gold increases.
    // Suppress the streak modal so celebrations don't stack on this screen.
    sessionStorage.setItem('suppress-streak-milestone-modal', 'true');

    if (shouldAnimate) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#087E7E'],
      });
    }
    await awardGold();
  };

  // Loading / unavailable: render nothing (parent overlay shows the celebration).
  if (!quiz) return null;

  const isCorrect = selected !== null && selected === quiz.correctIndex;

  return (
    <div className="w-full max-w-md mx-auto px-6 text-center">
      {selected === null ? (
        <>
          <p className="text-sm text-white/70 mb-2">Une dernière chose — le mot du jour 📖</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Que veut dire «&nbsp;{quiz.word}&nbsp;» ?
          </h2>
          {quiz.phonetic && (
            <p className="text-sm text-white/60 mt-1">{quiz.phonetic}</p>
          )}

          <div className="mt-5 space-y-2">
            {quiz.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-left text-sm text-white hover:bg-white/20 active:scale-[0.99] transition"
              >
                {opt}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={finish}
            className="mt-4 text-white/70 hover:text-white"
          >
            Passer
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <img
            src={ericCelebrating}
            srcSet="/images/eric-celebrating-400w.webp 400w, /images/eric-celebrating-600w.webp 600w"
            sizes="128px"
            alt="Jude"
            className="w-32 h-32 object-contain drop-shadow-2xl"
            loading="lazy"
          />
          <h2 className="text-2xl font-bold text-white">
            {isCorrect ? 'Bravo, c’est exactement ça! 🎉' : 'Merci d’avoir essayé! 💛'}
          </h2>
          {/* No "incorrect" framing — we simply teach the answer. */}
          <p className="text-white/85 text-sm leading-relaxed">
            «&nbsp;{quiz.word}&nbsp;» veut dire : {quiz.options[quiz.correctIndex]}
          </p>

          {awarded && (
            <div className="flex flex-col items-center gap-2">
              <GoldBadge goldAmount={FIRST_QUIZ_GOLD} animated className="text-sm px-3 py-1" />
              <p className="text-white/80 text-sm">
                Tes premières pièces d’or sont à toi — et ta série vient de commencer, jour 1! 🔥
              </p>
            </div>
          )}

          <Button onClick={finish} className="mt-2 gap-1">
            Continuer
          </Button>
        </div>
      )}
    </div>
  );
}
