import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, Loader2, RefreshCw, Search, Filter, Clock, Mail, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import type { DonationAdmin } from "../types";

const DonationsModule = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: donations, isLoading, refetch } = useQuery({
    queryKey: ["admin-donations", statusFilter, providerFilter],
    queryFn: async () => {
      let query = supabase
        .from("donations")
        .select("id, order_id, amount, currency, provider, donor_name, donor_email, donor_message, status, created_at")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (providerFilter !== "all") {
        query = query.eq("provider", providerFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DonationAdmin[];
    },
  });

  const filteredDonations = useMemo(() => {
    if (!donations) return [];
    if (!searchQuery) return donations;
    const q = searchQuery.toLowerCase();
    return donations.filter(
      (d) =>
        d.order_id.toLowerCase().includes(q) ||
        d.donor_name?.toLowerCase().includes(q) ||
        d.donor_email?.toLowerCase().includes(q)
    );
  }, [donations, searchQuery]);

  const stats = useMemo(() => {
    if (!donations) return { total: 0, htg: 0, usd: 0 };
    let htg = 0;
    let usd = 0;
    for (const d of donations) {
      if (d.status === "completed") {
        if (d.currency === "HTG") htg += d.amount;
        if (d.currency === "USD") usd += d.amount;
      }
    }
    return { total: donations.length, htg, usd: usd / 100 };
  }, [donations]);

  const pendingCount = donations?.filter((d) => d.status === "pending").length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-black">En attente</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Complété</Badge>;
      case "failed":
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "moncash":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">MonCash</Badge>;
      case "stripe":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Stripe</Badge>;
      default:
        return <Badge variant="outline">{provider}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === "USD") return `$${(amount / 100).toFixed(2)} USD`;
    return `${amount} HTG`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dons</h2>
          <p className="text-muted-foreground">Toutes les contributions reçues</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500 text-black px-3 py-1">
              {pendingCount} en attente
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-sm text-muted-foreground">Total dons</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-sm text-muted-foreground">Total HTG (complétés)</p>
            <p className="text-2xl font-bold">{stats.htg.toLocaleString()} HTG</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-sm text-muted-foreground">Total USD (complétés)</p>
            <p className="text-2xl font-bold">${stats.usd.toFixed(2)} USD</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID, nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complétés</SelectItem>
                <SelectItem value="failed">Échoués</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
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

      {/* Donations List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !filteredDonations.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Aucun don trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDonations.map((donation) => (
            <Card key={donation.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm">{donation.order_id}</span>
                    {getProviderBadge(donation.provider)}
                    {getStatusBadge(donation.status)}
                  </div>

                  <p className="text-lg font-semibold">
                    {formatAmount(donation.amount, donation.currency)}
                  </p>

                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {donation.donor_name && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {donation.donor_name}
                      </span>
                    )}
                    {donation.donor_email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {donation.donor_email}
                      </span>
                    )}
                    {donation.donor_message && (
                      <span className="flex items-center gap-1.5 italic">
                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                        {donation.donor_message}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(donation.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationsModule;
