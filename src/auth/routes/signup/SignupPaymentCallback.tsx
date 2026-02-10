/**
 * SignupPaymentCallback - Handles return from MonCash during signup
 * 
 * Reads orderId from URL, verifies payment, then redirects back to Step 3.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkSignupPaymentStatus } from '../../services/payment.service';
import { saveSignupProgress } from '../../store/authFlow.store';

type Status = 'verifying' | 'success' | 'failed';

export default function SignupPaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId') || searchParams.get('referenceId') || '';

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setError('Aucun identifiant de paiement trouvé');
      return;
    }
    verifyPayment();
  }, [orderId]);

  const verifyPayment = async () => {
    setStatus('verifying');
    setError('');

    const result = await checkSignupPaymentStatus(orderId);

    if (result.success && result.status === 'completed') {
      // Save payment completion to signup progress
      saveSignupProgress({
        accessMethod: 'moncash',
        paymentCompleted: true,
        paymentOrderId: orderId,
      });
      setStatus('success');
      // Auto-redirect back to Step 3 after 2 seconds
      setTimeout(() => navigate('/auth/signup/step-3'), 2000);
    } else {
      setStatus('failed');
      setError(result.error || 'Le paiement n\'a pas été confirmé');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6 p-6 text-center animate-in fade-in duration-300">
      {status === 'verifying' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div>
            <h3 className="text-lg font-bold">Vérification du paiement...</h3>
            <p className="text-sm text-muted-foreground mt-1">Veuillez patienter pendant que nous vérifions votre transaction.</p>
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-green-500" />
          <div>
            <h3 className="text-lg font-bold text-green-700">Paiement confirmé ! ✅</h3>
            <p className="text-sm text-muted-foreground mt-1">Redirection vers la dernière étape...</p>
          </div>
        </>
      )}

      {status === 'failed' && (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-bold text-destructive">Paiement non confirmé</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/auth/signup/step-3')}>
              ← Retour
            </Button>
            <Button onClick={verifyPayment}>
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
