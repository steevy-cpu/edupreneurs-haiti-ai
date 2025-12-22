import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Receipt,
  User,
  Calendar,
  DollarSign,
  Phone,
  FileText,
  ZoomIn,
  Download,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Demo revenue data for the chart
const demoRevenueData = [
  { month: "Jan", natcash: 12500, moncash: 18200, total: 30700 },
  { month: "Fév", natcash: 15800, moncash: 22100, total: 37900 },
  { month: "Mar", natcash: 18200, moncash: 19800, total: 38000 },
  { month: "Avr", natcash: 22400, moncash: 25600, total: 48000 },
  { month: "Mai", natcash: 28900, moncash: 31200, total: 60100 },
  { month: "Juin", natcash: 35600, moncash: 38400, total: 74000 },
  { month: "Juil", natcash: 42300, moncash: 45100, total: 87400 },
  { month: "Août", natcash: 38700, moncash: 41200, total: 79900 },
  { month: "Sep", natcash: 45200, moncash: 48900, total: 94100 },
  { month: "Oct", natcash: 52100, moncash: 55400, total: 107500 },
  { month: "Nov", natcash: 58900, moncash: 62300, total: 121200 },
  { month: "Déc", natcash: 67500, moncash: 71800, total: 139300 },
];

const totalNatCash = demoRevenueData.reduce((sum, d) => sum + d.natcash, 0);
const totalMonCash = demoRevenueData.reduce((sum, d) => sum + d.moncash, 0);
const grandTotal = totalNatCash + totalMonCash;

