import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Clock, DollarSign, Phone, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  receipt_url: string | null;
  natcash_phone: string | null;
  natcash_reference: string | null;
  admin_verified: boolean | null;
  verified_by: string | null;
  verification_notes: string | null;
  verified_at: string | null;
  created_at: string;
  user_id: string;
  description: string | null;
}

const AdminPayments = () => {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Fetch pending NatCash payments
  const { data: pendingPayments, isLoading } = useQuery({
    queryKey: ['admin-natcash-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('provider', 'natcash')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PaymentTransaction[];
    }
  });

  // Verify payment mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ orderId, action, notes }: { orderId: string; action: 'approve' | 'reject'; notes?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('natcash-admin-verify', {
        body: { orderId, action, notes }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(variables.action === 'approve' ? 'Paiement approuvé' : 'Paiement rejeté');
      queryClient.invalidateQueries({ queryKey: ['admin-natcash-payments'] });
      setSelectedTransaction(null);
      setVerificationNotes("");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const handleVerify = (action: 'approve' | 'reject') => {
    if (!selectedTransaction) return;
    verifyMutation.mutate({
      orderId: selectedTransaction.order_id,
      action,
      notes: verificationNotes || undefined
    });
  };

  const getStatusBadge = (status: string, adminVerified: boolean | null) => {
    if (adminVerified) {
      return status === 'completed' 
        ? <Badge className="bg-green-500">Approuvé</Badge>
        : <Badge variant="destructive">Rejeté</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-500 text-black">Reçu téléversé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingVerificationCount = pendingPayments?.filter(
    p => p.status === 'pending_verification' && !p.admin_verified
  ).length || 0;

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Paiements NatCash</h1>
            <p className="text-muted-foreground">Vérifiez et approuvez les paiements NatCash</p>
          </div>
          {pendingVerificationCount > 0 && (
            <Badge className="bg-yellow-500 text-black text-lg px-4 py-2">
              {pendingVerificationCount} en attente de vérification
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : pendingPayments?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Aucun paiement NatCash</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingPayments?.map((payment) => (
              <Card 
                key={payment.id}
                className={payment.status === 'pending_verification' && !payment.admin_verified 
                  ? 'border-yellow-500 border-2' 
                  : ''}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold">{payment.order_id}</span>
                        {getStatusBadge(payment.status, payment.admin_verified)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {payment.amount} {payment.currency || 'HTG'}
                        </span>
                        {payment.natcash_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {payment.natcash_phone}
                          </span>
                        )}
                        {payment.natcash_reference && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Réf: {payment.natcash_reference}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>

                      {payment.verification_notes && (
                        <p className="text-sm italic text-muted-foreground">
                          Notes: {payment.verification_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {payment.receipt_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewReceiptUrl(payment.receipt_url)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir Reçu
                        </Button>
                      )}
                      
                      {payment.status === 'pending_verification' && !payment.admin_verified && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedTransaction(payment)}
                        >
                          Vérifier
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Verification Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Vérifier le Paiement</DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Commande:</strong> {selectedTransaction.order_id}</p>
                  <p><strong>Montant:</strong> {selectedTransaction.amount} {selectedTransaction.currency || 'HTG'}</p>
                  {selectedTransaction.natcash_phone && (
                    <p><strong>Téléphone:</strong> {selectedTransaction.natcash_phone}</p>
                  )}
                  {selectedTransaction.natcash_reference && (
                    <p><strong>Référence:</strong> {selectedTransaction.natcash_reference}</p>
                  )}
                </div>

                {selectedTransaction.receipt_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setViewReceiptUrl(selectedTransaction.receipt_url)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le Reçu
                  </Button>
                )}

                <div>
                  <label className="text-sm font-medium">Notes de vérification (optionnel)</label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Ajoutez des notes sur cette vérification..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => handleVerify('reject')}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Rejeter
              </Button>
              <Button
                onClick={() => handleVerify('approve')}
                disabled={verifyMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Receipt Viewer Dialog */}
        <Dialog open={!!viewReceiptUrl} onOpenChange={() => setViewReceiptUrl(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Reçu de Paiement</DialogTitle>
            </DialogHeader>
            {viewReceiptUrl && (
              <div className="flex justify-center overflow-auto">
                <img 
                  src={viewReceiptUrl} 
                  alt="Reçu de paiement"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AdminPayments;
