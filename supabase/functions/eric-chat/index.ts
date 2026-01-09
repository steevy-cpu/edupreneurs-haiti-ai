/**
 * Security-Hardened: Eric Chat (Community AI)
 * 
 * Features:
 * - JWT authentication (validates userId from token)
 * - Rate limiting (60 req/min for auth, 10 req/min for anon)
 * - Input validation
 * - Security headers
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

const JUDE_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY FIX: Validate user from JWT token instead of trusting client input
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Token manquant' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Create client with user's auth token to validate JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabaseAuth.auth.getUser(token);
    
    if (claimsError || !claims?.user) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Token invalide' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Use verified userId from JWT, not from client input
    const verifiedUserId = claims.user.id;

    const rawBody = await req.json();
    const { conversationId, userMessage, userNickname } = rawBody;

    // Basic validation
    if (!conversationId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Champs requis manquants' }),
        { status: 400, headers: responseHeaders }
      );
    }

    if (typeof userMessage !== 'string' || userMessage.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Message invalide ou trop long' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit using verified userId
    const rateCheck = await checkRateLimit(supabaseAdmin, RATE_LIMITS.AI_TUTOR, verifiedUserId, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for eric-chat`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    console.log('Jude chat request:', { conversationId, userId: verifiedUserId.substring(0, 8) });

    // Get conversation history
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('sender_id, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    // Fetch profiles for senders
    const uniqueSenderIds = [...new Set((messages as Array<{sender_id: string; content: string}>)?.map((m) => m.sender_id) || [])];
    const { data: senderProfiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, nickname, full_name')
      .in('user_id', uniqueSenderIds);

    const profileMap = new Map(
      (senderProfiles as Array<{user_id: string; nickname: string | null; full_name: string}>)?.map((p) => [p.user_id, p.nickname || p.full_name]) || []
    );

    const conversationHistory = (messages as Array<{sender_id: string; content: string}>)?.map((msg) => {
      const isJude = msg.sender_id === JUDE_USER_ID;
      const senderName = profileMap.get(msg.sender_id) || 'Utilisateur';
      return {
        role: isJude ? 'assistant' : 'user',
        content: isJude ? msg.content : `[${senderName}]: ${msg.content}`
      };
    }) || [];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get current time for greeting
    const now = new Date();
    const haitiOffset = -5;
    const haitiTime = new Date(now.getTime() + (haitiOffset * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
    const currentHour = haitiTime.getHours();
    
    let greeting = "Bonjour";
    if (currentHour >= 18 || currentHour < 5) {
      greeting = "Bonsoir";
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = "Bon après-midi";
    }

    const isFirstMessage = !conversationHistory || conversationHistory.length === 0;
    const nicknameText = userNickname || "l'élève";
    const greetingInstruction = isFirstMessage 
      ? `SALUTATION PREMIÈRE FOIS: Commence par "${greeting} ${nicknameText} ! Je suis Jude, votre assistant IA éducatif."`
      : `CONVERSATION EN COURS: Ne dis pas bonjour à nouveau. Continue naturellement.`;

    const systemPrompt = `Tu es Jude, un assistant IA éducatif haïtien expert du programme du MENFP.

${greetingInstruction}

💬 CONVERSATIONS DE GROUPE:
- Les messages sont préfixés par le nom: [Nom]: message
- Réponds à "${nicknameText}" spécifiquement

🗣️ LANGUE: Français standard par défaut.

🎓 TON EXPERTISE: Curriculum MENFP, toutes matières, préparation examens.

📝 STYLE: Pédagogue, encourageant, paragraphes courts et aérés.

❌ HORS COMPÉTENCE: Questions non-éducatives → réponds poliment.`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-20), // Limit history
      { role: 'user', content: `[${nicknameText}]: ${userMessage}` }
    ];

    console.log('Calling Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('Lovable AI error:', response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte' }),
          { status: 429, headers: responseHeaders }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    // Mark user's message as read (use verifiedUserId)
    await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', verifiedUserId)
      .eq('read', false);

    // Insert Jude's response
    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: JUDE_USER_ID,
        content: aiResponse,
        read: false,
      });

    if (insertError) {
      console.error('Error inserting response:', insertError);
      throw insertError;
    }

    console.log('Jude response inserted successfully');

    // Send push notification (use verifiedUserId)
    try {
      const cleanResponse = aiResponse.replace(/\n+/g, ' ').trim();
      const notificationBody = cleanResponse.substring(0, 100) + (cleanResponse.length > 100 ? '...' : '');
      
      await supabaseAdmin.functions.invoke('send-push-notification', {
        body: {
          recipientUserId: verifiedUserId,
          title: '🤖 Jude (Assistant IA)',
          body: notificationBody,
          conversationId: conversationId
        }
      });
    } catch (pushError) {
      console.error('Push notification error:', pushError);
    }

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Error in eric-chat:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
