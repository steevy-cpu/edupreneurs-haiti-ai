import { 
  Target, 
  Coins, 
  Trophy, 
  Languages, 
  FileText, 
  Heart, 
  GraduationCap, 
  MessageCircle, 
  Newspaper, 
  Calculator, 
  PenLine, 
  FlaskConical, 
  Globe, 
  Laptop, 
  BookOpen,
  Smartphone,
  CheckCircle,
  RefreshCw,
  Users,
  HelpCircle
} from "lucide-react";
import { createElement } from "react";

// ============================================
// STATIC DATA - Never recreated on renders
// ============================================

export const DEFAULT_STATS = { lessons: 2800, exams: 90, users: 25 };

// Features Section
export const features = [
  { 
    iconName: "Target" as const, 
    title: "Apprentissage 100% Personnalisé", 
    desc: "L'agent IA s'adapte à votre niveau, de la 7AF à NS4 (programme MENFP complet)" 
  },
  { 
    iconName: "Coins" as const, 
    title: "Prix Dérisoire - 200 Gdes/mois", 
    desc: "Accessible à tous avec une semaine d'essai gratuite" 
  },
  { 
    iconName: "Trophy" as const, 
    title: "Système Gold Révolutionnaire", 
    desc: "Gagnez des points, débloquez des fonctions premium, et même de l'argent réel" 
  },
  { 
    iconName: "Languages" as const, 
    title: "Multilingue Intelligent", 
    desc: "Créole, Français, Anglais, Espagnol - Votre IA parle votre langue" 
  }
] as const;

// Platform Features Section
export const platformFeatures = [
  { 
    iconName: "FileText" as const, 
    title: "Hub des Examens Officiels", 
    desc: "Accédez aux examens officiels de 2011 à 2025. Préparez-vous avec les vrais sujets du MENFP et des corrections détaillées par notre IA.",
    highlightTemplate: "{exams}+ examens disponibles",
    color: "from-blue-500 to-cyan-500",
    link: "/exams-hub"
  },
  { 
    iconName: "Heart" as const, 
    title: "Découvre ta Passion", 
    desc: "Test de personnalité pour découvrir vos talents cachés. Explorez la musique, les arts, les échecs et la littérature avec notre guide interactif.",
    highlightTemplate: "4 domaines à explorer",
    color: "from-pink-500 to-rose-500",
    link: "/passion-discovery"
  },
  { 
    iconName: "GraduationCap" as const, 
    title: "Développement Personnel", 
    desc: "Modules d'éducation civique, leadership et développement personnel pour former des citoyens responsables et des leaders de demain.",
    highlightTemplate: "Formation complète",
    color: "from-purple-500 to-violet-500",
    link: "/passion-discovery"
  },
  { 
    iconName: "MessageCircle" as const, 
    title: "Messagerie & Communauté", 
    desc: "Discutez avec vos camarades et Jude votre assistant IA. Créez des groupes d'étude et partagez vos réussites.",
    highlightTemplate: "Chat en temps réel",
    color: "from-green-500 to-emerald-500",
    link: "/community"
  },
  { 
    iconName: "Newspaper" as const, 
    title: "Fil d'Actualité", 
    desc: "Restez connecté avec la communauté EDUPRENEURS. Partagez vos progrès, inspirez les autres et célébrez ensemble.",
    highlightTemplate: "Réseau social éducatif",
    color: "from-orange-500 to-amber-500",
    link: "/feed"
  },
  { 
    iconName: "Trophy" as const, 
    title: "Classement & Compétition", 
    desc: "Montez dans le classement en accumulant des Gold. Comparez-vous aux meilleurs élèves d'Haïti et gagnez des récompenses.",
    highlightTemplate: "Top étudiants",
    color: "from-yellow-500 to-orange-500",
    link: "/leaderboard"
  }
] as const;

