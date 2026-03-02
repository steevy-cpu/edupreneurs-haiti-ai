/**
 * Google Analytics GA4 — consent-gated, placeholder Measurement ID.
 * Only loads when analytics cookie consent is granted AND a real ID is set.
 */

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with real Measurement ID

/** Inject GA4 scripts into <head>. No-op if placeholder ID. */
export const initGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
  // Prevent double-initialization
  if ((window as any).gtag) return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  `;
  document.head.appendChild(script2);
};

/** Fire a custom GA4 event. */
export const trackGAEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

/** Track a page view on route change. */
export const trackGAPageView = (path: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, { page_path: path });
  }
};
