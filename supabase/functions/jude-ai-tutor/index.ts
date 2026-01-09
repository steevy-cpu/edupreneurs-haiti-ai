import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Animation trigger keywords mapping
const ANIMATION_TRIGGERS: Record<string, { animation: string; emotion: string; priority: number }> = {
  // Greetings
  'bonjour': { animation: 'waving', emotion: 'happy', priority: 3 },
  'salut': { animation: 'waving', emotion: 'happy', priority: 3 },
  'hello': { animation: 'waving', emotion: 'happy', priority: 3 },
  'bonsoir': { animation: 'waving', emotion: 'happy', priority: 3 },
  'bienvenue': { animation: 'waving', emotion: 'happy', priority: 3 },
  
  // Success/Celebration
  'bravo': { animation: 'celebrating', emotion: 'excited', priority: 4 },
  'excellent': { animation: 'celebrating', emotion: 'excited', priority: 4 },
  'parfait': { animation: 'celebrating', emotion: 'excited', priority: 4 },
  'correct': { animation: 'celebrating', emotion: 'happy', priority: 3 },
  'félicitations': { animation: 'celebrating', emotion: 'excited', priority: 4 },
  'super': { animation: 'celebrating', emotion: 'excited', priority: 4 },
  'génial': { animation: 'celebrating', emotion: 'excited', priority: 4 },
  
  // Thinking
  'hmm': { animation: 'thinking', emotion: 'focused', priority: 2 },
  'réfléchis': { animation: 'thinking', emotion: 'focused', priority: 2 },
  'pense': { animation: 'thinking', emotion: 'focused', priority: 2 },
  'calcule': { animation: 'thinking', emotion: 'focused', priority: 2 },
  'voyons': { animation: 'thinking', emotion: 'focused', priority: 2 },
  
  // Agreement
  'oui': { animation: 'nodding', emotion: 'happy', priority: 1 },
  'exactement': { animation: 'nodding', emotion: 'happy', priority: 2 },
  'bien sûr': { animation: 'nodding', emotion: 'happy', priority: 2 },
  
  // Pointing/Directing
  'regarde': { animation: 'pointing', emotion: 'neutral', priority: 2 },
  'voir': { animation: 'pointing', emotion: 'neutral', priority: 1 },
  'ici': { animation: 'pointing', emotion: 'neutral', priority: 1 },
  'voici': { animation: 'pointing', emotion: 'neutral', priority: 2 },
};

// Detect animation from response text
function detectAnimation(text: string): { animation: string; emotion: string } {
  const lowerText = text.toLowerCase();
  let bestMatch = { animation: 'talking', emotion: 'neutral', priority: 0 };
  
  for (const [keyword, trigger] of Object.entries(ANIMATION_TRIGGERS)) {
    if (lowerText.includes(keyword) && trigger.priority > bestMatch.priority) {
      bestMatch = trigger;
    }
  }
  
  return { animation: bestMatch.animation, emotion: bestMatch.emotion };
}

