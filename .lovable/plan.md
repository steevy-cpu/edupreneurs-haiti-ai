
## Plan N3: Sentry Error Reporting Integration

Three files change. One new dependency (`@sentry/react`). No database migrations. No edge function changes. No existing UI or logic is altered.

---

### Dependency

**New package:** `@sentry/react` — the official Sentry SDK for React applications.

- Current bundle already includes `@react-three/fiber`, `framer-motion`, TipTap, PDF.js, and chess. The Sentry SDK adds ~35–45 KB gzipped to the vendor chunk. This is justified because it is infrastructure code (error observability), not a feature-facing library. It only initialises once at startup and has negligible runtime overhead.
- No other packages are needed. `@sentry/react` bundles its own transport and tracing integrations.

---

### Change 1 — `src/main.tsx`: Sentry initialisation before React render

**Where:** Top of the file, before `createRoot` is called. Sentry must be the very first thing that runs so it can catch any error that occurs during React's own initialisation.

**What to add:**

```typescript
import * as Sentry from '@sentry/react';

// Initialise Sentry before React renders
// DSN is injected at build time via VITE_SENTRY_DSN — never falls back to a hardcoded value
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // Set environment based on Vite build mode (production | development)
    environment: import.meta.env.MODE,
    // 10% transaction sampling — keeps tracing overhead minimal on 3G
    tracesSampleRate: 0.1,
    // Drop errors originating from browser extensions — they are noise
    // from students' installed extensions, not platform bugs
    beforeSend(event) {
      const frames = event.exception?.values?.flatMap(
        (v) => v.stacktrace?.frames ?? []
      ) ?? [];
      const fromExtension = frames.some((frame) => {
        const filename = frame.filename ?? '';
        return (
          filename.startsWith('chrome-extension://') ||
          filename.startsWith('moz-extension://') ||
          filename.startsWith('safari-extension://')
        );
      });
      // Return null to drop the event entirely
      return fromExtension ? null : event;
    },
  });
}
```

**Key design decisions:**

1. **Guarded by `if (sentryDsn)`** — If `VITE_SENTRY_DSN` is not configured (e.g. local dev without the secret), Sentry never initialises. No errors thrown, no traffic sent, React renders normally. This means the DSN is optional at dev time and mandatory at production deploy time.

2. **`import.meta.env.MODE`** — Vite sets this to `"production"` in `vite build` and `"development"` in `vite dev`. This gives Sentry the correct environment tag automatically, matching the existing `process.env.NODE_ENV` pattern already used in `ErrorBoundary.tsx` line 167.

3. **`tracesSampleRate: 0.1`** — Exactly as requested. 10% of page loads will emit a performance transaction to Sentry. Sentry's free tier limit is 10,000 transactions/month; 10% sampling keeps the platform well within that limit even at scale.

4. **`beforeSend` extension filter** — Iterates over all stack frames in all exception values. Checks `filename` for `chrome-extension://`, `moz-extension://`, and `safari-extension://` prefixes. Returns `null` to drop the event if any frame matches. Safari extensions are included because some Haitian students use Safari on iOS.

5. **Sentry init is synchronous and non-blocking** — `Sentry.init()` returns void immediately. It sets up a global error handler and an in-memory event queue internally, but does not block the JS thread. `createRoot` and `root.render()` execute immediately after, exactly as before.

**Position in file:** The `import * as Sentry from '@sentry/react'` goes at line 2 (after the existing React import). The `Sentry.init()` block goes after the import block and before the `serviceWorker` registration block. The service worker registration and all React rendering code are completely unchanged.

---

### Change 2 — `src/components/ErrorBoundary.tsx`: Add `Sentry.captureException()` in `componentDidCatch`

**Where:** Inside `componentDidCatch`, after the existing `console.error` call, before the chunk-load error check.

