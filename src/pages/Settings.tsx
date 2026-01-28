import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import ericArmsCrossed from "@/assets/eric-main01.png";
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
}

interface NotificationCategory {
  category: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_NOTIFICATION_CATEGORIES: Omit<NotificationCategory, 'enabled'>[] = [
  { category: 'email', label: 'Notifications par email', description: 'Recevez des emails sur votre progression' },
  { category: 'lesson_reminders', label: 'Rappels de leçons', description: 'Recevez des rappels pour continuer vos leçons' },
  { category: 'achievements', label: 'Alertes de réussite', description: 'Soyez notifié quand vous débloquez des badges' },
  { category: 'weekly_progress', label: 'Rapport hebdomadaire', description: 'Recevez un résumé de votre progression chaque semaine' },
];

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, user, isAuthenticated, isLoading: authLoading } = useSessionAuth();
  const { isSlowConnection, shouldShowAnimations } = useNetworkAwareLoading();
  
  const userId = user?.id ?? null;
  const userEmail = user?.email ?? "";
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
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
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationCategories, setNotificationCategories] = useState<NotificationCategory[]>([]);
  const [savingNotification, setSavingNotification] = useState<string | null>(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("lessonLanguage") || "fr";
  });
  
  // Stability guard for lazy-loaded AvatarSelector (prevents React error #310)
  const [avatarSectionReady, setAvatarSectionReady] = useState(false);

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

  // Fetch all data in parallel
  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    
    setPageLoading(true);

    // Fetch all data in parallel
    const [profileResult, followersResult, followingResult, notificationPrefsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
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
    setProfile(profileData);
    setSelectedAvatar(profileData.avatar_url || "");
    setProfileForm({
      fullName: profileData.full_name || "",
      nickname: profileData.nickname || "",
      academicGrade: profileData.academic_grade || "",
      phoneNumber: profileData.phone_number || "",
      bio: profileData.bio || "",
      school: profileData.school || "",
    });

    setFollowerCount(followersResult.count || 0);
    setFollowingCount(followingResult.count || 0);

    // Merge saved preferences with defaults
    const savedPrefs = notificationPrefsResult.data || [];
    const mergedCategories = DEFAULT_NOTIFICATION_CATEGORIES.map(cat => {
      const saved = savedPrefs.find(p => p.category === cat.category);
      return {
        ...cat,
        enabled: saved?.enabled ?? true, // Default to true if not set
      };
    });
    setNotificationCategories(mergedCategories);

    setPageLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId && !authLoading) {
      fetchUserData();
    }
  }, [userId, authLoading, fetchUserData]);

  useEffect(() => {
    localStorage.setItem("lessonLanguage", language);
  }, [language]);

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

// Debounced notification database update
  const debouncedNotificationUpdate = useMemo(
    () => debounce(async (category: string, enabled: boolean, uid: string) => {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: uid,
          category,
          enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,category',
        });

      if (error) {
        // Revert on error
        setNotificationCategories(prev => 
          prev.map(cat => cat.category === category ? { ...cat, enabled: !enabled } : cat)
        );
        toast.error("Erreur lors de la mise à jour");
      } else {
        toast.success("Préférence mise à jour");
      }
      setSavingNotification(null);
    }, 500),
    []
  );

  const handleNotificationToggle = useCallback((category: string, enabled: boolean) => {
    if (!userId) return;
    
    setSavingNotification(category);
    
    // Optimistic update
    setNotificationCategories(prev => 
      prev.map(cat => cat.category === category ? { ...cat, enabled } : cat)
    );
    
    // Debounced database update
    debouncedNotificationUpdate(category, enabled, userId);
  }, [userId, debouncedNotificationUpdate]);

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
                    <h2 className="text-2xl font-bold">{profile?.nickname || "Utilisateur"}</h2>
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
                      <select
                        id="academicGrade"
                        value={profileForm.academicGrade}
                        onChange={(e) => setProfileForm({ ...profileForm, academicGrade: e.target.value })}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Sélectionnez...</option>
                        <option>7e</option>
                        <option>8e</option>
                        <option>9e</option>
                        <option>S1</option>
                        <option>S2</option>
                        <option>Philo</option>
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

          {/* Account Tab */}
          <TabsContent value="account" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
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
                          onClick={handleDeleteAccount}
                          className="bg-destructive hover:bg-destructive/90"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Suppression...
                            </>
                          ) : (
                            "Oui, supprimer mon compte"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-4 sm:mt-6">
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
                {notificationCategories.map((cat, index) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={cat.category}>{cat.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {cat.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {savingNotification === cat.category && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Switch
                          id={cat.category}
                          checked={cat.enabled}
                          onCheckedChange={(checked) => handleNotificationToggle(cat.category, checked)}
                          disabled={savingNotification === cat.category}
                        />
                      </div>
                    </div>
                    {index < notificationCategories.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab - Now includes Subscription */}
          <TabsContent value="preferences" className="mt-4 sm:mt-6 space-y-6">
            {/* Subscription Section */}
            <Card className="border-none rounded-[20px] shadow-md">
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
                <div className="p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--success))]/10 rounded-xl border-2 border-[hsl(var(--primary))]/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold">Plan Gratuit</h3>
                      <p className="text-sm text-muted-foreground">Accès de base aux fonctionnalités</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent">
                        0 HTG
                      </div>
                      <div className="text-sm text-muted-foreground">par mois</div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                      Accès aux leçons de base
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                      Assistant IA limité
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-muted" />
                      Quiz illimités (Premium)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-muted" />
                      Support prioritaire (Premium)
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Les abonnements premium arrivent bientôt!
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences Section */}
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
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="language">Langue de l'interface</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="fr">Français</option>
                    <option value="ht">Kreyòl Ayisyen</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Cette option changera la langue de l'interface utilisateur
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Thème de l'application</Label>
                  <p className="text-sm text-muted-foreground">
                    Utilisez le bouton de thème en haut à droite pour changer entre le mode clair et sombre
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
};

export default Settings;
