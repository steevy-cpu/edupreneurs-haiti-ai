import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Phone, CheckCircle, Upload, ArrowRight, Clock, Camera, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface NatCashPaymentFlowProps {
  amount: number;
  description?: string;
  onSuccess?: () => void;
}

interface PaymentInstructions {
  accountNumber: string;
  accountName: string;
}

type FlowStep = "phone" | "instructions" | "waiting" | "upload" | "pending" | "success";

/** Compress image client-side for 3G optimization */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1024;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const NatCashPaymentFlow = ({ amount, description, onSuccess }: NatCashPaymentFlowProps) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<FlowStep>("phone");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payMethod, setPayMethod] = useState<"ussd" | "app">("ussd");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      if (data.paymentInstructions) {
        setInstructions({
          accountNumber: data.paymentInstructions.accountNumber,
          accountName: data.paymentInstructions.accountName,
        });
      }
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

      if (!error && data?.status === "completed") return true;
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
          setStep("upload");
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

  // Handle receipt file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 MB)");
      return;
    }

    setReceiptFile(file);
    try {
      const compressed = await compressImage(file);
      setReceiptPreview(compressed);
    } catch {
      // If compression fails, just show a placeholder
      setReceiptPreview(null);
    }
  };

  // Upload receipt
  const handleUploadReceipt = async () => {
    if (!receiptFile || !orderId) return;

    setUploadLoading(true);
    try {
      const base64 = receiptPreview || await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(receiptFile);
      });

      const { data, error } = await supabase.functions.invoke("natcash-upload-receipt", {
        body: {
          orderId,
          receiptBase64: base64,
          fileName: receiptFile.name,
          natcashPhone: phone,
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Erreur lors du téléversement");
        return;
      }

      toast.success("Reçu téléversé! En attente de vérification.");
      setStep("pending");
    } catch {
      toast.error("Erreur réseau - vérifiez votre connexion");
    } finally {
      setUploadLoading(false);
    }
  };

  const accountNumber = instructions?.accountNumber;
  const accountConfigured = accountNumber && accountNumber !== "NOT_CONFIGURED";

  // ─── STEP: Phone Entry ─────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="natcash-phone" className="flex items-center gap-2">
            <Phone size={16} />
            Votre numéro NatCash (Natcom)
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
            Entrez votre numéro Natcom à 8 chiffres (sans le +509)
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

  // ─── STEP: Instructions ────────────────────────────────────
  if (step === "instructions") {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-semibold text-sm">Instructions de paiement NatCash</h4>

            {/* Method toggle */}
            <div className="flex rounded-lg bg-muted p-1 gap-1">
              <button
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${payMethod === "ussd" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                onClick={() => setPayMethod("ussd")}
              >
                📞 Via USSD
              </button>
              <button
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${payMethod === "app" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                onClick={() => setPayMethod("app")}
              >
                📱 Via l'App
              </button>
            </div>

            {payMethod === "ussd" ? (
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Composez <strong>*202#</strong> sur votre téléphone Natcom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Sélectionnez <strong>"Transfert d'argent"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>
                    {accountConfigured ? (
                      <>Entrez le numéro: <strong className="text-primary">{accountNumber}</strong></>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle size={14} />
                        Numéro non disponible — contactez le support
                      </span>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Entrez le montant: <strong>{amount} HTG</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  <span>Confirmez avec votre <strong>PIN NatCash</strong></span>
                </li>
              </ol>
            ) : (
              <div className="space-y-2">
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <span>Ouvrez l'application <strong>NatCash</strong> sur votre téléphone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <span>Sélectionnez <strong>"Transfert"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <span>
                      {accountConfigured ? (
                        <>Entrez le numéro: <strong className="text-primary">{accountNumber}</strong></>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertCircle size={14} />
                          Numéro non disponible — contactez le support
                        </span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                    <span>Entrez le montant: <strong>{amount} HTG</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">5</span>
                    <span>Confirmez le transfert</span>
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground pt-1">
                  Pas encore l'app?{" "}
                  <a href="https://play.google.com/store/apps/details?id=com.natcash" target="_blank" rel="noopener noreferrer" className="text-primary underline">Android</a>
                  {" · "}
                  <a href="https://apps.apple.com/us/app/natcash-natcom/id1613464862" target="_blank" rel="noopener noreferrer" className="text-primary underline">iPhone</a>
                </p>
              </div>
            )}

            {/* Destination info */}
            {accountConfigured && (
              <div className="bg-background rounded-lg p-3 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Envoyer à</p>
                <p className="font-mono font-bold text-lg text-primary">{accountNumber}</p>
                {instructions?.accountName && instructions.accountName !== "NOT_CONFIGURED" && (
                  <p className="text-xs text-muted-foreground">{instructions.accountName}</p>
                )}
              </div>
            )}

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
          disabled={!accountConfigured}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          J'ai effectué le transfert
        </Button>
      </div>
    );
  }

  // ─── STEP: Waiting / Polling ───────────────────────────────
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
          onClick={() => setStep("upload")}
        >
          Pas encore confirmé? Téléverser mon reçu
        </Button>
      </div>
    );
  }

  // ─── STEP: Receipt Upload (Fallback) ───────────────────────
  if (step === "upload") {
    return (
      <div className="space-y-4 py-2">
        <div className="text-center">
          <h4 className="font-semibold text-sm">Téléverser votre reçu</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Prenez une photo ou sélectionnez la capture d'écran de votre transfert NatCash.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        {receiptPreview ? (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={receiptPreview}
                alt="Aperçu du reçu"
                className="w-full max-h-48 object-contain bg-muted"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setReceiptPreview(null);
                  setReceiptFile(null);
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="mr-1 h-4 w-4" />
                Changer
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleUploadReceipt}
                disabled={uploadLoading}
              >
                {uploadLoading ? (
                  <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Envoi...</>
                ) : (
                  <><Upload className="mr-1 h-4 w-4" />Envoyer</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-24 border-dashed flex flex-col gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm">Photo ou fichier du reçu</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setStep("waiting");
            setPollCount(0);
          }}
        >
          Réessayer la vérification automatique
        </Button>
      </div>
    );
  }

  // ─── STEP: Pending Admin Verification ──────────────────────
  if (step === "pending") {
    return (
      <div className="text-center py-6 space-y-3">
        <Clock className="h-12 w-12 text-[hsl(var(--warning,40_96%_50%))] mx-auto" />
        <h4 className="font-semibold text-lg">Reçu en cours de vérification</h4>
        <p className="text-sm text-muted-foreground">
          Un administrateur vérifiera votre paiement sous peu. Votre abonnement sera activé automatiquement.
        </p>
      </div>
    );
  }

  // ─── STEP: Success ─────────────────────────────────────────
  return (
    <div className="text-center py-6 space-y-3">
      <CheckCircle className="h-12 w-12 text-[hsl(var(--success))] mx-auto" />
      <h4 className="font-semibold text-lg">Paiement confirmé!</h4>
      <p className="text-sm text-muted-foreground">
        Votre abonnement a été renouvelé pour 30 jours.
      </p>
    </div>
  );
};

export default NatCashPaymentFlow;
