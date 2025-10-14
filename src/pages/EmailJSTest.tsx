import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateConfirmationCode,
} from "@/utils/emailService";

const EmailJSTest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSendVerification = async () => {
    if (!email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    setLoading("verification");
    try {
      const confirmationCode = generateConfirmationCode();
      await sendVerificationEmail({
        to_email: email,
        to_name: "Utilisateur Test",
        confirmation_code: confirmationCode,
        nickname: "TestUser",
        academic_grade: "10e année",
      });
      toast.success("Email de vérification envoyé avec succès!");
      console.log("Code de confirmation généré:", confirmationCode);
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de vérification");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleSendWelcome = async () => {
    if (!email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    setLoading("welcome");
    try {
      await sendWelcomeEmail({
        to_email: email,
        to_name: "Utilisateur Test",
        nickname: "TestUser",
      });
      toast.success("Email de bienvenue envoyé avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de bienvenue");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    setLoading("reset");
    try {
      const resetUrl = `${window.location.origin}/reset-password?token=test-token-123`;
      await sendPasswordResetEmail({
        to_email: email,
        reset_url: resetUrl,
      });
      toast.success("Email de réinitialisation envoyé avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de réinitialisation");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pt-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Test EmailJS - Flux d'Emails</h1>
          <p className="text-muted-foreground">
            Testez les différents emails de votre flux de vérification
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Configuration EmailJS requise:</strong>
            <br />
            1. Créez un compte sur{" "}
            <a
              href="https://www.emailjs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              EmailJS
            </a>
            <br />
            2. Créez un service (notez le Service ID)
            <br />
            3. Créez 3 templates avec ces IDs:
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>template_verification - Email de vérification</li>
              <li>template_welcome - Email de bienvenue</li>
              <li>template_reset - Email de réinitialisation</li>
            </ul>
            <br />
            4. Mettez à jour les IDs dans src/utils/emailService.ts
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Configuration de Test</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour tester les envois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email de Vérification</CardTitle>
              </div>
              <CardDescription>
                Envoi du code de confirmation à 6 chiffres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSendVerification}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "verification" ? "Envoi..." : "Envoyer"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <CardTitle>Email de Bienvenue</CardTitle>
              </div>
              <CardDescription>
                Envoi après inscription réussie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSendWelcome}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "welcome" ? "Envoi..." : "Envoyer"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <CardTitle>Réinitialisation</CardTitle>
              </div>
              <CardDescription>
                Email de réinitialisation de mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSendPasswordReset}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "reset" ? "Envoi..." : "Envoyer"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Variables disponibles pour les templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Template Vérification:</h3>
              <code className="block bg-muted p-2 rounded text-sm">
                {`{{to_name}}, {{to_email}}, {{confirmation_code}}, {{nickname}}, {{academic_grade}}`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Template Bienvenue:</h3>
              <code className="block bg-muted p-2 rounded text-sm">
                {`{{to_name}}, {{to_email}}, {{nickname}}`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Template Réinitialisation:</h3>
              <code className="block bg-muted p-2 rounded text-sm">
                {`{{to_email}}, {{reset_url}}`}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailJSTest;
