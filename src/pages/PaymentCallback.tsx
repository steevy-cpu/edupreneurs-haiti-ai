import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PaymentStatus = 'checking' | 'completed' | 'failed' | 'pending' | 'error';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const orderId = searchParams.get('orderId');
  const hasError = searchParams.get('error') === 'true';
  const maxAttempts = 10;
  const pollInterval = 3000; // 3 seconds

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setErrorMessage('Aucun identifiant de commande trouvé');
      return;
    }

    // Check if MonCash redirected with an error (user cancelled or gateway error)
    if (hasError) {
      setStatus('failed');
      setErrorMessage('Le paiement a été annulé ou a échoué sur MonCash. Veuillez réessayer.');
      return;
    }

    checkPaymentStatus();
  }, [orderId, hasError]);

  const checkPaymentStatus = async () => {
    if (!orderId) return;
    
    try {
      setAttempts(prev => prev + 1);

      // First, trigger verification with MonCash/Bazik API to update DB status
      if (attempts === 0) {
        console.log('Triggering payment verification with MonCash API...');
        const { error: verifyError } = await supabase.functions.invoke('moncash-verify-payment', {
          body: { orderId }
        });
        if (verifyError) {
          console.warn('Verification call failed, falling back to status check:', verifyError);
        }
      }

      // Then check the status from DB
      const { data, error } = await supabase.functions.invoke('moncash-check-status', {
        body: { orderId }
      });

      if (error) {
        console.error('Status check error:', error);
        if (attempts >= maxAttempts) {
          setStatus('error');
          setErrorMessage('Impossible de vérifier le statut du paiement');
          return;
        }
        // Retry after interval
        setTimeout(checkPaymentStatus, pollInterval);
        return;
      }

      const paymentStatus = data?.transaction?.status;

      if (paymentStatus === 'completed') {
        setStatus('completed');
      } else if (paymentStatus === 'failed') {
        setStatus('failed');
        setErrorMessage(data?.transaction?.description || data?.error || 'Le paiement a échoué');
      } else if (paymentStatus === 'pending') {
        // Still pending, continue polling if we haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setStatus('pending');
          setTimeout(checkPaymentStatus, pollInterval);
        } else {
          // Max attempts reached, show pending state
          setStatus('pending');
        }
      } else {
        setStatus('error');
        setErrorMessage('Statut de paiement inconnu');
      }
    } catch (err) {
      console.error('Payment status check failed:', err);
      if (attempts >= maxAttempts) {
        setStatus('error');
        setErrorMessage('Erreur lors de la vérification du paiement');
      } else {
        setTimeout(checkPaymentStatus, pollInterval);
      }
    }
  };

  const handleRetry = () => {
    setStatus('checking');
    setAttempts(0);
    setErrorMessage(null);
    checkPaymentStatus();
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Vérification du paiement...</h3>
              <p className="text-muted-foreground">
                Nous vérifions votre paiement MonCash. Veuillez patienter.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Tentative {attempts}/{maxAttempts}
            </div>
          </>
        );

      case 'pending':
        return (
          <>
            <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Paiement en attente</h3>
              <p className="text-muted-foreground">
                Votre paiement est en cours de traitement. Si vous avez confirmé sur MonCash, 
                il sera validé sous peu.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Vérifier à nouveau
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Aller au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        );

      case 'completed':
        return (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Paiement réussi!</h3>
              <p className="text-muted-foreground">
                Votre abonnement Premium est maintenant actif. Profitez de toutes les fonctionnalités!
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Commencer à apprendre
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );

      case 'failed':
        return (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Paiement échoué</h3>
              <p className="text-muted-foreground">
                {errorMessage || 'Le paiement n\'a pas pu être complété.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/payment-demo')}>
                Réessayer
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Retour au tableau de bord
              </Button>
            </div>
          </>
        );

      case 'error':
      default:
        return (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Erreur</h3>
              <p className="text-muted-foreground">
                {errorMessage || 'Une erreur est survenue lors de la vérification du paiement.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Retour au tableau de bord
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
