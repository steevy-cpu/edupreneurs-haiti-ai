import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [signupData, setSignupData] = useState({
    email: "",
    name: "",
    password: "",
    academicLevel: "",
    phone: "",
    acceptTerms: false
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      toast.success("Compte créé avec succès! Profitez de vos 7 jours gratuits 🎉");
      navigate("/customize-ai");
      setLoading(false);
    }, 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login
    setTimeout(() => {
      toast.success("Connexion réussie!");
      navigate("/dashboard");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="relative w-full max-w-md p-8 bg-card border-border shadow-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">EDUPRENEURS</span>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se Connecter"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <a href="#" className="text-primary hover:underline">Mot de passe oublié?</a>
              </p>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/20 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent font-medium">7 jours d'essai gratuit inclus!</span>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom / Pseudo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={6}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Niveau académique</Label>
                <Select 
                  value={signupData.academicLevel}
                  onValueChange={(value) => setSignupData({ ...signupData, academicLevel: value })}
                  required
                >
                  <SelectTrigger id="level" className="bg-background">
                    <SelectValue placeholder="Sélectionnez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7eme">7ème année</SelectItem>
                    <SelectItem value="8eme">8ème année</SelectItem>
                    <SelectItem value="9eme">9ème année</SelectItem>
                    <SelectItem value="seconde">Seconde</SelectItem>
                    <SelectItem value="premiere">Première</SelectItem>
                    <SelectItem value="terminale">Terminale</SelectItem>
                    <SelectItem value="philo">Rhéto/Philo</SelectItem>
                    <SelectItem value="universite">Préparation Université</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+509 XXXX XXXX"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={signupData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setSignupData({ ...signupData, acceptTerms: checked as boolean })
                  }
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  J'accepte les{" "}
                  <a href="#" className="text-primary hover:underline">conditions d'utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-primary hover:underline">politique de confidentialité</a>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Création..." : "Créer mon compte"}
              </Button>

              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                Après inscription, profitez de 7 jours gratuits. Ensuite, choisissez votre méthode 
                de paiement pour continuer à seulement 200 gourdes/mois.
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
