import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, CreditCard, Check, ArrowRight, ArrowLeft,
  Smartphone, Clock, Shield, Sparkles, Crown,
  Loader2, Upload, Camera, Image, AlertCircle,
  CheckCircle2, XCircle, HelpCircle, Copy, FileText,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type Step = 'select-plan' | 'ussd-instructions' | 'upload-receipt' | 'pending-verification' | 'verified' | 'rejected';

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
    price: 500,
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
    price: 4500,
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
  const [step, setStep] = useState<Step>('select-plan');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [natcashReference, setNatcashReference] = useState('');
  const [natcashPhone, setNatcashPhone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo NatCash account info
  const natcashAccountNumber = "509-3456-7890";
  const natcashAccountName = "EDUPRENEURS HAITI";

  const progress = {
    'select-plan': 20,
    'ussd-instructions': 40,
    'upload-receipt': 60,
    'pending-verification': 80,
    'verified': 100,
    'rejected': 80
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    // Generate a demo order ID
    const demoOrderId = `NATCASH-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(demoOrderId);
    setStep('ussd-instructions');
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
    if (!natcashReference.trim()) {
      toast.error("Veuillez entrer le numéro de référence NatCash");
      return;
    }

    setIsLoading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setStep('pending-verification');
    toast.success("Reçu envoyé! En attente de vérification par l'admin.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers!");
  };

  const simulateVerification = (approved: boolean) => {
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

  const renderPlanSelection = () => (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full mb-4">
          <Smartphone className="w-5 h-5" />
          <span className="font-medium">Paiement via NatCash</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Choisissez votre plan</h2>
        <p className="text-muted-foreground">
          Payez facilement avec NatCash - Transfert mobile simple et sécurisé
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
    </div>
  );

  const renderUSSDInstructions = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Instructions de paiement NatCash</CardTitle>
        <CardDescription>
          Suivez ces étapes pour effectuer votre transfert
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Numéro de commande</span>
            <div className="flex items-center gap-2">
              <code className="bg-background px-2 py-1 rounded text-sm font-mono">{orderId}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(orderId)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-semibold">{selectedPlan?.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Montant à payer</span>
            <span className="font-bold text-green-600">{selectedPlan?.price.toLocaleString()} HTG</span>
          </div>
        </div>

        {/* NatCash Account Info */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Compte NatCash Edupreneurs
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

        {/* USSD Instructions */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Comment effectuer le transfert:
          </h4>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Composez *202#</p>
                <p className="text-sm text-muted-foreground">Sur votre téléphone Natcom</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Sélectionnez "Envoyer Argent"</p>
                <p className="text-sm text-muted-foreground">Option 1 dans le menu</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Entrez le numéro: {natcashAccountNumber}</p>
                <p className="text-sm text-muted-foreground">Le compte Edupreneurs</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">4</div>
              <div>
                <p className="font-medium">Entrez le montant: {selectedPlan?.price.toLocaleString()} HTG</p>
                <p className="text-sm text-muted-foreground">Et votre code PIN pour confirmer</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">5</div>
              <div>
                <p className="font-medium">Prenez une capture d'écran</p>
                <p className="text-sm text-muted-foreground">Du message de confirmation avec le numéro de référence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 flex items-start gap-3 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300">Important</p>
            <p className="text-amber-600 dark:text-amber-400">
              Gardez le message de confirmation! Vous devrez télécharger la capture d'écran pour activer votre compte.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button 
          className="w-full bg-green-500 hover:bg-green-600" 
          onClick={() => setStep('upload-receipt')}
        >
          J'ai effectué le paiement
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep('select-plan')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux plans
        </Button>
      </CardFooter>
    </Card>
  );

  const renderUploadReceipt = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Télécharger votre reçu</CardTitle>
        <CardDescription>
          Envoyez la capture d'écran de confirmation NatCash
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order reminder */}
        <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Commande:</span>
          <code className="bg-background px-2 py-1 rounded text-sm font-mono">{orderId}</code>
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

        {/* Reference number input */}
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
          <p className="text-xs text-muted-foreground">
            Le numéro de référence se trouve dans le SMS de confirmation
          </p>
        </div>

        {/* File upload area */}
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
              <img 
                src={receiptPreview} 
                alt="Receipt preview" 
                className="w-full max-h-64 object-contain bg-muted"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setReceiptFile(null);
                  setReceiptPreview('');
                }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">Cliquez pour sélectionner</p>
              <p className="text-sm text-muted-foreground">ou glissez-déposez votre image</p>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG jusqu'à 5MB</p>
            </div>
          )}
        </div>

        {/* Help section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300">Besoin d'aide?</p>
            <p className="text-blue-600 dark:text-blue-400">
              Assurez-vous que la capture d'écran montre clairement le montant, la date et le numéro de référence.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button 
          className="w-full bg-green-500 hover:bg-green-600" 
          onClick={handleUploadReceipt}
          disabled={isLoading || !receiptFile}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Envoyer pour vérification
            </>
          )}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep('ussd-instructions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux instructions
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPendingVerification = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">En attente de vérification</h3>
          <p className="text-muted-foreground">
            Notre équipe vérifie votre paiement. Vous recevrez une notification une fois approuvé.
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
            <span className="text-muted-foreground">Montant</span>
            <span className="font-semibold">{selectedPlan?.price.toLocaleString()} HTG</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Statut</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              <Clock className="w-3 h-3 mr-1" />
              En attente
            </Badge>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
          <p className="text-blue-700 dark:text-blue-300">
            <Clock className="w-4 h-4 inline mr-1" />
            La vérification prend généralement entre 5 et 30 minutes pendant les heures ouvrables.
          </p>
        </div>

        {/* Demo buttons to simulate admin actions */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">
            (Démo: Simuler la réponse de l'admin)
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => simulateVerification(true)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Approuver
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => simulateVerification(false)}
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
            <Sparkles className="w-4 h-4" />
            Vos avantages Premium
          </h4>
          <ul className="space-y-2">
            {selectedPlan?.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Numéro de commande</span>
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

  const renderRejected = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Paiement non vérifié</h3>
          <p className="text-muted-foreground">
            Nous n'avons pas pu vérifier votre paiement. Veuillez réessayer.
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
          <Button 
            className="w-full" 
            onClick={() => {
              setReceiptFile(null);
              setReceiptPreview('');
              setNatcashReference('');
              setStep('upload-receipt');
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Renvoyer un nouveau reçu
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setStep('ussd-instructions')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Refaire le paiement
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
            Démo - Paiement NatCash
          </Badge>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Edupreneurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Paiement par transfert mobile NatCash
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Plan</span>
            <span>Instructions</span>
            <span>Reçu</span>
            <span>Vérification</span>
            <span>Terminé</span>
          </div>
          <Progress value={progress[step]} className="h-2" />
        </div>

        {/* Step Content */}
        {step === 'select-plan' && renderPlanSelection()}
        {step === 'ussd-instructions' && renderUSSDInstructions()}
        {step === 'upload-receipt' && renderUploadReceipt()}
        {step === 'pending-verification' && renderPendingVerification()}
        {step === 'verified' && renderVerified()}
        {step === 'rejected' && renderRejected()}

        {/* Footer info */}
        <div className="mt-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Paiement sécurisé via NatCash/Digicel</span>
          </div>
          
          <div>
            <Link to="/admin/payments-demo">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Voir le Panel Admin (Demo)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
