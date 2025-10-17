import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ERIC_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, userMessage, userId, userNickname } = await req.json();

    if (!conversationId || !userMessage || !userId) {
      throw new Error('Missing required fields');
    }

    console.log('Eric chat request:', { conversationId, userId, userNickname });

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get conversation history for context
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('sender_id, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    const conversationHistory = messages?.map(msg => ({
      role: msg.sender_id === userId ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    console.log('Conversation history length:', conversationHistory.length);

    // Call Gemini AI
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get current time for greeting
    const now = new Date();
    const haitiOffset = -5; // Haiti is UTC-5 (EST)
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
      ? `SALUTATION PREMIÈRE FOIS:
- C'est la première fois que tu parles à cet utilisateur dans cette conversation
- L'utilisateur s'appelle "${nicknameText}"
- Commence ta réponse par "${greeting} ${nicknameText} ! Je suis Eric, votre assistant IA éducatif."
- Demande comment tu peux aider l'utilisateur`
      : `CONVERSATION EN COURS:
- Tu es DÉJÀ en conversation avec l'utilisateur qui s'appelle "${nicknameText}"
- NE DIS PAS "${greeting}" ou "Bonjour" ou "Bonsoir" à nouveau
- Utilise son pseudo "${nicknameText}" naturellement dans la conversation
- Continue directement la conversation de manière naturelle
- Réponds simplement à la question posée sans te présenter à nouveau`;

    const systemPrompt = `Tu es Eric, un assistant IA éducatif haïtien expert du programme du MENFP.

${greetingInstruction}

🗣️ LANGUE DE COMMUNICATION:
- **Français standard** est ta langue par DÉFAUT
- Tu PARLES TOUJOURS EN FRANÇAIS sauf si l'utilisateur te demande EXPLICITEMENT de parler créole

🎓 TON EXPERTISE:
- Le curriculum du MENFP pour tous les niveaux
- Toutes les matières du programme haïtien
- Aide aux devoirs et préparation aux examens
- Méthodes d'apprentissage adaptées

📝 TON STYLE:
- **Pédagogue et encourageant**
- **Exemples concrets** du contexte haïtien
- **Français standard TOUJOURS**
- **Émojis éducatifs** pour rendre vivant
- **Structuré et clair**
- **IMPORTANT: Utilise des sauts de ligne entre paragraphes pour aérer tes réponses**
- **Sépare les idées avec des doubles sauts de ligne**
- **Paragraphes courts et lisibles pour mobile**

✅ TU RÉPONDS À:
- Questions sur les matières du programme MENFP
- Explications de concepts scolaires
- Aide aux devoirs
- Préparation aux examens
- Méthodes d'étude

❌ HORS DE TA COMPÉTENCE:
Si on te pose une question NON-ÉDUCATIVE, réponds:
"Bonjour ! Je suis Eric, votre assistant IA éducatif. Je suis là pour vous aider avec vos études. 📚
Je ne peux malheureusement pas répondre à des questions en dehors de l'éducation. Avez-vous une question sur vos cours ?"`;

    // Build messages array with conversation history
    const aiMessages = [];
    
    // Add system prompt as first user message
    aiMessages.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    
    // Add conversation history
    for (const msg of conversationHistory) {
      const role = msg.role === 'user' ? 'user' : 'model';
      aiMessages.push({
        role: role,
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current message
    aiMessages.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    console.log('Calling Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: aiMessages,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    // Clean asterisks from the response
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    console.log('Generated response length:', aiResponse.length);

    // Mark the user's message as read (Eric has "seen" it)
    const { error: markReadError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', userId)
      .eq('read', false);

    if (markReadError) {
      console.error('Error marking user message as read:', markReadError);
    }

    // Insert Eric's response using service role (bypasses RLS)
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: ERIC_USER_ID,
        content: aiResponse,
        read: false,
      });

    if (insertError) {
      console.error('Error inserting Eric response:', insertError);
      throw insertError;
    }

    console.log('Eric response inserted successfully');

    // Send push notification to the user
    try {
      // Clean the AI response for notification (remove extra formatting)
      const cleanResponse = aiResponse
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      
      const notificationBody = cleanResponse.substring(0, 100) + (cleanResponse.length > 100 ? '...' : '');
      
      const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
        body: {
          recipientUserId: userId,
          title: '🤖 Eric (Assistant IA)',
          body: notificationBody,
          conversationId: conversationId
        }
      });

      if (pushError) {
        console.error('Error sending push notification:', pushError);
      } else {
        console.log('Push notification sent to user');
      }
    } catch (pushError) {
      console.error('Exception sending push notification:', pushError);
      // Don't throw error, just log it
    }

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in eric-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});