import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Phone, CheckCircle, Upload, ArrowRight, Clock } from "lucide-react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface NatCashPaymentFlowProps {
  amount: number;
  description?: string;
  onSuccess?: () => void;
  onFallback?: () => void;
}

type FlowStep = "phone" | "instructions" | "waiting" | "success" | "fallback";

const NatCashPaymentFlow = ({ amount, description, onSuccess, onFallback }: NatCashPaymentFlowProps) => {
  const { session } = useSessionAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<FlowStep>("phone");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 36; // 3 minutes at 5s intervals

  // Create NatCash order
  const handleCreateOrder = async () => {
    if (!/^\d{8}$/.test(phone)) {
      toast.error("Entrez un numéro NatCash valide (8 chiffres)");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("natcash-create-order", {
        body: {
          amount,
          description: description || "Renouvellement Edupreneurs - 30 jours",
          natcashPhone: phone,
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Erreur lors de la création de la commande");
        return;
      }

      setOrderId(data.order.orderId);
      setStep("instructions");
    } catch {
      toast.error("Erreur réseau - vérifiez votre connexion");
    } finally {
      setLoading(false);
    }
  };

  // Poll for auto-confirmation
  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) return false;

    try {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("status")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data?.status === "completed") {
        return true;
      }
    } catch {
      // Silently fail polling
    }
    return false;
  }, [orderId]);

  // Polling effect
  useEffect(() => {
    if (step !== "waiting") return;

    const interval = setInterval(async () => {
      setPollCount((prev) => {
        if (prev >= MAX_POLLS) {
          clearInterval(interval);
          setStep("fallback");
          return prev;
        }
        return prev + 1;
      });

      const confirmed = await checkPaymentStatus();
      if (confirmed) {
        clearInterval(interval);
        setStep("success");
        queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
        queryClient.invalidateQueries({ queryKey: ["subscription-banner"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("Paiement confirmé! 🎉");
        onSuccess?.();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, checkPaymentStatus, queryClient, onSuccess]);

  if (step === "phone") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="natcash-phone" className="flex items-center gap-2">
            <Phone size={16} />
            Votre numéro NatCash (Digicel)
          </Label>
          <Input
            id="natcash-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="Ex: 37001234"
            maxLength={8}
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground">
            Entrez votre numéro Digicel à 8 chiffres (sans le +509)
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleCreateOrder}
          disabled={loading || phone.length !== 8}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</>
          ) : (
            <><ArrowRight className="mr-2 h-4 w-4" />Continuer — {amount} HTG</>
          )}
        </Button>
      </div>
    );
  }

  if (step === "instructions") {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-semibold text-sm">Instructions de paiement NatCash</h4>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Composez <strong>*202#</strong> sur votre téléphone Digicel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Sélectionnez <strong>"Transfert d'argent"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Entrez le montant: <strong>{amount} HTG</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Confirmez avec votre <strong>PIN NatCash</strong></span>
              </li>
            </ol>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Référence de commande</p>
              <p className="font-mono font-bold text-sm">{orderId}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          onClick={() => {
            setStep("waiting");
            setPollCount(0);
          }}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          J'ai effectué le transfert
        </Button>
      </div>
    );
  }

  if (step === "waiting") {
    const progress = Math.min((pollCount / MAX_POLLS) * 100, 100);
    return (
      <div className="space-y-4 text-center py-4">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <div>
          <h4 className="font-semibold">Vérification en cours...</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Nous attendons la confirmation de votre paiement
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Clock size={12} />
          {Math.max(0, Math.ceil((MAX_POLLS - pollCount) * 5 / 60))} min restantes
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep("fallback")}
        >
          Pas encore confirmé? Essayer autrement
        </Button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle className="h-12 w-12 text-[hsl(var(--success))] mx-auto" />
        <h4 className="font-semibold text-lg">Paiement confirmé!</h4>
        <p className="text-sm text-muted-foreground">
          Votre abonnement a été renouvelé pour 30 jours.
        </p>
      </div>
    );
  }

  // Fallback step
  return (
    <div className="space-y-4 text-center py-4">
      <p className="text-sm text-muted-foreground">
        La vérification automatique n'a pas pu confirmer votre paiement. 
        Vous pouvez téléverser votre reçu pour une vérification manuelle.
      </p>
      <Button
        className="w-full"
        variant="outline"
        onClick={() => onFallback?.()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Téléverser mon reçu
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setStep("waiting");
          setPollCount(0);
        }}
      >
        Réessayer la vérification automatique
      </Button>
    </div>
  );
};

export default NatCashPaymentFlow;
