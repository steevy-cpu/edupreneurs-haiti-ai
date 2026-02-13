import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRESET_AMOUNTS_HTG = [100, 250, 500, 1000];
const PRESET_AMOUNTS_USD = [5, 10, 25, 50];
const MIN_AMOUNT_HTG = 50;
const MIN_AMOUNT_USD = 1;

export function DonationCard() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("moncash");

  const isUSD = activeTab === "stripe";
  const presets = isUSD ? PRESET_AMOUNTS_USD : PRESET_AMOUNTS_HTG;
  const minAmount = isUSD ? MIN_AMOUNT_USD : MIN_AMOUNT_HTG;
  const currency = isUSD ? "USD" : "HTG";

  const effectiveAmount = selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : 0);
  const isValidAmount = effectiveAmount >= minAmount;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim());

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setCustomAmount(cleaned);
    setSelectedAmount(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset to first preset of new currency
    setSelectedAmount(tab === "stripe" ? PRESET_AMOUNTS_USD[1] : PRESET_AMOUNTS_HTG[1]);
    setCustomAmount("");
  };

  const handleMonCashDonate = async () => {
    if (!isValidAmount) return;
    setIsLoading(true);

    try {
      const orderId = `DON-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

      await supabase.from("donations").insert({
        order_id: orderId,
        amount: effectiveAmount,
        currency: "HTG",
        provider: "moncash",
        donor_name: donorName.trim() || null,
        donor_email: donorEmail.trim() || null,
        donor_message: donorMessage.trim() || null,
        status: "pending",
      });

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

      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error("Donation error:", err);
      toast.error("Erreur lors de la création du paiement. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeDonate = async () => {
    if (!isValidAmount) return;
    setIsLoading(true);

    try {
      const amountCents = effectiveAmount * 100;

      const { data, error } = await supabase.functions.invoke("stripe-create-donation", {
        body: {
          amount: amountCents,
          donorName: donorName.trim() || null,
          donorEmail: donorEmail.trim() || null,
          donorMessage: donorMessage.trim() || null,
        },
      });

      if (error || !data?.url) {
        throw new Error("Erreur de paiement Stripe");
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Stripe donation error:", err);
      toast.error("Erreur lors de la création du paiement. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-4 sm:p-8 shadow-lg space-y-4 sm:space-y-6">
        <h2 className="text-lg font-bold text-foreground text-center">
          Faites un don 🎁
        </h2>

        {/* Payment method tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="moncash" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Smartphone className="w-4 h-4" />
              MonCash
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="w-4 h-4" />
              Carte (USD)
            </TabsTrigger>
          </TabsList>

          {/* Shared content below tabs */}
          <div className="mt-4 space-y-4 sm:space-y-6">
            {/* Preset amounts */}
            <div className="grid grid-cols-2 gap-3">
              {presets.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetClick(amount)}
                  className={`py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border-2 ${
                    selectedAmount === amount
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {isUSD ? `$${amount}` : `${amount} HTG`}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <Input
              type="text"
              inputMode="numeric"
              placeholder={`Montant (min ${isUSD ? "$1" : "50 HTG"})`}
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="text-center text-lg font-semibold"
            />

            {/* Optional fields */}
            <div className="space-y-2 sm:space-y-3">
              <Input
                type="text"
                placeholder="Votre nom (optionnel)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                maxLength={100}
              />
              <Input
                type="email"
                placeholder="Votre email *"
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                maxLength={255}
              />
              <Input
                type="text"
                placeholder="Message (optionnel)"
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Payment buttons per tab */}
            <TabsContent value="moncash" className="mt-0">
              <Button
                onClick={handleMonCashDonate}
                disabled={!isValidAmount || !isValidEmail || isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-4 sm:py-6 text-sm sm:text-base"
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

            <TabsContent value="stripe" className="mt-0">
              <Button
                onClick={handleStripeDonate}
                disabled={!isValidAmount || !isValidEmail || isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-4 sm:py-6 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Traitement...
                  </>
                ) : (
                  `Donate $${effectiveAmount || "..."} USD with Card`
                )}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </section>
  );
}