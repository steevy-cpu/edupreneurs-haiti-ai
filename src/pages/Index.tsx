import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ericCelebrating from "@/assets/eric-celebrating.png";
import ericMain01 from "@/assets/eric-main01.png";
import ericThinkingPose from "@/assets/eric-thinking-pose.png";
import ericPointingRight from "@/assets/eric-right-pointing.png";
import heroImage from "@/assets/hero-education.jpg";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, BookOpen, Trophy, MessageCircle, Newspaper, Users, GraduationCap, Heart, FileText, Mail, Phone, MapPin } from "lucide-react";

// Lazy load chatbot for better initial page load
const HomeChatbot = lazy(() => import("@/components/HomeChatbot").then(module => ({ default: module.HomeChatbot })));

// Default fallback values
const DEFAULT_STATS = { lessons: 2500, exams: 85, users: 10 };

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsLoaded, setStatsLoaded] = useState(false);

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

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime updates for changes
    const channel = supabase
      .channel('homepage-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'official_exams' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

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
    { icon: "🎯", title: "Apprentissage 100% Personnalisé", desc: "L'agent IA s'adapte à votre niveau, de la 7AF à NS4 (programme MENFP complet)" },
    { icon: "💰", title: "Prix Dérisoire - 200 Gdes/mois", desc: "Accessible à tous avec une semaine d'essai gratuite" },
    { icon: "🏆", title: "Système Gold Révolutionnaire", desc: "Gagnez des points, débloquez des fonctions premium, et même de l'argent réel" },
    { icon: "🌐", title: "Multilingue Intelligent", desc: "Créole, Français, Anglais, Espagnol - Votre IA parle votre langue" }
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
      name: "Fondateur",
      role: "CEO & Visionnaire",
      bio: "Passionné par l'éducation et la technologie, dédié à transformer l'éducation haïtienne.",
      placeholder: true
    },
    {
      name: "Directeur Pédagogique",
      role: "Contenu & Curriculum",
      bio: "Expert en pédagogie avec une profonde connaissance du programme MENFP.",
      placeholder: true
    },
    {
      name: "Directeur Technique",
      role: "CTO & Innovation",
      bio: "Spécialiste en intelligence artificielle et développement de plateformes éducatives.",
      placeholder: true
    }
  ], []);

  return (
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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-3">
            <img src={edupreneursLogo} alt="EDUPRENEURS Logo" className="h-8 sm:h-12 w-auto object-contain" loading="eager" decoding="async" />
          </Link>
          
          {/* Updated Navigation Menu */}
          <nav className="hidden md:flex items-center gap-5">
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

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <ThemeToggle />
            <Link to="/auth" className="hidden sm:inline-block">
              <Button size="sm" className="bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-400 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Se connecter
              </Button>
            </Link>
            <button 
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Updated */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <nav className="flex flex-col p-3 gap-2">
              <a href="#accueil" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Accueil</a>
              <a href="#comment-ca-marche" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
              <a href="#courses" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Cours</a>
              <a href="#about" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>À propos</a>
              <a href="#faq" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#contact" className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <Link to="/auth" className="sm:hidden">
                <Button size="sm" className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:opacity-90 text-sm">
                  Se connecter
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section id="accueil" className="relative py-6 xs:py-8 sm:py-12 md:py-16 lg:py-20 px-2 xs:px-3 sm:px-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
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
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent relative animate-shimmer bg-[length:200%_auto]">
                révolutionnée
                <span className="absolute -right-4 xs:-right-6 sm:-right-8 -top-1 xs:-top-2 text-base xs:text-xl sm:text-2xl animate-pulse">✨</span>
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
              <Link to="/auth" className="w-full sm:w-auto group">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-2xl text-[11px] xs:text-xs sm:text-sm lg:text-base py-2 xs:py-2.5 font-bold transition-all duration-300 hover:scale-105">
                  🚀 Commencer Maintenant
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto group">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[11px] xs:text-xs sm:text-sm lg:text-base py-2 xs:py-2.5 font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                  📱 Essai Gratuit 7 Jours
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6">
              {heroStats.map((stat, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-3 sm:p-4 lg:p-5 text-center min-w-[80px] sm:min-w-[100px] lg:min-w-[110px]">
                    <div className="text-base sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform whitespace-nowrap">{stat.number}</div>
                    <div className="text-[9px] sm:text-xs lg:text-sm text-muted-foreground font-bold uppercase leading-tight whitespace-nowrap">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center relative order-first md:order-last mt-4 sm:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
            <img 
              src={ericCelebrating} 
              alt="Jude - Assistant IA EDUPRENEURS" 
              className="w-full max-w-[200px] sm:max-w-[280px] md:max-w-md drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Revolution Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gradient-to-b from-primary/5 to-background text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-4 sm:mb-6 leading-tight animate-fade-in">
            Une révolution nécessaire pour Haïti 🇭🇹
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2 font-medium">
            En 2025, le système éducatif peine à répondre au besoin éducatif. Nous croyons fermement qu'avec les bonnes méthodes 
            et la technologie, le programme du MENFP peut enfin impacter positivement notre jeunesse.
          </p>
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <img src={heroImage} alt="Étudiants haïtiens apprenant avec EDUPRENEURS" className="relative h-32 sm:h-40 lg:h-44 rounded-xl sm:rounded-2xl shadow-2xl mx-auto border-2 border-primary/20 group-hover:scale-105 transition-transform duration-300" loading="eager" decoding="async" />
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 sm:mb-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
                🇭🇹 Projet Phare 2025 : Révolutionner l'Éducation Haïtienne
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                Système d'instruction entièrement basé sur le programme du MENFP avec des méthodes d'apprentissage technologiques innovantes
              </p>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericPointingRight} 
                alt="Eric vous guide" 
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain animate-[float_4s_ease-in-out_infinite] drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 hover:shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="p-4 sm:p-6 relative z-10">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
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
              🎯 Comment ça marche ?
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
                icon: "📝", 
                title: "Créez votre compte", 
                desc: "Inscription gratuite en 2 minutes. Essai gratuit de 7 jours sans engagement.",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                step: 2, 
                icon: "🎓", 
                title: "Choisissez votre niveau", 
                desc: "De la 7AF à NS4 - Sélectionnez votre classe pour un contenu adapté au programme MENFP.",
                color: "from-green-500 to-emerald-500"
              },
              { 
                step: 3, 
                icon: "🤖", 
                title: "Rencontrez Jude", 
                desc: "Votre assistant IA personnel vous accompagne 24h/7j en créole ou français.",
                color: "from-purple-500 to-violet-500"
              },
              { 
                step: 4, 
                icon: "🏆", 
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
                <Card className="relative z-10 h-full hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>
                  <CardHeader className="text-center pb-2">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{item.icon}</span>
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
          <div className="text-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-2xl font-bold transition-all duration-300 hover:scale-105">
                🚀 Commencer maintenant - C'est gratuit !
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
              ✨ Fonctionnalités de la Plateforme
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
              Découvrez toutes les fonctionnalités qui font d'EDUPRENEURS la plateforme éducative la plus complète d'Haïti
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {platformFeatures.map((feature, idx) => (
              <Link key={idx} to={feature.link} className="group">
                <Card className="h-full hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}></div>
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
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

      {/* Categories - Learning Features */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
            📚 <span className="text-primary">Apprentissage personnalisé avec Jude</span>
          </h2>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Votre assistant IA personnalisé vous accompagne dans chaque matière du programme MENFP
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                icon: "🤖", 
                title: "Assistant IA Personnalisé", 
                desc: "Jude explique chaque leçon en créole ou français, s'adapte à votre rythme et répond à toutes vos questions 24h/7j.",
                features: ["✓ Explications simples", "✓ Support multilingue", "✓ Disponible partout"],
                featured: true
              },
              { 
                icon: "🏆", 
                title: "Système Gold Gamifié", 
                desc: "Gagnez des points Gold à chaque quiz réussi. Débloquez des fonctions premium, changez votre avatar, ou même gagnez de l'argent réel !",
                features: ["✓ Récompenses réelles", "✓ Motivation constante", "✓ Fonctions premium"]
              },
              { 
                icon: "📚", 
                title: "Programme MENFP Complet", 
                desc: "De la 7ème à la Terminale, tous les contenus officiels du Ministère de l'Éducation avec vidéos, schémas et quiz interactifs.",
                features: ["✓ 100% conforme MENFP", "✓ Vidéos explicatives", "✓ Quiz amusants"]
              },
              { 
                icon: "🌍", 
                title: "Langues & Culture", 
                desc: "Français, créole, anglais, espagnol - maîtrisez les langues avec votre assistant multilingue et découvrez la culture haïtienne.",
                features: ["✓ 4 langues", "✓ Culture haïtienne", "✓ Méthodes modernes"]
              },
              { 
                icon: "📱", 
                title: "Accessible Partout", 
                desc: "Smartphone, tablette, PC - apprenez depuis n'importe quel appareil, même avec une connexion lente. Prix dérisoire : 200 gourdes/mois.",
                features: ["✓ Multi-appareils", "✓ Mode hors ligne", "✓ Prix abordable"]
              }
              ].map((cat, idx) => (
              <Card key={idx} className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl ${cat.featured ? 'border-2 border-accent bg-gradient-to-br from-accent/10 to-background relative overflow-hidden' : 'border-primary/20 hover:border-primary/40'}`}>
                {cat.featured && <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">Populaire</div>}
                <CardHeader>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <CardTitle className="text-xl text-primary font-bold">{cat.title}</CardTitle>
                  <CardDescription className="font-medium">{cat.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {cat.features.map((feature, fidx) => (
                      <div key={fidx} className="text-sm text-primary font-semibold flex items-center gap-2">
                        <span className="text-accent">→</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-primary mb-3 sm:mb-4">
            📚 Nos cours disponibles
          </h2>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            Programme complet du MENFP de la 7AF à NS4 (Terminale)
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "🔢", title: "Mathématiques", desc: "Algèbre, géométrie, statistiques, probabilités. Tous les chapitres du programme MENFP avec explications simples et quiz amusants.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: "📝", title: "Français", desc: "Grammaire, conjugaison, expression écrite et orale. Maîtrisez la langue française avec votre assistant IA personnalisé.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: "🔬", title: "Sciences", desc: "Physique, chimie, biologie, sciences de la terre. Expériences virtuelles et schémas explicatifs pour comprendre la nature.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: "🌍", title: "Sciences Sociales", desc: "Histoire d'Haïti, géographie, éducation civique. Découvrez votre pays et le monde avec des cartes interactives.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: "🇺🇸", title: "Anglais", desc: "Grammaire anglaise, vocabulaire, conversation. Apprenez l'anglais avec des méthodes modernes et interactives.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: "🇭🇹", title: "Créole", desc: "Langue maternelle haïtienne, orthographe créole, expression orale. Valorisez votre culture et votre identité.", levels: ["7AF - NS4", "Programme MENFP"] },
              { icon: "💻", title: "Informatique", desc: "Bureautique, navigation internet, sécurité numérique. Maîtrisez les outils numériques essentiels pour le 21ème siècle.", levels: ["7AF - NS4", "Compétences numériques"] }
            ].map((course, idx) => (
              <Card key={idx} className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40">
                <CardHeader>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{course.icon}</div>
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
          
          <Card className="relative mt-16 max-w-4xl mx-auto bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">🎯 Apprentissage personnalisé avec Jude</CardTitle>
              <CardDescription className="text-base font-medium">
                Votre assistant IA vous guide dans chaque matière, explique en créole ou français, et s'adapte à votre rythme. 
                Gagnez des Gold en réussissant les quiz et débloquez des fonctions premium !
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 relative z-10">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-2xl font-bold transition-all duration-300 hover:scale-105">
                  🚀 Commencer l'apprentissage
                </Button>
              </Link>
              <div className="pt-4">
                <img src={ericMain01} alt="Jude - Assistant IA" className="w-64 mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-background to-primary/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="container mx-auto max-w-3xl">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 sm:mb-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-primary">Questions fréquentes</h2>
              <p className="text-muted-foreground font-medium">Tout ce que vous devez savoir sur EDUPRENEURS</p>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericThinkingPose} 
                alt="Eric réfléchit à vos questions" 
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain animate-float drop-shadow-xl"
                loading="lazy"
                decoding="async"
              />
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
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12 animate-fade-in">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              🇭🇹 À Propos d'EDUPRENEURS
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
              
              <h3 className="text-2xl font-black text-primary pt-4">Projet Phare 2025 🚀</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                EDUPRENEURS est né d'une vision claire : <span className="font-black text-foreground bg-gradient-to-r from-primary/20 to-accent/20 px-2 py-1 rounded">révolutionner l'éducation haïtienne</span> en 
                mettant en place un système d'instruction entièrement basé sur le programme du Ministère de l'Éducation Nationale 
                et de la Formation Professionnelle (MENFP).
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  { icon: "🎯", title: "Apprentissage Personnalisé", desc: "Un système d'apprentissage entièrement personnalisé qui s'adapte au rythme de chaque élève" },
                  { icon: "📱", title: "Accessible Partout", desc: "Accessible depuis n'importe quel smartphone, tablette ou PC - de la 7AF jusqu'à NS4 (Terminale)" },
                  { icon: "💰", title: "Prix Abordable", desc: "Seulement 200 gourdes par mois avec une semaine d'essai gratuite pour démocratiser l'éducation" }
                ].map((point, idx) => (
                  <Card key={idx} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20 hover:border-primary/40 bg-gradient-to-r from-card to-card/50">
                    <CardContent className="p-4 flex gap-4">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{point.icon}</div>
                      <div>
                        <h4 className="font-black text-primary mb-1 text-base">{point.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{point.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card className="relative bg-gradient-to-br from-card via-primary/5 to-accent/10 shadow-2xl border-2 border-primary/20 overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">🚀 Notre Vision pour Haïti</CardTitle>
                <CardDescription className="text-base font-medium leading-relaxed">
                  Nous croyons fermement qu'avec les bonnes méthodes, le programme du MENFP qui est assez généraliste 
                  pour certains a encore l'occasion d'impacter positivement l'avenir de notre pays.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {[
                  { title: "Conformité MENFP", desc: "100% aligné sur le programme officiel du Ministère de l'Éducation", icon: "✓" },
                  { title: "Formation Continue", desc: "Mises à jour trimestrielles pour optimiser l'expérience utilisateur", icon: "↻" },
                  { title: "Communauté", desc: "Panels de chat entre élèves utilisant le système Gold pour créer une véritable communauté d'apprentissage", icon: "👥" }
                ].map((item, idx) => (
                  <div key={idx} className="group/item p-4 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 rounded-xl border-l-4 border-accent hover:border-primary transition-all duration-300 hover:shadow-lg hover:translate-x-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
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
              👥 L'équipe derrière EDUPRENEURS
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Des passionnés dédiés à transformer l'éducation haïtienne
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, idx) => (
              <Card key={idx} className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 text-center overflow-hidden">
                <CardHeader className="pb-2">
                  {/* Placeholder Avatar */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-primary/20">
                    <Users className="w-12 h-12 text-primary/50" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">{member.name}</CardTitle>
                  <CardDescription className="text-sm font-semibold text-accent">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-muted-foreground mt-8 text-sm italic">
            Photos et informations détaillées bientôt disponibles
          </p>
        </div>
      </section>

      {/* Partnership Section (Placeholder) */}
      <section id="partners" className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
              🤝 Nos Partenaires
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Ensemble pour transformer l'éducation haïtienne
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <img 
                src={edupreneursLogo} 
                alt="EDUPRENEURS" 
                className="relative h-20 sm:h-24 object-contain grayscale-0 hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>
          
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-card to-card/50 border-primary/20 text-center">
            <CardContent className="p-6 sm:p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-bold text-primary mb-2">Partenariats en cours de développement</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Nous travaillons activement à établir des partenariats avec des organisations éducatives, 
                des institutions haïtiennes et des acteurs du secteur technologique. 
                Restez à l'écoute pour les annonces à venir !
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Intéressé par un partenariat ? <a href="#contact" className="text-primary font-semibold hover:underline">Contactez-nous</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
              📞 Contactez-nous
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Une question ? Besoin d'aide ? Notre équipe est là pour vous
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Email */}
            <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-primary">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:contact@edupreneurs.app" className="text-muted-foreground hover:text-primary font-medium transition-colors">
                  contact@edupreneurs.app
                </a>
                <p className="text-xs text-muted-foreground mt-2">Réponse sous 24h</p>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
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

            {/* Location */}
            <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 text-center sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-primary">Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium">
                  Haïti 🇭🇹
                </p>
                <p className="text-xs text-muted-foreground mt-2">Plateforme 100% haïtienne</p>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Suivez-nous sur les réseaux sociaux</p>
            <div className="flex justify-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-lg">📘</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-lg">📸</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-lg">🐦</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-lg">▶️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 animate-fade-in">
            Rejoignez la révolution de l'éducation haïtienne 🚀
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto font-medium leading-relaxed">
            Transformez votre façon d'apprendre avec la technologie. Apprentissage personnalisé, assistant IA, et récompenses réelles vous attendent.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl font-bold text-base px-8 py-6 hover:scale-105 transition-all duration-300">
              Commencez votre essai gratuit ✨
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
            <img src={edupreneursLogo} alt="Edupreneurs" className="h-14 mx-auto mb-4 brightness-110" />
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
    </div>
  );
};

export default Index;
