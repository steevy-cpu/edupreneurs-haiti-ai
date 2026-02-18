import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Founder user IDs to exclude from leaderboards
const FOUNDER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── SECURITY: Only allow calls from our cron job or founders ──────────────
  // Accept either a valid CRON_SECRET header (for scheduled invocations) or a
  // valid founder JWT (for manual admin triggers).  All other callers → 401.
  const authHeader = req.headers.get('Authorization') ?? '';
  const cronSecret = Deno.env.get('CRON_SECRET') ?? '';

  const hasCronSecret =
    cronSecret.length > 0 &&
    req.headers.get('X-Cron-Secret') === cronSecret;

  if (!hasCronSecret) {
    // Fall back: accept a valid JWT from a founder
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await tempClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    const isFounder =
      !authError &&
      user &&
      FOUNDER_USER_IDS.includes(user.id);

    if (!isFounder) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
  // ── END SECURITY CHECK ─────────────────────────────────────────────────────

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get last week's Monday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - dayOfWeek - 6);
    lastMonday.setHours(0, 0, 0, 0);
    const weekStart = lastMonday.toISOString().split('T')[0];

    console.log(`Checking weekly champions for week starting: ${weekStart}`);

    // Get top 3 players from last week (excluding founders)
    const { data: topPlayers, error: fetchError } = await supabase
      .from('quiz_battle_weekly_xp')
      .select('user_id, xp_earned')
      .eq('week_start', weekStart)
      .not('user_id', 'in', `(${FOUNDER_USER_IDS.join(',')})`)
      .order('xp_earned', { ascending: false })
      .limit(3);

    if (fetchError) {
      console.error('Error fetching top players:', fetchError);
      throw fetchError;
    }

    if (!topPlayers || topPlayers.length === 0) {
      console.log('No players found for this week');
      return new Response(
        JSON.stringify({ message: 'No players this week', week: weekStart }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${topPlayers.length} top players:`, topPlayers);

    let awardedCount = 0;

    // Award badge to top 3 players
    for (const player of topPlayers) {
      // Check if player already has this badge for this week
      const { data: existingBadge } = await supabase
        .from('quiz_battle_badges')
        .select('id')
        .eq('user_id', player.user_id)
        .eq('badge_key', 'weekly_champion')
        .gte('earned_at', weekStart)
        .maybeSingle();

      if (existingBadge) {
        console.log(`Player ${player.user_id} already has weekly_champion badge for week ${weekStart}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from('quiz_battle_badges')
        .insert({
          user_id: player.user_id,
          badge_key: 'weekly_champion',
          badge_name: 'Champion Hebdo',
          description: `Top 3 de la semaine du ${weekStart}!`,
          icon: '🏆',
        });

      if (insertError) {
        console.error(`Error awarding badge to ${player.user_id}:`, insertError);
      } else {
        console.log(`Awarded weekly_champion badge to ${player.user_id}`);
        awardedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        awarded: awardedCount,
        week: weekStart,
        topPlayers: topPlayers.map(p => ({ user_id: p.user_id, xp: p.xp_earned })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in award-weekly-champion:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});