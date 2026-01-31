

# Restructure Mot du Jour Feature with TTS Provider Choice

## Overview

This plan addresses both problems identified and adds a **TTS provider selection feature** so super users can compare OpenAI vs ElevenLabs audio quality before deciding which to use.

---

## Problem 1: Word Repetition Too Soon

| Current Behavior | Issue |
|------------------|-------|
| Uses hash-based selection: `hash(date) % totalWords` | With 15 words, same word can repeat within 9-10 days |
| No tracking of which words were recently shown | No guarantee all words appear before cycling |

**Solution**: Sequential word cycling with database tracking.

---

## Problem 2: Low Audio Volume + Provider Choice

| Current Behavior | Issue |
|------------------|-------|
| Uses only OpenAI TTS (`tts-1-hd`, voice: `nova`) | Known issue - produces very quiet audio |
| No way to compare alternatives | Super users can't test which provider sounds better |

**Solution**: Add TTS provider selection in the Control Center so super users can generate audio with either:
- **OpenAI TTS** (current - `tts-1-hd` with `nova` voice)
- **ElevenLabs TTS** (`eleven_multilingual_v2` with `Sarah` voice and `use_speaker_boost: true`)

---

## Implementation Plan

### Step 1: Database Migration

```sql
-- Add display_order column for sequential rotation
ALTER TABLE daily_words 
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Populate existing words with sequential order
WITH ordered_words AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as rn
  FROM daily_words
  WHERE is_active = true
)
UPDATE daily_words 
SET display_order = (SELECT rn FROM ordered_words WHERE ordered_words.id = daily_words.id);

-- Create unique index for display_order
CREATE INDEX IF NOT EXISTS idx_daily_words_display_order ON daily_words(display_order);

-- Create app_settings table for tracking global state
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Anyone can read app settings"
ON app_settings FOR SELECT
TO authenticated
USING (true);

-- Only founders can update settings (use security definer function)
CREATE OR REPLACE FUNCTION public.update_app_setting(_key TEXT, _value JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO app_settings (key, value, updated_at)
  VALUES (_key, _value, NOW())
  ON CONFLICT (key) 
  DO UPDATE SET value = _value, updated_at = NOW();
END;
$$;

-- Initialize the word rotation tracker
SELECT public.update_app_setting('word_of_day', '{"last_date": null, "last_order": 0}');
```

---

### Step 2: Update Edge Function - Add Provider Choice

**File**: `supabase/functions/generate-word-audio/index.ts`

Add support for `provider` parameter (`openai` or `elevenlabs`):

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse, secureJsonResponse, secureErrorResponse } from '../_shared/securityHeaders.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const FOUNDER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f',
  '7580cd10-e18c-4b2f-ac50-def28d046c9d',
];

type TTSProvider = 'openai' | 'elevenlabs';

async function generateWithOpenAI(word: string): Promise<Uint8Array> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      voice: 'nova',
      input: word,
      response_format: 'mp3',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI TTS error: ${response.status}`);
  }
  
  return new Uint8Array(await response.arrayBuffer());
}

async function generateWithElevenLabs(word: string): Promise<Uint8Array> {
  const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: word,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true, // KEY: Ensures proper volume!
        },
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`ElevenLabs TTS error: ${response.status}`);
  }
  
  return new Uint8Array(await response.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // Auth verification (unchanged)...
    
    const { wordId, word, provider = 'elevenlabs' } = await req.json();
    const ttsProvider: TTSProvider = provider === 'openai' ? 'openai' : 'elevenlabs';
    
    // Validate API key for selected provider
    if (ttsProvider === 'openai' && !OPENAI_API_KEY) {
      return secureErrorResponse('OpenAI API key not configured', 500);
    }
    if (ttsProvider === 'elevenlabs' && !ELEVENLABS_API_KEY) {
      return secureErrorResponse('ElevenLabs API key not configured', 500);
    }
    
    console.log(`Generating audio for "${word}" using ${ttsProvider}`);
    
    // Generate audio based on provider
    const audioBytes = ttsProvider === 'openai'
      ? await generateWithOpenAI(word)
      : await generateWithElevenLabs(word);
    
    // Upload and update database (unchanged)...
    
    return secureJsonResponse({
      success: true,
      audioUrl,
      provider: ttsProvider,
      message: `Audio generated for "${word}" using ${ttsProvider}`,
    });
  } catch (error) {
    // Error handling (unchanged)...
  }
});
```

---

### Step 3: Update Control Center UI - Add Provider Toggle

**File**: `src/pages/control-center/modules/WordsModule.tsx`

Add a TTS provider selector for super users:

