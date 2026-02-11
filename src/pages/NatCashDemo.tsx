import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, CreditCard, Check, ArrowRight, ArrowLeft,
  Smartphone, Clock, Shield, Sparkles, Crown,
  Loader2, Upload, Camera, AlertCircle,
  CheckCircle2, XCircle, HelpCircle, Copy, FileText,
  Settings, Zap, Building2, Wifi, WifiOff,
  AppWindow, Download
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Step = 'info' | 'select-plan' | 'payment-instructions' | 'auto-verifying' | 'upload-receipt' | 'pending-verification' | 'verified' | 'rejected';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Premium Mensuel',
    price: 200,
    period: 'mois',
    popular: true,
    features: [
      'Accès illimité aux leçons',
      'Quiz et exercices illimités',
      'Assistant IA Jude',
      'Téléchargement hors ligne',
      'Support prioritaire'
    ]
  },
  {
    id: 'annual',
    name: 'Premium Annuel',
    price: 2000,
    period: 'an',
    features: [
      'Tout Premium inclus',
      '2 mois gratuits',
      'Accès anticipé aux nouvelles fonctionnalités',
      'Badge exclusif'
    ]
  }
];

export default function NatCashDemo() {
  const [step, setStep] = useState<Step>('info');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [natcashReference, setNatcashReference] = useState('');
  const [natcashPhone, setNatcashPhone] = useState('');
  const [autoVerifyProgress, setAutoVerifyProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo NatCash account info
  const natcashAccountNumber = "509-XXXX-XXXX";
  const natcashAccountName = "EDUPRENEURS HAITI";

  const progress: Record<Step, number> = {
    'info': 0,
    'select-plan': 15,
    'payment-instructions': 35,
    'auto-verifying': 55,
    'upload-receipt': 65,
    'pending-verification': 80,
    'verified': 100,
    'rejected': 80
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    const demoOrderId = `NATCASH-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(demoOrderId);
    setStep('payment-instructions');
    toast.success("Plan sélectionné! Suivez les instructions pour payer.");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 5MB");
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      toast.error("Veuillez sélectionner une capture d'écran");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep('pending-verification');
    toast.success("Reçu envoyé! En attente de vérification.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers!");
  };

  const simulateAutoVerification = () => {
    setStep('auto-verifying');
    setAutoVerifyProgress(0);
    
    const interval = setInterval(() => {
      setAutoVerifyProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setStep('verified');
            toast.success("✅ Paiement vérifié automatiquement! Abonnement activé.");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  const simulateAutoVerificationFailed = () => {
    setStep('auto-verifying');
    setAutoVerifyProgress(0);
    
    const interval = setInterval(() => {
      setAutoVerifyProgress(prev => {
        if (prev >= 70) {
          clearInterval(interval);
          setTimeout(() => {
            setStep('upload-receipt');
            toast.info("Vérification automatique non confirmée. Téléchargez votre reçu.");
          }, 500);
          return 70;
        }
        return prev + 10;
      });
    }, 400);
  };

  const simulateManualVerification = (approved: boolean) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (approved) {
        setStep('verified');
        toast.success("Paiement vérifié! Votre abonnement est actif.");
      } else {
        setStep('rejected');
        toast.error("Paiement rejeté. Veuillez réessayer.");
      }
    }, 1500);
  };

  // ─── INFO PAGE ───────────────────────────────────────────
  const renderInfoPage = () => (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* How it works - User side */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Comment ça marche pour l'utilisateur</CardTitle>
              <CardDescription>Le parcours de paiement NatCash</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex gap-4 items-start p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">1</div>
              <div>
                <p className="font-medium">L'utilisateur choisit son plan</p>
                <p className="text-sm text-muted-foreground">200 HTG/mois ou 2000 HTG/an</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Effectue le transfert NatCash</p>
                <p className="text-sm text-muted-foreground">Via USSD (*202#) ou l'application NatCash — les deux méthodes sont disponibles</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">3</div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Vérification automatique via Bazik.io
                </p>
                <p className="text-sm text-muted-foreground">Le système détecte le paiement automatiquement en comparant le numéro de téléphone et le montant. L'abonnement s'active instantanément!</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">4</div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-500" />
                  Fallback: Téléchargement du reçu (si nécessaire)
                </p>
                <p className="text-sm text-muted-foreground">Si la vérification automatique échoue (réseau, délai), l'utilisateur peut télécharger une capture d'écran du reçu. Un admin vérifie et approuve manuellement.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it works - Admin/Business side */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Côté Admin / Business</CardTitle>
              <CardDescription>Comment l'argent arrive et comment les comptes sont activés</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Where money goes */}
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Où va l'argent?
            </h4>
            <p className="text-sm text-green-600 dark:text-green-400 mb-3">
              L'argent est transféré <strong>directement sur votre portefeuille NatCash (Natcom)</strong>. 
              Le numéro de réception est configuré via le secret <code className="bg-green-100 dark:bg-green-900/30 px-1 rounded">NATCASH_ACCOUNT_NUMBER</code>.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span>Vous recevez l'argent instantanément sur votre téléphone Natcom</span>
            </div>
          </div>

          {/* Auto-verification flow */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Processus de vérification automatique
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                <p>L'utilisateur effectue le transfert NatCash vers votre numéro</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                <p><strong>Bazik.io</strong> (notre processeur de paiement) détecte la transaction via webhook</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                <p>Le système compare le <strong>numéro de téléphone</strong> et le <strong>montant</strong> avec la commande en attente</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">✓</div>
                <p>Si ça correspond → <strong>L'abonnement est activé automatiquement</strong> — aucune action admin requise!</p>
              </div>
            </div>
          </div>

          {/* When manual is needed */}
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Quand l'intervention manuelle est-elle nécessaire?
            </h4>
            <ul className="space-y-2 text-sm text-amber-600 dark:text-amber-400">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Problème de réseau empêchant le webhook Bazik.io d'arriver</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>L'utilisateur a payé avec un numéro différent de celui enregistré</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Le montant ne correspond pas exactement (frais de transfert inclus)</span>
              </li>
            </ul>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
              Dans ces cas, l'utilisateur télécharge son reçu et un admin l'approuve depuis le 
              <Link to="/admin/payments" className="underline font-medium ml-1">Panel Admin des Paiements</Link>.
            </p>
          </div>

          {/* Admin tools */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Outils Admin disponibles
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span><strong>Panel des Paiements</strong> — Voir toutes les transactions NatCash, approuver/rejeter les reçus</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span><strong>Virements sortants</strong> — Envoyer de l'argent aux utilisateurs (remboursements, récompenses)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span><strong>Historique complet</strong> — Toutes les transactions avec statuts et horodatage</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" className="bg-green-500 hover:bg-green-600" onClick={() => setStep('select-plan')}>
          Voir la démo du parcours utilisateur
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  // ─── PLAN SELECTION ──────────────────────────────────────
  const renderPlanSelection = () => (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full mb-4">
          <Smartphone className="w-5 h-5" />
          <span className="font-medium">Paiement via NatCash (Natcom)</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Choisissez votre plan</h2>
        <p className="text-muted-foreground">
          Payez facilement avec NatCash — Transfert mobile simple et sécurisé
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
              plan.popular ? 'border-green-500 shadow-md' : ''
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Recommandé
              </Badge>
            )}
            <CardHeader className="text-center pt-8">
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                plan.popular ? 'bg-green-500 text-white' : 'bg-muted'
              }`}>
                <Crown className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground"> HTG/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                Choisir ce plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-4">
        <Button variant="ghost" onClick={() => setStep('info')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux informations
        </Button>
      </div>
    </div>
  );

  // ─── PAYMENT INSTRUCTIONS (USSD + App tabs) ─────────────
  const renderPaymentInstructions = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Effectuez votre paiement</CardTitle>
        <CardDescription>
          Choisissez votre méthode de transfert NatCash préférée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Commande</span>
            <div className="flex items-center gap-2">
              <code className="bg-background px-2 py-1 rounded text-sm font-mono">{orderId}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(orderId)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Montant</span>
            <span className="font-bold text-green-600">{selectedPlan?.price.toLocaleString()} HTG</span>
          </div>
        </div>

        {/* NatCash Account Info */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Envoyez à ce numéro:
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Numéro:</span>
              <div className="flex items-center gap-2">
                <code className="bg-white dark:bg-background px-3 py-1 rounded font-mono font-bold">{natcashAccountNumber}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(natcashAccountNumber)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nom:</span>
              <span className="font-semibold">{natcashAccountName}</span>
            </div>
          </div>
        </div>

        {/* USSD vs App instructions */}
        <Tabs defaultValue="ussd" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ussd" className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              Via USSD
            </TabsTrigger>
            <TabsTrigger value="app" className="flex items-center gap-1">
              <AppWindow className="w-3 h-3" />
              Via l'App
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ussd" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Fonctionne sans internet
            </p>
            {[
              { title: "Composez *202#", desc: "Sur votre téléphone Natcom" },
              { title: "Sélectionnez \"Envoyer Argent\"", desc: "Option 1 dans le menu" },
              { title: `Entrez le numéro: ${natcashAccountNumber}`, desc: "Le compte Edupreneurs" },
              { title: `Entrez le montant: ${selectedPlan?.price.toLocaleString()} HTG`, desc: "Confirmez avec votre code PIN" },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">{i + 1}</div>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="app" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Nécessite internet
            </p>
            {[
              { title: "Ouvrez l'application NatCash", desc: "Sur votre téléphone" },
              { title: "Sélectionnez \"Transfert\"", desc: "Dans le menu principal" },
              { title: `Entrez le numéro: ${natcashAccountNumber}`, desc: "Le compte Edupreneurs" },
              { title: `Entrez le montant: ${selectedPlan?.price.toLocaleString()} HTG`, desc: "Confirmez le transfert" },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">{i + 1}</div>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <a href="https://play.google.com/store/apps/details?id=com.natcash" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" /> Google Play
                </Button>
              </a>
              <a href="https://apps.apple.com/us/app/natcash-natcom/id1613464862" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" /> App Store
                </Button>
              </a>
            </div>
          </TabsContent>
        </Tabs>

        {/* Auto-verification note */}
        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 flex items-start gap-3 border border-green-200 dark:border-green-800">
          <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-700 dark:text-green-300">Activation automatique</p>
            <p className="text-green-600 dark:text-green-400">
              Votre abonnement sera activé automatiquement dès que le paiement est détecté. Si la vérification automatique échoue, vous pourrez télécharger votre reçu.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <p className="text-xs text-muted-foreground mb-1">(Démo: Choisissez un scénario)</p>
        <Button 
          className="w-full bg-green-500 hover:bg-green-600" 
          onClick={simulateAutoVerification}
        >
          <Zap className="mr-2 h-4 w-4" />
          Simuler: Vérification automatique réussie ✓
        </Button>
        <Button 
          variant="outline"
          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={simulateAutoVerificationFailed}
        >
          <Upload className="mr-2 h-4 w-4" />
          Simuler: Vérification échouée → Reçu manuel
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep('select-plan')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux plans
        </Button>
      </CardFooter>
    </Card>
  );

  // ─── AUTO VERIFYING ──────────────────────────────────────
  const renderAutoVerifying = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <Zap className="w-10 h-10 text-green-500 animate-pulse" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Vérification en cours...</h3>
          <p className="text-muted-foreground">
            Le système vérifie automatiquement votre paiement via Bazik.io
          </p>
        </div>
        <div className="max-w-xs mx-auto space-y-2">
          <Progress value={autoVerifyProgress} className="h-3" />
          <p className="text-sm text-muted-foreground">{autoVerifyProgress}% — Recherche du paiement...</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Commande</span>
            <code className="font-mono">{orderId}</code>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Montant</span>
            <span className="font-semibold">{selectedPlan?.price.toLocaleString()} HTG</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── UPLOAD RECEIPT (fallback) ───────────────────────────
  const renderUploadReceipt = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-amber-600" />
        </div>
        <CardTitle className="text-2xl">Télécharger votre reçu</CardTitle>
        <CardDescription>
          La vérification automatique n'a pas pu confirmer le paiement. Envoyez votre reçu pour une vérification manuelle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 flex items-start gap-2 text-sm border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-600 dark:text-amber-400">
            Cela peut arriver si le réseau est lent ou si le numéro utilisé est différent. Un admin vérifiera votre reçu rapidement.
          </p>
        </div>

        {/* Phone number input */}
        <div className="space-y-2">
          <Label htmlFor="natcash-phone">Numéro NatCash utilisé</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="natcash-phone"
              placeholder="+509 3XXX XXXX"
              className="pl-10"
              value={natcashPhone}
              onChange={(e) => setNatcashPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Reference number */}
        <div className="space-y-2">
          <Label htmlFor="reference">Numéro de référence NatCash</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="reference"
              placeholder="Ex: NC123456789"
              className="pl-10"
              value={natcashReference}
              onChange={(e) => setNatcashReference(e.target.value)}
            />
          </div>
        </div>

        {/* File upload */}
        <div className="space-y-2">
          <Label>Capture d'écran du reçu</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          {receiptPreview ? (
            <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
              <img src={receiptPreview} alt="Receipt preview" className="w-full max-h-64 object-contain bg-muted" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
              >
                <XCircle className="w-4 h-4 mr-1" /> Supprimer
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium mb-1">Cliquez pour sélectionner</p>
              <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 5MB</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button 
          className="w-full bg-green-500 hover:bg-green-600" 
          onClick={handleUploadReceipt}
          disabled={isLoading || !receiptFile}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
          ) : (
            <><Upload className="mr-2 h-4 w-4" /> Envoyer pour vérification</>
          )}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep('payment-instructions')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </CardFooter>
    </Card>
  );

  // ─── PENDING VERIFICATION ────────────────────────────────
  const renderPendingVerification = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">En attente de vérification manuelle</h3>
          <p className="text-muted-foreground">
            Un administrateur vérifiera votre reçu et activera votre abonnement.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Commande</span>
            <code className="bg-background px-2 py-1 rounded text-sm font-mono">{orderId}</code>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-semibold">{selectedPlan?.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Statut</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              <Clock className="w-3 h-3 mr-1" /> Reçu envoyé — vérification en cours
            </Badge>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
          <p className="text-blue-700 dark:text-blue-300">
            <Clock className="w-4 h-4 inline mr-1" />
            La vérification manuelle prend généralement 5 à 30 minutes.
          </p>
        </div>

        {/* Demo buttons */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">(Démo: Simuler la réponse admin)</p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => simulateManualVerification(true)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Approuver
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => simulateManualVerification(false)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
              Rejeter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── VERIFIED ────────────────────────────────────────────
  const renderVerified = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Paiement vérifié!</h3>
          <p className="text-muted-foreground">
            Votre abonnement {selectedPlan?.name} est maintenant actif.
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3 text-left border border-green-200 dark:border-green-800">
          <h4 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-300">
            <Sparkles className="w-4 h-4" /> Vos avantages Premium
          </h4>
          <ul className="space-y-2">
            {selectedPlan?.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" /> {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Commande</span>
            <code className="font-mono">{orderId}</code>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Valide jusqu'au</span>
            <span className="font-medium">
              {new Date(Date.now() + (selectedPlan?.period === 'an' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
          Accéder à mon compte Premium
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  // ─── REJECTED ────────────────────────────────────────────
  const renderRejected = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Paiement non vérifié</h3>
          <p className="text-muted-foreground">
            Nous n'avons pas pu vérifier votre paiement.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-left border border-red-200 dark:border-red-800">
          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Raisons possibles:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
            <li>La capture d'écran n'est pas lisible</li>
            <li>Le montant ne correspond pas</li>
            <li>Le numéro de référence est incorrect</li>
            <li>Le paiement n'a pas été reçu</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Button className="w-full" onClick={() => {
            setReceiptFile(null); setReceiptPreview(''); setNatcashReference('');
            setStep('upload-receipt');
          }}>
            <Upload className="mr-2 h-4 w-4" /> Renvoyer un nouveau reçu
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setStep('payment-instructions')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Refaire le paiement
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 border-green-500 text-green-600">
            <Smartphone className="w-3 h-3 mr-1" />
            Démo — Paiement NatCash (Natcom)
          </Badge>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Edupreneurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Paiement par transfert mobile NatCash
          </p>
        </div>

        {/* Progress */}
        {step !== 'info' && (
          <div className="mb-8 max-w-lg mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Plan</span>
              <span>Paiement</span>
              <span>Vérification</span>
              <span>Terminé</span>
            </div>
            <Progress value={progress[step]} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        {step === 'info' && renderInfoPage()}
        {step === 'select-plan' && renderPlanSelection()}
        {step === 'payment-instructions' && renderPaymentInstructions()}
        {step === 'auto-verifying' && renderAutoVerifying()}
        {step === 'upload-receipt' && renderUploadReceipt()}
        {step === 'pending-verification' && renderPendingVerification()}
        {step === 'verified' && renderVerified()}
        {step === 'rejected' && renderRejected()}

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Paiement sécurisé via NatCash/Natcom</span>
          </div>
          
          <div className="flex gap-2 justify-center">
            {step !== 'info' && (
              <Button variant="outline" size="sm" onClick={() => setStep('info')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Comment ça marche?
              </Button>
            )}
            <Link to="/admin/payments-demo">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Panel Admin (Démo)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
