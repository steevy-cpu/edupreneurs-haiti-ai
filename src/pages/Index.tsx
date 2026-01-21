import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useVisitor } from "@/contexts/VisitorContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

// Static imports for critical above-the-fold images
// Using original PNG files which have proper transparency
import ericCelebrating from "@/assets/eric-celebrating.png";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import ericPointingRight from "@/assets/eric-right-pointing.png";

// Lazy load non-critical images
const ericMain01 = () => import("@/assets/eric-main01.png").then(m => m.default);
const ericThinkingPose = () => import("@/assets/eric-thinking-pose.png").then(m => m.default);
const judeProfile = () => import("@/assets/jude-profile.jpeg").then(m => m.default);

import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, BookOpen, Trophy, MessageCircle, Newspaper, Users, GraduationCap, Heart, FileText, Mail, Phone, MapPin, PenLine, Bot, Calculator, Languages, FlaskConical, Globe, Laptop, Target, Smartphone, Coins, HelpCircle, CheckCircle, RefreshCw } from "lucide-react";
import { VisitorTypeSelector, VisitorBanner } from "@/components/visitor";

// Lazy load chatbot for better initial page load
const HomeChatbot = lazy(() => import("@/components/HomeChatbot").then(module => ({ default: module.HomeChatbot })));

