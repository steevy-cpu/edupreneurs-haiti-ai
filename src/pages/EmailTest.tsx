import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send, Key, LogIn, PartyPopper, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EmailTest = () => {
  const [email, setEmail] = useState("celestinsteeve738@gmail.com");
  const [loading, setLoading] = useState<string | null>(null);

  const sendTestEmail = async () => {
    setLoading("test");
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email }
      });

      if (error) throw error;

      toast.success("Email de test envoyé!", {
        description: `Vérifiez ${email}`
      });
      console.log("Test email response:", data);
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error("Erreur", {
        description: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  const sendWelcomeEmail = async () => {
    setLoading("welcome");
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email,
          fullName: "Test User",
          verificationUrl: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast.success("Email de bienvenue envoyé!", {
        description: `Vérifiez ${email}`
      });
      console.log("Welcome email response:", data);
    } catch (error: any) {
      console.error("Error sending welcome email:", error);
      toast.error("Erreur", {
        description: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  const sendPasswordResetEmail = async () => {
    setLoading("reset");
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: {
          email,
          resetUrl: `${window.location.origin}/auth?reset=true`
        }
      });

      if (error) throw error;

      toast.success("Email de réinitialisation envoyé!", {
        description: `Vérifiez ${email}`
      });
      console.log("Password reset email response:", data);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast.error("Erreur", {
        description: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  const sendLoginNotification = async () => {
    setLoading("login");
    try {
      const timestamp = new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const { data, error } = await supabase.functions.invoke('send-login-notification', {
        body: {
          email,
          fullName: "Test User",
          timestamp,
          device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
          location: "Test Location"
        }
      });

      if (error) throw error;

      toast.success("Notification de connexion envoyée!", {
        description: `Vérifiez ${email}`
      });
      console.log("Login notification response:", data);
    } catch (error: any) {
      console.error("Error sending login notification:", error);
      toast.error("Erreur", {
        description: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">📧 Test des Emails</h1>
          <p className="text-muted-foreground">
            Testez tous les templates d'emails de l'application
          </p>
        </div>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            <strong>Important:</strong> Avec Resend en mode test, vous ne pouvez envoyer des emails qu'à{" "}
            <strong>celestinsteeve738@gmail.com</strong>. Pour envoyer à d'autres adresses, vous devez{" "}
            <a 
              href="https://resend.com/domains" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-amber-600"
            >
              vérifier un domaine sur Resend
            </a>.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Entrez l'adresse email de destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email de destination</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
              />
              <p className="text-xs text-muted-foreground">
                Utilisez celestinsteeve738@gmail.com pour les tests
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Email de Test</CardTitle>
              </div>
              <CardDescription>
                Email simple pour tester que le système fonctionne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={sendTestEmail} 
                disabled={loading === "test"}
                className="w-full"
              >
                {loading === "test" ? "Envoi..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-green-500" />
                <CardTitle>Email de Bienvenue</CardTitle>
              </div>
              <CardDescription>
                Email envoyé lors de l'inscription d'un utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={sendWelcomeEmail} 
                disabled={loading === "welcome"}
                className="w-full"
                variant="outline"
              >
                {loading === "welcome" ? "Envoi..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer Bienvenue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-red-500" />
                <CardTitle>Réinitialisation Mot de Passe</CardTitle>
              </div>
              <CardDescription>
                Email envoyé pour réinitialiser le mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={sendPasswordResetEmail} 
                disabled={loading === "reset"}
                className="w-full"
                variant="outline"
              >
                {loading === "reset" ? "Envoi..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer Reset
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-blue-500" />
                <CardTitle>Notification de Connexion</CardTitle>
              </div>
              <CardDescription>
                Email envoyé lors d'une nouvelle connexion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={sendLoginNotification} 
                disabled={loading === "login"}
                className="w-full"
                variant="outline"
              >
                {loading === "login" ? "Envoi..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer Notification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">📝 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. Configuration Resend:</strong>
              <p className="text-muted-foreground">
                En mode test, Resend n'envoie des emails qu'à l'adresse associée à votre compte (celestinsteeve738@gmail.com).
              </p>
            </div>
            <div>
              <strong>2. Pour envoyer à d'autres adresses:</strong>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Allez sur <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">resend.com/domains</a></li>
                <li>Ajoutez et vérifiez votre domaine</li>
                <li>Changez le "from" dans les edge functions pour utiliser votre domaine</li>
              </ul>
            </div>
            <div>
              <strong>3. Vérifier les logs:</strong>
              <p className="text-muted-foreground">
                Ouvrez la console (F12) pour voir les réponses détaillées des edge functions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTest;
