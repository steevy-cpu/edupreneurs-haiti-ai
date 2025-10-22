import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid token in the URL
    const checkToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setValidToken(false);
        toast({
          title: "Lien invalide",
          description: "Aucun token de réinitialisation trouvé",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
        return;
      }

      // Check token validity without consuming it
      const { data, error } = await supabase.rpc('check_reset_token' as any, {
        reset_token: token
      });

      if (error || !data) {
        setValidToken(false);
        toast({
          title: "Lien invalide ou expiré",
          description: "Veuillez demander un nouveau lien de réinitialisation",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
        return;
      }

      const tokenData = Array.isArray(data) ? data[0] : data as { valid: boolean; user_id: string; email: string };
      
      if (tokenData.valid) {
        setValidToken(true);
      } else {
        setValidToken(false);
        toast({
          title: "Lien invalide ou expiré",
          description: "Veuillez demander un nouveau lien de réinitialisation",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    };

    checkToken();
  }, [navigate, toast, searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez vérifier que les deux mots de passe sont identiques",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const token = searchParams.get('token');
      
      if (!token) {
        throw new Error("Token manquant");
      }

      // Call edge function to reset password
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          token,
          newPassword
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Mot de passe réinitialisé ✅",
        description: "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.",
      });

      // Redirect to login
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (validToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lien invalide ou expiré</h2>
          <p className="text-muted-foreground mb-4">
            Vous allez être redirigé vers la page de connexion...
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={edupreneursLogo} 
              alt="Edupreneurs" 
              className="h-16 w-16 rounded-xl object-cover"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nouveau mot de passe
            </h1>
            <p className="text-sm text-muted-foreground">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm text-muted-foreground">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Au moins 6 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm text-muted-foreground">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
