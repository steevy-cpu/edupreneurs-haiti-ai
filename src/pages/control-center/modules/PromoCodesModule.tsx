/**
 * Control Center — Promo Partners & Codes Management
 *
 * Two-tab layout: Partenaires (default) + Codes Promo.
 * Partners link organizations to promo codes. Founder-only via RLS.
 * Existing codes CRUD preserved in second tab.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Plus, Trash2, Loader2, Gift, Sparkles, Pencil, Users, Building2,
} from "lucide-react";
import { format } from "date-fns";

/* ─── Types ─────────────────────────────────────────────────────── */

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

interface PromoPartner {
  id: string;
  name: string;
  contact_email: string | null;
  organization_type: string;
  promo_code_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  promo_codes: PromoCode | null;
}

/** French labels for organization types */
const ORG_TYPE_LABELS: Record<string, string> = {
  school: "École",
  business: "Entreprise",
  ngo: "ONG",
  government: "Gouvernement",
  other: "Autre",
};

/* ─── Partner Form (shared between Create & Edit) ───────────────── */

interface PartnerFormState {
  name: string;
  contact_email: string;
  organization_type: string;
  promo_code_id: string; // "new" means create inline
  notes: string;
  // Inline new-code fields (only used when promo_code_id === "new")
  new_code: string;
  new_gold_reward: number;
  new_max_uses: string;
}

const EMPTY_PARTNER_FORM: PartnerFormState = {
  name: "",
  contact_email: "",
  organization_type: "school",
  promo_code_id: "",
  notes: "",
  new_code: "",
  new_gold_reward: 50,
  new_max_uses: "",
};

/* ─── Main Module ──────────────────────────────────────────────── */

