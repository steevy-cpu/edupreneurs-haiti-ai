import { useState, useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { useVisitor } from "@/contexts/VisitorContext";

// Critical components (immediate render)
import { VisitorBanner } from "@/components/visitor";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroSection } from "@/components/home/HeroSection";

// Deferred content wrapper
import { DeferredContent } from "@/components/home/DeferredContent";

// Section components
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PlatformFeaturesSection } from "@/components/home/PlatformFeaturesSection";
import { CoursesSection } from "@/components/home/CoursesSection";
import { FAQSection } from "@/components/home/FAQSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TeamSection } from "@/components/home/TeamSection";
import { ContactSection } from "@/components/home/ContactSection";
import { BlogSectionWrapper } from "@/components/home/BlogSectionWrapper";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/Footer";

// Modals
import { VisitorTypeSelector } from "@/components/visitor";

// Lazy-loaded floating elements
const HomeChatbot = lazy(() => import("@/components/HomeChatbot").then(module => ({ default: module.HomeChatbot })));

// Hooks
import { useDeferredStats } from "@/hooks/useDeferredStats";

/**
 * Homepage orchestrator.
 * Follows critical rendering path architecture:
 * 1. Critical Shell (Header + Hero) renders immediately
 * 2. DeferredContent renders when browser is idle
 * 3. FloatingLayer (Chatbot) renders after scroll/idle
 */
const Index = () => {
  const { isVisitor } = useVisitor();
  const { stats, isLoaded } = useDeferredStats();
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  const [chatbotReady, setChatbotReady] = useState(false);

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
        <link rel="canonical" href="https://edupreneurs.app" />
      </Helmet>

      <VisitorBanner />
      
      <div className="min-h-screen bg-background font-poppins">
        {/* Critical Shell - renders immediately */}
        <HeaderNav />
        <HeroSection 
          stats={stats} 
          statsLoaded={isLoaded}
          onVisitorClick={() => setShowVisitorSelector(true)}
        />
        
        {/* Deferred Content - renders when idle/visible */}
        <DeferredContent minHeight="400px" timeout={2000}>
          <FeaturesSection />
          <HowItWorksSection />
          <PlatformFeaturesSection examsCount={stats.exams} />
          <CoursesSection />
          <FAQSection />
          <AboutSection />
          <TeamSection />
          <ContactSection />
          <BlogSectionWrapper />
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
