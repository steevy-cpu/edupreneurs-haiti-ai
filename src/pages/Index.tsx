import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Sparkles, Trophy, Users, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-education.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">EDUPRENEURS</span>
            </div>
            <Button 
              variant="default" 
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Se Connecter
            </Button>
          </nav>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">7 jours d'essai gratuit</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Apprendre avec{" "}
                <span className="gradient-text">l'Intelligence Artificielle</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                La première plateforme éducative haïtienne 100% personnalisée. 
                Suivez le programme du MENFP avec votre assistant IA personnel et 
                gagnez des récompenses en apprenant.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/auth")}
                >
                  Commencer Gratuitement
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-2"
                  onClick={() => setShowVideo(true)}
                >
                  Voir la Démo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">+1000 étudiants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Système de récompenses</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img 
                src={heroImage} 
                alt="Étudiants utilisant la technologie" 
                className="relative rounded-3xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Pourquoi choisir <span className="gradient-text">EDUPRENEURS</span> ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une expérience d'apprentissage révolutionnaire adaptée aux besoins des étudiants haïtiens
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 bg-card hover:bg-card/80 border-border transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Assistant IA Personnalisé</h3>
            <p className="text-muted-foreground leading-relaxed">
              Votre propre tuteur IA qui s'adapte à votre rythme et explique en créole, français, anglais ou espagnol.
            </p>
          </Card>

          <Card className="p-8 bg-card hover:bg-card/80 border-border transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Système de Gold</h3>
            <p className="text-muted-foreground leading-relaxed">
              Gagnez des points à chaque quiz réussi. Échangez-les contre des récompenses réelles ou du crédit.
            </p>
          </Card>

          <Card className="p-8 bg-card hover:bg-card/80 border-border transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Programme MENFP</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tout le programme officiel de la 7ème année jusqu'aux concours universitaires, disponible 24/7.
            </p>
          </Card>

          <Card className="p-8 bg-card hover:bg-card/80 border-border transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/50 flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Vidéos Explicatives</h3>
            <p className="text-muted-foreground leading-relaxed">
              Des centaines de vidéos pour illustrer chaque concept et faciliter la compréhension.
            </p>
          </Card>

          <Card className="p-8 bg-card hover:bg-card/80 border-border transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Quiz Amusants</h3>
            <p className="text-muted-foreground leading-relaxed">
              Testez vos connaissances avec des quiz interactifs et ludiques après chaque chapitre.
            </p>
          </Card>

          <Card className="p-8 bg-card hover:bg-card/80 border-border transition-all hover:scale-105 hover:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Accessible Partout</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sur smartphone, tablette ou PC. Apprenez n'importe où, n'importe quand à partir de 200 gourdes/mois.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20 p-12 lg:p-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Prêt à transformer votre éducation ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez des centaines d'étudiants qui apprennent déjà avec EDUPRENEURS. 
              Essayez gratuitement pendant 7 jours, sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg"
                onClick={() => navigate("/auth")}
              >
                Créer mon compte gratuit
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2"
              >
                En savoir plus
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">EDUPRENEURS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La révolution de l'éducation en Haïti commence ici.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Programme</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 EDUPRENEURS. Tous droits réservés. Fait avec ❤️ pour l'éducation haïtienne.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-card rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">Vidéo de démonstration à venir...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
