/**
 * GiftLinkTab - "Lien Famille" tab for Step 3 of signup
 * 
 * Allows students to generate a payment link for a family member abroad.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateGiftLink } from "../../services/gift.service";
import { getSignupProgress } from "../../store/authFlow.store";

export default function GiftLinkTab() {
  const { toast } = useToast();
  const [giftUrl, setGiftUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const saved = getSignupProgress();
    
    if (!saved.fullName || !saved.email) {
      toast({ title: "Erreur", description: "Retournez à l'étape 1 pour remplir vos informations.", variant: "destructive" });
      setIsGenerating(false);
      return;
    }

    const result = await generateGiftLink(saved.fullName, saved.email);
    
    if (result.success && result.giftUrl) {
      setGiftUrl(result.giftUrl);
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible de générer le lien", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      toast({ title: "Lien copié ! 📋", description: "Envoyez-le à votre proche via WhatsApp ou SMS" });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = giftUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <h4 className="font-bold text-base">👨‍👩‍👧 Lien Famille</h4>
        <p className="text-xs text-muted-foreground">
          Un proche à l'étranger peut payer votre abonnement par carte bancaire ($2 USD)
        </p>
      </div>

      {!giftUrl ? (
        <>
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
            <p>📱 Générez un lien de paiement</p>
            <p>📤 Envoyez-le par WhatsApp ou SMS</p>
            <p>💳 Votre proche paie par carte ($2 USD)</p>
            <p>✅ Votre compte est activé automatiquement</p>
          </div>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération...</>
            ) : (
              <><Link2 className="mr-2 h-4 w-4" />Générer un lien de paiement</>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="bg-muted rounded-lg p-3 text-xs break-all font-mono">
            {giftUrl}
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="w-full"
            variant={copied ? "outline" : "default"}
            size="lg"
          >
            {copied ? (
              <><Check className="mr-2 h-4 w-4" />Copié !</>
            ) : (
              <><Copy className="mr-2 h-4 w-4" />Copier le lien</>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            ⏳ Ce lien expire dans 7 jours
          </p>
        </>
      )}
    </div>
  );
}
