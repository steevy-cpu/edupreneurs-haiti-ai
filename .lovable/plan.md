
# Add "Donate Page" Navigation Suggestion to HomeChatbot

## What Changes

Add a 5th suggestion button "Emmène-moi vers la page de donation" to the existing FAQ suggestions in the Jude chatbot. When clicked, instead of sending a message to the AI, it navigates the user directly to `/donate`.

## How

### File: `src/components/HomeChatbot.tsx`

1. **Import `useNavigate`** from `react-router-dom`

2. **Convert `faqSuggestions` from a string array to an object array** with properties:
   - `label`: display text
   - `action`: either `"chat"` (send as message) or `"navigate"` (redirect)
   - `path`: optional navigation path (for navigate actions)

3. **Add the new suggestion**:
   ```text
   { label: "Emmène-moi vers la page de donation", action: "navigate", path: "/donate" }
   ```

4. **Update the suggestion buttons rendering** to check the action type:
   - If `action === "navigate"`: call `navigate(path)` and close the chatbot
   - If `action === "chat"`: call `sendMessage(label)` as before

### Updated data structure:

```typescript
const faqSuggestions = [
  { label: "Qu'est-ce qu'EDUPRENEURS ?", action: "chat" },
  { label: "Comment puis-je m'inscrire ?", action: "chat" },
  { label: "Quels cours sont disponibles ?", action: "chat" },
  { label: "Comment fonctionne la plateforme ?", action: "chat" },
  { label: "Emmène-moi vers la page de donation", action: "navigate", path: "/donate" },
];
```

### Updated button click handler:

```typescript
onClick={() => {
  if (suggestion.action === "navigate" && suggestion.path) {
    setIsOpen(false);
    navigate(suggestion.path);
  } else {
    sendMessage(suggestion.label);
  }
}}
```

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- existing 4 suggestions unchanged |
| 3G optimized? | Yes -- no new assets or API calls |
| Backward compatible? | Yes |
| Edge cases? | Navigation closes chat first to avoid overlay issues |
