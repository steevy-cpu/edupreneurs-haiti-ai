/**
 * Control Center — Promo Codes Management
 * 
 * Founder-only CRUD for promo codes: view, create, toggle, delete.
 * Uses direct Supabase client (founder RLS policies protect access).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Loader2, Gift, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface PromoCode {
  id: string;
  code: string;
  gold_reward: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  grants_free_access: boolean;
  created_at: string;
}

const PromoCodesModule = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    gold_reward: 50,
    max_uses: "",
    expires_at: "",
    grants_free_access: false,
  });

  // Fetch all promo codes
  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  // Toggle is_active
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  // Create promo code
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.toUpperCase().trim(),
        gold_reward: form.gold_reward,
        is_active: true,
        grants_free_access: form.grants_free_access,
        current_uses: 0,
      };
      if (form.max_uses) payload.max_uses = parseInt(form.max_uses);
      if (form.expires_at) payload.expires_at = new Date(form.expires_at).toISOString();

      const { error } = await supabase.from("promo_codes").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setCreateOpen(false);
      setForm({ code: "", gold_reward: 50, max_uses: "", expires_at: "", grants_free_access: false });
      toast.success("Code promo créé!");
    },
    onError: (err: any) => {
      // Unique constraint violation on code
      if (err?.code === "23505" || err?.message?.includes("duplicate")) {
        toast.error("Ce code existe déjà");
      } else {
        toast.error("Erreur lors de la création");
      }
    },
  });

  // Delete promo code
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Code supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Create button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Codes Promo ({codes.length})</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Nouveau code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un code promo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="EX: BIENVENUE2026"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label>Récompense Gold *</Label>
                <Input
                  type="number"
                  value={form.gold_reward}
                  onChange={(e) => setForm({ ...form, gold_reward: Math.max(1, Math.min(1000, Number(e.target.value))) })}
                  min={1}
                  max={1000}
                />
              </div>
              <div className="space-y-2">
                <Label>Utilisations max (vide = illimité)</Label>
                <Input
                  type="number"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Illimité"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Date d'expiration (optionnel)</Label>
                <Input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.grants_free_access}
                  onCheckedChange={(v) => setForm({ ...form, grants_free_access: v })}
                />
                <Label>Accès gratuit</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!form.code.trim() || form.gold_reward < 1 || createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promo codes table */}
      {codes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun code promo. Créez-en un!
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Code</th>
                <th className="pb-2 pr-4">Gold</th>
                <th className="pb-2 pr-4">Utilisations</th>
                <th className="pb-2 pr-4">Expire</th>
                <th className="pb-2 pr-4">Actif</th>
                <th className="pb-2 pr-4">Accès</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-mono font-semibold">{c.code}</td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                      {c.gold_reward}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {c.current_uses}/{c.max_uses ?? "∞"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {c.expires_at ? format(new Date(c.expires_at), "dd/MM/yyyy") : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <Switch
                      checked={c.is_active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: c.id, is_active: v })}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    {c.grants_free_access && (
                      <Badge variant="secondary" className="text-xs">
                        <Gift className="mr-1 h-3 w-3" /> Gratuit
                      </Badge>
                    )}
                  </td>
                  <td className="py-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer {c.code}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Les utilisateurs ayant déjà utilisé ce code ne seront pas affectés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(c.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PromoCodesModule;
