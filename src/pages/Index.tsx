import { useState, useEffect, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useVisitor } from "@/contexts/VisitorContext";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { ensureProfileExists } from "@/hooks/useEnsureProfile";

// Critical components (immediate render — above the fold)
import { VisitorBanner } from "@/components/visitor";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroSection } from "@/components/home/HeroSection";

// Deferred content wrapper
import { DeferredContent } from "@/components/home/DeferredContent";

// Below-the-fold sections — lazy loaded to reduce initial JS bundle
const FeaturesSection = lazy(() => import("@/components/home/FeaturesSection"));
const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
const PlatformFeaturesSection = lazy(() => import("@/components/home/PlatformFeaturesSection"));
const CoursesSection = lazy(() => import("@/components/home/CoursesSection"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const AboutSection = lazy(() => import("@/components/home/AboutSection"));
const TeamSection = lazy(() => import("@/components/home/TeamSection"));
const ContactSection = lazy(() => import("@/components/home/ContactSection"));
const BlogSectionWrapper = lazy(() => import("@/components/home/BlogSectionWrapper"));

// Lightweight — keep static
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/Footer";

// Modals
import { VisitorTypeSelector } from "@/components/visitor";

// Lazy-loaded floating elements
const HomeChatbot = lazy(() => import("@/components/HomeChatbot").then(module => ({ default: module.HomeChatbot })));

// Hooks
import { useDeferredStats } from "@/hooks/useDeferredStats";
import { GradientOrbs } from "@/components/home/GradientOrbs";

/**
 * Homepage orchestrator.
 * Follows critical rendering path architecture:
 * 1. Critical Shell (Header + Hero) renders immediately
 * 2. DeferredContent renders when browser is idle
 * 3. FloatingLayer (Chatbot) renders after scroll/idle
 */
const Index = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useSessionAuth();
  const { isVisitor } = useVisitor();
  const { stats, isLoaded } = useDeferredStats();
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  const [chatbotReady, setChatbotReady] = useState(false);
  // Tracks whether ensureProfileExists has completed for Google users
  const [profileChecked, setProfileChecked] = useState(false);

  // For Google OAuth users landing on /, ensure profile exists before redirecting
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const provider = user.app_metadata?.provider;
    if (provider === 'google') {
      // Idempotent — creates profile if missing, syncs email_confirmed if exists
      ensureProfileExists(user.id, user.user_metadata, 'google')
        .finally(() => setProfileChecked(true));
    } else {
      // Non-Google users skip profile check (handled during signup)
      setProfileChecked(true);
    }
  }, [authLoading, isAuthenticated, user]);

  // Defer chatbot loading until scroll or idle
  useEffect(() => {
    if (chatbotReady) return;

    const onScroll = () => {
      if (window.scrollY > 400) {
        setChatbotReady(true);
      }
    };

    let idleId: number | ReturnType<typeof setTimeout>;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(
        () => setChatbotReady(true),
        { timeout: 5000 }
      );
    } else {
      idleId = setTimeout(() => setChatbotReady(true), 2000);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if ('requestIdleCallback' in window) {
        window.cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as ReturnType<typeof setTimeout>);
      }
    };
  }, [chatbotReady]);

  // Redirect only after profile check completes — prevents redirect before flag is set
  if (!authLoading && isAuthenticated && profileChecked) {
    const needsSetup = sessionStorage.getItem("google_needs_setup") === "true";
    return <Navigate to={needsSetup ? "/auth/google-setup" : "/dashboard"} replace />;
  }

  return (
    <>
      <Helmet>
        <title>EDUPRENEURS - L'Éducation Haïtienne Révolutionnée par l'IA | Éducation Haïti</title>
        <meta name="description" content="EDUPRENEURS: Plateforme éducative haïtienne avec assistant IA personnalisé. Programme MENFP complet de la 7AF à NS4. Cours, examens officiels. Essai gratuit 7 jours." />
        <meta name="keywords" content="éducation haïti, MENFP, cours en ligne, assistant IA, examens officiels, apprentissage personnalisé, 7AF, NS4" />
        <meta property="og:title" content="EDUPRENEURS - L'Éducation Haïtienne Révolutionnée par l'IA" />
        <meta property="og:description" content="Plateforme éducative avec assistant IA personnalisé. Programme MENFP complet. Essai gratuit 7 jours." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_HT" />
        <link rel="canonical" href="https://mon-edupreneur.com/" />
        {/* Preload already in index.html — no duplication needed here */}
      </Helmet>

      <VisitorBanner />
      
      <div className="min-h-screen bg-background font-poppins relative">
        {/* Effect 6: Morphing gradient orbs — desktop only, fixed behind all content */}
        <GradientOrbs />

        {/* Critical Shell - renders immediately */}
        <HeaderNav />
        <HeroSection 
          stats={stats} 
          statsLoaded={isLoaded}
          onVisitorClick={() => setShowVisitorSelector(true)}
        />
        
        {/* Deferred Content — lazy sections wrapped in Suspense for code splitting */}
        <DeferredContent minHeight="400px" timeout={2000}>
          <Suspense fallback={null}><FeaturesSection /></Suspense>
          <Suspense fallback={null}><HowItWorksSection /></Suspense>
          <Suspense fallback={null}><PlatformFeaturesSection examsCount={stats.exams} /></Suspense>
          <Suspense fallback={null}><CoursesSection /></Suspense>
          <Suspense fallback={null}><FAQSection /></Suspense>
          <Suspense fallback={null}><AboutSection /></Suspense>
          <Suspense fallback={null}><TeamSection /></Suspense>
          <Suspense fallback={null}><ContactSection /></Suspense>
          <Suspense fallback={null}><BlogSectionWrapper /></Suspense>
        </DeferredContent>
        
        <CTASection />
        <Footer />
      </div>
      
      {/* Floating Layer - deferred until scroll or idle */}
      {chatbotReady && (
        <Suspense fallback={null}>
          <HomeChatbot />
        </Suspense>
      )}
      
      <VisitorTypeSelector 
        open={showVisitorSelector} 
        onOpenChange={setShowVisitorSelector} 
      />
    </>
  );
};

export default Index;
