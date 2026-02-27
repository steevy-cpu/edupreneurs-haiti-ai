import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Globe,
  Trash2,
  Save,
  Mail,
  Phone,
  GraduationCap,
  School,
  FileText,
  Users,
  UserCheck,
  Loader2,
  LogOut,
  CalendarDays,
  Smartphone,
  Gift,
  Info,
} from "lucide-react";
import ericArmsCrossed from "@/assets/eric-main01.png";
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
import { getAvatarUrl } from "@/lib/avatarMap";
import { PageHeader, SettingsPageSkeleton } from "@/components/shared";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { debounce } from "@/utils/performanceOptimization";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { validateUserText } from "@/lib/textModeration";
import { StripeRenewalButton } from "@/components/subscription/StripeRenewalButton";
import { isFounder } from "@/lib/founderConstants";
import { RenewalGiftLink } from "@/components/subscription/RenewalGiftLink";
import { initializePushNotifications } from "@/utils/pushNotifications";
import { useStreak } from "@/contexts/StreakContext";
import { STREAK_FLAME_URL } from "@/lib/streakConstants";

// Lazy load heavy components
const AvatarSelector = lazy(() => import('@/components/AvatarSelector').then(m => ({ default: m.AvatarSelector })));

interface UserProfile {
  id: string;
  full_name: string;
  nickname: string;
  academic_grade: string;
  phone_number: string;
  user_id: string;
  bio: string | null;
  school: string | null;
  avatar_url: string | null;
  gender: string | null;
  date_of_birth: string | null;
}

/** Each group maps to one or more real categories checked by the push system */
interface NotificationGroup {
  key: string;
  categories: string[];
  label: string;
  description: string;
}

