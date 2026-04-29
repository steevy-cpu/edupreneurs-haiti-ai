import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAvatarUrl } from "@/lib/avatarMap";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Status = "verifying" | "success" | "failed";

export default function DonationSuccessCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");

  const isStripe = searchParams.get("stripe") === "success";
  const orderId = searchParams.get("order") || searchParams.get("orderId") || searchParams.get("referenceId");
  const judeAvatar = getAvatarUrl("jude", 128);

  const sendThankYouEmail = async (donationOrderId: string) => {
    try {
      const { data: donation } = await supabase
        .from("donations")
        .select("donor_name, donor_email, amount, currency")
        .eq("order_id", donationOrderId)
        .maybeSingle();

      if (donation?.donor_email) {
        await supabase.functions.invoke("send-donation-thank-you", {
          body: {
            donorName: donation.donor_name,
            donorEmail: donation.donor_email,
            amount: donation.amount,
            currency: donation.currency,
            orderId: donationOrderId,
          },
        });
      }
    } catch (e) {
      console.error("Thank-you email failed (non-blocking):", e);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    const verify = async () => {
      try {
        if (isStripe) {
          // Stripe handles payment confirmation; mark donation as completed
          const { error: updateError } = await supabase
            .from("donations")
            .update({ status: "completed" })
            .eq("order_id", orderId)
            .eq("status", "pending");

          if (updateError) {
            console.error("Stripe donation update error:", updateError);
          }

          setStatus("success");
          await sendThankYouEmail(orderId);
        } else {
          // MonCash flow: verify via edge function
          const { data, error } = await supabase.functions.invoke("moncash-check-status", {
            body: { orderId },
          });

          if (error || !data?.success || data?.status !== "completed") {
            setStatus("failed");
            return;
          }

          setStatus("success");
          await sendThankYouEmail(orderId);
        }

        // Fire confetti
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#f59e0b", "#3b82f6"],
        });
      } catch {
        setStatus("failed");
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6">
        <img
          src={judeAvatar}
          alt="Jude"
          className="w-20 h-20 rounded-full mx-auto border-4 border-primary/30"
          width={80}
          height={80}
        />

        {status === "verifying" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Vérification de votre don...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Mèsi anpil! 🎉</h1>
            <p className="text-muted-foreground">
              Votre don a été reçu avec succès. Grâce à vous, plus d'élèves haïtiens
              auront accès à une éducation de qualité.
            </p>
            <p className="text-sm text-muted-foreground italic">
              — Jude, votre assistant IA éducatif 💙
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
            <h1 className="text-xl font-bold text-foreground">Paiement non confirmé</h1>
            <p className="text-muted-foreground text-sm">
              Nous n'avons pas pu vérifier votre paiement. Si vous avez été débité,
              contactez-nous et nous résoudrons le problème.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Link to="/donate">
            <Button variant="outline" className="w-full">
              Retourner à la page de don
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full text-muted-foreground">
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
