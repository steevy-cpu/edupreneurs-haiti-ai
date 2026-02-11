import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CORRECT_MESSAGES = [
  "Bravo !",
  "Excellent !",
  "Parfait !",
  "Super boulot !",
  "Tu gères !",
  "Impressionnant !",
  "C'est ça !",
  "Bien joué !",
  "Tu assures !",
  "Magnifique !",
];

const INCORRECT_MESSAGES = [
  "Pas tout à fait...",
  "Presque !",
  "Essaie encore la prochaine fois !",
  "Pas exactement...",
  "C'est pas grave, on apprend !",
  "Bonne tentative !",
  "Continue, tu vas y arriver !",
  "Hmm, pas cette fois...",
  "Ne lâche pas !",
  "Regarde bien l'explication !",
];

const VOICE_ID = "cjVigY5qzO86Huf0OWal"; // Eric - young male voice

const VOICE_SETTINGS = {
  correct: { stability: 0.35, similarity_boost: 0.75, style: 0.6, speed: 1.05 },
  incorrect: { stability: 0.55, similarity_boost: 0.75, style: 0.25, speed: 0.95 },
};

async function generateAudio(
  text: string,
  type: "correct" | "incorrect",
  apiKey: string
): Promise<ArrayBuffer> {
  const settings = VOICE_SETTINGS[type];

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_22050_32`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: settings.style,
          use_speaker_boost: true,
          speed: settings.speed,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  return await response.arrayBuffer();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { path: string; status: string }[] = [];

    // Generate correct messages
    for (let i = 0; i < CORRECT_MESSAGES.length; i++) {
      const path = `jude-feedback/correct-${i}.mp3`;
      try {
        console.log(`Generating correct-${i}: "${CORRECT_MESSAGES[i]}"`);
        const audioBuffer = await generateAudio(CORRECT_MESSAGES[i], "correct", ELEVENLABS_API_KEY);
        const uint8Array = new Uint8Array(audioBuffer);

        const { error } = await supabase.storage
          .from("lesson-audio")
          .upload(path, uint8Array, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (error) throw error;
        results.push({ path, status: "success" });
      } catch (err) {
        console.error(`Failed correct-${i}:`, err);
        results.push({ path, status: `error: ${err.message}` });
      }
    }

    // Generate incorrect messages
    for (let i = 0; i < INCORRECT_MESSAGES.length; i++) {
      const path = `jude-feedback/incorrect-${i}.mp3`;
      try {
        console.log(`Generating incorrect-${i}: "${INCORRECT_MESSAGES[i]}"`);
        const audioBuffer = await generateAudio(INCORRECT_MESSAGES[i], "incorrect", ELEVENLABS_API_KEY);
        const uint8Array = new Uint8Array(audioBuffer);

        const { error } = await supabase.storage
          .from("lesson-audio")
          .upload(path, uint8Array, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (error) throw error;
        results.push({ path, status: "success" });
      } catch (err) {
        console.error(`Failed incorrect-${i}:`, err);
        results.push({ path, status: `error: ${err.message}` });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;

    return new Response(
      JSON.stringify({
        message: `Generated ${successCount}/20 audio clips`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