// Default fallback values
const DEFAULT_STATS = { lessons: 2800, exams: 90, users: 25 };

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  
  // Network-aware loading for 3G optimization
  const { shouldDeferResources, shouldShowBlur, shouldShowAnimations, isSlowConnection } = useNetworkAwareLoading();
  const { isVisitor } = useVisitor();
  
  // Lazy loaded images state
  const [lazyImages, setLazyImages] = useState<{
    judeProfile?: string;
  }>({});

  const fetchStats = useCallback(async () => {
    try {
      const [lessonsRes, examsRes, usersRes] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('official_exams').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);
      
      setStats({
        lessons: lessonsRes.count || DEFAULT_STATS.lessons,
        exams: examsRes.count || DEFAULT_STATS.exams,
        users: usersRes.count || DEFAULT_STATS.users
      });
      setStatsLoaded(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Defer stats fetching for faster LCP - wait until after initial paint
  useEffect(() => {
    // On slow connections, defer stats loading by 3 seconds
    // On fast connections, load after 500ms (after LCP)
    const delay = shouldDeferResources ? 1000 : 100;
    
    const timer = setTimeout(() => {
      fetchStats();
    }, delay);

    return () => clearTimeout(timer);
  }, [fetchStats, shouldDeferResources]);
  
  // Lazy load non-critical images after initial render
  useEffect(() => {
    const loadLazyImages = async () => {
      const jude = await judeProfile();
      setLazyImages({
        judeProfile: jude
      });
    };
    
    // Load lazy images after a delay on slow connections
    const delay = shouldDeferResources ? 2000 : 100;
    const timer = setTimeout(loadLazyImages, delay);
    return () => clearTimeout(timer);
  }, [shouldDeferResources]);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Memoized static arrays to prevent recreation on every render
  const heroStats = useMemo(() => [
    { number: `${stats.lessons}+`, label: "Leçons" },
    { number: `${stats.exams}+`, label: "Examens" },
    { number: `${stats.users}+`, label: "Étudiants" },
    { number: "24/7", label: "Assistant IA" },
    { number: "7AF-NS4", label: "Niveaux" }
  ], [stats]);

  const features = useMemo(() => [
    { icon: <Target className="w-10 h-10 text-primary" />, title: "Apprentissage 100% Personnalisé", desc: "L'agent IA s'adapte à votre niveau, de la 7AF à NS4 (programme MENFP complet)" },
    { icon: <Coins className="w-10 h-10 text-primary" />, title: "Prix Dérisoire - 200 Gdes/mois", desc: "Accessible à tous avec une semaine d'essai gratuite" },
    { icon: <Trophy className="w-10 h-10 text-primary" />, title: "Système Gold Révolutionnaire", desc: "Gagnez des points, débloquez des fonctions premium, et même de l'argent réel" },
    { icon: <Languages className="w-10 h-10 text-primary" />, title: "Multilingue Intelligent", desc: "Créole, Français, Anglais, Espagnol - Votre IA parle votre langue" }
  ], []);

  const platformFeatures = useMemo(() => [
    { 
      icon: FileText, 
      title: "Hub des Examens Officiels", 
      desc: "Accédez aux examens officiels de 2011 à 2025. Préparez-vous avec les vrais sujets du MENFP et des corrections détaillées par notre IA.",
      highlight: `${stats.exams}+ examens disponibles`,
      color: "from-blue-500 to-cyan-500",
      link: "/exams-hub"
    },
    { 
      icon: Heart, 
      title: "Découvre ta Passion", 
      desc: "Test de personnalité pour découvrir vos talents cachés. Explorez la musique, les arts, les échecs et la littérature avec notre guide interactif.",
      highlight: "4 domaines à explorer",
      color: "from-pink-500 to-rose-500",
      link: "/passion-discovery"
    },
    { 
      icon: GraduationCap, 
      title: "Développement Personnel", 
      desc: "Modules d'éducation civique, leadership et développement personnel pour former des citoyens responsables et des leaders de demain.",
      highlight: "Formation complète",
      color: "from-purple-500 to-violet-500",
      link: "/passion-discovery"
    },
    { 
      icon: MessageCircle, 
      title: "Messagerie & Communauté", 
      desc: "Discutez avec vos camarades et Jude votre assistant IA. Créez des groupes d'étude et partagez vos réussites.",
      highlight: "Chat en temps réel",
      color: "from-green-500 to-emerald-500",
      link: "/community"
    },
    { 
      icon: Newspaper, 
      title: "Fil d'Actualité", 
      desc: "Restez connecté avec la communauté EDUPRENEURS. Partagez vos progrès, inspirez les autres et célébrez ensemble.",
      highlight: "Réseau social éducatif",
      color: "from-orange-500 to-amber-500",
      link: "/feed"
    },
    { 
      icon: Trophy, 
      title: "Classement & Compétition", 
      desc: "Montez dans le classement en accumulant des Gold. Comparez-vous aux meilleurs élèves d'Haïti et gagnez des récompenses.",
      highlight: "Top étudiants",
      color: "from-yellow-500 to-orange-500",
      link: "/leaderboard"
    }
  ], [stats.exams]);

  const faqItems = useMemo(() => [
    { q: "Comment m'inscrire à EDUPRENEURS ?", a: "Créez un compte avec votre email, choisissez votre niveau académique et profitez de votre semaine d'essai gratuite. Ensuite, abonnez-vous pour seulement 200 gourdes par mois." },
    { q: "Comment fonctionne l'assistant IA ?", a: "Votre assistant IA personnalisé vous aide dans toutes les matières, explique les leçons en créole ou français, et s'adapte à votre rythme d'apprentissage." },
    { q: "Qu'est-ce que le système Gold ?", a: "Gagnez des points Gold en réussissant les quiz, utilisez-les pour débloquer des fonctions premium, changer votre avatar ou même gagner de l'argent réel." },
    { q: "Le contenu suit-il le programme officiel ?", a: "Absolument ! Notre plateforme est entièrement basée sur le programme du Ministère de l'Éducation Nationale (MENFP) de la 7ème à la Terminale." },
    { q: "Comment contacter l'équipe EDUPRENEURS ?", a: "Vous pouvez nous contacter par email à contact@edupreneurs.app ou via WhatsApp. Nous répondons généralement dans les 24 heures." }
  ], []);

  // Team members data
  const teamMembers = useMemo(() => [
    {
      name: "Djoodoodson F. FLORENT",
      initials: "DF",
      role: "Fondateur & CEO",
      bio: "Passionné par l'éducation et la technologie, dédié à transformer l'éducation haïtienne.",
      color: "from-primary to-accent"
    },
    {
      name: "Steeve Andolf Celestin",
      initials: "SC",
      role: "CTO & Innovation",
      bio: "Expert en technologie et innovation, architecte des solutions numériques d'EDUPRENEURS.",
      color: "from-accent to-primary"
    }
  ], []);

  return (
    <>
      <VisitorBanner />
      <div className="min-h-screen bg-background font-poppins">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>EDUPRENEURS - L'Éducation Haïtienne Révolutionnée par l'IA | Plateforme MENFP</title>
        <meta name="description" content="EDUPRENEURS: Plateforme éducative haïtienne avec assistant IA personnalisé. Programme MENFP complet de la 7AF à NS4. Cours, examens officiels. Essai gratuit 7 jours." />
        <meta name="keywords" content="éducation haïti, MENFP, cours en ligne, assistant IA, examens officiels, apprentissage personnalisé, 7AF, NS4" />
        <meta property="og:title" content="EDUPRENEURS - L'Éducation Haïtienne Révolutionnée par l'IA" />
        <meta property="og:description" content="Plateforme éducative avec assistant IA personnalisé. Programme MENFP complet. Essai gratuit 7 jours." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_HT" />
        <link rel="canonical" href="https://edupreneurs.app" />
      </Helmet>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-3">
            <img 
              src={edupreneursLogo} 
              alt="EDUPRENEURS Logo" 
              width={45}
              height={56}
              className="h-8 sm:h-12 w-auto object-contain" 
              loading="eager"
              fetchPriority="high"
            />
          </Link>
          
          {/* Navigation Menu - Hidden on tablet, shown on large screens */}
          <nav className="hidden lg:flex items-center gap-5">
            <a href="#accueil" className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm">
              Accueil
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#comment-ca-marche" className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm">
              Comment ça marche
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#courses" className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm">
              Cours
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm">
              À propos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#faq" className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm">
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <ThemeToggle />
            <Link to="/auth?tab=login" className="hidden lg:inline-block">
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105">
                Se connecter
              </Button>
            </Link>
            <Link to="/auth?tab=signup" className="hidden lg:inline-block">
              <Button size="sm" className="bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-400 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Créer un compte
              </Button>
            </Link>
            <button 
              className="lg:hidden p-1.5 sm:p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <nav className="flex flex-col p-3 gap-2">
              <a href="#accueil" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Accueil</a>
              <a href="#comment-ca-marche" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
              <a href="#courses" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Cours</a>
              <a href="#about" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>À propos</a>
              <a href="#faq" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#contact" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                <Link to="/auth?tab=login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/auth?tab=signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:opacity-90 text-sm">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section id="accueil" className="relative pt-2 pb-6 xs:pt-2 xs:pb-8 sm:pt-3 sm:pb-12 md:pt-4 md:pb-16 lg:pt-4 lg:pb-20 px-2 xs:px-3 sm:px-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto grid md:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-10 items-center">
          <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 z-10 px-2 xs:px-0 animate-fade-in">
            {/* Target Audience Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary">
              <GraduationCap className="w-4 h-4" />
              <span>Pour les élèves de 7AF à NS4</span>
            </div>
            
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
              L'Éducation Haïtienne{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                révolutionnée
              </span>{" "}
              par l'Intelligence Artificielle
            </h1>
            
            {/* Clear Tagline */}
            <p className="text-sm sm:text-base lg:text-lg font-semibold text-primary">
              Plateforme d'éducation interactive en Haïti avec IA pour apprendre et réussir
            </p>
            
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
              Programme complet du MENFP avec assistant IA personnalisé. Apprenez à votre rythme, 
              gagnez des récompenses, et préparez-vous aux examens officiels.
            </p>

            {/* How It Works Quick Steps */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-2 sm:py-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">1</span>
                <span className="font-medium">Inscrivez-vous</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs sm:text-sm">2</span>
                <span className="font-medium">Choisissez votre niveau</span>
              </div>
              <span className="text-muted-foreground hidden sm:inline">→</span>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">3</span>
                <span className="font-medium">Apprenez avec Jude</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4">
              <Link to="/auth?tab=signup" className="w-full sm:w-auto group">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl text-[11px] xs:text-xs sm:text-sm lg:text-base py-2 xs:py-2.5 font-bold transition-all duration-300 ease-out hover:scale-[1.02]">
                  Créer un compte
                </Button>
              </Link>
              <Link to="/auth?tab=login" className="w-full sm:w-auto group">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[11px] xs:text-xs sm:text-sm lg:text-base py-2 xs:py-2.5 font-bold shadow-md hover:shadow-lg transition-all duration-300 ease-out hover:scale-[1.02]">
                  Se connecter
                </Button>
              </Link>
            </div>
            
            {/* Explorer sans inscription link */}
            <div className="mt-2">
              <button 
                onClick={() => setShowVisitorSelector(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors ease-out cursor-pointer"
              >
                <span className="underline underline-offset-2">Explorer sans inscription</span>
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6">
              {heroStats.map((stat, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] group">
                  <CardContent className="p-3 sm:p-4 lg:p-5 text-center min-w-[80px] sm:min-w-[100px] lg:min-w-[110px]">
                    {!statsLoaded ? (
                      <div className="space-y-2">
                        <div className="h-6 sm:h-7 lg:h-8 bg-muted/50 rounded animate-pulse mx-auto w-12 sm:w-14 lg:w-16" />
                        <div className="h-3 sm:h-3.5 bg-muted/30 rounded animate-pulse mx-auto w-10 sm:w-12" />
                      </div>
                    ) : (
                      <>
                        <div className="text-base sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform ease-out whitespace-nowrap">{stat.number}</div>
                        <div className="text-[9px] sm:text-xs lg:text-sm text-muted-foreground font-bold uppercase leading-tight whitespace-nowrap">{stat.label}</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center relative order-first md:order-last mt-4 sm:mt-0">
            {shouldShowBlur && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl opacity-40"></div>
            )}
            <img 
              src={ericCelebrating} 
              alt="Jude - Assistant IA EDUPRENEURS" 
              className="w-full max-w-[200px] sm:max-w-[280px] md:max-w-md drop-shadow-xl hover:scale-[1.02] transition-transform duration-500 ease-out relative z-10"
              loading="eager"
              fetchPriority="high"
              width={448}
              height={672}
            />
          </div>
        </div>
      </section>


      {/* Features Highlight */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 sm:mb-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
                Projet Phare 2025 : Révolutionner l'Éducation Haïtienne
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                Système d'instruction entièrement basé sur le programme du MENFP avec des méthodes d'apprentissage technologiques innovantes
              </p>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericPointingRight} 
                alt="Eric vous guide" 
                width={160}
                height={240}
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain animate-[float_4s_ease-in-out_infinite] drop-shadow-xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group hover:scale-[1.02] transition-all duration-300 ease-out bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 hover:shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                <CardHeader className="p-4 sm:p-6 relative z-10">
                  <div className="mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300 ease-out">{feature.icon}</div>
                  <CardTitle className="text-lg sm:text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 relative z-10">
                  <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced "Comment ça marche" Section */}
      <section id="comment-ca-marche" className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
              Comment ça marche
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              En 4 étapes simples, commencez votre parcours d'apprentissage personnalisé
            </p>
          </div>
          
          {/* 4 Steps Visual */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
            {[
              { 
                step: 1, 
                image: "/images/writing-logo.webp",
                title: "Créez votre compte", 
                desc: "Inscription gratuite en 2 minutes. Essai gratuit de 7 jours sans engagement.",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                step: 2, 
                image: "/images/graduation.webp",
                title: "Choisissez votre niveau", 
                desc: "De la 7AF à NS4 - Sélectionnez votre classe pour un contenu adapté au programme MENFP.",
                color: "from-green-500 to-emerald-500"
              },
              { 
                step: 3, 
                image: "/images/jude-profile.png",
                title: "Rencontrez Jude", 
                desc: "Votre assistant IA personnel vous accompagne 24h/7j en créole ou français.",
                color: "from-primary to-accent"
              },
              { 
                step: 4, 
                image: "/images/champion.png",
                title: "Gagnez des Gold", 
                desc: "Réussissez les quiz, gagnez des récompenses et débloquez des fonctions premium !",
                color: "from-yellow-500 to-orange-500"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Connector line */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0"></div>
                )}
                <Card className="relative z-10 h-full hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>
                  <CardHeader className="text-center pb-2">
                  <div className="w-20 h-20 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 ease-out">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                      {item.step}
                    </div>
                    <CardTitle className="text-lg font-bold text-primary">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center px-2">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl font-bold transition-all duration-300 ease-out hover:scale-[1.02] text-xs sm:text-sm px-4 sm:px-6 md:px-8">
                <span className="hidden sm:inline">Créer un compte - C'est gratuit</span>
                <span className="sm:hidden">Créer un compte</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
              Fonctionnalités de la Plateforme
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
              Découvrez toutes les fonctionnalités qui font d'EDUPRENEURS la plateforme éducative la plus complète d'Haïti
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {platformFeatures.map((feature, idx) => (
              <Link key={idx} to={feature.link} className="group">
                <Card className="h-full hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}></div>
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 ease-out shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-primary group-hover:text-accent transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-sm font-medium leading-relaxed">{feature.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${feature.color} text-white shadow-md`}>
                      {feature.highlight}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Courses */}
      <section id="courses" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-primary mb-3 sm:mb-4">
            Nos cours disponibles
          </h2>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            Programme complet du MENFP de la 7AF à NS4 (Terminale)
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: <Calculator className="w-12 h-12 text-primary" />, title: "Mathématiques", desc: "Algèbre, géométrie, statistiques, probabilités. Tous les chapitres du programme MENFP avec explications simples et quiz amusants.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: <PenLine className="w-12 h-12 text-primary" />, title: "Français", desc: "Grammaire, conjugaison, expression écrite et orale. Maîtrisez la langue française avec votre assistant IA personnalisé.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: <FlaskConical className="w-12 h-12 text-primary" />, title: "Sciences", desc: "Physique, chimie, biologie, sciences de la terre. Expériences virtuelles et schémas explicatifs pour comprendre la nature.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: <Globe className="w-12 h-12 text-primary" />, title: "Sciences Sociales", desc: "Histoire d'Haïti, géographie, éducation civique. Découvrez votre pays et le monde avec des cartes interactives.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: <Languages className="w-12 h-12 text-primary" />, title: "Anglais", desc: "Grammaire anglaise, vocabulaire, conversation. Apprenez l'anglais avec des méthodes modernes et interactives.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: <BookOpen className="w-12 h-12 text-primary" />, title: "Créole", desc: "Langue maternelle haïtienne, orthographe créole, expression orale. Valorisez votre culture et votre identité.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: <Laptop className="w-12 h-12 text-primary" />, title: "Informatique", desc: "Bureautique, navigation internet, sécurité numérique. Maîtrisez les outils numériques essentiels pour le 21ème siècle.", levels: ["7AF - NS4", "Compétences numériques"] }
            ].map((course, idx) => (
              <Card key={idx} className="group hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-xl border-primary/20 hover:border-primary/40">
                <CardHeader>
                  <div className="mb-4 group-hover:scale-105 transition-transform duration-300 ease-out">{course.icon}</div>
                  <CardTitle className="font-bold text-primary">{course.title}</CardTitle>
                  <CardDescription className="font-medium">{course.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.levels.map((level, lidx) => (
                      <span 
                        key={lidx} 
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="relative mt-16 max-w-4xl mx-auto bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 overflow-hidden group hover:shadow-xl transition-all duration-300 ease-out">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Apprentissage personnalisé avec Jude</CardTitle>
              <CardDescription className="text-base font-medium">
                Votre assistant IA vous guide dans chaque matière, explique en créole ou français, et s'adapte à votre rythme. 
                Gagnez des Gold en réussissant les quiz et débloquez des fonctions premium !
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 relative z-10 px-3 xs:px-4 sm:px-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl font-bold transition-all duration-300 ease-out hover:scale-[1.02] text-xs sm:text-sm px-4 sm:px-6 md:px-8">
                  <span className="hidden sm:inline">Commencer l'apprentissage</span>
                  <span className="sm:hidden">Commencer</span>
                </Button>
              </Link>
              <div className="pt-4">
                <div className="w-64 h-64 mx-auto flex items-center justify-center">
                  <img
                    src="/images/jude-passion-discovery.png"
                    alt="Jude - Assistant IA personnalisé"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-background to-primary/5 overflow-visible">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="container mx-auto max-w-3xl">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 sm:mb-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-primary">Questions fréquentes</h2>
              <p className="text-muted-foreground font-medium">Tout ce que vous devez savoir sur EDUPRENEURS</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-40 sm:w-52 md:w-60 h-40 sm:h-52 md:h-60 flex items-center justify-center animate-float">
                <img
                  src="/images/jude-profile.png"
                  alt="Jude - Assistant FAQ"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {faqItems.map((faq, idx) => (
              <Card key={idx} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 hover:scale-[1.02] bg-gradient-to-r from-card to-card/50" onClick={() => toggleFaq(idx)}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center font-bold">
                    <span className="group-hover:text-primary transition-colors">{faq.q}</span>
                    <span className={`text-2xl transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      {expandedFaq === idx ? '−' : '+'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedFaq === idx && (
                  <CardContent className="animate-fade-in">
                    <p className="text-muted-foreground font-medium leading-relaxed">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative py-20 px-4 bg-gradient-to-br from-background to-accent/5 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-2xl opacity-40"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-2xl opacity-40"></div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12 animate-fade-in">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              À Propos d'EDUPRENEURS
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-primary">Notre Mission</h3>
              <blockquote className="text-foreground font-bold italic border-l-4 border-accent pl-4 py-2 bg-accent/5 rounded-r-lg">
                « L'éducation est l'arme la plus puissante pour transformer une nation » - Nelson Mandela
              </blockquote>
              <p className="text-muted-foreground leading-relaxed font-medium">
                En 2025, le système éducatif haïtien peine encore à répondre aux besoins du pays en matière d'efficacité. 
                Le pays se fait de plus en plus devancé au point de vue d'instruction par le biais technologique, 
                se trouvant totalement désuet dans ce monde dirigé par la technologie.
              </p>
              
              <h3 className="text-2xl font-black text-primary pt-4">Projet Phare 2025</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                EDUPRENEURS est né d'une vision claire : <span className="font-black text-foreground bg-gradient-to-r from-primary/20 to-accent/20 px-2 py-1 rounded">révolutionner l'éducation haïtienne</span> en 
                mettant en place un système d'instruction entièrement basé sur le programme du Ministère de l'Éducation Nationale 
                et de la Formation Professionnelle (MENFP).
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  { icon: <Target className="w-8 h-8 text-primary" />, title: "Apprentissage Personnalisé", desc: "Un système d'apprentissage entièrement personnalisé qui s'adapte au rythme de chaque élève" },
                  { icon: <Smartphone className="w-8 h-8 text-primary" />, title: "Accessible Partout", desc: "Accessible depuis n'importe quel smartphone, tablette ou PC - de la 7AF jusqu'à NS4 (Terminale)" },
                  { icon: <Coins className="w-8 h-8 text-primary" />, title: "Prix Abordable", desc: "Seulement 200 gourdes par mois avec une semaine d'essai gratuite pour démocratiser l'éducation" }
                ].map((point, idx) => (
                  <Card key={idx} className="group hover:shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] border-primary/20 hover:border-primary/40 bg-gradient-to-r from-card to-card/50">
                    <CardContent className="p-4 flex gap-4">
                      <div className="group-hover:scale-105 transition-transform duration-300 ease-out flex-shrink-0">{point.icon}</div>
                      <div>
                        <h4 className="font-black text-primary mb-1 text-base">{point.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{point.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card className="relative bg-gradient-to-br from-card via-primary/5 to-accent/10 shadow-xl border-2 border-primary/20 overflow-hidden group hover:shadow-2xl transition-all duration-500 ease-out">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Notre Vision pour Haïti</CardTitle>
                <CardDescription className="text-base font-medium leading-relaxed">
                  Nous croyons fermement qu'avec les bonnes méthodes, le programme du MENFP qui est assez généraliste 
                  pour certains a encore l'occasion d'impacter positivement l'avenir de notre pays.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {[
                  { title: "Conformité MENFP", desc: "100% aligné sur le programme officiel du Ministère de l'Éducation", icon: <CheckCircle className="w-6 h-6 text-primary" /> },
                  { title: "Formation Continue", desc: "Mises à jour trimestrielles pour optimiser l'expérience utilisateur", icon: <RefreshCw className="w-6 h-6 text-primary" /> },
                  { title: "Communauté", desc: "Panels de chat entre élèves utilisant le système Gold pour créer une véritable communauté d'apprentissage", icon: <Users className="w-6 h-6 text-primary" /> }
                ].map((item, idx) => (
                  <div key={idx} className="group/item p-4 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 rounded-xl border-l-4 border-accent hover:border-primary transition-all duration-300 hover:shadow-lg hover:translate-x-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{item.icon}</div>
                      <div>
                        <h4 className="font-black text-primary mb-2 text-base">{item.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
              L'équipe EDUPRENEURS
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Des passionnés dédiés à transformer l'éducation haïtienne
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member, idx) => (
              <Card key={idx} className="group hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-lg border-0 bg-card text-center overflow-hidden">
                <CardHeader className="pb-3 pt-8">
                  {/* Stylized Initials Avatar */}
                  <div className={`w-20 h-20 mx-auto rounded-lg bg-gradient-to-br ${member.color} flex items-center justify-center mb-4 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 ease-out shadow-lg`}>
                    <span className="text-2xl font-black text-white tracking-tight">{member.initials}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{member.name}</CardTitle>
                  <CardDescription className="text-base font-semibold text-accent mt-1">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
              Contactez-nous
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Une question ? Besoin d'aide ? Notre équipe est là pour vous
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
            {/* Email */}
            <Card className="group hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 ease-out shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-primary">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:contact@mon-edupreneur.com" className="text-muted-foreground hover:text-primary font-medium transition-colors">
                  contact@mon-edupreneur.com
                </a>
                <p className="text-xs text-muted-foreground mt-2">Réponse sous 24h</p>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="group hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 ease-out shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-primary">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium">
                  Bientôt disponible
                </p>
                <p className="text-xs text-muted-foreground mt-2">Support en temps réel</p>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Suivez-nous sur les réseaux sociaux</p>
            <div className="flex justify-center gap-4">
              <a href="#" aria-label="Facebook (bientôt disponible)" className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:scale-[1.02] transition-all duration-300 ease-out cursor-not-allowed opacity-50 shadow-md">
                <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" aria-label="Instagram (bientôt disponible)" className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:scale-[1.02] transition-all duration-300 ease-out cursor-not-allowed opacity-50 shadow-md">
                <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="TikTok (bientôt disponible)" className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:scale-[1.02] transition-all duration-300 ease-out cursor-not-allowed opacity-50 shadow-md">
                <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 animate-fade-in">
            Rejoignez la révolution de l'éducation haïtienne
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto font-medium leading-relaxed">
            Transformez votre façon d'apprendre avec la technologie. Apprentissage personnalisé, assistant IA, et récompenses réelles vous attendent.
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl font-bold text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 hover:scale-[1.02] transition-all duration-300 ease-out">
              <span className="hidden sm:inline">Créer un compte gratuitement</span>
              <span className="sm:hidden">Créer un compte</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Updated */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 overflow-hidden">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
        
        <div className="container mx-auto relative z-10">
          {/* Logo and Tagline */}
          <div className="text-center mb-12">
            <img src={edupreneursLogo} alt="Edupreneurs" width={45} height={56} className="h-14 mx-auto mb-4 brightness-110" />
            <p className="text-slate-300 max-w-md mx-auto text-sm font-medium">
              Révolutionner l'éducation haïtienne avec l'intelligence artificielle
            </p>
          </div>
          
          {/* Links Grid - Updated */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Navigation */}
            <div className="text-center md:text-left">
              <h4 className="font-black text-white mb-4 text-lg tracking-wide">NAVIGATION</h4>
              <ul className="space-y-3">
                <li><a href="#accueil" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Accueil</a></li>
                <li><a href="#comment-ca-marche" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Comment ça marche</a></li>
                <li><a href="#courses" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Nos Cours</a></li>
                <li><Link to="/dashboard" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Dashboard</Link></li>
              </ul>
            </div>
            
            {/* À Propos */}
            <div className="text-center md:text-left">
              <h4 className="font-black text-white mb-4 text-lg tracking-wide">À PROPOS</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Notre Mission</a></li>
                <li><a href="#team" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> L'Équipe</a></li>
                <li><a href="#partners" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Nos Partenaires</a></li>
                <li><Link to="/exams-hub" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Préparation au Bac</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div className="text-center md:text-left">
              <h4 className="font-black text-white mb-4 text-lg tracking-wide">SUPPORT</h4>
              <ul className="space-y-3">
                <li><a href="#faq" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> FAQ</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Contact</a></li>
                <li><Link to="/resources" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Ressources</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-center md:text-left">
              <h4 className="font-black text-white mb-4 text-lg tracking-wide">LÉGAL</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy-policy" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Confidentialité</Link></li>
                <li><Link to="/cookie-settings" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Paramètres Cookies</Link></li>
                <li><Link to="/auth" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Se connecter</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">
              © 2025 EDUPRENEURS. Éducation de qualité pour Haïti 🇭🇹
            </p>
            <p className="text-slate-500 text-xs">
              Plateforme éducative basée sur le programme officiel du MENFP
            </p>
          </div>
        </div>
      </footer>

      {/* Home Page Chatbot - Lazy loaded for performance */}
      <Suspense fallback={<div />}>
        <HomeChatbot />
      </Suspense>

      {/* Visitor Type Selector Modal */}
      <VisitorTypeSelector 
        open={showVisitorSelector} 
        onOpenChange={setShowVisitorSelector} 
      />
    </div>
    </>
  );
};

export default Index;
