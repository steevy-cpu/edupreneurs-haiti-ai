import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ericMain00 from "@/assets/eric-main00.png";
import ericMain01 from "@/assets/eric-main01.png";
import heroImage from "@/assets/hero-education.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={heroImage} alt="EDUPRENEURS Logo" className="h-10 rounded-lg shadow-sm" />
            <span className="text-xl font-bold text-primary">EDUPRENEURS</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#accueil" className="text-foreground hover:text-primary transition-colors font-medium">Accueil</a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">Fonctionnalités</a>
            <a href="#courses" className="text-foreground hover:text-primary transition-colors font-medium">Cours</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">À propos</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-accent to-yellow-500 hover:opacity-90">
                Se connecter
              </Button>
            </Link>
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <nav className="flex flex-col p-4 gap-2">
              <a href="#accueil" className="py-2 px-4 hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Accueil</a>
              <a href="#features" className="py-2 px-4 hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
              <a href="#courses" className="py-2 px-4 hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Cours</a>
              <a href="#about" className="py-2 px-4 hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>À propos</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="accueil" className="py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              L'Éducation Haïtienne{" "}
              <span className="gradient-text relative">
                révolutionnée
                <span className="absolute -right-8 -top-2 text-2xl animate-pulse">✨</span>
              </span>{" "}
              par l'Intelligence Artificielle
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              "L'éducation est l'arme la plus puissante pour transformer une nation" - Nelson Mandela. 
              En 2025, le système éducatif haïtien peine encore à répondre aux besoins du pays. 
              EDUPRENEURS change la donne avec un apprentissage entièrement personnalisé, basé sur le programme MENFP.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-lg">
                  🚀 Commencer Maintenant
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  📱 Essai Gratuit 7 Jours
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-6">
              {[
                { number: "200", label: "Gourdes/mois" },
                { number: "7j", label: "Essai gratuit" },
                { number: "24/7", label: "Assistant IA" },
                { number: "7ème-Term", label: "Tous niveaux" }
              ].map((stat, idx) => (
                <Card key={idx} className="flex-1 min-w-[100px] bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-black text-primary">{stat.number}</div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center relative">
            <img 
              src={ericMain00} 
              alt="Eric - Assistant IA EDUPRENEURS" 
              className="w-full max-w-md animate-[float_4s_ease-in-out_infinite] drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Revolution Section */}
      <section className="py-20 px-4 bg-background text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-primary mb-6">
            Une révolution nécessaire pour Haïti
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            En 2025, le système éducatif peine à répondre au besoin éducatif. Nous croyons fermement qu'avec les bonnes méthodes 
            et la technologie, le programme du MENFP peut enfin impacter positivement notre jeunesse.
          </p>
          <img src={heroImage} alt="EDUPRENEURS Logo" className="h-44 rounded-2xl shadow-xl mx-auto" />
        </div>
      </section>

      {/* Features Highlight */}
      <section id="features" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-primary mb-4">
            🇭🇹 Projet Phare 2025 : Révolutionner l'Éducation Haïtienne
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Système d'instruction entièrement basé sur le programme du MENFP avec des méthodes d'apprentissage technologiques innovantes
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎯", title: "Apprentissage 100% Personnalisé", desc: "L'agent IA s'adapte à votre niveau, de la 7ème à la préparation universitaire" },
              { icon: "💰", title: "Prix Dérisoire - 200 Gdes/mois", desc: "Accessible à tous avec une semaine d'essai gratuite" },
              { icon: "🏆", title: "Système Gold Révolutionnaire", desc: "Gagnez des points, débloquez des fonctions premium, et même de l'argent réel" },
              { icon: "🌐", title: "Multilingue Intelligent", desc: "Créole, Français, Anglais, Espagnol - Votre IA parle votre langue" }
            ].map((feature, idx) => (
              <Card key={idx} className="hover:scale-105 transition-transform duration-300 card-glow">
                <CardHeader>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            🎯 Comment ça marche : <span className="text-primary">Apprentissage personnalisé avec Eric</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Votre assistant IA personnalisé vous accompagne dans chaque matière du programme MENFP
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: "🤖", 
                title: "Assistant IA Personnalisé", 
                desc: "Eric explique chaque leçon en créole ou français, s'adapte à votre rythme et répond à toutes vos questions 24h/7j.",
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
                icon: "🎓", 
                title: "Préparation Universitaire", 
                desc: "Préparez-vous aux concours d'admission avec les sujets des 10 dernières années et un accompagnement personnalisé.",
                features: ["✓ Archives 10 ans", "✓ Simulations d'examen", "✓ Coaching IA"]
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
              <Card key={idx} className={`hover:scale-105 transition-transform duration-300 ${cat.featured ? 'border-2 border-accent bg-gradient-to-br from-accent/5 to-background' : ''}`}>
                <CardHeader>
                  <div className="text-4xl mb-4">{cat.icon}</div>
                  <CardTitle className="text-xl text-primary">{cat.title}</CardTitle>
                  <CardDescription>{cat.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {cat.features.map((feature, fidx) => (
                      <div key={fidx} className="text-sm text-primary font-medium">{feature}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-primary mb-4">
            📚 Nos cours disponibles
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Programme complet du MENFP de la 7ème à la Terminale, avec préparation universitaire
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🔢", title: "Mathématiques", desc: "Algèbre, géométrie, statistiques, probabilités. Tous les chapitres du programme MENFP avec explications simples et quiz amusants.", levels: ["7ème - Terminale", "Prépa Université"] },
              { icon: "📝", title: "Français", desc: "Grammaire, conjugaison, expression écrite et orale. Maîtrisez la langue française avec votre assistant IA personnalisé.", levels: ["7ème - Terminale", "Prépa Université"] },
              { icon: "🔬", title: "Sciences", desc: "Physique, chimie, biologie, sciences de la terre. Expériences virtuelles et schémas explicatifs pour comprendre la nature.", levels: ["7ème - Terminale", "Prépa Université"] },
              { icon: "🌍", title: "Sciences Sociales", desc: "Histoire d'Haïti, géographie, éducation civique. Découvrez votre pays et le monde avec des cartes interactives.", levels: ["7ème - Terminale", "Prépa Université"] },
              { icon: "🇺🇸", title: "Anglais", desc: "Grammaire anglaise, vocabulaire, conversation. Apprenez l'anglais avec des méthodes modernes et interactives.", levels: ["7ème - Terminale", "Prépa Université"] },
              { icon: "🇭🇹", title: "Créole", desc: "Langue maternelle haïtienne, orthographe créole, expression orale. Valorisez votre culture et votre identité.", levels: ["7ème - Terminale", "Prépa Université"] },
              { icon: "🎓", title: "Préparation Universitaire", desc: "Concours d'admission des 10 dernières années, simulations d'examen, coaching IA. Préparez-vous aux meilleures universités.", levels: ["Archives 10 ans", "Simulations"], featured: true },
              { icon: "💻", title: "Informatique", desc: "Bureautique, navigation internet, sécurité numérique. Maîtrisez les outils numériques essentiels pour le 21ème siècle.", levels: ["7ème - Terminale", "Compétences numériques"] }
            ].map((course, idx) => (
              <Card key={idx} className={`hover:scale-105 transition-transform duration-300 ${course.featured ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-accent' : ''}`}>
                <CardHeader>
                  <div className="text-5xl mb-4">{course.icon}</div>
                  <CardTitle className={course.featured ? 'text-white' : ''}>{course.title}</CardTitle>
                  <CardDescription className={course.featured ? 'text-white/90' : ''}>{course.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.levels.map((level, lidx) => (
                      <span 
                        key={lidx} 
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.featured 
                            ? 'bg-white/20 text-white' 
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="mt-16 max-w-4xl mx-auto bg-gradient-to-br from-card to-card/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">🎯 Apprentissage personnalisé avec Eric</CardTitle>
              <CardDescription className="text-base">
                Votre assistant IA vous guide dans chaque matière, explique en créole ou français, et s'adapte à votre rythme. 
                Gagnez des Gold en réussissant les quiz et débloquez des fonctions premium !
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-lg">
                  🚀 Commencer l'apprentissage
                </Button>
              </Link>
              <div className="pt-4">
                <img src={ericMain01} alt="Eric - Assistant IA" className="w-64 mx-auto drop-shadow-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "Comment m'inscrire à EDUPRENEURS ?", a: "Créez un compte avec votre email, choisissez votre niveau académique et profitez de votre semaine d'essai gratuite. Ensuite, abonnez-vous pour seulement 200 gourdes par mois." },
              { q: "Comment fonctionne l'assistant IA ?", a: "Votre assistant IA personnalisé vous aide dans toutes les matières, explique les leçons en créole ou français, et s'adapte à votre rythme d'apprentissage." },
              { q: "Qu'est-ce que le système Gold ?", a: "Gagnez des points Gold en réussissant les quiz, utilisez-les pour débloquer des fonctions premium, changer votre avatar ou même gagner de l'argent réel." },
              { q: "Le contenu suit-il le programme officiel ?", a: "Absolument ! Notre plateforme est entièrement basée sur le programme du Ministère de l'Éducation Nationale (MENFP) de la 7ème à la Terminale." }
            ].map((faq, idx) => (
              <Card key={idx} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toggleFaq(idx)}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    {faq.q}
                    <span className="text-2xl">{expandedFaq === idx ? '−' : '+'}</span>
                  </CardTitle>
                </CardHeader>
                {expandedFaq === idx && (
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-primary mb-12">
            🇭🇹 À Propos d'EDUPRENEURS
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">Notre Mission</h3>
              <p className="text-foreground font-semibold">
                « L'éducation est l'arme la plus puissante pour transformer une nation » - Nelson Mandela
              </p>
              <p className="text-muted-foreground leading-relaxed">
                En 2025, le système éducatif haïtien peine encore à répondre aux besoins du pays en matière d'efficacité. 
                Le pays se fait de plus en plus devancé au point de vue d'instruction par le biais technologique, 
                se trouvant totalement désuet dans ce monde dirigé par la technologie.
              </p>
              
              <h3 className="text-2xl font-bold text-primary pt-4">Projet Phare 2025</h3>
              <p className="text-muted-foreground leading-relaxed">
                EDUPRENEURS est né d'une vision claire : <span className="font-bold text-foreground">révolutionner l'éducation haïtienne</span> en 
                mettant en place un système d'instruction entièrement basé sur le programme du Ministère de l'Éducation Nationale 
                et de la Formation Professionnelle (MENFP).
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  { icon: "🎯", title: "Apprentissage Personnalisé", desc: "Un système d'apprentissage entièrement personnalisé qui s'adapte au rythme de chaque élève" },
                  { icon: "📱", title: "Accessible Partout", desc: "Accessible depuis n'importe quel smartphone, tablette ou PC - de la 7ème année jusqu'à la préparation universitaire" },
                  { icon: "💰", title: "Prix Abordable", desc: "Seulement 200 gourdes par mois avec une semaine d'essai gratuite pour démocratiser l'éducation" }
                ].map((point, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex gap-4">
                      <div className="text-3xl">{point.icon}</div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">{point.title}</h4>
                        <p className="text-sm text-muted-foreground">{point.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">🚀 Notre Vision pour Haïti</CardTitle>
                <CardDescription className="text-base">
                  Nous croyons fermement qu'avec les bonnes méthodes, le programme du MENFP qui est assez généraliste 
                  pour certains a encore l'occasion d'impacter positivement l'avenir de notre pays.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Conformité MENFP", desc: "100% aligné sur le programme officiel du Ministère de l'Éducation" },
                  { title: "Formation Continue", desc: "Mises à jour trimestrielles pour optimiser l'expérience utilisateur" },
                  { title: "Communauté", desc: "Panels de chat entre élèves utilisant le système Gold pour créer une véritable communauté d'apprentissage" }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border-l-4 border-accent">
                    <h4 className="font-bold text-primary mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Rejoignez la révolution de l'éducation haïtienne
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Transformez votre façon d'apprendre avec la technologie. Apprentissage personnalisé, assistant IA, et récompenses réelles vous attendent.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl">
              Commencez votre essai gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-accent mb-4">EDUPRENEURS</h4>
              <ul className="space-y-2">
                <li><a href="#accueil" className="text-muted-foreground hover:text-accent transition-colors">Accueil</a></li>
                <li><a href="#courses" className="text-muted-foreground hover:text-accent transition-colors">Cours</a></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-accent transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-4">Matières</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-accent transition-colors">Français</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-accent transition-colors">Mathématiques</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-accent transition-colors">Sciences Sociales</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#faq" className="text-muted-foreground hover:text-accent transition-colors">FAQ</a></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-accent transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            © 2025 EDUPRENEURS. Éducation de qualité pour Haïti 🇭🇹
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