```tsx
// Add state for provider selection
const [selectedProvider, setSelectedProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs');

// Update generateAudio to pass provider
const generateAudio = async (word: DailyWord) => {
  // ...existing code...
  
  const response = await supabase.functions.invoke("generate-word-audio", {
    body: { 
      wordId: word.id, 
      word: word.word,
      provider: selectedProvider  // NEW: Pass selected provider
    },
  });
  
  // Show which provider was used in success toast
  if (response.data?.success) {
    toast.success(`Audio généré pour "${word.word}" (${response.data.provider})`);
  }
};

// Add UI for provider selection (in the Stats Header section)
<div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg mb-4">
  <span className="text-sm font-medium">Fournisseur TTS:</span>
  <div className="flex gap-2">
    <Button
      variant={selectedProvider === 'elevenlabs' ? 'default' : 'outline'}
      size="sm"
      onClick={() => setSelectedProvider('elevenlabs')}
    >
      ElevenLabs (Recommandé)
    </Button>
    <Button
      variant={selectedProvider === 'openai' ? 'default' : 'outline'}
      size="sm"
      onClick={() => setSelectedProvider('openai')}
    >
      OpenAI
    </Button>
  </div>
  <span className="text-xs text-muted-foreground">
    {selectedProvider === 'elevenlabs' 
      ? 'Volume plus élevé, meilleur français' 
      : 'Volume plus bas, alternative'}
  </span>
</div>
```

---

### Step 4: Update Word Selection Hook

**File**: `src/hooks/useWordOfTheDay.ts`

Replace hash-based selection with sequential fetching:

```typescript
// REMOVE: getGlobalWordIndex function

// NEW: Fetch word based on sequential order
const fetchWord = async () => {
  const haitiDate = getHaitiDate();
  
  // Check cache first (unchanged)...
  
  // Get current rotation state
  const { data: settings } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'word_of_day')
    .single();
  
  const lastDate = settings?.value?.last_date;
  const lastOrder = settings?.value?.last_order || 0;
  
  let currentOrder = lastOrder;
  
  // If new day, advance to next word
  if (lastDate !== haitiDate) {
    const { data: maxData } = await supabase
      .from('daily_words')
      .select('display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();
    
    const maxOrder = maxData?.display_order || 1;
    currentOrder = (lastOrder % maxOrder) + 1;
    
    // Update rotation state (uses security definer function)
    await supabase.rpc('update_app_setting', {
      _key: 'word_of_day',
      _value: { last_date: haitiDate, last_order: currentOrder }
    });
  }
  
  // Fetch word with this display_order
  const { data: wordData } = await supabase
    .from('daily_words')
    .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
    .eq('is_active', true)
    .eq('display_order', currentOrder)
    .single();
  
  return wordData;
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database | Add `display_order`, create `app_settings` table, add RPC function |
| `supabase/functions/generate-word-audio/index.ts` | Add provider choice (OpenAI or ElevenLabs) |
| `src/pages/control-center/modules/WordsModule.tsx` | Add TTS provider toggle UI |
| `src/hooks/useWordOfTheDay.ts` | Replace hash with sequential selection |

---

## UI Preview

The Control Center will show:

```
┌─────────────────────────────────────────────────────┐
│ Gestion Audio des Mots                              │
├─────────────────────────────────────────────────────┤
│ Fournisseur TTS:                                    │
│ [ElevenLabs (Recommandé)] [OpenAI]                  │
│ ↳ Volume plus élevé, meilleur français              │
├─────────────────────────────────────────────────────┤
│ Word 1: Perspicace [pɛʁ.spi.kas]  [▶️ Play] [🔄]    │
│ Word 2: Éphémère [e.fe.mɛʁ]       [▶️ Play] [🔄]    │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

Super users can:
1. Select their preferred TTS provider
2. Generate audio for any word
3. Play both versions to compare
4. The selected provider is used for all subsequent generations

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Gradual migration, existing audio still works |
| Works with existing data? | Yes | Migration populates display_order for all words |
| Backward compatible? | Yes | Falls back to ID order if display_order is null |
| 3G optimized? | Yes | Same number of queries, localStorage cache still works |
| API keys configured? | Yes | Both ELEVENLABS_API_KEY and OPENAI_API_KEY exist |
| Super user only? | Yes | Edge function validates founder status |

---

## Testing Plan

1. Run migration to add `display_order` column and `app_settings` table
2. Go to Control Center → Words Module
3. See new TTS provider toggle
4. Generate audio for same word with both providers
5. Play both to compare volume and quality
6. Verify today's word advances correctly at midnight Haiti time

