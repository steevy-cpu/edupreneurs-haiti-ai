/**
 * TikTok Pixel — consent-gated, placeholder ID.
 * Only loads when marketing cookie consent is granted AND a real pixel ID is set.
 */

const TIKTOK_PIXEL_ID = 'TIKTOK_PIXEL_ID_PLACEHOLDER'; // Replace with real ID

/** Inject TikTok Pixel base code into <head>. No-op if placeholder ID. */
export const initTikTokPixel = () => {
  if (!TIKTOK_PIXEL_ID || TIKTOK_PIXEL_ID === 'TIKTOK_PIXEL_ID_PLACEHOLDER') return;
  // Prevent double-initialization
  if ((window as any).ttq) return;

  const script = document.createElement('script');
  script.innerHTML = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
      var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${TIKTOK_PIXEL_ID}');
      ttq.page();
    }(window, document, 'ttq');
  `;
  document.head.appendChild(script);
};

/** Fire a custom TikTok event (e.g. CompleteRegistration). */
export const trackTikTokEvent = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track(event, params);
  }
};

/** Convenience: track signup conversion */
export const trackSignup = () => trackTikTokEvent('CompleteRegistration');

/** Convenience: track page view */
export const trackPageView = () => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.page();
  }
};
