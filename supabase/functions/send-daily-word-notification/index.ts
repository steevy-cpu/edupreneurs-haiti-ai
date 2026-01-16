/**
 * Send Daily Word of the Day Push Notification
 * 
 * Sends a push notification to all users who have:
 * 1. Push subscriptions enabled
 * 2. word_of_day notification category enabled (or no preference set = default enabled)
 * 
 * Triggered manually by founders from Control Center.
 * In production, can be triggered by external cron/scheduler.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Founder user IDs who can trigger this function
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

// Deterministic word selection based on date - ensures same word for everyone
const getGlobalWordIndex = (date: string, totalWords: number): number => {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % totalWords;
};

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

    // Get request body (optional: specific word ID)
    let specificWordId: string | null = null;
    try {
      const body = await req.json();
      specificWordId = body.wordId || null;
    } catch {
      // No body, use random word
    }

    // Get today's word using deterministic selection (same as frontend)
    const haitiDate = getHaitiDate();
    
    // Fetch all active words with consistent ordering
    const { data: allWords, error: wordsError } = await supabase
      .from('daily_words')
      .select('id, word, phonetic, definition')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (wordsError || !allWords || allWords.length === 0) {
      console.error('Error fetching words:', wordsError);
      return new Response(
        JSON.stringify({ error: 'No active words found' }),
        { status: 404, headers: responseHeaders }
      );
    }

    // Use deterministic selection - same word everyone sees today
    let todaysWord: DailyWord;
    
    if (specificWordId) {
      // If a specific word is requested, use it (for testing)
      const specificWord = allWords.find(w => w.id === specificWordId);
      if (!specificWord) {
        return new Response(
          JSON.stringify({ error: 'Specified word not found' }),
          { status: 404, headers: responseHeaders }
        );
      }
      todaysWord = specificWord;
    } else {
      // Deterministic selection based on date
      const wordIndex = getGlobalWordIndex(haitiDate, allWords.length);
      todaysWord = allWords[wordIndex];
    }
    
    console.log(`📅 Haiti date: ${haitiDate}`);
    console.log(`📖 Today's word (deterministic): "${todaysWord.word}" [${todaysWord.phonetic}]`);

    

    // Get all users with push subscriptions
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

    // Get unique user IDs
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

    // Get notification preferences for word_of_day category
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('user_id, enabled')
      .eq('category', 'word_of_day')
      .in('user_id', uniqueUserIds);

    // Build map of user preferences (default to enabled if no preference set)
    const prefMap = new Map<string, boolean>();
    preferences?.forEach(p => prefMap.set(p.user_id, p.enabled));

    // Filter users who have word_of_day enabled (or no preference = default enabled)
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

    // Send notifications in batches of 10 with delay to avoid rate limits
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

      // Delay between batches
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