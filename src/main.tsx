import { createRoot } from "react-dom/client";
import * as Sentry from '@sentry/react';
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Signals to the inline ES5 watchdog in index.html that the module bundle parsed
// and executed on this browser. Must run before anything else can throw.
(window as any).__APP_BOOTED = true;

// Initialise Sentry before React renders so it can catch errors during React's own init.
// Hardcoded DSN fallback: env injection has failed before, and Sentry DSNs are public-safe.
const sentryDsn =
  (import.meta.env.VITE_SENTRY_DSN as string | undefined) ||
  'https://0a15fabbd1d14b5698af8cafe3da3aba@o4510909608886272.ingest.us.sentry.io/4510909610524672';

Sentry.init({
    dsn: sentryDsn,
    // Vite sets MODE to "production" in builds and "development" in dev server
    environment: import.meta.env.MODE,
    // 10% transaction sampling — keeps overhead minimal on Haiti's 3G connections
    tracesSampleRate: 0.1,
    // Drop errors that originate from browser extensions — these are noise from
    // students' installed extensions, not platform bugs, and would pollute the feed
    beforeSend(event) {
      const frames = event.exception?.values?.flatMap(
        (v) => v.stacktrace?.frames ?? []
      ) ?? [];
      const fromExtension = frames.some((frame) => {
        const filename = frame.filename ?? '';
        return (
          filename.startsWith('chrome-extension://') ||
          filename.startsWith('moz-extension://') ||
          filename.startsWith('safari-extension://')  // Safari on iOS (some students)
        );
      });
      // Return null to silently drop the event
      return fromExtension ? null : event;
    },
});

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Root mount watchdog: if React fails to mount within 10 seconds, show error message
const MOUNT_TIMEOUT_MS = 10000;
const rootElement = document.getElementById("root");

if (rootElement) {
  // CRITICAL: Clear HTML loading placeholder IMMEDIATELY when React starts
  // This ensures users see React content instantly, not blocked by auth
  const placeholder = rootElement.querySelector('.loading-placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  const mountWatchdog = setTimeout(() => {
    // Check if root is still empty (React failed to mount)
    if (rootElement.children.length === 0) {
      // React failed to mount - show error message
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #1a1a2e;
          color: #ffffff;
          text-align: center;
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
          <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">
            Aplikasyon an pa ka chaje
          </h1>
          <p style="font-size: 16px; color: #a0a0a0; margin-bottom: 24px; max-width: 400px;">
            Tanpri eseye rechaje paj la oswa netwaye kach navigatè w la.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              padding: 12px 32px;
              font-size: 16px;
              font-weight: 600;
              background-color: #6366f1;
              color: #ffffff;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            "
          >
            Rechaje Paj la
          </button>
        </div>
      `;
    }
  }, MOUNT_TIMEOUT_MS);

  // Render the app immediately - no blocking on auth
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );

  // Clear watchdog once React has rendered something
  const observer = new MutationObserver(() => {
    if (rootElement.children.length > 0) {
      clearTimeout(mountWatchdog);
      observer.disconnect();
    }
  });

  observer.observe(rootElement, { childList: true, subtree: true });
}
