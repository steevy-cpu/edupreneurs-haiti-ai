/**
 * @file AccountTab.tsx
 * @description Account tab content for the Settings page — subscription management,
 *   password change, promo codes, streak stats, and account deletion.
 * @module components/settings
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  CreditCard,
  Trash2,
  Mail,
  Loader2,
  LogOut,
  Gift,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StripeRenewalButton } from "@/components/subscription/StripeRenewalButton";
import { RenewalGiftLink } from "@/components/subscription/RenewalGiftLink";
import { useStreak } from "@/contexts/StreakContext";
import { STREAK_FLAME_URL } from "@/lib/streakConstants";
import type { UserProfile } from "@/types/settings.types";

export interface AccountTabProps {
  profile: UserProfile | null;
  userId: string | null;
  userEmail: string;
  session: Session | null;
  isFounderUser: boolean;
  onLogout: () => void;
}

export function AccountTab({
  profile,
  userId,
  userEmail,
  session,
  isFounderUser,
  onLogout,
}: AccountTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Password re-entry confirmation state for account deletion
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteVerifying, setDeleteVerifying] = useState(false);

  // Promo code redemption state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Payment method selection for subscription renewal
  const [paymentMethod, setPaymentMethod] = useState<"moncash" | "stripe">("moncash");

  // Compute subscription display data
  const subscriptionInfo = useMemo(() => {
    if (!profile) return null;
    const p = profile as any;
    // Distinguish timed free access (promo-granted with end date) from permanent (founders)
    if (p.has_free_access && p.subscription_end_date) {
      const endDate = new Date(p.subscription_end_date);
      return {
        state: 'free_timed' as const,
        // Force UTC to prevent midnight-UTC showing as previous day in local timezone
        formattedDate: endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
      };
    }
    if (p.has_free_access) return { state: 'free' as const };

    const endDate = p.subscription_end_date ? new Date(p.subscription_end_date) : null;
    const now = new Date();
    const isActive = p.subscription_status === 'active' && endDate && endDate.getTime() > now.getTime();

    if (isActive && endDate) {
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        state: 'active' as const,
        endDate,
        daysLeft,
        formattedDate: endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      };
    }

    return { state: 'expired' as const };
  }, [profile]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Mot de passe modifié avec succès!");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Erreur lors du changement: " + error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  // Redeem a promo code via the edge function
  const handleRedeemPromo = async () => {
    if (!promoCode.trim() || promoLoading) return;
    if (!session) {
      toast.error("Non authentifié");
      return;
    }

    setPromoLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-promo-code", {
        body: { code: promoCode.trim() },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        // 429 rate limit from edge function
        if (error.message?.includes("429") || error.message?.includes("rate")) {
          toast.error("Trop de tentatives. Réessaie dans une heure.");
        } else {
          toast.error("Erreur réseau. Réessaie.");
        }
        return;
      }

      if (data?.success) {
        toast.success(`Félicitations! ${data.goldAwarded} Gold ajouté à ton compte! 🥇`);
        setPromoCode("");
        // Refresh gold balance in sidebar/profile
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch {
      toast.error("Erreur réseau. Réessaie.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      if (!session) {
        toast.error("Non authentifié");
        return;
      }

      const { error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      await supabase.auth.signOut();

      toast.success("Compte supprimé avec succès");
      navigate("/auth/login");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error("Erreur lors de la suppression: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /** Verify password then proceed with account deletion */
  const handlePasswordVerifyAndDelete = async () => {
    if (!deletePassword.trim()) {
      toast.error("Veuillez entrer votre mot de passe");
      return;
    }
    setDeleteVerifying(true);
    try {
      // Re-authenticate to confirm identity before irreversible deletion
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: deletePassword,
      });
      if (error) {
        toast.error("Mot de passe incorrect. Suppression annulée.");
        return;
      }
      setShowPasswordConfirm(false);
      setDeletePassword('');
      await handleDeleteAccount();
    } catch {
      toast.error("Erreur de vérification. Réessayez.");
    } finally {
      setDeleteVerifying(false);
    }
  };

  const handleRenewSubscription = async () => {
    setRenewLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('moncash-create-payment', {
        body: { amount: 200, description: 'Renouvellement Edupreneurs - 30 jours' },
      });
      if (error || !data?.redirectUrl) {
        toast.error("Erreur lors de la création du paiement");
        setRenewLoading(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      toast.error("Erreur réseau - vérifiez votre connexion");
      setRenewLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Subscription Section — moved from Preferences for visibility */}
      <Card id="subscription" className="border-none rounded-[20px] shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="text-primary shrink-0" size={20} />
            Abonnement actuel
          </CardTitle>
          <CardDescription className="text-sm">
            Gérez votre abonnement et votre facturation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
          {subscriptionInfo?.state === 'free_timed' ? (
            <div className="p-4 sm:p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <Info className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Vous bénéficiez d'un accès gratuit à la plateforme jusqu'au {subscriptionInfo.formattedDate}.
                  </p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-1">
                    Après cette date, un abonnement sera requis pour accéder aux fonctionnalités premium.
                  </p>
                </div>
              </div>
            </div>
          ) : subscriptionInfo?.state === 'free' ? (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--success))]/10 to-[hsl(var(--primary))]/10 rounded-xl border-2 border-[hsl(var(--success))]/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] text-xs font-semibold uppercase tracking-wide">
                  Accès Gratuit
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vous bénéficiez d'un accès gratuit à la plateforme. Aucun renouvellement nécessaire.
              </p>
            </div>
          ) : subscriptionInfo?.state === 'active' ? (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--success))]/10 rounded-xl border-2 border-[hsl(var(--primary))]/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-3 py-1 rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] text-xs font-semibold uppercase tracking-wide">
                      Actif
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expire le <strong>{subscriptionInfo.formattedDate}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.daysLeft} jour{subscriptionInfo.daysLeft !== 1 ? 's' : ''} restant{subscriptionInfo.daysLeft !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-extrabold text-primary">200 HTG</div>
                  <div className="text-sm text-muted-foreground">/ 30 jours</div>
                </div>
              </div>

              {/* Payment method tabs */}
              <div className="space-y-3">
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      paymentMethod === "moncash"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPaymentMethod("moncash")}
                  >
                    MonCash
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      paymentMethod === "stripe"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPaymentMethod("stripe")}
                  >
                    Carte
                  </button>
                </div>

                {paymentMethod === "moncash" ? (
                  <Button
                    className="w-full"
                    onClick={handleRenewSubscription}
                    disabled={renewLoading}
                  >
                    {renewLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Préparation...</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" />Renouveler avec MonCash (+30 jours)</>
                    )}
                  </Button>
                ) : (
                  <StripeRenewalButton />
                )}

                {/* Shareable renewal links */}
                <RenewalGiftLink />
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl border-2 border-destructive/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold uppercase tracking-wide">
                  Expiré
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Votre abonnement a expiré. Renouvelez pour continuer à accéder à toutes les fonctionnalités.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="text-2xl font-extrabold text-primary">200 HTG <span className="text-sm font-normal text-muted-foreground">/ 30 jours</span></div>
              </div>
              {/* Payment method tabs */}
              <div className="space-y-3">
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      paymentMethod === "moncash"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPaymentMethod("moncash")}
                  >
                    MonCash
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      paymentMethod === "stripe"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPaymentMethod("stripe")}
                  >
                    Carte
                  </button>
                </div>

                {paymentMethod === "moncash" ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleRenewSubscription}
                    disabled={renewLoading}
                  >
                    {renewLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Préparation...</>
                    ) : (
                      <><CreditCard className="mr-2 h-5 w-5" />Renouveler avec MonCash — 200 HTG</>
                    )}
                  </Button>
                ) : (
                  <StripeRenewalButton size="lg" />
                )}

                {/* Shareable renewal links */}
                <RenewalGiftLink />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak Stats Section — hidden for founders */}
      {!isFounderUser && (
        <StreakInfoCard />
      )}

      <Card className="border-none rounded-[20px] shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="text-primary shrink-0" size={20} />
            Email du compte
          </CardTitle>
          <CardDescription className="text-sm">
            Votre adresse email actuelle
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-muted rounded-lg">
            <span className="font-medium text-sm sm:text-base break-all">{userEmail}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Email vérifié ✓</span>
          </div>

          {/* Logout button — uses parent handleLogout */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      {/* Promo code redemption */}
      <Card className="border-none rounded-[20px] shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Gift className="text-primary shrink-0" size={20} />
            Code Promotionnel
          </CardTitle>
          <CardDescription className="text-sm">
            Entre un code promo pour recevoir des récompenses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Entre ton code promotionnel"
              maxLength={50}
              className="uppercase"
            />
            <Button
              onClick={handleRedeemPromo}
              disabled={!promoCode.trim() || promoLoading}
            >
              {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none rounded-[20px] shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Lock className="text-primary shrink-0" size={20} />
            Changer le mot de passe
          </CardTitle>
          <CardDescription className="text-sm">
            Assurez-vous d'utiliser un mot de passe sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handlePasswordChange} className="space-y-4" name="password-change-form" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Au moins 8 caractères"
                required
                minLength={8}
                autoComplete="new-password"
              />
              {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                <p className="text-xs text-destructive">Le mot de passe doit contenir au moins 8 caractères</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Retapez le mot de passe"
                required
                autoComplete="off"
              />
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={savingPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
            >
              {savingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Changer le mot de passe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none rounded-[20px] shadow-md border-2 border-destructive">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
            <Trash2 size={20} className="shrink-0" />
            Zone dangereuse
          </CardTitle>
          <CardDescription className="text-sm">
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={loading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cela supprimera définitivement votre compte
                  et toutes vos données de nos serveurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => setShowPasswordConfirm(true)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Oui, supprimer mon compte
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Password re-entry confirmation dialog — second step before deletion */}
          <Dialog
            open={showPasswordConfirm}
            onOpenChange={(open) => {
              if (!open) {
                setShowPasswordConfirm(false);
                setDeletePassword('');
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmation de suppression</DialogTitle>
                <DialogDescription>
                  Pour confirmer la suppression définitive de votre compte, veuillez entrer votre mot de passe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="delete-password">Entrez votre mot de passe pour confirmer</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePasswordVerifyAndDelete();
                  }}
                  disabled={deleteVerifying || loading}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordConfirm(false);
                    setDeletePassword('');
                  }}
                  disabled={deleteVerifying || loading}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handlePasswordVerifyAndDelete}
                  disabled={deleteVerifying || loading || !deletePassword.trim()}
                >
                  {deleteVerifying || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Confirmer la suppression"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

/** Streak stats card — co-located here as it's only used in the Account tab */
function StreakInfoCard() {
  const { currentStreak, longestStreak, freezeCount } = useStreak();

  return (
    <Card className="border-none rounded-[20px] shadow-md">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <img src={STREAK_FLAME_URL} alt="Streak" className="w-5 h-5" />
          Série d'apprentissage
        </CardTitle>
        <CardDescription className="text-sm">
          Ta progression quotidienne
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Série actuelle</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Record</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">❄️ {freezeCount}</p>
            <p className="text-xs text-muted-foreground">Freezes</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Les freezes protègent ta série pendant 1 jour manqué. Tu en gagnes en atteignant des étapes !
        </p>
      </CardContent>
    </Card>
  );
}
