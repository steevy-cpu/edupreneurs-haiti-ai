/**
 * RenewalGiftLink - Generate shareable payment links for subscription renewal
 * 
 * Authenticated users can generate MonCash or Stripe gift links
 * pre-linked to their account, for family members to pay on their behalf.
 */

import { useState } from "react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateGiftLink } from "@/auth/services/gift.service";
import { generateMonCashGiftLink } from "@/auth/services/gift-moncash.service";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Gift, Copy, Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RenewalGiftLink() {
  const { user } = useSessionAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [generatingStripe, setGeneratingStripe] = useState(false);
  const [generatingMoncash, setGeneratingMoncash] = useState(false);
  const [stripeLink, setStripeLink] = useState<string | null>(null);
  const [moncashLink, setMoncashLink] = useState<string | null>(null);
  const [copiedStripe, setCopiedStripe] = useState(false);
  const [copiedMoncash, setCopiedMoncash] = useState(false);

  // Fetch profile for name
  const { data: profile } = useQuery({
    queryKey: ["renewal-gift-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const handleGenerateStripeLink = async () => {
    if (!user?.id || !user?.email || !profile?.full_name) return;
    setGeneratingStripe(true);
    try {
      const result = await generateGiftLink(profile.full_name, user.email, user.id);
      if (result.success && result.giftUrl) {
        setStripeLink(result.giftUrl);
        toast.success("Lien Stripe créé (valide 7 jours)");
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch {
      toast.error("Erreur inattendue");
    } finally {
      setGeneratingStripe(false);
    }
  };

  const handleGenerateMoncashLink = async () => {
    if (!user?.id || !user?.email || !profile?.full_name) return;
    setGeneratingMoncash(true);
    try {
      const result = await generateMonCashGiftLink(profile.full_name, user.email, user.id);
      if (result.success && result.giftUrl) {
        setMoncashLink(result.giftUrl);
        toast.success("Lien MonCash créé (valide 15 min)");
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch {
      toast.error("Erreur inattendue");
    } finally {
      setGeneratingMoncash(false);
    }
  };

  const copyToClipboard = async (url: string, type: "stripe" | "moncash") => {
    try {
      await navigator.clipboard.writeText(url);
      if (type === "stripe") {
        setCopiedStripe(true);
        setTimeout(() => setCopiedStripe(false), 2000);
      } else {
        setCopiedMoncash(true);
        setTimeout(() => setCopiedMoncash(false), 2000);
      }
      toast.success("Lien copié ! Envoyez-le via WhatsApp ou SMS");
    } catch {
      toast.error("Impossible de copier");
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between w-full p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
        >
          <span className="flex items-center gap-2 font-medium">
            <Gift className="h-4 w-4 text-primary" />
            Lien Famille — Quelqu'un d'autre paie pour vous
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-3">
        <p className="text-xs text-muted-foreground">
          Générez un lien de paiement et envoyez-le à un parent ou proche via WhatsApp/SMS.
        </p>

        {/* Stripe Link ($2 USD, 7 days) */}
        <div className="space-y-2">
          {stripeLink ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={stripeLink}
                className="flex-1 text-xs p-2 rounded border border-input bg-background truncate"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(stripeLink, "stripe")}
              >
                {copiedStripe ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleGenerateStripeLink}
              disabled={generatingStripe || !profile?.full_name}
            >
              {generatingStripe ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Création...</>
              ) : (
                "Créer lien Carte — $2 USD (7 jours)"
              )}
            </Button>
          )}
        </div>

        {/* MonCash Link (200 HTG, 15 min) */}
        <div className="space-y-2">
          {moncashLink ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={moncashLink}
                className="flex-1 text-xs p-2 rounded border border-input bg-background truncate"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(moncashLink, "moncash")}
              >
                {copiedMoncash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleGenerateMoncashLink}
              disabled={generatingMoncash || !profile?.full_name}
            >
              {generatingMoncash ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Création...</>
              ) : (
                "Créer lien MonCash — 200 HTG (15 min)"
              )}
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default RenewalGiftLink;