**Current `componentDidCatch` (lines 30–38):**
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  // Check if this is a chunk loading error (stale cache)
  if (isChunkLoadError(error)) {
    handleChunkLoadError(error);
    return;
  }
}
```

**New `componentDidCatch`:**
```typescript
import * as Sentry from '@sentry/react';

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Keep existing console log for local debugging
  console.error('ErrorBoundary caught an error:', error, errorInfo);

  // Report to Sentry with React component stack for meaningful traces
  // Only fires if Sentry was initialised (i.e. VITE_SENTRY_DSN is set)
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });

  // Chunk loading errors (stale cache) trigger auto-reload — no user action needed
  if (isChunkLoadError(error)) {
    handleChunkLoadError(error);
    return;
  }
}
```

**Key design decisions:**

1. **`Sentry.captureException` is a no-op if Sentry was never initialised** — If `VITE_SENTRY_DSN` was not set and `Sentry.init()` was skipped, calling `captureException` does nothing (Sentry SDK is designed this way — it checks internal state). So calling it unconditionally in the boundary is safe.

2. **`errorInfo.componentStack` as context** — This is the React component tree at the time of the crash. It tells you exactly which component chain caused the failure — far more useful than a raw JS stack trace when debugging a React render error. It is passed as `contexts.react.componentStack` which is the idiomatic Sentry React pattern.

3. **Chunk load errors are still reported to Sentry** — The `captureException` call is placed *before* the `isChunkLoadError` check. This is intentional: if a chunk load error escapes to the boundary (rather than being caught by `lazyWithRetry`), we want to know about it in Sentry. The subsequent `handleChunkLoadError` → `window.location.reload()` still fires exactly as before.

4. **No changes to render logic, state, or UI** — The `render()` method, `getDerivedStateFromError`, `handleReload`, and all JSX are completely untouched. The only change is the addition of two imports and one `captureException` call inside `componentDidCatch`.

---

### Environment Variable Documentation

`VITE_SENTRY_DSN` must be added as a Vite environment variable. Since the `.env` file is auto-managed by Lovable Cloud, this requires adding it via the **Lovable project settings → Environment Variables** (or the Supabase secrets panel for any server-side usage — but this is frontend-only so it goes in Vite env).

**How to obtain the DSN:**
1. Create a free account at sentry.io
2. Create a new project → select React as the platform
3. Copy the DSN from the Sentry project setup page (format: `https://<key>@<org>.ingest.sentry.io/<project-id>`)
4. Add it to the project's environment config as `VITE_SENTRY_DSN`

The DSN is a publishable key — it is intentionally designed to be embedded in client-side code and has no server-side privileges. It is safe to store as a `VITE_` prefixed variable.

---

### Files Changed Summary

| File | Change |
|---|---|
| `src/main.tsx` | Add `@sentry/react` import; add `Sentry.init()` block with DSN guard, environment, tracesSampleRate, and `beforeSend` extension filter — placed before `createRoot` |
| `src/components/ErrorBoundary.tsx` | Add `@sentry/react` import; add `Sentry.captureException()` call inside `componentDidCatch` with `componentStack` context — placed after `console.error`, before chunk-load check |
| `package.json` | Add `@sentry/react` to dependencies (Lovable installs it automatically) |

---

### Safety Verification

| Check | Status |
|---|---|
| Sentry initialisation does not block React render | Yes — `Sentry.init()` is synchronous and non-blocking. It sets up internal state and returns void immediately. `createRoot` and `root.render()` execute right after with no delay. The mount watchdog timer is unaffected. |
| Sentry is skipped entirely if DSN is not configured | Yes — the `if (sentryDsn)` guard means `Sentry.init()` is never called in local dev without the env var. `captureException` in the ErrorBoundary is a no-op when Sentry has not been initialised. |
| `beforeSend` filter correctly drops extension errors | Yes — the filter iterates `event.exception.values[].stacktrace.frames[]` and checks the `filename` field for `chrome-extension://`, `moz-extension://`, and `safari-extension://` prefixes. Returns `null` to drop; returns the event unchanged otherwise. |
| `beforeSend` does not accidentally drop real platform errors | Yes — platform errors originate from filenames like `/assets/index-abc.js` or `https://edupreneurs-haiti-ai.lovable.app/...`. None of these match the extension prefix pattern. |
| Chunk load errors are still reported to Sentry | Yes — `captureException` fires before the `isChunkLoadError` branch. Chunk load errors are reported to Sentry AND the auto-reload still fires. |
| Chunk load errors still trigger auto-reload | Yes — `handleChunkLoadError` path is completely unchanged. Adding `captureException` before it does not alter its execution. |
| ErrorBoundary UI unchanged for users | Yes — no changes to `render()`, `getDerivedStateFromError`, `handleReload`, or any JSX. Students see the exact same error screen as before. |
| `VITE_SENTRY_DSN` is a publishable key (safe to use as VITE_ prefix) | Yes — Sentry DSNs are intentionally client-side-safe. Sentry's own documentation recommends embedding them in frontend code. |
| tracesSampleRate of 0.1 is appropriate for free tier | Yes — 10% sampling on a platform with thousands of page views still provides representative performance data while staying within Sentry's 10,000 transaction/month free tier limit. |
| 3G performance impact | Negligible — Sentry SDK initialises synchronously (no network on init). Error events are sent asynchronously via a background fetch after the error occurs, never on the critical render path. |
| MonCash and Stripe payment flows unaffected | Yes — no payment code touched. |
| Provider Stack or hook count affected | No — Sentry init is outside React. `captureException` is a plain function call inside a class component lifecycle method. |
| New dependencies | One: `@sentry/react`. No transitive dependencies that conflict with existing packages. |
