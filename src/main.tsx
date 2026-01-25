import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
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
