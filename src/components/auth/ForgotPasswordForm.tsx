import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

export default function ForgotPasswordForm() {
  const { toast } = useToast();
  const {
    forgotPasswordEmail,
    setForgotPasswordEmail,
    isResettingPassword,
    setIsResettingPassword,
    handleInputFocus,
    setActiveTab,
  } = useAuth();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsResettingPassword(true);
    try {
      const { data, error } = await supabase.rpc('generate_password_reset_token', {
        user_email: forgotPasswordEmail
      });

      if (error) throw error;

      const tokenData = data as unknown as Array<{ token: string; user_id: string; full_name: string }>;
      
      if (!tokenData || tokenData.length === 0) {
        toast({
          title: "Vérifiez votre boîte mail",
          description: "Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.",
        });
        setForgotPasswordEmail("");
        setActiveTab("login");
        return;
      }

      const { token, full_name } = tokenData[0];
      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;
      
      await supabase.functions.invoke('send-password-reset-email', {
        body: {
          email: forgotPasswordEmail,
          resetUrl: resetUrl,
          fullName: full_name,
        }
      });
      
      toast({
        title: "Email envoyé ✅",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });

      setForgotPasswordEmail("");
      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Vérifiez votre boîte mail",
        description: "Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.",
      });
      setForgotPasswordEmail("");
      setActiveTab("login");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword} className="space-y-4" name="forgot-password-form" autoComplete="on">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Mot de passe oublié ?</h2>
        <p className="text-sm text-muted-foreground">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="forgot-email" className="text-sm text-muted-foreground">
          Adresse e-mail
        </Label>
        <Input
          id="forgot-email"
          type="email"
          required
          placeholder="ex: nom@domaine.com"
          value={forgotPasswordEmail}
          onChange={(e) => setForgotPasswordEmail(e.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="done"
          inputMode="email"
          className="auth-input"
        />
      </div>
      <Button type="submit" disabled={isResettingPassword} className="auth-btn-submit w-full mt-6">
        {isResettingPassword ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer le lien"
        )}
      </Button>
      <button
        type="button"
        onClick={() => setActiveTab("login")}
        className="text-sm text-muted-foreground hover:text-primary mt-4 text-center w-full"
      >
        Retour à la connexion
      </button>
    </form>
  );
}
