import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const TestEmail = () => {
  const [sending, setSending] = useState(false);

  const sendTestEmail = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email: 'celestinsteeve738@gmail.com' }
      });

      if (error) throw error;

      toast.success("Email de test envoyé avec succès!", {
        description: "Vérifiez la boîte de réception de celestinsteeve738@gmail.com"
      });
      
      console.log("Test email response:", data);
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error("Erreur lors de l'envoi de l'email", {
        description: error.message
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Test Email</h1>
          <p className="text-muted-foreground">
            Envoi d'un email de test à celestinsteeve738@gmail.com
          </p>
        </div>

        <Button 
          onClick={sendTestEmail} 
          disabled={sending}
          className="w-full"
          size="lg"
        >
          {sending ? "Envoi en cours..." : "Envoyer l'email de test"}
        </Button>

        <p className="text-sm text-muted-foreground mt-4">
          Cliquez pour tester le système d'authentification par email
        </p>
      </div>
    </div>
  );
};

export default TestEmail;