// FAQ Items
export const faqItems = [
  { 
    q: "Comment m'inscrire à EDUPRENEURS ?", 
    a: "Créez un compte avec votre email, choisissez votre niveau académique et profitez de votre semaine d'essai gratuite. Ensuite, abonnez-vous pour seulement 200 gourdes par mois." 
  },
  { 
    q: "Comment fonctionne l'assistant IA ?", 
    a: "Votre assistant IA personnalisé vous aide dans toutes les matières, explique les leçons en créole ou français, et s'adapte à votre rythme d'apprentissage." 
  },
  { 
    q: "Qu'est-ce que le système Gold ?", 
    a: "Gagnez des points Gold en réussissant les quiz, utilisez-les pour débloquer des fonctions premium, changer votre avatar ou même gagner de l'argent réel." 
  },
  { 
    q: "Le contenu suit-il le programme officiel ?", 
    a: "Absolument ! Notre plateforme est entièrement basée sur le programme du Ministère de l'Éducation Nationale (MENFP) de la 7ème à la Terminale." 
  },
  { 
    q: "Comment contacter l'équipe EDUPRENEURS ?", 
    a: "Vous pouvez nous contacter par email à contact@edupreneurs.com ou via WhatsApp. Nous répondons généralement dans les 24 heures." 
  }
] as const;

// Team Members
export const teamMembers = [
  {
    name: "Djoodoodson F. FLORENT",
    role: "Fondateur & CEO",
    bio: "Passionné par l'éducation et la technologie, dédié à transformer l'éducation haïtienne.",
    image: "/blog-authors/djoodoodson.jpg"
  },
  {
    name: "Steeve Andolf Celestin",
    role: "CTO & Innovation",
    bio: "Expert en technologie et innovation, architecte des solutions numériques d'EDUPRENEURS.",
    image: "/blog-authors/steeve.jpeg"
  }
] as const;

// Courses Data
export const courses = [
  { 
    iconName: "Calculator" as const, 
    title: "Mathématiques", 
    desc: "Algèbre, géométrie, statistiques, probabilités. Tous les chapitres du programme MENFP avec explications simples et quiz amusants.", 
    levels: ["7AF - NS4", "Programme MENFP"] 
  },
  { 
    iconName: "PenLine" as const, 
    title: "Français", 
    desc: "Grammaire, conjugaison, expression écrite et orale. Maîtrisez la langue française avec votre assistant IA personnalisé.", 
    levels: ["7AF - NS4", "Programme MENFP"] 
  },
  { 
    iconName: "FlaskConical" as const, 
    title: "Sciences", 
    desc: "Physique, chimie, biologie, sciences de la terre. Expériences virtuelles et schémas explicatifs pour comprendre la nature.", 
    levels: ["7AF - NS4", "Programme MENFP"] 
  },
  { 
    iconName: "Globe" as const, 
    title: "Sciences Sociales", 
    desc: "Histoire d'Haïti, géographie, éducation civique. Découvrez votre pays et le monde avec des cartes interactives.", 
    levels: ["7AF - NS4", "Programme MENFP"] 
  },
  { 
    iconName: "Languages" as const, 
    title: "Anglais", 
    desc: "Grammaire anglaise, vocabulaire, conversation. Apprenez l'anglais avec des méthodes modernes et interactives.", 
    levels: ["7AF - NS4", "Programme MENFP"] 
  },
  { 
    iconName: "BookOpen" as const, 
    title: "Créole", 
    desc: "Langue maternelle haïtienne, orthographe créole, expression orale. Valorisez votre culture et votre identité.", 
    levels: ["7AF - NS4", "Programme MENFP"] 
  },
  { 
    iconName: "Laptop" as const, 
    title: "Informatique", 
    desc: "Bureautique, navigation internet, sécurité numérique. Maîtrisez les outils numériques essentiels pour le 21ème siècle.", 
    levels: ["7AF - NS4", "Compétences numériques"] 
  }
] as const;