const NOTIFICATION_GROUPS: NotificationGroup[] = [
  { key: 'interactions', categories: ['like', 'comment', 'share', 'mention'], label: 'Interactions', description: 'Likes, commentaires, partages et mentions' },
  { key: 'social', categories: ['follow'], label: 'Social', description: 'Nouvelles abonnements et demandes de suivi' },
  { key: 'messages', categories: ['message'], label: 'Messages', description: 'Messages privés et messages de groupe' },
  { key: 'contenu', categories: ['post', 'lesson', 'word_of_day'], label: 'Contenu', description: 'Nouveaux posts, commentaires de leçons et mot du jour' },
  { key: 'system', categories: ['system'], label: 'Système', description: "Renouvellements d'abonnement et annonces" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { session, user, isAuthenticated, isLoading: authLoading } = useSessionAuth();
  const { isSlowConnection, shouldShowAnimations } = useNetworkAwareLoading();
  
  const userId = user?.id ?? null;
  const userEmail = user?.email ?? "";
  // Founders bypass the 3-day avatar regeneration cooldown
  const isFounderUser = isFounder(userId);
  
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || "profile";
  });
  const [loading, setLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    nickname: "",
    academicGrade: "",
    phoneNumber: "",
    bio: "",
    school: "",
    gender: "",
    dateOfBirth: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  // Group-level toggle state: key → enabled (true = all categories in group enabled)
  const [groupToggles, setGroupToggles] = useState<Record<string, boolean>>(
    () => Object.fromEntries(NOTIFICATION_GROUPS.map(g => [g.key, true]))
  );
  const [savingNotification, setSavingNotification] = useState<string | null>(null);

  // Password re-entry confirmation state for account deletion
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteVerifying, setDeleteVerifying] = useState(false);

  // Push notification toggle state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  // Track if browser has denied push permission (requires manual browser settings change)
  const [pushPermissionDenied, setPushPermissionDenied] = useState(false);
  
  // Stability guard for lazy-loaded AvatarSelector (prevents React error #310)
  const [avatarSectionReady, setAvatarSectionReady] = useState(false);

  // Promo code redemption state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  // Redirect if not authenticated (handled after all hooks)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Delay AvatarSelector mounting until React dispatcher is stable (double rAF pattern)
  useEffect(() => {
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setAvatarSectionReady(true);
      });
      return () => cancelAnimationFrame(frame2);
    });
    return () => cancelAnimationFrame(frame1);
  }, []);

  // Check push subscription status on mount
  useEffect(() => {
    if (!userId) return;
    
    // Check browser permission state
    if ('Notification' in window) {
      setPushPermissionDenied(Notification.permission === 'denied');
    }

    // Check if a push subscription exists for this device
    const deviceId = localStorage.getItem('edupreneurs_device_id');
    if (!deviceId) {
      setPushEnabled(false);
      return;
    }

    supabase
      .from('push_subscriptions' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .maybeSingle()
      .then(({ data }) => {
        setPushEnabled(!!data);
      });
  }, [userId]);

  // Fetch all data in parallel
  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    
    setPageLoading(true);

    // Fetch all data in parallel
    const [profileResult, followersResult, followingResult, notificationPrefsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(), // maybeSingle: avoids PGRST116 on race at signup or orphaned auth user
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId).eq("status", "accepted"),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId).eq("status", "accepted"),
      supabase.from("notification_preferences").select("*").eq("user_id", userId),
    ]);

    if (profileResult.error) {
      console.error("Error fetching profile:", profileResult.error);
      setPageLoading(false);
      return;
    }

    const profileData = profileResult.data;
    // Null guard: handles race at signup or orphaned auth user — abort silently rather than crash on .avatar_url
    if (!profileData) {
      setPageLoading(false);
      return;
    }
    setProfile(profileData);
    setSelectedAvatar(profileData.avatar_url || "");
    setProfileForm({
      fullName: profileData.full_name || "",
      nickname: profileData.nickname || "",
      academicGrade: profileData.academic_grade || "",
      phoneNumber: profileData.phone_number || "",
      bio: profileData.bio || "",
      school: profileData.school || "",
      gender: profileData.gender || "",
      dateOfBirth: profileData.date_of_birth || "",
    });

    setFollowerCount(followersResult.count || 0);
    setFollowingCount(followingResult.count || 0);

    // Derive group toggles from real preference rows
    // If ANY category in a group has enabled=false, the group toggle is OFF
    const savedPrefs = notificationPrefsResult.data || [];
    const disabledCategories = new Set(
      savedPrefs.filter(p => p.enabled === false).map(p => p.category)
    );
    const newToggles: Record<string, boolean> = {};
    for (const group of NOTIFICATION_GROUPS) {
      // Group is OFF if any of its categories are explicitly disabled
      newToggles[group.key] = !group.categories.some(cat => disabledCategories.has(cat));
    }
    setGroupToggles(newToggles);

    setPageLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId && !authLoading) {
      fetchUserData();
    }
  }, [userId, authLoading, fetchUserData]);

  // Scroll to subscription card if hash is present — now in account tab
  useEffect(() => {
    if (activeTab === 'account' && window.location.hash === '#subscription') {
      setTimeout(() => {
        document.getElementById('subscription')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth/login");
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    
    // If it's a full URL (AI-generated avatar), it's already saved by the generator
    // Only update for preset avatar IDs
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
      // Full URL - just update local state, profile already updated by AI generator
      return;
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", profile?.user_id);

      if (error) throw error;
      
      // Invalidate cached profile to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success("Avatar mis à jour!");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour de l'avatar");
    }
  };

  // Helper function to validate nickname format (letters, numbers, underscores only)
  const isValidNicknameFormat = (nickname: string): boolean => {
    return /^[a-zA-Z0-9_]*$/.test(nickname);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!profileForm.fullName.trim()) {
      toast.error("Le nom complet est requis");
      return;
    }
    if (!profileForm.nickname.trim()) {
      toast.error("Le pseudo est requis");
      return;
    }
    if (profileForm.nickname.length < 3) {
      toast.error("Le pseudo doit contenir au moins 3 caractères");
      return;
    }
    if (!isValidNicknameFormat(profileForm.nickname)) {
      toast.error("Le pseudo ne peut contenir que des lettres, chiffres et underscores");
      return;
    }
    
    // Content moderation for nickname
    const nicknameCheck = validateUserText(profileForm.nickname, 'nickname');
    if (!nicknameCheck.valid) {
      toast.error(nicknameCheck.error || "Pseudo invalide");
      return;
    }
    
    // Content moderation for full name
    const fullNameCheck = validateUserText(profileForm.fullName, 'fullName');
    if (!fullNameCheck.valid) {
      toast.error(fullNameCheck.error || "Nom invalide");
      return;
    }
    
    if (!profileForm.academicGrade) {
      toast.error("Le niveau académique est requis");
      return;
    }
    
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.fullName.trim(),
          nickname: profileForm.nickname.trim(),
          academic_grade: profileForm.academicGrade,
          phone_number: profileForm.phoneNumber.trim(),
          bio: profileForm.bio.trim() || null,
          school: profileForm.school.trim() || null,
          gender: profileForm.gender || null,
          date_of_birth: profileForm.dateOfBirth || null,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      // Invalidate cached profile to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success("Profil mis à jour avec succès!");
      fetchUserData();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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

  /** Toggle an entire notification group ON or OFF.
   *  OFF → upsert all category rows with enabled=false.
   *  ON  → delete all category rows (revert to implicit default = enabled). */
  const handleGroupToggle = useCallback(async (groupKey: string, enabled: boolean) => {
    if (!userId) return;

    const group = NOTIFICATION_GROUPS.find(g => g.key === groupKey);
    if (!group) return;

    setSavingNotification(groupKey);
    // Optimistic update
    setGroupToggles(prev => ({ ...prev, [groupKey]: enabled }));

    try {
      if (enabled) {
        // Delete rows → reverts to implicit default (enabled)
        const { error } = await supabase
          .from('notification_preferences')
          .delete()
          .eq('user_id', userId)
          .in('category', group.categories);
        if (error) throw error;
      } else {
        // Upsert rows with enabled=false for every category in the group
        const rows = group.categories.map(cat => ({
          user_id: userId,
          category: cat,
          enabled: false,
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase
          .from('notification_preferences')
          .upsert(rows, { onConflict: 'user_id,category' });
        if (error) throw error;
      }
      toast.success('Préférence mise à jour');
    } catch {
      // Revert on failure
      setGroupToggles(prev => ({ ...prev, [groupKey]: !enabled }));
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingNotification(null);
    }
  }, [userId]);

  // Push notification toggle handler — uses existing initializePushNotifications
  const handlePushToggle = useCallback(async (enabled: boolean) => {
    if (!userId) return;
    setPushLoading(true);

    try {
      if (enabled) {
        // Subscribe: delegates to existing push infra (permission + SW + DB upsert)
        await initializePushNotifications(userId);
        // Verify it worked by checking if permission was granted
        if ('Notification' in window && Notification.permission === 'granted') {
          setPushEnabled(true);
          toast.success("Notifications push activées");
        } else if ('Notification' in window && Notification.permission === 'denied') {
          setPushPermissionDenied(true);
          toast.error("Permission refusée — changez dans les paramètres du navigateur");
        }
      } else {
        // Unsubscribe: remove SW subscription + delete DB row for this device
        // Unsubscribe from browser push — cast needed since TS lib doesn't include pushManager
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const pm = (registration as any).pushManager;
          if (pm) {
            const subscription = await pm.getSubscription();
            if (subscription) {
              await subscription.unsubscribe();
            }
          }
        }
        // Delete push_subscriptions row for this device
        const deviceId = localStorage.getItem('edupreneurs_device_id');
        if (deviceId) {
          await supabase
            .from('push_subscriptions' as any)
            .delete()
            .eq('user_id', userId)
            .eq('device_id', deviceId);
        }
        setPushEnabled(false);
        toast.success("Notifications push désactivées");
      }
    } catch (error: any) {
      console.error("Push toggle error:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setPushLoading(false);
    }
  }, [userId]);

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

  const [paymentMethod, setPaymentMethod] = useState<"moncash" | "stripe">("moncash");

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

  // Compute subscription display data
  const subscriptionInfo = useMemo(() => {
    if (!profile) return null;
    const p = profile as any;
    // Distinguish timed free access (promo-granted with end date) from permanent (founders)
    if (p.has_free_access && p.subscription_end_date) {
      const endDate = new Date(p.subscription_end_date);
      return {
        state: 'free_timed' as const,
        formattedDate: endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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

  // Show skeleton while auth is loading OR page data is loading (non-blocking)
  if (authLoading || pageLoading) {
    return <SettingsPageSkeleton simplified={isSlowConnection} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8" data-tour="settings-content">
{/* Header using PageHeader component - skip image on slow connections to save data */}
        {isSlowConnection ? (
          <PageHeader
            title="Paramètres"
            subtitle="Gérez votre profil, votre compte et vos préférences"
            backPath="/dashboard"
            backLabel="Dashboard"
            variant="simple"
          />
        ) : (
          <PageHeader
            title="Paramètres"
            subtitle="Gérez votre profil, votre compte et vos préférences"
            image={ericArmsCrossed}
            backPath="/dashboard"
            backLabel="Dashboard"
          />
        )}

{/* Settings Tabs - Simplified to 4 tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-1 sm:gap-2 h-auto p-1">
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
              <User size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
              <Lock size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm">Compte</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
              <Bell size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm hidden sm:inline">Notifications</span>
              <span className="text-xs sm:hidden">Notifs</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
              <Globe size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm hidden sm:inline">Préférences</span>
              <span className="text-xs sm:hidden">Prefs</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab - Always render since it's the default */}
          <TabsContent value="profile" className="mt-4 sm:mt-6">
            {/* Profile Overview Card */}
            <Card className="border-none rounded-[20px] shadow-md mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Profile Avatar */}
                  <Avatar className="h-24 w-24">
                    {selectedAvatar && <AvatarImage src={getAvatarUrl(selectedAvatar)} alt="Avatar" />}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-3xl font-semibold">
                      {profile?.nickname?.[0] || profile?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Profile Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{profile?.nickname ?? profile?.full_name?.split(' ')[0] ?? 'toi'}</h2>
                    <p className="text-muted-foreground">{profile?.full_name}</p>
                    {profile?.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-2xl font-bold">
                        <Users size={20} className="text-primary" />
                        {followerCount}
                      </div>
                      <p className="text-xs text-muted-foreground">Abonnés</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-2xl font-bold">
                        <UserCheck size={20} className="text-success" />
                        {followingCount}
                      </div>
                      <p className="text-xs text-muted-foreground">Abonnements</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="text-primary shrink-0" size={20} />
                  Informations du profil
                </CardTitle>
                <CardDescription className="text-sm">
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6" name="profile-form" autoComplete="on">
{/* Avatar Selection - Guarded lazy load */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Photo de profil</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choisis un avatar qui te représente
                    </p>
                    {avatarSectionReady ? (
                      <Suspense fallback={
                        <div className="flex items-center justify-center p-8 bg-muted/50 rounded-xl">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
                        </div>
                      }>
                        <AvatarSelector 
                          selectedAvatar={selectedAvatar}
                          onSelect={handleAvatarSelect}
                          userId={userId || undefined}
                          isSuperUser={isFounderUser}
                        />
                      </Suspense>
                    ) : (
                      <div className="flex items-center justify-center p-8 bg-muted/50 rounded-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User size={16} />
                        Nom complet *
                      </Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        placeholder="Votre nom complet"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nickname" className="flex items-center gap-2">
                        <User size={16} />
                        Pseudo *
                      </Label>
                      <Input
                        id="nickname"
                        value={profileForm.nickname}
                        onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                        placeholder="Votre pseudo"
                        required
                        minLength={3}
                        maxLength={30}
                      />
                      {profileForm.nickname && !isValidNicknameFormat(profileForm.nickname) && (
                        <p className="text-xs text-destructive mt-1">
                          Le pseudo ne peut contenir que des lettres, chiffres et underscores (pas d'emojis)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="academicGrade" className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        Niveau académique *
                      </Label>
                      {/* Standardized grade values matching authValidation.ts */}
                      <select
                        id="academicGrade"
                        value={profileForm.academicGrade}
                        onChange={(e) => setProfileForm({ ...profileForm, academicGrade: e.target.value })}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Sélectionnez...</option>
                        <option value="7AF">7ème Année Fondamentale</option>
                        <option value="8AF">8ème Année Fondamentale</option>
                        <option value="9AF">9ème Année Fondamentale</option>
                        <option value="NS1">Première (NS1)</option>
                        <option value="NS2">Seconde (NS2)</option>
                        <option value="NS3">Rhéto (NS3)</option>
                        <option value="NS4">Philosophie (NS4)</option>
                        <option value="UNIV">Université</option>
                        <option value="NONE">Autre / Non scolarisé</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                        <Phone size={16} />
                        Numéro de téléphone (optionnel)
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        placeholder="+509 XXXX XXXX"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  {/* Gender selector — toggle buttons matching onboarding quiz style */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User size={16} />
                        Genre
                      </Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={profileForm.gender === "male" ? "default" : "outline"}
                          className={`flex-1 h-12 text-base ${profileForm.gender === "male" ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => setProfileForm({ ...profileForm, gender: "male" })}
                        >
                          👦 Garçon
                        </Button>
                        <Button
                          type="button"
                          variant={profileForm.gender === "female" ? "default" : "outline"}
                          className={`flex-1 h-12 text-base ${profileForm.gender === "female" ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => setProfileForm({ ...profileForm, gender: "female" })}
                        >
                          👧 Fille
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        Date de naissance
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        min="1950-01-01"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pour recevoir un email spécial le jour de ton anniversaire! 🎂
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <FileText size={16} />
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Parlez-nous de vous..."
                      className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">{profileForm.bio.length}/500 caractères</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school" className="flex items-center gap-2">
                      <School size={16} />
                      École
                    </Label>
                    <Input
                      id="school"
                      value={profileForm.school}
                      onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
                      placeholder="Nom de votre école"
                      maxLength={100}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={savingProfile}
                    className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab — Subscription card moved here as first child */}
          <TabsContent value="account" className="mt-4 sm:mt-6">
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

              {/* Streak Stats Section */}
              {!isFounderUser && (
                <StreakInfoCard userId={userId} />
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

                  {/* Logout button — uses existing handleLogout */}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleLogout}
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
          </TabsContent>

          {/* Notifications Tab — push toggle added above category toggles */}
          <TabsContent value="notifications" className="mt-4 sm:mt-6 space-y-6">
            {/* Push notification master toggle */}
            <Card className="border-none rounded-[20px] shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <Label htmlFor="push-toggle" className="text-base font-medium">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">
                        {pushPermissionDenied
                          ? "Bloqué — changez dans les paramètres du navigateur"
                          : "Recevoir des notifications sur cet appareil"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pushLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <Switch
                      id="push-toggle"
                      checked={pushEnabled}
                      onCheckedChange={handlePushToggle}
                      disabled={pushLoading || pushPermissionDenied}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification category preferences */}
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Bell className="text-primary shrink-0" size={20} />
                  Préférences de notification
                </CardTitle>
                <CardDescription className="text-sm">
                  Choisissez comment vous souhaitez être informé. Les modifications sont enregistrées automatiquement.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                {NOTIFICATION_GROUPS.map((group, index) => (
                  <div key={group.key}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={group.key}>{group.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {savingNotification === group.key && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Switch
                          id={group.key}
                          checked={groupToggles[group.key] ?? true}
                          onCheckedChange={(checked) => handleGroupToggle(group.key, checked)}
                          disabled={savingNotification === group.key}
                        />
                      </div>
                    </div>
                    {index < NOTIFICATION_GROUPS.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab — subscription moved to Account, theme card removed, language replaced with info */}
          <TabsContent value="preferences" className="mt-4 sm:mt-6 space-y-6">
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Globe className="text-primary shrink-0" size={20} />
                  Préférences de l'application
                </CardTitle>
                <CardDescription className="text-sm">
                  Personnalisez votre expérience d'apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {/* Static language info — no i18n system exists yet */}
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    La plateforme est disponible en Français. Le support du Kreyòl est en cours de développement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
};

/** Streak stats card for the Account tab */
function StreakInfoCard({ userId }: { userId: string | null }) {
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

export default Settings;