const PromoCodesModule = () => {
  return (
    <Tabs defaultValue="partners" className="space-y-4">
      <TabsList>
        <TabsTrigger value="partners" className="gap-1.5">
          <Building2 className="h-4 w-4" />
          Partenaires
        </TabsTrigger>
        <TabsTrigger value="codes" className="gap-1.5">
          <Gift className="h-4 w-4" />
          Codes Promo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="partners">
        <PartnersTab />
      </TabsContent>
      <TabsContent value="codes">
        <CodesTab />
      </TabsContent>
    </Tabs>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PARTNERS TAB
   ═══════════════════════════════════════════════════════════════════ */

const PartnersTab = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<PromoPartner | null>(null);
  const [usersPartner, setUsersPartner] = useState<PromoPartner | null>(null);

  /* Fetch partners with joined promo code data */
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-promo-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_partners")
        .select("*, promo_codes(id, code, gold_reward, max_uses, current_uses, is_active, grants_free_access, expires_at, created_at)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PromoPartner[];
    },
  });

  /* Fetch all promo codes for the assignment select */
  const { data: allCodes = [] } = useQuery({
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

  /* Delete partner */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-partners"] });
      toast.success("Partenaire supprimé");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Partenaires ({partners.length})</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Ajouter un partenaire
            </Button>
          </DialogTrigger>
          <PartnerFormDialog
            allCodes={allCodes}
            onClose={() => setCreateOpen(false)}
          />
        </Dialog>
      </div>

      {/* Table */}
      {partners.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun partenaire. Ajoutez-en un!
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Partenaire</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Code assigné</th>
                <th className="pb-2 pr-4">Utilisations</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Date d'ajout</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-semibold">{p.name}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className="text-xs">
                      {ORG_TYPE_LABELS[p.organization_type] ?? p.organization_type}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {p.promo_codes?.code ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-3 pr-4">
                    {p.promo_codes
                      ? `${p.promo_codes.current_uses}/${p.promo_codes.max_uses ?? "∞"}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">
                    {p.contact_email || "—"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">
                    {format(new Date(p.created_at), "dd/MM/yyyy")}
                  </td>
                  <td className="py-3 flex items-center gap-1">
                    {/* View users who redeemed this partner's code */}
                    {p.promo_codes && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Voir les utilisateurs"
                        onClick={() => setUsersPartner(p)}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Modifier"
                      onClick={() => setEditPartner(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer {p.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Le code promo associé ne sera pas supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(p.id)}
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

      {/* Edit dialog */}
      {editPartner && (
        <Dialog open onOpenChange={() => setEditPartner(null)}>
          <PartnerFormDialog
            partner={editPartner}
            allCodes={allCodes}
            onClose={() => setEditPartner(null)}
          />
        </Dialog>
      )}

      {/* Users sheet */}
      {usersPartner && (
        <PartnerUsersSheet
          partner={usersPartner}
          onClose={() => setUsersPartner(null)}
        />
      )}
    </div>
  );
};

/* ─── Partner Create/Edit Dialog ────────────────────────────────── */

interface PartnerFormDialogProps {
  partner?: PromoPartner;
  allCodes: PromoCode[];
  onClose: () => void;
}

const PartnerFormDialog = ({ partner, allCodes, onClose }: PartnerFormDialogProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!partner;

  const [form, setForm] = useState<PartnerFormState>(
    partner
      ? {
          name: partner.name,
          contact_email: partner.contact_email ?? "",
          organization_type: partner.organization_type,
          promo_code_id: partner.promo_code_id ?? "",
          notes: partner.notes ?? "",
          new_code: "",
          new_gold_reward: 50,
          new_max_uses: "",
        }
      : { ...EMPTY_PARTNER_FORM }
  );

  const isCreatingNewCode = form.promo_code_id === "new";

  const mutation = useMutation({
    mutationFn: async () => {
      let codeId: string | null = form.promo_code_id || null;

      /* If inline new code requested, create it first */
      if (isCreatingNewCode) {
        const codePayload: Record<string, unknown> = {
          code: form.new_code.toUpperCase().trim(),
          gold_reward: form.new_gold_reward,
          is_active: true,
          grants_free_access: false,
          current_uses: 0,
        };
        if (form.new_max_uses) codePayload.max_uses = parseInt(form.new_max_uses);

        const { data: newCode, error: codeErr } = await (supabase
          .from("promo_codes")
          .insert(codePayload)
          .select("id")
          .single();
        if (codeErr) throw codeErr;
        codeId = newCode.id;
      }

      const partnerPayload = {
        name: form.name.trim(),
        contact_email: form.contact_email.trim() || null,
        organization_type: form.organization_type,
        promo_code_id: codeId,
        notes: form.notes.trim() || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("promo_partners")
          .update(partnerPayload)
          .eq("id", partner!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promo_partners").insert(partnerPayload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-partners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success(isEdit ? "Partenaire mis à jour!" : "Partenaire créé!");
      onClose();
    },
    onError: (err: any) => {
      if (err?.code === "23505" || err?.message?.includes("duplicate")) {
        toast.error("Ce code existe déjà");
      } else {
        toast.error("Erreur: " + (err?.message ?? "inconnue"));
      }
    },
  });

  const canSubmit =
    form.name.trim().length > 0 &&
    (!isCreatingNewCode || form.new_code.trim().length > 0);

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Modifier le partenaire" : "Ajouter un partenaire"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        {/* Name */}
        <div className="space-y-2">
          <Label>Nom du partenaire *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Collège Saint-Louis"
            maxLength={100}
          />
        </div>

        {/* Organization type */}
        <div className="space-y-2">
          <Label>Type d'organisation *</Label>
          <Select
            value={form.organization_type}
            onValueChange={(v) => setForm({ ...form, organization_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORG_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>Email de contact</Label>
          <Input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            placeholder="contact@ecole.ht"
          />
        </div>

        {/* Promo code assignment */}
        <div className="space-y-2">
          <Label>Assigner un code promo</Label>
          <Select
            value={form.promo_code_id}
            onValueChange={(v) => setForm({ ...form, promo_code_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Aucun code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun code</SelectItem>
              <SelectItem value="new">➕ Créer un nouveau code</SelectItem>
              {allCodes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} ({c.current_uses}/{c.max_uses ?? "∞"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inline new-code fields — only shown when creating a new code */}
        {isCreatingNewCode && (
          <div className="space-y-3 rounded-md border p-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground">Nouveau code promo</p>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={form.new_code}
                onChange={(e) => setForm({ ...form, new_code: e.target.value.toUpperCase() })}
                placeholder="EX: ECOLE2026"
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Récompense Gold</Label>
                <Input
                  type="number"
                  value={form.new_gold_reward}
                  onChange={(e) =>
                    setForm({ ...form, new_gold_reward: Math.max(1, Math.min(1000, Number(e.target.value))) })
                  }
                  min={1}
                  max={1000}
                />
              </div>
              <div className="space-y-2">
                <Label>Max utilisations</Label>
                <Input
                  type="number"
                  value={form.new_max_uses}
                  onChange={(e) => setForm({ ...form, new_max_uses: e.target.value })}
                  placeholder="Illimité"
                  min={1}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes internes..."
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          {isEdit ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

/* ─── Partner Users Sheet (side panel) ──────────────────────────── */

interface PartnerUsersSheetProps {
  partner: PromoPartner;
  onClose: () => void;
}

const PartnerUsersSheet = ({ partner, onClose }: PartnerUsersSheetProps) => {
  const codeId = partner.promo_code_id;

  /* Fetch users who redeemed this partner's code */
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-partner-users", codeId],
    enabled: !!codeId,
    queryFn: async () => {
      // Get redemption records for this code
      const { data: redemptions, error: rErr } = await supabase
        .from("user_promo_redemptions")
        .select("user_id, redeemed_at")
        .eq("promo_code_id", codeId!);
      if (rErr) throw rErr;
      if (!redemptions?.length) return [];

      const userIds = redemptions.map((r) => r.user_id);

      // Fetch profile data for those users
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, nickname, academic_grade, subscription_status, created_at")
        .in("user_id", userIds);
      if (pErr) throw pErr;

      // Merge redemption date with profile info
      return redemptions.map((r) => {
        const profile = profiles?.find((p) => p.user_id === r.user_id);
        return {
          user_id: r.user_id,
          nickname: profile?.nickname ?? "—",
          academic_grade: profile?.academic_grade ?? "—",
          subscription_status: profile?.subscription_status ?? "—",
          redeemed_at: r.redeemed_at,
        };
      });
    },
  });

  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Utilisateurs — {partner.name}</SheetTitle>
          <SheetDescription>
            Code: <span className="font-mono font-semibold">{partner.promo_codes?.code ?? "—"}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun utilisateur n'a encore utilisé ce code.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-2">{users.length} utilisateur{users.length > 1 ? "s" : ""}</p>
              {users.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{u.nickname}</p>
                    <p className="text-xs text-muted-foreground">{u.academic_grade}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={u.subscription_status === "active" ? "default" : "secondary"} className="text-xs">
                      {u.subscription_status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(u.redeemed_at), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CODES TAB — existing functionality preserved exactly
   ═══════════════════════════════════════════════════════════════════ */

const CodesTab = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    gold_reward: 50,
    max_uses: "",
    expires_at: "",
    grants_free_access: false,
  });

  /* Fetch all promo codes */
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

  /* Toggle is_active */
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

  /* Create promo code */
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
      if (err?.code === "23505" || err?.message?.includes("duplicate")) {
        toast.error("Ce code existe déjà");
      } else {
        toast.error("Erreur lors de la création");
      }
    },
  });

  /* Delete promo code */
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
