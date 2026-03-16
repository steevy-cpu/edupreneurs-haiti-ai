

## Plan: Add Traducteur to Sidebar Navigation

Add the Translate page to the "Découverte" section of the sidebar navigation with a "new" badge.

### Change

**File: `src/shell/config/navigation.ts`**

1. Add `Languages` icon to the lucide-react imports (line 8 area)
2. Insert a new nav item in the "Découverte" section (after line 92):
   ```typescript
   { to: '/translate', icon: Languages, label: 'Traducteur', badge: 'new' },
   ```

This places it in the discovery section alongside Lecture, Jeux, and Rechercher — with the same `'new'` badge style already used by Lecture. No other files need changes since the sidebar renderer already handles `badge: 'new'` display and the `/translate` route already exists.

