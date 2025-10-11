import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { AvatarSelector } from "@/components/AvatarSelector";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lessonReminders: true,
    achievementAlerts: true,
    weeklyProgress: false,
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("lessonLanguage") || "fr";
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem("lessonLanguage", language);
  }, [language]);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserEmail(session.user.email || "");

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
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
    });

    // Fetch follower count
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", session.user.id)
      .eq("status", "accepted");

    // Fetch following count
    const { count: followingsCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", session.user.id)
      .eq("status", "accepted");

    setFollowerCount(followersCount || 0);
    setFollowingCount(followingsCount || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", profile?.user_id);

      if (error) throw error;
      
      toast.success("Avatar mis à jour!");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour de l'avatar");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.fullName,
          nickname: profileForm.nickname,
          academic_grade: profileForm.academicGrade,
          phone_number: profileForm.phoneNumber,
          bio: profileForm.bio,
          school: profileForm.school,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès!");
      fetchUserData();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Mot de passe modifié avec succès!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Erreur lors du changement: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete profile first (cascade will handle related data)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Sign out
      await supabase.auth.signOut();
      
      toast.success("Compte supprimé avec succès");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {/* Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-6 sm:p-8 rounded-[20px] mb-6 sm:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 relative z-10">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Paramètres</h1>
              <p className="text-sm sm:text-base opacity-90">
                Gérez votre profil, votre compte et vos préférences
              </p>
            </div>
            <div className="flex-shrink-0 relative z-10">
              <img 
                src={ericArmsCrossed} 
                alt="Eric - Confident" 
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-[float_4s_ease-in-out_infinite]"
              />
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-1 sm:gap-2 h-auto p-1">
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
            <TabsTrigger value="subscription" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
              <CreditCard size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm hidden sm:inline">Abonnement</span>
              <span className="text-xs sm:hidden">Abon.</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
              <Globe size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm hidden sm:inline">Préférences</span>
              <span className="text-xs sm:hidden">Prefs</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
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
                <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                  {/* Avatar Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Photo de profil</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choisis un avatar qui te représente
                    </p>
                    <AvatarSelector 
                      selectedAvatar={selectedAvatar}
                      onSelect={handleAvatarSelect}
                    />
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User size={16} />
                        Nom complet
                      </Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nickname" className="flex items-center gap-2">
                        <User size={16} />
                        Pseudo
                      </Label>
                      <Input
                        id="nickname"
                        value={profileForm.nickname}
                        onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                        placeholder="Votre pseudo"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="academicGrade" className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        Niveau académique
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
                        Numéro de téléphone
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        placeholder="+509 XXXX XXXX"
                        required
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
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Enregistrement..." : "Enregistrer les modifications"}
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
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Au moins 6 caractères"
                        required
                      />
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
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                    >
                      {loading ? "Modification..." : "Changer le mot de passe"}
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
                      <Button variant="destructive" className="w-full">
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
                        >
                          Oui, supprimer mon compte
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
                  Choisissez comment vous souhaitez être informé
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifs">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des emails sur votre progression
                    </p>
                  </div>
                  <Switch
                    id="email-notifs"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lesson-reminders">Rappels de leçons</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des rappels pour continuer vos leçons
                    </p>
                  </div>
                  <Switch
                    id="lesson-reminders"
                    checked={notifications.lessonReminders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, lessonReminders: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-alerts">Alertes de réussite</Label>
                    <p className="text-sm text-muted-foreground">
                      Soyez notifié quand vous débloquez des badges
                    </p>
                  </div>
                  <Switch
                    id="achievement-alerts"
                    checked={notifications.achievementAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, achievementAlerts: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-progress">Rapport hebdomadaire</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez un résumé de votre progression chaque semaine
                    </p>
                  </div>
                  <Switch
                    id="weekly-progress"
                    checked={notifications.weeklyProgress}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, weeklyProgress: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="mt-4 sm:mt-6">
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
                      <h3 className="text-xl sm:text-2xl font-bold">Plan Mensuel</h3>
                      <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent">
                        200 HTG
                      </div>
                      <div className="text-sm text-muted-foreground">par mois</div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                      Toutes les matières MENFP
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                      Assistant IA personnalisé
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                      Quiz illimités et golds
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                      Support prioritaire
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Abonnement actif jusqu'au 4 novembre 2025
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Méthode de paiement</h4>
                  <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <div className="w-12 h-8 bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] rounded flex items-center justify-center text-white text-xs font-bold">
                      MC
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">MonCash</p>
                      <p className="text-sm text-muted-foreground">Terminant par ••{profile?.phone_number?.slice(-4)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Annuler l'abonnement
                  </Button>
                  <Button className="flex-1 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90">
                    Mettre à niveau
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-4 sm:mt-6">
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

                <Separator />

                <div className="space-y-4">
                  <Label htmlFor="difficulty">Niveau de difficulté par défaut</Label>
                  <select
                    id="difficulty"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Facile</option>
                    <option>Moyen</option>
                    <option>Difficile</option>
                    <option>Personnalisé</option>
                  </select>
                </div>

                <Button className="w-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
};

export default Settings;