// Demo data for pending payments
const demoPendingPayments = [
  {
    id: "1",
    order_id: "NC-2024-001234",
    user_name: "Jean-Pierre Louis",
    user_avatar: null,
    user_email: "jp.louis@email.com",
    amount: 500,
    currency: "HTG",
    description: "Plan Premium - 1 mois",
    natcash_phone: "+509 3456 7890",
    natcash_reference: "TXN123456789",
    receipt_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    uploaded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    order_id: "NC-2024-001235",
    user_name: "Marie Claire Joseph",
    user_avatar: null,
    user_email: "mc.joseph@email.com",
    amount: 1200,
    currency: "HTG",
    description: "Plan Premium - 3 mois",
    natcash_phone: "+509 4567 8901",
    natcash_reference: "TXN987654321",
    receipt_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=600&fit=crop",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    uploaded_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    order_id: "NC-2024-001236",
    user_name: "Pierre André Michel",
    user_avatar: null,
    user_email: "pa.michel@email.com",
    amount: 2000,
    currency: "HTG",
    description: "Plan Premium - 6 mois",
    natcash_phone: "+509 5678 9012",
    natcash_reference: "TXN456789123",
    receipt_url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=600&fit=crop",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    uploaded_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

const demoVerifiedPayments = [
  {
    id: "4",
    order_id: "NC-2024-001230",
    user_name: "Sophie Beaumont",
    amount: 500,
    currency: "HTG",
    description: "Plan Premium - 1 mois",
    verified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: "Admin",
  },
  {
    id: "5",
    order_id: "NC-2024-001228",
    user_name: "Jacques Duval",
    amount: 1200,
    currency: "HTG",
    description: "Plan Premium - 3 mois",
    verified_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: "Admin",
  },
];

const demoRejectedPayments = [
  {
    id: "6",
    order_id: "NC-2024-001225",
    user_name: "Robert Martin",
    amount: 500,
    currency: "HTG",
    description: "Plan Premium - 1 mois",
    rejected_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rejection_reason: "Reçu illisible - veuillez soumettre une photo plus claire",
  },
];

type Payment = typeof demoPendingPayments[0];

export default function AdminPaymentsDemo() {
  const [pendingPayments, setPendingPayments] = useState(demoPendingPayments);
  const [verifiedPayments, setVerifiedPayments] = useState(demoVerifiedPayments);
  const [rejectedPayments, setRejectedPayments] = useState(demoRejectedPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `il y a ${minutes} min`;
    }
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setVerifyDialogOpen(true);
  };

  const handleRejectClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Move to verified
    setPendingPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
    setVerifiedPayments(prev => [{
      id: selectedPayment.id,
      order_id: selectedPayment.order_id,
      user_name: selectedPayment.user_name,
      amount: selectedPayment.amount,
      currency: selectedPayment.currency,
      description: selectedPayment.description,
      verified_at: new Date().toISOString(),
      verified_by: "Admin (Demo)",
    }, ...prev]);
    
    setIsProcessing(false);
    setVerifyDialogOpen(false);
    toast.success("Paiement vérifié avec succès!", {
      description: `Commande ${selectedPayment.order_id} approuvée`
    });
  };

  const handleConfirmReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast.error("Veuillez indiquer une raison de rejet");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Move to rejected
    setPendingPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
    setRejectedPayments(prev => [{
      id: selectedPayment.id,
      order_id: selectedPayment.order_id,
      user_name: selectedPayment.user_name,
      amount: selectedPayment.amount,
      currency: selectedPayment.currency,
      description: selectedPayment.description,
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
    }, ...prev]);
    
    setIsProcessing(false);
    setRejectDialogOpen(false);
    toast.error("Paiement rejeté", {
      description: `Commande ${selectedPayment.order_id} refusée`
    });
  };

  const resetDemo = () => {
    setPendingPayments(demoPendingPayments);
    setVerifiedPayments(demoVerifiedPayments);
    setRejectedPayments(demoRejectedPayments);
    toast.info("Demo réinitialisée");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/natcash-demo">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Vérification Paiements</h1>
              <p className="text-sm text-muted-foreground">Panel Administrateur (Demo)</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetDemo}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser Demo
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingPayments.length}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vérifiés</p>
                  <p className="text-3xl font-bold text-green-600">{verifiedPayments.length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejetés</p>
                  <p className="text-3xl font-bold text-red-600">{rejectedPayments.length}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Revenus Totaux
                </CardTitle>
                <CardDescription>Comparaison NatCash vs MonCash (2024)</CardDescription>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">NatCash</p>
                  <p className="text-lg font-bold text-orange-500">{totalNatCash.toLocaleString()} HTG</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">MonCash</p>
                  <p className="text-lg font-bold text-blue-500">{totalMonCash.toLocaleString()} HTG</p>
                </div>
                <div className="border-l pl-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-green-500">{grandTotal.toLocaleString()} HTG</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNatcash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorMoncash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} HTG`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="natcash" 
                    name="NatCash"
                    stroke="#f97316" 
                    fillOpacity={1} 
                    fill="url(#colorNatcash)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="moncash" 
                    name="MonCash"
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorMoncash)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly Breakdown Bar Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4">Répartition Mensuelle</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} HTG`, '']}
                    />
                    <Legend />
                    <Bar dataKey="natcash" name="NatCash" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="moncash" name="MonCash" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              En attente
              {pendingPayments.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 justify-center bg-amber-500">
                  {pendingPayments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified">Vérifiés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          </TabsList>

          {/* Pending Payments */}
          <TabsContent value="pending">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-4">
                {pendingPayments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">Aucun paiement en attente</p>
                      <p className="text-sm text-muted-foreground">Tous les paiements ont été traités</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingPayments.map((payment) => (
                    <Card key={payment.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Receipt Preview */}
                          <div 
                            className="w-full md:w-48 h-48 md:h-auto bg-muted relative group cursor-pointer"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            <img 
                              src={payment.receipt_url} 
                              alt="Reçu"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="h-8 w-8 text-white" />
                            </div>
                            <Badge className="absolute top-2 left-2 bg-amber-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeAgo(payment.uploaded_at)}
                            </Badge>
                          </div>
                          
                          {/* Payment Details */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={payment.user_avatar || undefined} />
                                  <AvatarFallback>
                                    {payment.user_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{payment.user_name}</p>
                                  <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="font-mono">
                                {payment.order_id}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-bold text-lg">{payment.amount} {payment.currency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{payment.description}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{payment.natcash_phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-xs">{payment.natcash_reference}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                              <Calendar className="h-3 w-3" />
                              Commandé: {formatDate(payment.created_at)}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => handleViewReceipt(payment)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir reçu
                              </Button>
                              <Button 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => handleRejectClick(payment)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                              <Button 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleVerifyClick(payment)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Verified Payments */}
          <TabsContent value="verified">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-3">
                {verifiedPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.user_name}</p>
                            <p className="text-sm text-muted-foreground">{payment.order_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{payment.amount} {payment.currency}</p>
                          <p className="text-xs text-muted-foreground">
                            Vérifié {getTimeAgo(payment.verified_at)} par {payment.verified_by}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Rejected Payments */}
          <TabsContent value="rejected">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-3">
                {rejectedPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.user_name}</p>
                            <p className="text-sm text-muted-foreground">{payment.order_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{payment.amount} {payment.currency}</p>
                          <p className="text-xs text-muted-foreground">
                            Rejeté {getTimeAgo(payment.rejected_at)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-13 p-2 bg-red-500/5 rounded-md border border-red-500/20">
                        <p className="text-sm text-red-600">
                          <strong>Raison:</strong> {payment.rejection_reason}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>

      {/* Receipt View Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Reçu de paiement
            </DialogTitle>
            <DialogDescription>
              {selectedPayment?.order_id} - {selectedPayment?.user_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <img 
              src={selectedPayment?.receipt_url} 
              alt="Reçu de paiement"
              className="w-full rounded-lg border"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Montant</p>
              <p className="font-bold">{selectedPayment?.amount} {selectedPayment?.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Référence NatCash</p>
              <p className="font-mono">{selectedPayment?.natcash_reference}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Téléphone</p>
              <p>{selectedPayment?.natcash_phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Description</p>
              <p>{selectedPayment?.description}</p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Fermer
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setReceiptDialogOpen(false);
                if (selectedPayment) handleRejectClick(selectedPayment);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setReceiptDialogOpen(false);
                if (selectedPayment) handleVerifyClick(selectedPayment);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Confirmation Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Confirmer l'approbation
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir approuver ce paiement?
            </DialogDescription>
          </DialogHeader>
          
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commande</span>
                  <span className="font-mono">{selectedPayment?.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span>{selectedPayment?.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-bold">{selectedPayment?.amount} {selectedPayment?.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Référence</span>
                  <span className="font-mono text-xs">{selectedPayment?.natcash_reference}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmVerify}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer l'approbation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Rejeter le paiement
            </DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet. L'utilisateur sera notifié.
            </DialogDescription>
          </DialogHeader>
          
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commande</span>
                  <span className="font-mono">{selectedPayment?.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span>{selectedPayment?.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-bold">{selectedPayment?.amount} {selectedPayment?.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Raison du rejet *</label>
            <Textarea
              placeholder="Ex: Reçu illisible, montant incorrect, référence non trouvée..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rejet en cours...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirmer le rejet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
