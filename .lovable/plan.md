

# Fix: Time-Aware Greetings for HomeChatbot

## Problem Statement

Jude greets users with "Bonjour" at 9PM, which is contextually incorrect. The greeting should adapt to the time of day to feel more natural and personalized.

**Current behavior:**
- Frontend: Hardcoded "Bonjour ! Je suis Jude..."
- Backend AI: No time context in system prompt → generates "Bonjour" responses

**Desired behavior:**
- Morning (6:00-11:59): "Bonjour" (Good morning)
- Afternoon (12:00-17:59): "Bon après-midi" (Good afternoon)  
- Evening (18:00-21:59): "Bonsoir" (Good evening)
- Night (22:00-5:59): "Bonsoir" (Good evening - appropriate for late night)

---

## Implementation Approach

### Phase 1: Create Time-Based Greeting Utility

Create a shared utility that returns the appropriate French greeting based on the current hour.

**New file:** `src/utils/getTimeBasedGreeting.ts`

```typescript
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeGreeting {
  greeting: string;
  period: TimePeriod;
  hour: number;
}

export function getTimeBasedGreeting(): TimeGreeting {
  const hour = new Date().getHours();
  
  // Morning (6-12): Bonjour
  if (hour >= 6 && hour < 12) {
    return { greeting: 'Bonjour', period: 'morning', hour };
  }
  
  // Afternoon (12-18): Bon après-midi
  if (hour >= 12 && hour < 18) {
    return { greeting: 'Bon après-midi', period: 'afternoon', hour };
  }
  
  // Evening & Night (18-6): Bonsoir
  return { greeting: 'Bonsoir', period: hour >= 18 ? 'evening' : 'night', hour };
}
```

---

### Phase 2: Update HomeChatbot Initial Message

Modify `HomeChatbot.tsx` to use the dynamic greeting in the initial message.

**File:** `src/components/HomeChatbot.tsx`

```typescript
// Import the utility
import { getTimeBasedGreeting } from "@/utils/getTimeBasedGreeting";

// Inside the component, compute initial message dynamically
const getInitialMessage = (): Message => {
  const { greeting } = getTimeBasedGreeting();
  return {
    content: `${greeting} ! Je suis Jude, votre assistant IA sur EDUPRENEURS. Comment puis-je vous aider à découvrir notre plateforme ? 😊`,
    sender: "eric"
  };
};

// Use useMemo or useState with initializer function
const [messages, setMessages] = useState<Message[]>(() => [getInitialMessage()]);
```

---

### Phase 3: Update Backend Edge Function

Pass the current time context to the AI so Jude's generated responses also use appropriate greetings.

**File:** `supabase/functions/home-eric-chat/index.ts`

**Changes:**
1. Add time context to the system prompt
2. The frontend will pass the user's local hour

**Frontend change (in HomeChatbot.tsx):**
```typescript
const { data, error } = await supabase.functions.invoke('home-eric-chat', {
  body: {
    message: userMessage,
    chatHistory: ...,
    localHour: new Date().getHours() // Pass current hour
  }
});
```

**Backend change (in edge function):**
```typescript
const { message, chatHistory, localHour } = validation.data;

// Determine greeting based on passed hour
const getGreetingFromHour = (hour: number) => {
  if (hour >= 6 && hour < 12) return { greeting: 'Bonjour', period: 'le matin' };
  if (hour >= 12 && hour < 18) return { greeting: 'Bon après-midi', period: 'l\'après-midi' };
  return { greeting: 'Bonsoir', period: 'le soir' };
};

const timeContext = getGreetingFromHour(localHour ?? new Date().getHours());

// Add to system prompt:
const systemPrompt = `Tu es Jude...

⏰ CONTEXTE TEMPOREL :
- Il est actuellement ${timeContext.period} chez l'utilisateur
- Utilise "${timeContext.greeting}" comme salutation (pas "Bonjour" s'il fait nuit !)
- Adapte ton ton au moment de la journée

...rest of prompt`;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/utils/getTimeBasedGreeting.ts` | **New file** - shared greeting utility |
| `src/components/HomeChatbot.tsx` | Use dynamic greeting for initial message + pass `localHour` to backend |
| `supabase/functions/home-eric-chat/index.ts` | Add time context to system prompt |
| `supabase/functions/_shared/validation.ts` | Add `localHour` to schema (optional) |

---

## Expected Result

```text
At 9PM:
  - Initial message: "Bonsoir ! Je suis Jude..."
  - AI responses: Uses "Bonsoir" appropriately

At 10AM:
  - Initial message: "Bonjour ! Je suis Jude..."
  - AI responses: Uses "Bonjour" appropriately

At 2PM:
  - Initial message: "Bon après-midi ! Je suis Jude..."
  - AI responses: Uses "Bon après-midi" appropriately
```

---

## Technical Details

### Validation Schema Update

The `ericChatSchema` in `_shared/validation.ts` needs to accept the optional `localHour` parameter:

```typescript
export const ericChatSchema = z.object({
  message: z.string().min(1).max(2000),
  chatHistory: z.array(...).optional(),
  localHour: z.number().min(0).max(23).optional() // Add this
});
```

### Why Pass Hour from Frontend?

- The edge function runs in Deno, which doesn't know the user's timezone
- Haiti uses Eastern Time (America/Port-au-Prince)
- Passing `localHour` from the browser ensures accurate time context

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - `localHour` is optional with fallback |
| Works with existing data? | Yes - no data changes |
| Backward compatible? | Yes - old clients work without `localHour` |
| 3G performance impact? | None - single number added to request |
| Edge cases handled? | Yes - fallback to server time if not provided |

---

## Test Scenarios

1. **Open chatbot at different times:**
   - Morning → "Bonjour"
   - Afternoon → "Bon après-midi"
   - Evening/Night → "Bonsoir"

2. **AI response greetings:**
   - Ask a question at 9PM → AI should use "Bonsoir" in response
   - Ask at 10AM → AI should use "Bonjour"

3. **Regression test:**
   - FAQ button clicks still return instant cached responses
   - Rate limiting still works

