/**
 * Send Daily Word of the Day Push Notification
 *
 * Sends a push notification to all users who have:
 * 1. Push subscriptions enabled
 * 2. word_of_day notification category enabled (or no preference set = default enabled)
 *
 * Triggered manually by founders from Control Center.
 * In production, can be triggered by external cron/scheduler.
 *
 * Word selection uses the SAME deterministic date-math algorithm as:
 *   - useWordOfTheDay.ts (frontend hook)
 *   - WordsModule.tsx (admin preview)
 * All three systems are kept in lockstep to prevent divergence.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Founder UUIDs — must match is_founder() DB function
const FOUNDER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f',
  '7580cd10-e18c-4b2f-ac50-def28d046c9d'
];

interface DailyWord {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
}

// ─── Deterministic word selection ──────────────────────────────────────────
// Reference date must match REFERENCE_DATE in useWordOfTheDay.ts and
// WordsModule.tsx — do NOT change this value independently.
const REFERENCE_DATE_MS = new Date('2026-01-01T00:00:00').getTime();

/**
 * Given today's Haiti date string and the total active word count,
 * returns the display_order value for today's word.
 * Double-mod handles negative daysSince for dates before reference.
 */
const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00').getTime();
  const daysSince = Math.floor((today - REFERENCE_DATE_MS) / (1000 * 60 * 60 * 24));
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};
// ───────────────────────────────────────────────────────────────────────────

// Get today's date in Haiti timezone (YYYY-MM-DD format)
const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Port-au-Prince'
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: responseHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Only founders can trigger daily word notifications
    if (!FOUNDER_IDS.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Only founders can send daily word notifications' }),
        { status: 403, headers: responseHeaders }
      );
    }

    // Parse optional specific word override (for testing)
    let specificWordId: string | null = null;
    try {
      const body = await req.json();
      specificWordId = body.wordId || null;
    } catch {
      // No body provided — use deterministic selection
    }

    const haitiDate = getHaitiDate();
    console.log(`📅 Haiti date: ${haitiDate}`);

    let todaysWord: DailyWord;

    if (specificWordId) {
      // ── Testing override path ─────────────────────────────────────────
      // Bypass algorithm entirely and use the explicitly requested word.
      const { data: specificWord, error: specificError } = await supabase
        .from('daily_words')
        .select('id, word, phonetic, definition')
        .eq('id', specificWordId)
        .maybeSingle();

      if (specificError || !specificWord) {
        return new Response(
          JSON.stringify({ error: 'Specified word not found' }),
          { status: 404, headers: responseHeaders }
        );
      }
      todaysWord = specificWord;
    } else {
      // ── Deterministic selection ───────────────────────────────────────
      // Step 1: Get the count of active words (cheap HEAD request)
      const { count, error: countError } = await supabase
        .from('daily_words')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (countError || !count || count === 0) {
        console.error('Error fetching word count:', countError);
        return new Response(
          JSON.stringify({ error: 'No active words found' }),
          { status: 404, headers: responseHeaders }
        );
      }

      // Step 2: Compute today's display_order (same formula as frontend)
      const displayOrder = computeDisplayOrder(haitiDate, count);
      console.log(`📖 Computed display_order: ${displayOrder} (from ${count} active words)`);

      // Step 3: Fetch the word matching this display_order
      const { data: wordByOrder, error: wordError } = await supabase
        .from('daily_words')
        .select('id, word, phonetic, definition')
        .eq('is_active', true)
        .eq('display_order', displayOrder)
        .maybeSingle();

      if (wordError) {
        console.error('Error fetching word by display_order:', wordError);
      }

      // Step 4: Fallback to first word if display_order has a gap in the sequence
      if (!wordByOrder) {
        console.warn(`⚠️ No word found for display_order=${displayOrder}, falling back to first word`);
        const { data: fallbackWord, error: fallbackError } = await supabase
          .from('daily_words')
          .select('id, word, phonetic, definition')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (fallbackError || !fallbackWord) {
          return new Response(
            JSON.stringify({ error: 'No active words found' }),
            { status: 404, headers: responseHeaders }
          );
        }
        todaysWord = fallbackWord;
      } else {
        todaysWord = wordByOrder;
      }
    }

    console.log(`📖 Today's word: "${todaysWord.word}" [${todaysWord.phonetic}]`);

    // Fetch all users with push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .order('user_id');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: responseHeaders }
      );
    }

    const uniqueUserIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
    console.log(`👥 Found ${uniqueUserIds.length} users with push subscriptions`);

    if (uniqueUserIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users with push subscriptions',
          word: todaysWord.word,
          sentCount: 0
        }),
        { headers: responseHeaders }
      );
    }

    // Check notification preferences for word_of_day category
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('user_id, enabled')
      .eq('category', 'word_of_day')
      .in('user_id', uniqueUserIds);

    // Build preference map — absence of a preference defaults to enabled
    const prefMap = new Map<string, boolean>();
    preferences?.forEach(p => prefMap.set(p.user_id, p.enabled));

    const eligibleUserIds = uniqueUserIds.filter(userId => {
      const pref = prefMap.get(userId);
      return pref === undefined || pref === true;
    });

    console.log(`✅ ${eligibleUserIds.length} users eligible for word_of_day notification`);

    if (eligibleUserIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All users have word_of_day notifications disabled',
          word: todaysWord.word,
          sentCount: 0
        }),
        { headers: responseHeaders }
      );
    }

    // Build notification payload
    const notificationPayload = {
      title: `📖 Mot du jour: ${todaysWord.word}`,
      body: `[${todaysWord.phonetic}] - ${todaysWord.definition.substring(0, 100)}${todaysWord.definition.length > 100 ? '...' : ''}`,
      type: 'word_of_day',
      url: '/dashboard',
    };

    // Send in batches of 10 with a short delay to avoid rate limits
    const BATCH_SIZE = 10;
    const BATCH_DELAY_MS = 100;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < eligibleUserIds.length; i += BATCH_SIZE) {
      const batch = eligibleUserIds.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (userId) => {
          try {
            const response = await supabase.functions.invoke('send-push-notification', {
              body: {
                recipientUserId: userId,
                ...notificationPayload
              }
            });

            if (response.error) {
              console.error(`Failed for user ${userId.substring(0, 8)}:`, response.error);
              return false;
            }

            return response.data?.success || response.data?.skipped;
          } catch (err) {
            console.error(`Error for user ${userId.substring(0, 8)}:`, err);
            return false;
          }
        })
      );

      successCount += batchResults.filter(r => r).length;
      failCount += batchResults.filter(r => !r).length;

      if (i + BATCH_SIZE < eligibleUserIds.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`📊 Daily word notification results: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        word: todaysWord.word,
        phonetic: todaysWord.phonetic,
        definition: todaysWord.definition,
        totalUsers: uniqueUserIds.length,
        eligibleUsers: eligibleUserIds.length,
        sentCount: successCount,
        failedCount: failCount
      }),
      { headers: responseHeaders }
    );

  } catch (error: any) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
