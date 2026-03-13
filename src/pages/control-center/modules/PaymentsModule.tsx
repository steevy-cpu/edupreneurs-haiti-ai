import { useState, useMemo, useEffect } from "react";
import { PAYMENTS_PAGE_SIZE } from '@/lib/constants/pagination';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Clock, DollarSign, Loader2, RefreshCw, Search, Filter, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  receipt_url: string | null;
  admin_verified: boolean | null;
  verified_by: string | null;
  verification_notes: string | null;
  verified_at: string | null;
  created_at: string;
  user_id: string;
  description: string | null;
}

const PaymentsModule = () => {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Accumulation pagination — 50 rows per page, append-style
  const [page, setPage] = useState(0);
  const [allPayments, setAllPayments] = useState<PaymentTransaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  // Reset accumulated data when filters change
  useEffect(() => {
    setAllPayments([]);
    setPage(0);
    setHasMore(true);
  }, [statusFilter, providerFilter]);

  const { data: pagePayments, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments', statusFilter, providerFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        // 50 rows per page — prevents unbounded fetches
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      
      // Apply filters
      if (statusFilter !== "all") {
        if (statusFilter === "pending_verification") {
          query = query.eq('status', 'pending_verification').eq('admin_verified', false);
        } else {
          query = query.eq('status', statusFilter);
        }
      }
      
      if (providerFilter !== "all") {
        query = query.eq('provider', providerFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentTransaction[];
    }
  });

  // Append fetched page to accumulated list
  useEffect(() => {
    if (!pagePayments) return;
    setHasMore(pagePayments.length === PAGE_SIZE);
    if (page === 0) {
      setAllPayments(pagePayments);
    } else {
      setAllPayments((prev) => [...prev, ...pagePayments]);
    }
  }, [pagePayments, page]);

  // Manual payment verification mutation (approve/reject pending receipts)
  const verifyMutation = useMutation({
    mutationFn: async ({ orderId, action, notes }: { orderId: string; action: 'approve' | 'reject'; notes?: string }) => {
      const updateData: Record<string, unknown> = {
        admin_verified: action === 'approve',
        verified_at: new Date().toISOString(),
      };
      if (notes) updateData.verification_notes = notes;
      if (action === 'approve') updateData.status = 'completed';
      // Rejected payments need their status updated too
      if (action === 'reject') updateData.status = 'rejected';

      const { error } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('order_id', orderId);

      if (error) throw new Error(error.message);
      return { success: true };
    },
    onSuccess: (data, variables) => {
      toast.success(variables.action === 'approve' ? 'Paiement approuvé' : 'Paiement rejeté');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
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
      case 'completed':
        return <Badge className="bg-green-500">Complété</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'moncash':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">MonCash</Badge>;
      case 'stripe':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Stripe</Badge>;
      default:
        return <Badge variant="outline">{provider}</Badge>;
    }
  };

  // Filter accumulated payments by search query (order_id only)
  const filteredPayments = useMemo(() => {
    if (!allPayments.length) return [];
    if (!searchQuery) return allPayments;
    return allPayments.filter(p =>
      p.order_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPayments, searchQuery]);

  const pendingVerificationCount = allPayments.filter(
    p => p.status === 'pending_verification' && !p.admin_verified
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Paiements</h2>
          <p className="text-muted-foreground">Vérifiez et approuvez les paiements</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingVerificationCount > 0 && (
            <Badge className="bg-yellow-500 text-black px-3 py-1">
              {pendingVerificationCount} en attente
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID de commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="pending_verification">À vérifier</SelectItem>
                <SelectItem value="completed">Complétés</SelectItem>
                <SelectItem value="failed">Échoués</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={(v) => { setProviderFilter(v); }}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="moncash">MonCash</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {isLoading && page === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !filteredPayments.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Aucun paiement trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Loaded count indicator */}
          <p className="text-sm text-muted-foreground">
            Affichage de {filteredPayments.length} paiements
          </p>

          {filteredPayments.map((payment) => (
            <Card 
              key={payment.id}
              className={payment.status === 'pending_verification' && !payment.admin_verified 
                ? 'border-yellow-500 border-2' 
                : ''}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold">{payment.order_id}</span>
                      {getProviderBadge(payment.provider)}
                      {getStatusBadge(payment.status, payment.admin_verified)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {payment.amount} {payment.currency || 'HTG'}
                      </span>
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

          {/* Load more: shown when more rows may exist */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Charger plus
              </Button>
            </div>
          )}
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
                <p><strong>Fournisseur:</strong> {selectedTransaction.provider}</p>
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

export default PaymentsModule;