// Generate text hash for caching
function generateTextHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Navigation detection from response - enhanced patterns
function detectNavigation(response: string): string | null {
  const navigationPatterns: Record<string, string> = {
    // Home
    'page d\'accueil': '/',
    'accueil': '/',
    
    // Dashboard
    'tableau de bord': '/dashboard',
    'dashboard': '/dashboard',
    'mes stats': '/dashboard',
    'statistiques': '/dashboard',
    
    // Courses/Subjects
    'matières': '/matieres',
    'matieres': '/matieres',
    'mes cours': '/matieres',
    'sujets': '/matieres',
    'mathématiques': '/course/mathematiques',
    'math': '/course/mathematiques',
    'français': '/course/francais',
    'anglais': '/course/anglais',
    'espagnol': '/course/espagnol',
    'sciences expérimentales': '/course/sciences-experimentales',
    'sciences sociales': '/course/sciences-sociales',
    'histoire': '/course/sciences-sociales',
    'géographie': '/course/sciences-sociales',
    'créole': '/course/creole',
    'biologie': '/course/biologie',
    'physique': '/course/physique',
    'chimie': '/course/chimie',
    
    // Features
    'classement': '/leaderboard',
    'leaderboard': '/leaderboard',
    'mon rang': '/leaderboard',
    'communauté': '/community',
    'community': '/community',
    'discuter': '/community',
    'messages': '/community',
    'chat': '/community',
    'fil d\'actualité': '/feed',
    'feed': '/feed',
    'publications': '/feed',
    'échecs': '/chess-game',
    'chess': '/chess-game',
    'jouer aux échecs': '/chess-game',
    'passions': '/passion-discovery',
    'découvrir': '/passion-discovery',
    'activités': '/passion-discovery',
    'baccalauréat': '/baccalaureat',
    'bac': '/baccalaureat',
    'examens officiels': '/baccalaureat',
    
    // User
    'profil': '/profile',
    'mon compte': '/profile',
    'paramètres': '/settings',
    'réglages': '/settings',
    'notifications': '/notifications',
  };

  const lowerResponse = response.toLowerCase();
  
  // Check for navigation intent phrases
  const hasNavigationIntent = 
    lowerResponse.includes('allons') || 
    lowerResponse.includes('va voir') || 
    lowerResponse.includes('visite') || 
    lowerResponse.includes('clique') ||
    lowerResponse.includes('rends-toi') ||
    lowerResponse.includes('direction') ||
    lowerResponse.includes('accède') ||
    lowerResponse.includes('va sur');
    
  if (hasNavigationIntent) {
    for (const [keyword, path] of Object.entries(navigationPatterns)) {
      if (lowerResponse.includes(keyword)) {
        return path;
      }
    }
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      chatHistory = [], 
      userNickname = 'ami(e)',
      currentPage = '/',
      enableVoice = true,
      voiceId = 'EXAVITQu4vr4xnSDxMaL' // Sarah - friendly female voice
    } = await req.json();

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client for caching
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Get current time in Haiti
    const haitiTime = new Date().toLocaleString('en-US', { timeZone: 'America/Port-au-Prince' });
    const hour = new Date(haitiTime).getHours();
    
    let greeting = 'Bonjour';
    if (hour >= 18 || hour < 5) {
      greeting = 'Bonsoir';
    } else if (hour >= 12) {
      greeting = 'Bon après-midi';
    }

    // Page context for awareness
    const pageContextMap: Record<string, string> = {
      '/': 'sur la page d\'accueil',
      '/dashboard': 'sur ton tableau de bord',
      '/matieres': 'sur la page des matières',
      '/leaderboard': 'sur le classement',
      '/community': 'dans la communauté',
      '/feed': 'sur le fil d\'actualité',
      '/chess-game': 'sur la page d\'échecs',
      '/passion-discovery': 'sur la page des passions',
      '/baccalaureat': 'sur la préparation au bac',
      '/profile': 'sur ton profil',
      '/settings': 'dans les paramètres',
      '/notifications': 'sur les notifications',
    };
    
    const pageContext = pageContextMap[currentPage] || 
      (currentPage.startsWith('/course/') ? `sur le cours de ${currentPage.replace('/course/', '').replace(/-/g, ' ')}` : 
       currentPage.startsWith('/lesson/') ? 'sur une leçon' : '');

    // System prompt for Jude - French-only platform assistant
    const systemPrompt = `Tu es Jude, l'assistant officiel de la plateforme éducative EDUPRENEURS.

RÈGLES LINGUISTIQUES STRICTES:
- Tu réponds UNIQUEMENT en français
- Tu passes au créole haïtien SEULEMENT si l'utilisateur le demande explicitement (ex: "parle en créole", "répon an kreyòl")
- Si l'utilisateur écrit en créole, réponds en français mais mentionne: "Je peux répondre en créole si tu préfères, dis-le moi!"

RÔLE ET LIMITES:
- Tu es un ASSISTANT de navigation et d'aide à la plateforme éducative
- Tu peux aider avec: questions sur la plateforme, navigation, sujets éducatifs, conseils d'étude, encouragements
- Tu NE DOIS PAS répondre aux: questions personnelles non liées à l'éducation, sujets politiques, controversés, ou inappropriés
- Pour les questions hors sujet, réponds poliment: "Je suis spécialisé dans l'aide éducative et la navigation sur EDUPRENEURS. Comment puis-je t'aider avec tes études ou la plateforme?"

CONNAISSANCE DE LA PLATEFORME:
Pages principales:
- Tableau de bord (/dashboard): Statistiques d'apprentissage, progression, temps d'étude
- Matières (/matieres): Toutes les matières disponibles
- Classement (/leaderboard): Voir ton rang parmi les autres élèves
- Communauté (/community): Discuter avec d'autres élèves
- Fil d'actualité (/feed): Voir les publications des autres
- Échecs (/chess-game): Jouer aux échecs avec moi comme coach!
- Passions (/passion-discovery): Découvrir des activités extra-scolaires
- Baccalauréat (/baccalaureat): Préparation aux examens officiels
- Profil (/profile): Voir et modifier ton profil
- Paramètres (/settings): Gérer ton compte
- Notifications (/notifications): Voir tes notifications

MATIÈRES DISPONIBLES:
- Mathématiques (7AF à NS4)
- Français (7AF à NS4)
- Anglais (7AF à NS4)
- Espagnol (7AF à 9AF)
- Sciences Expérimentales (7AF à 9AF)
- Sciences Sociales / Histoire-Géographie
- Créole Haïtien
- Biologie et Géologie (Nouveau Secondaire)
- Physique et Chimie (Nouveau Secondaire)

NAVIGATION:
Quand tu suggères une page, utilise TOUJOURS une de ces phrases pour déclencher la navigation:
- "Allons voir..."
- "Va visiter..."
- "Clique ici pour..."
- "Rends-toi sur..."
- "Direction..."

STYLE DE COMMUNICATION:
- Sois bref et clair (2-3 phrases maximum par réponse)
- Sois encourageant et amical
- Utilise 1-2 émojis maximum par message
- Tutoie l'utilisateur
- Appelle l'élève par son prénom: ${userNickname}

CONTEXTE ACTUEL:
- L'élève est actuellement ${pageContext || 'sur la plateforme'}
- ${greeting}!`;

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Lovable AI Gateway
    console.log('Calling Lovable AI Gateway for Jude response...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let responseText = aiData.choices?.[0]?.message?.content || "Je suis désolé, je n'ai pas pu générer une réponse.";
    
    // Clean up response
    responseText = responseText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .trim();

    // Detect animation and emotion from response
    const { animation, emotion } = detectAnimation(responseText);
    
    // Detect navigation intent
    const navigate = detectNavigation(responseText);

    // Generate audio if voice is enabled
    let audioUrl: string | null = null;
    let phonemes: Array<{ time: number; phoneme: string }> | null = null;
    let durationMs: number | null = null;

    if (enableVoice && elevenLabsApiKey) {
      const textHash = generateTextHash(responseText);
      
      // Check cache first
      const { data: cachedAudio } = await supabase
        .from('jude_audio_cache')
        .select('audio_url, phoneme_data, duration_ms')
        .eq('text_hash', textHash)
        .single();

      if (cachedAudio) {
        console.log('Using cached audio');
        audioUrl = cachedAudio.audio_url;
        phonemes = cachedAudio.phoneme_data;
        durationMs = cachedAudio.duration_ms;
        
        // Update cache usage
        await supabase
          .from('jude_audio_cache')
          .update({ 
            last_used_at: new Date().toISOString(),
            use_count: supabase.rpc('increment', { row_id: textHash })
          })
          .eq('text_hash', textHash);
      } else {
        // Generate new audio with ElevenLabs
        console.log('Generating new audio with ElevenLabs...');
        try {
          const ttsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
            {
              method: 'POST',
              headers: {
                'xi-api-key': elevenLabsApiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: responseText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                  style: 0.4,
                  use_speaker_boost: true,
                },
              }),
            }
          );

          if (ttsResponse.ok) {
            const audioBuffer = await ttsResponse.arrayBuffer();
            const audioBase64 = btoa(
              String.fromCharCode(...new Uint8Array(audioBuffer))
            );
            
            // Estimate duration (rough: ~150 words per minute for French)
            const wordCount = responseText.split(/\s+/).length;
            durationMs = Math.round((wordCount / 150) * 60 * 1000);
            
            // For now, return base64 audio directly
            // In production, upload to storage and return URL
            audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
            
            // Generate simplified phoneme timing for lip sync
            // This is a basic approximation - real phonemes would come from ElevenLabs streaming
            phonemes = generateSimplifiedPhonemes(responseText, durationMs);
            
            // Cache the audio (skip for base64, would cache URL in production)
            console.log('Audio generated successfully, duration:', durationMs, 'ms');
          } else {
            console.error('ElevenLabs TTS error:', await ttsResponse.text());
          }
        } catch (ttsError) {
          console.error('TTS generation failed:', ttsError);
        }
      }
    }

    const result = {
      response: responseText,
      animation,
      emotion,
      audio_url: audioUrl,
      phonemes,
      duration_ms: durationMs,
      navigate
    };

    console.log('Jude response ready:', { animation, emotion, hasAudio: !!audioUrl });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in jude-ai-tutor:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: "Désolé, j'ai rencontré un problème. Réessayons!",
      animation: 'idle',
      emotion: 'neutral'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Generate simplified phoneme timing for lip sync
