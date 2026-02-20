

# Mot du Jour Plan B — Browser Voice Recording

## Overview

Add a third audio option (microphone recording) alongside ElevenLabs and OpenAI in `WordsModule.tsx`. Uses the browser's built-in `MediaRecorder` API — no new dependencies.

---

## Changes (single file: `src/pages/control-center/modules/WordsModule.tsx`)

### 1. New State Variables (~10 lines, after line 111)

```typescript
// Recording state
const [recordingWordId, setRecordingWordId] = useState<string | null>(null);
const [recordingWord, setRecordingWord] = useState<DailyWord | null>(null);
const [isRecording, setIsRecording] = useState(false);
const [recordingDuration, setRecordingDuration] = useState(0);
const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const mediaStreamRef = useRef<MediaStream | null>(null);
const chunksRef = useRef<Blob[]>([]);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const previewAudioRef = useRef<HTMLAudioElement | null>(null);
```

### 2. New Icon Import (line 26)

Add `MicOff, Square, Play, Upload` to the existing lucide imports.

### 3. Recording Functions (~80 lines, after toggleActive)

- **`openRecordingDialog(word)`** — sets `recordingWord`, opens the recording modal
- **`cleanupRecording()`** — stops MediaRecorder, releases mic stream (`track.stop()`), revokes object URL, clears timer, resets all recording state
- **`startRecording()`** — requests mic via `getUserMedia({ audio: true })`, creates `MediaRecorder` with `audio/webm` (fallback `audio/ogg`), starts collecting chunks, starts duration timer, auto-stops at 30 seconds
- **`stopRecording()`** — stops MediaRecorder, combines chunks into Blob, creates preview URL
- **`uploadRecording()`** — converts Blob to File, uploads to `lesson-audio/word-of-day/{wordId}.webm` via `supabase.storage.from('lesson-audio').upload()` with `upsert: true`, updates `daily_words.audio_url` with public URL + cache-busting timestamp, refreshes word list, shows success toast
- **`closeRecordingDialog()`** — calls `cleanupRecording()`, clears `recordingWord`

### 4. Mic Button in Table (after line 638, in the Audio column)

Add a microphone button alongside the existing play/regenerate buttons:

```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-7 w-7"
  onClick={() => openRecordingDialog(word)}
  title="Enregistrer avec le micro"
>
  <Mic className="h-3 w-3 text-amber-600" />
</Button>
```

Also add the mic button for words without audio (alongside the "Generer" button).

### 5. Recording Dialog (~80 lines, after the Add/Edit Dialog)

A new `Dialog` controlled by `recordingWord !== null`:

```
+------------------------------------------+
|  Enregistrer: "{word}"                    |
|  [{phonetic}] — {definition}             |
|                                          |
|  [ Record button: large red circle ]     |
|  Duration: 0:12 / 0:30                   |
|                                          |
|  --- After recording ---                 |
|  [ Play preview ]  [ Re-record ]         |
|                                          |
|  [ Annuler ]  [ Utiliser cet enreg. ]    |
+------------------------------------------+
```

- Record button: red pulsing circle when recording, gray mic when idle
- Duration counter updates every second via `setInterval`
- After recording stops: shows playback button + re-record button
- "Utiliser cet enregistrement" triggers upload
- Cancel and close both call `cleanupRecording()`

### 6. Cleanup on Unmount (update existing useEffect at line 391)

Add cleanup for recording resources alongside existing audio cleanup.

---

## Technical Details

| Aspect | Implementation |
|--------|---------------|
| Mime type | `audio/webm` primary, `audio/ogg` fallback via `MediaRecorder.isTypeSupported()` |
| Max duration | 30 seconds, enforced by `setTimeout` calling `stopRecording()` |
| Storage path | `lesson-audio/word-of-day/{wordId}.webm` (upsert overwrites existing) |
| Audio URL update | Same pattern as edge function: public URL + `?t={timestamp}` |
| Mic release | `mediaStreamRef.current.getTracks().forEach(t => t.stop())` |
| Object URL cleanup | `URL.revokeObjectURL(recordedUrl)` in `cleanupRecording()` |
| Permission error | Caught in `getUserMedia` catch block, shown via `toast.error()` |

## Safety Verification

| Check | Status |
|-------|--------|
| No new dependencies | MediaRecorder is built-in browser API |
| Only WordsModule.tsx modified | Single file change |
| Existing ElevenLabs/OpenAI unchanged | Mic button added alongside, not replacing |
| Mic released on close | cleanupRecording() stops all tracks |
| Object URL revoked | Prevents memory leaks |
| 30s auto-stop | Prevents accidentally long recordings |
| Upload uses existing bucket | lesson-audio bucket, same path pattern |
| Student-facing code untouched | useWordOfTheDay.ts reads audio_url regardless of source |