// How It Works Steps
export const howItWorksSteps = [
  { 
    step: 1, 
    iconName: "GraduationCap" as const,
    title: "Créez un compte", 
    desc: "Inscrivez-vous en 30 secondes avec votre email et choisissez votre niveau (7AF à NS4).",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    step: 2, 
    iconName: "BookOpen" as const,
    title: "Choisissez une matière", 
    desc: "Explorez les cours alignés sur le programme MENFP et commencez votre apprentissage.",
    color: "from-purple-500 to-violet-500"
  },
  { 
    step: 3, 
    useImage: true,
    title: "Rencontrez Jude", 
    desc: "Votre assistant IA personnel vous accompagne 24h/7j en créole ou français.",
    color: "from-primary to-accent"
  },
  { 
    step: 4, 
    iconName: "Trophy" as const,
    title: "Gagnez des Gold", 
    desc: "Réussissez les quiz, gagnez des récompenses et débloquez des fonctions premium !",
    color: "from-yellow-500 to-orange-500"
  }
] as const;

// About Section Points
export const aboutPoints = [
  { 
    iconName: "Target" as const, 
    title: "Apprentissage Personnalisé", 
    desc: "Un système d'apprentissage entièrement personnalisé qui s'adapte au rythme de chaque élève" 
  },
  { 
    iconName: "Smartphone" as const, 
    title: "Accessible Partout", 
    desc: "Accessible depuis n'importe quel smartphone, tablette ou PC - de la 7AF jusqu'à NS4 (Terminale)" 
  },
  { 
    iconName: "Coins" as const, 
    title: "Prix Abordable", 
    desc: "Seulement 200 gourdes par mois avec une semaine d'essai gratuite pour démocratiser l'éducation" 
  }
] as const;

// Vision Points
export const visionPoints = [
  { 
    iconName: "CheckCircle" as const,
    title: "Conformité MENFP", 
    desc: "100% aligné sur le programme officiel du Ministère de l'Éducation" 
  },
  { 
    iconName: "RefreshCw" as const,
    title: "Formation Continue", 
    desc: "Mises à jour trimestrielles pour optimiser l'expérience utilisateur" 
  },
  { 
    iconName: "Users" as const,
    title: "Communauté", 
    desc: "Panels de chat entre élèves utilisant le système Gold pour créer une véritable communauté d'apprentissage" 
  }
] as const;

// Navigation Links
export const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#courses", label: "Cours" },
  { href: "#about", label: "À propos" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" }
] as const;

// Footer Links
export const footerLinks = {
  navigation: [
    { href: "#accueil", label: "Accueil" },
    { href: "#comment-ca-marche", label: "Comment ça marche" },
    { href: "#courses", label: "Nos Cours" },
    { to: "/blog", label: "Blog" }
  ],
  about: [
    { href: "#about", label: "Notre Mission" },
    { href: "#team", label: "L'Équipe" },
    { href: "#partners", label: "Nos Partenaires" },
    { to: "/exams-hub", label: "Préparation au Bac" }
  ],
  support: [
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
    { to: "/resources", label: "Ressources" }
  ],
  legal: [
    { to: "/privacy-policy", label: "Confidentialité" },
    { to: "/cookie-settings", label: "Paramètres Cookies" },
    { to: "/auth/login", label: "Se connecter" }
  ]
} as const;

// Icon mapping for runtime resolution
export const iconMap = {
  Target,
  Coins,
  Trophy,
  Languages,
  FileText,
  Heart,
  GraduationCap,
  MessageCircle,
  Newspaper,
  Calculator,
  PenLine,
  FlaskConical,
  Globe,
  Laptop,
  BookOpen,
  Smartphone,
  CheckCircle,
  RefreshCw,
  Users,
  HelpCircle
} as const;

// Helper to get icon component
export function getIcon(iconName: keyof typeof iconMap, className?: string) {
  const IconComponent = iconMap[iconName];
  return createElement(IconComponent, { className: className || "w-10 h-10 text-primary" });
}
