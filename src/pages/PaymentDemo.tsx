import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Lock, Phone, GraduationCap, 
  CreditCard, Check, ArrowRight, ArrowLeft,
  Smartphone, Clock, Shield, Sparkles, Crown,
  Loader2, ExternalLink, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Step = 'signup' | 'plan' | 'payment' | 'processing' | 'success';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  trial?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'gratuit',
    features: [
      'Accès aux leçons de base',
      'Quiz limités',
      'Support communautaire'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    period: 'mois',
    trial: true,
    popular: true,
    features: [
      '7 jours d\'essai gratuit',
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

export default function PaymentDemo() {
  const [step, setStep] = useState<Step>('signup');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    grade: ''
  });

  const progress = {
    signup: 25,
    plan: 50,
    payment: 75,
    processing: 90,
    success: 100
  };

  const handleSignup = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    toast.success("Compte créé avec succès!");
    setStep('plan');
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (plan.price === 0) {
      toast.success("Plan gratuit activé!");
      setStep('success');
    } else {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    setStep('processing');
    
    try {
      // Call the real MonCash create payment API
      const { data, error } = await supabase.functions.invoke('moncash-create-payment', {
        body: { 
          amount: selectedPlan.price, 
          description: `Abonnement ${selectedPlan.name} - Edupreneurs` 
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        toast.error("Erreur lors de la création du paiement");
        setStep('payment');
        setIsLoading(false);
        return;
      }

      if (!data?.success || !data?.redirectUrl) {
        console.error('Invalid payment response:', data);
        toast.error(data?.error || "Erreur lors de la création du paiement");
        setStep('payment');
        setIsLoading(false);
        return;
      }

      // Store orderId for callback verification
      const orderId = data.orderId;
      
      // Redirect to MonCash payment portal
      // The return URL is configured in the MonCash dashboard
      // After payment, user will be redirected to /payment/callback?orderId=XXX
      toast.info("Redirection vers MonCash...");
      
      // Open MonCash in a new window or redirect
      window.location.href = data.redirectUrl;
      
    } catch (err) {
      console.error('Payment error:', err);
      toast.error("Une erreur est survenue");
      setStep('payment');
      setIsLoading(false);
    }
  };

  const renderSignup = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez la communauté Edupreneurs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom complet</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Jean Baptiste"
              className="pl-10"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="jean@example.com"
              className="pl-10"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="+509 3XXX XXXX"
              className="pl-10"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="grade">Niveau scolaire</Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="grade"
              placeholder="9ème AF"
              className="pl-10"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSignup}>
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPlanSelection = () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choisissez votre plan</h2>
        <p className="text-muted-foreground">
          Commencez avec 7 jours d'essai gratuit sur le plan Premium
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              plan.popular ? 'border-primary shadow-md scale-105' : ''
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Populaire
              </Badge>
            )}
            {plan.trial && (
              <Badge variant="secondary" className="absolute -top-3 right-4">
                <Clock className="w-3 h-3 mr-1" />
                7 jours gratuit
              </Badge>
            )}
            <CardHeader className="text-center pt-8">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {plan.id === 'starter' ? <User className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
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
                className="w-full" 
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => setStep('signup')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
          <img 
            src="https://www.moncashbutton.digicelgroup.com/M0n-Cash-Icons_Button.png" 
            alt="MonCash" 
            className="w-10 h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Smartphone className="w-8 h-8 text-orange-500" />
        </div>
        <CardTitle className="text-2xl">Paiement MonCash</CardTitle>
        <CardDescription>
          Payez en toute sécurité avec MonCash
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Plan sélectionné</span>
            <span className="font-semibold">{selectedPlan?.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Prix</span>
            <span className="font-semibold">{selectedPlan?.price} HTG/{selectedPlan?.period}</span>
          </div>
          {selectedPlan?.trial && (
            <>
              <Separator />
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Essai gratuit
                </span>
                <span className="font-semibold">7 jours</span>
              </div>
            </>
          )}
          <Separator />
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total aujourd'hui</span>
            <span className="font-bold text-primary">
              {selectedPlan?.trial ? '0' : selectedPlan?.price} HTG
            </span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300">Paiement sécurisé</p>
            <p className="text-blue-600 dark:text-blue-400">
              {selectedPlan?.trial 
                ? "Vous ne serez pas débité aujourd'hui. Le paiement sera effectué après les 7 jours d'essai."
                : "Votre transaction est protégée par MonCash."
              }
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moncash-phone">Numéro MonCash</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="moncash-phone"
              placeholder="+509 3XXX XXXX"
              className="pl-10"
              defaultValue={formData.phone}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Vous recevrez une notification MonCash pour confirmer le paiement
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handlePayment}>
          <CreditCard className="mr-2 h-4 w-4" />
          {selectedPlan?.trial ? 'Commencer l\'essai gratuit' : 'Payer avec MonCash'}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep('plan')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Changer de plan
        </Button>
      </CardFooter>
    </Card>
  );

  const renderProcessing = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center animate-pulse">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Traitement en cours...</h3>
          <p className="text-muted-foreground">
            Veuillez confirmer la transaction sur votre téléphone MonCash
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Étapes:</p>
          <ol className="list-decimal list-inside space-y-1 text-left text-muted-foreground">
            <li>Ouvrez l'application MonCash sur votre téléphone</li>
            <li>Confirmez la notification de paiement</li>
            <li>Entrez votre code PIN MonCash</li>
            <li>Attendez la confirmation</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Bienvenue sur Edupreneurs!</h3>
          <p className="text-muted-foreground">
            {selectedPlan?.trial 
              ? `Votre essai gratuit de 7 jours a commencé. Profitez de toutes les fonctionnalités Premium!`
              : `Votre abonnement ${selectedPlan?.name || 'Starter'} est maintenant actif.`
            }
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Vos avantages
          </h4>
          <ul className="space-y-2">
            {(selectedPlan?.features || plans[0].features).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {selectedPlan?.trial && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4 inline mr-1" />
              Rappel: Votre premier paiement de <strong>{selectedPlan.price} HTG</strong> sera débité le{' '}
              <strong>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</strong>
            </p>
          </div>
        )}

        <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
          Commencer à apprendre
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            Démo - Flux d'inscription et paiement
          </Badge>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Edupreneurs
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Inscription</span>
            <span>Plan</span>
            <span>Paiement</span>
            <span>Terminé</span>
          </div>
          <Progress value={progress[step]} className="h-2" />
        </div>

        {/* Step Content */}
        {step === 'signup' && renderSignup()}
        {step === 'plan' && renderPlanSelection()}
        {step === 'payment' && renderPayment()}
        {step === 'processing' && renderProcessing()}
        {step === 'success' && renderSuccess()}

        {/* Demo Notice */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Ceci est une démonstration du flux de paiement MonCash.
            <br />
            Aucune transaction réelle n'est effectuée.
          </p>
        </div>
      </div>
    </div>
  );
}
