/**
 * ForgotPasswordPage - Password reset request with pre-filled email support
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get pre-filled email from location state (from lockout redirect)
  const prefilledEmail = (location.state as { email?: string })?.email;
  
  const [email, setEmail] = useState(prefilledEmail || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_password_reset_token', {
        user_email: email
      });

      if (error) throw error;

      const tokenData = data as unknown as Array<{ token: string; user_id: string; full_name: string }>;
      
      if (!tokenData || tokenData.length === 0) {
        toast({
          title: "Vérifiez votre boîte mail",
          description: "Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.",
        });
        navigate('/auth/login');
        return;
      }

      const { token, full_name } = tokenData[0];
      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;
      
      await supabase.functions.invoke('send-password-reset-email', {
        body: { email, resetUrl, fullName: full_name }
      });
      
      toast({
        title: "Email envoyé ✅",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        title: "Vérifiez votre boîte mail",
        description: "Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.",
      });
      navigate('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-tabs p-3 flex justify-center">
        <div className="text-center py-3 font-bold text-primary">Réinitialiser le mot de passe</div>
      </div>
      <div className="auth-content p-5">
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Mot de passe oublié ?</h2>
            <p className="text-sm text-muted-foreground">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="text-sm text-muted-foreground">Adresse e-mail</Label>
            <Input
              id="forgot-email"
              type="email"
              required
              placeholder="ex: nom@domaine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="auth-input"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="auth-btn-submit w-full mt-6">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours...</> : "Envoyer le lien"}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-muted-foreground hover:text-primary mt-4 text-center w-full"
          >
            Retour à la connexion
          </button>
        </form>
      </div>
    </>
  );
}
