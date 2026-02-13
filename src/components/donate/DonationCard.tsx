import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, Smartphone, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRESET_AMOUNTS = [100, 250, 500, 1000];
const MIN_AMOUNT = 50;

export function DonationCard() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const effectiveAmount = selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : 0);
  const isValidAmount = effectiveAmount >= MIN_AMOUNT;

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setCustomAmount(cleaned);
    setSelectedAmount(null);
  };

  const handleMonCashDonate = async () => {
    if (!isValidAmount) return;
    setIsLoading(true);

    try {
      // Create donation record first
      const orderId = `DON-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

      await supabase.from("donations").insert({
        order_id: orderId,
        amount: effectiveAmount,
        currency: "HTG",
        provider: "moncash",
        donor_name: donorName.trim() || null,
        donor_message: donorMessage.trim() || null,
        status: "pending",
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("moncash-create-payment", {
        body: {
          amount: effectiveAmount,
          description: `Don Edupreneurs - ${effectiveAmount} HTG`,
          orderId,
          isDonation: true,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || "Erreur de paiement");
      }

      // Redirect to MonCash
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error("Donation error:", err);
      toast.error("Erreur lors de la création du paiement. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <h2 className="text-lg font-bold text-foreground text-center">
          Faites un don 🎁
        </h2>

        {/* Preset amounts */}
        <div className="grid grid-cols-2 gap-3">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePresetClick(amount)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                selectedAmount === amount
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {amount} HTG
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Montant personnalisé (min 50 HTG)"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="text-center text-lg font-semibold"
          />
        </div>

        {/* Optional fields */}
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Votre nom (optionnel)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            maxLength={100}
          />
          <Input
            type="text"
            placeholder="Un message d'encouragement (optionnel)"
            value={donorMessage}
            onChange={(e) => setDonorMessage(e.target.value)}
            maxLength={500}
          />
        </div>

        {/* Payment method tabs */}
        <Tabs defaultValue="moncash" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="moncash" className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              MonCash
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              Carte (USD)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moncash" className="mt-4">
            <Button
              onClick={handleMonCashDonate}
              disabled={!isValidAmount || isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-6 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                `Donner ${effectiveAmount || "..."} HTG avec MonCash`
              )}
            </Button>
          </TabsContent>

          <TabsContent value="stripe" className="mt-4">
            <div className="text-center py-6 space-y-3">
              <Clock className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">
                Paiement par carte bientôt disponible
              </p>
              <p className="text-xs text-muted-foreground/70">
                Vous pourrez bientôt donner en USD avec votre carte bancaire.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