function generateSimplifiedPhonemes(text: string, durationMs: number): Array<{ time: number; phoneme: string }> {
  const phonemes: Array<{ time: number; phoneme: string }> = [];
  const words = text.split(/\s+/);
  const timePerWord = durationMs / words.length;
  
  // French phoneme approximation based on common letter patterns
  const vowelPatterns: Record<string, string> = {
    'a': 'aa',
    'e': 'E',
    'i': 'I',
    'o': 'O',
    'u': 'U',
    'ou': 'U',
    'eu': 'E',
    'ai': 'E',
    'au': 'O',
    'eau': 'O',
  };

  let currentTime = 0;
  
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    
    // Find vowels in word for mouth shapes
    for (let i = 0; i < lowerWord.length; i++) {
      const char = lowerWord[i];
      const twoChar = lowerWord.substring(i, i + 2);
      const threeChar = lowerWord.substring(i, i + 3);
      
      let phoneme: string | null = null;
      
      if (vowelPatterns[threeChar]) {
        phoneme = vowelPatterns[threeChar];
        i += 2;
      } else if (vowelPatterns[twoChar]) {
        phoneme = vowelPatterns[twoChar];
        i += 1;
      } else if (vowelPatterns[char]) {
        phoneme = vowelPatterns[char];
      }
      
      if (phoneme) {
        phonemes.push({
          time: currentTime + (i / lowerWord.length) * timePerWord,
          phoneme: `viseme_${phoneme}`
        });
      }
    }
    
    currentTime += timePerWord;
  }
  
  // Add closing mouth at end
  phonemes.push({ time: durationMs, phoneme: 'viseme_sil' });
  
  return phonemes;
}
