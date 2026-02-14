/**
 * GiftLinkTab - "Lien Famille" tab for Step 3 of signup
 * 
 * Allows students to generate a payment link for a family member.
 * Supports both Stripe (card, $2 USD, 7-day expiry) and MonCash (200 HTG, 15-min expiry).
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Link2, CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateGiftLink } from "../../services/gift.service";
import { generateMonCashGiftLink } from "../../services/gift-moncash.service";
import { getSignupProgress } from "../../store/authFlow.store";

type GiftMethod = "stripe" | "moncash";

export default function GiftLinkTab() {
  const { toast } = useToast();
  const [giftUrl, setGiftUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<GiftMethod | null>(null);
  const [activeMethod, setActiveMethod] = useState<GiftMethod | null>(null);

  const handleGenerate = async (selectedMethod: GiftMethod) => {
    setIsGenerating(true);
    setMethod(selectedMethod);
    const saved = getSignupProgress();
    
    if (!saved.fullName || !saved.email) {
      toast({ title: "Erreur", description: "Retournez à l'étape 1 pour remplir vos informations.", variant: "destructive" });
      setIsGenerating(false);
      return;
    }

    const result = selectedMethod === "moncash"
      ? await generateMonCashGiftLink(saved.fullName, saved.email)
      : await generateGiftLink(saved.fullName, saved.email);
    
    if (result.success && result.giftUrl) {
      setGiftUrl(result.giftUrl);
      setActiveMethod(selectedMethod);
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

  const handleReset = () => {
    setGiftUrl("");
    setActiveMethod(null);
    setCopied(false);
  };

  return (
    <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <h4 className="font-bold text-base">👨‍👩‍👧 Lien Famille</h4>
        <p className="text-xs text-muted-foreground">
          Un proche peut payer votre abonnement pour vous
        </p>
      </div>

      {!giftUrl ? (
        <>
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
            <p>📱 Générez un lien de paiement</p>
            <p>📤 Envoyez-le par WhatsApp ou SMS</p>
            <p>💳 Votre proche paie pour vous</p>
            <p>✅ Votre compte est activé automatiquement</p>
          </div>

          {/* Two options */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => handleGenerate("moncash")}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating && method === "moncash" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération...</>
              ) : (
                <><Smartphone className="mr-2 h-4 w-4" />Lien MonCash (200 HTG)</>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleGenerate("stripe")}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
              size="lg"
            >
              {isGenerating && method === "stripe" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération...</>
              ) : (
                <><CreditCard className="mr-2 h-4 w-4" />Lien Carte Bancaire ($2 USD)</>
              )}
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground">
            MonCash: expire en 15 min · Carte: expire en 7 jours
          </p>
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
            ⏳ {activeMethod === "moncash" ? "Ce lien expire dans 15 minutes" : "Ce lien expire dans 7 jours"}
          </p>
          <Button
            type="button"
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            <Link2 className="mr-1 h-3 w-3" />
            Générer un nouveau lien
          </Button>
        </>
      )}
    </div>
  );
}
