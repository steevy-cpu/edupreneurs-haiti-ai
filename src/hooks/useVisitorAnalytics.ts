// Analytics stub for visitor mode
// This hook is ready for future implementation of analytics tracking

interface VisitorAnalyticsEvent {
  event: string;
  data?: Record<string, any>;
  timestamp: string;
}

export const useVisitorAnalytics = () => {
  // Future implementation: send to analytics service
  const logEvent = (event: string, data?: Record<string, any>) => {
    const analyticsEvent: VisitorAnalyticsEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    
    // For now, just log to console
    // In the future, this could send to Supabase, Mixpanel, Google Analytics, etc.
  };

  const trackPageView = (page: string) => {
    logEvent("page_view", { page });
  };

  const trackTourStep = (step: number, stepName: string) => {
    logEvent("tour_step", { step, stepName });
  };

  const trackTourComplete = () => {
    logEvent("tour_complete");
  };

  const trackTourSkip = (atStep: number) => {
    logEvent("tour_skip", { atStep });
  };

  const trackLockedContentClick = (contentType: string, contentId?: string) => {
    logEvent("locked_content_click", { contentType, contentId });
  };

  const trackSignUpIntent = (source: string) => {
    logEvent("signup_intent", { source });
  };

  const trackVisitorTypeSelected = (visitorType: string) => {
    logEvent("visitor_type_selected", { visitorType });
  };

  const trackTimeSpent = (page: string, seconds: number) => {
    logEvent("time_spent", { page, seconds });
  };

  return {
    trackPageView,
    trackTourStep,
    trackTourComplete,
    trackTourSkip,
    trackLockedContentClick,
    trackSignUpIntent,
    trackVisitorTypeSelected,
    trackTimeSpent,
  };
};
