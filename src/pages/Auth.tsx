import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authImage from "@/assets/auth00.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    fullName: "",
    nickname: "",
    academicGrade: "",
    phoneNumber: "",
    password: "",
    privacy: false,
    payment: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.password || !signupData.nickname || 
        !signupData.academicGrade || !signupData.phoneNumber) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Échec de la création du compte");

      const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: signupData.fullName || signupData.nickname,
          nickname: signupData.nickname,
          academic_grade: signupData.academicGrade,
          phone_number: signupData.phoneNumber,
          confirmation_code: confirmationCode,
          email_confirmed: false,
          phone_confirmed: false,
        });

      if (profileError) throw profileError;

      const emailPromise = supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: signupData.email,
          fullName: signupData.fullName || signupData.nickname,
          nickname: signupData.nickname,
          academicGrade: signupData.academicGrade,
          confirmationCode,
        },
      });

      const whatsappPromise = supabase.functions.invoke('send-whatsapp-confirmation', {
        body: {
          phoneNumber: signupData.phoneNumber,
          fullName: signupData.fullName || signupData.nickname,
          confirmationCode,
        },
      });

      const [emailResult, whatsappResult] = await Promise.all([emailPromise, whatsappPromise]);

      if (emailResult.error) {
        console.error("Email error:", emailResult.error);
      }

      if (whatsappResult.error) {
        console.error("WhatsApp error:", whatsappResult.error);
      } else if (whatsappResult.data?.whatsappUrl) {
        window.open(whatsappResult.data.whatsappUrl, '_blank');
      }

      toast({
        title: "Inscription réussie ! 🎉",
        description: "Vérifiez votre email et WhatsApp pour le code de confirmation",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="auth-page min-h-screen bg-background">
      {/* Header */}
      <header className="auth-header sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 bg-card border-b border-border">
        <Link to="/" className="auth-brand flex items-center gap-2.5 font-bold text-primary">
          <div className="auth-logo w-7 h-7 rounded-md bg-gradient-to-br from-primary to-primary/80"></div>
          <span>EDUPRENEURS</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/" className="auth-btn-outline">
            Accueil
          </Link>
          <Button 
            onClick={() => setActiveTab("login")}
            className="auth-btn-primary"
          >
            Se connecter
          </Button>
          <ThemeToggle />
        </nav>
      </header>

      {/* Main Content */}
      <div className="auth-wrap min-h-[calc(100vh-65px)] grid place-items-center p-4 md:p-8">
        <div className="auth-container flex flex-col items-center gap-8 w-full max-w-[1000px]">
          {/* Desktop Image */}
          <div className="auth-image-container hidden md:flex justify-center items-center">
            <img 
              src={authImage} 
              alt="Authentification EDUPRENEURS" 
              className="auth-image w-full max-w-[280px] h-auto animate-gentle-float" 
            />
          </div>
          
          <div className="auth-grid grid md:grid-cols-[1.1fr_0.9fr] gap-8 w-full">
            {/* Info Panel */}
            <aside className="auth-panel auth-info bg-card border border-border rounded-2xl shadow-lg p-7">
              <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
              <p className="text-muted-foreground mb-5">
                Créez votre compte ou connectez-vous pour accéder à votre apprentissage personnalisé aligné au MENFP.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="auth-badge">Essai 7 jours</span>
                <span className="auth-badge">FR / HT</span>
                <span className="auth-badge">IA personnalisée</span>
              </div>
              <ul className="auth-bullets list-none m-0 p-0 text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">• Leçons et schémas simples</li>
                <li className="flex items-center gap-2">• Quiz amusants et golds</li>
                <li className="flex items-center gap-2">• Paiement MonCash / NatCash</li>
                <li className="flex items-center gap-2">• Prix cible ~200 HTG / mois</li>
              </ul>
            </aside>

            {/* Mobile Image */}
            <div className="auth-image-mobile flex md:hidden justify-center items-center my-5">
              <img 
                src={authImage} 
                alt="Authentification EDUPRENEURS" 
                className="auth-image max-w-[250px] h-auto animate-gentle-float" 
              />
            </div>

            {/* Auth Card */}
            <section className="auth-panel auth-card bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="auth-tabs flex border-b border-border">
                <button
                  className={`auth-tab flex-1 text-center py-3.5 px-2.5 cursor-pointer font-bold ${
                    activeTab === "login" 
                      ? "text-primary border-b-[3px] border-primary" 
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Se connecter
                </button>
                <button
                  className={`auth-tab flex-1 text-center py-3.5 px-2.5 cursor-pointer font-bold ${
                    activeTab === "signup" 
                      ? "text-primary border-b-[3px] border-primary" 
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("signup")}
                >
                  Créer un compte
                </button>
              </div>

              {/* Content */}
              <div className="auth-content p-5">
                {/* Login Form */}
                {activeTab === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm text-muted-foreground">
                        Adresse e-mail
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        placeholder="ex: nom@domaine.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="auth-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm text-muted-foreground">
                        Mot de passe
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        placeholder="Votre mot de passe"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="auth-input"
                      />
                    </div>
                    <Button type="submit" className="auth-btn-submit w-full mt-6">
                      Se connecter
                    </Button>
                    <p className="auth-note text-xs text-muted-foreground mt-2">
                      Astuce test: <code className="bg-muted px-1 py-0.5 rounded text-xs">celestinsteeve738@gmail.com / test123</code> ou{" "}
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">djoodoodson@gmail.com / test123</code>
                    </p>
                  </form>
                )}

                {/* Signup Form */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm text-muted-foreground">
                          Adresse e-mail *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          required
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm text-muted-foreground">
                          Mot de passe *
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          required
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-fullname" className="text-sm text-muted-foreground">
                          Nom complet
                        </Label>
                        <Input
                          id="signup-fullname"
                          type="text"
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-nickname" className="text-sm text-muted-foreground">
                          Pseudo *
                        </Label>
                        <Input
                          id="signup-nickname"
                          type="text"
                          required
                          value={signupData.nickname}
                          onChange={(e) => setSignupData({ ...signupData, nickname: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-grade" className="text-sm text-muted-foreground">
                          Niveau académique *
                        </Label>
                        <select
                          id="signup-grade"
                          required
                          value={signupData.academicGrade}
                          onChange={(e) => setSignupData({ ...signupData, academicGrade: e.target.value })}
                          className="auth-input flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm"
                        >
                          <option value="">Sélectionnez…</option>
                          <option>7e</option>
                          <option>8e</option>
                          <option>9e</option>
                          <option>S1</option>
                          <option>S2</option>
                          <option>Philo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm text-muted-foreground">
                          Numéro *
                        </Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          required
                          placeholder="ex: +509 3x xx xx xx"
                          value={signupData.phoneNumber}
                          onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="privacy"
                        required
                        checked={signupData.privacy}
                        onChange={(e) => setSignupData({ ...signupData, privacy: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="privacy" className="text-sm text-muted-foreground">
                        J'accepte les politiques de confidentialité.
                      </Label>
                    </div>

                    <div className="auth-pay mt-6">
                      <strong className="block mb-2 text-sm">Méthode de paiement</strong>
                      <div className="flex flex-col gap-2">
                        <label className="auth-radio flex items-center gap-2 p-3 border border-input rounded-lg bg-muted/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="moncash"
                            required
                            checked={signupData.payment === "moncash"}
                            onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                          />
                          MonCash
                        </label>
                        <label className="auth-radio flex items-center gap-2 p-3 border border-input rounded-lg bg-muted/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="natcash"
                            checked={signupData.payment === "natcash"}
                            onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                          />
                          NatCash
                        </label>
                        <label className="auth-radio flex items-center gap-2 p-3 border border-input rounded-lg bg-muted/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="carte"
                            checked={signupData.payment === "carte"}
                            onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                          />
                          Carte bancaire
                        </label>
                      </div>
                      <p className="auth-note text-xs text-muted-foreground mt-2">
                        Essai gratuit 7 jours, puis ~200 HTG / mois.
                      </p>
                    </div>

                    <Button type="submit" className="auth-btn-submit w-full mt-6">
                      Créer mon compte
                    </Button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
