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
import { EricChatbot } from "@/components/EricChatbot";
import {
  Menu,
  X,
  Home,
  BookOpen,
  FolderOpen,
  Users,
  Link as LinkIcon,
  Settings as SettingsIcon,
  LogOut,
  User,
  Lock,
  Bell,
  CreditCard,
  Globe,
  Trash2,
  Save,
  MessageSquare,
  Search,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";
import dashboardImage from "@/assets/dashboard00.png";
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

interface UserProfile {
  id: string;
  full_name: string;
  nickname: string;
  academic_grade: string;
  phone_number: string;
  user_id: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    nickname: "",
    academicGrade: "",
    phoneNumber: "",
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
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserEmail(session.user.email || "");
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(profileData);
    setProfileForm({
      fullName: profileData.full_name || "",
      nickname: profileData.nickname || "",
      academicGrade: profileData.academic_grade || "",
      phoneNumber: profileData.phone_number || "",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
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
    <div className="min-h-screen bg-background">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-5 left-5 z-[1001] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${sidebarOpen ? "lg:left-[300px]" : ""}`}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-[280px] bg-card border-r border-border shadow-lg z-[1000] transition-transform duration-300 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-bold">EDUPRENEURS</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 text-center border-b border-border bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] shadow-md animate-[gentle-bob_8s_ease-in-out_infinite]">
            <img src={dashboardImage} alt="Eric Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="font-bold text-lg text-foreground mb-1">Eric</div>
          <div className="text-sm text-muted-foreground">Votre assistant IA</div>
        </div>

        <nav className="py-5">
          <a href="/dashboard" className="flex items-center gap-3 px-5 py-3.5 mx-3 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <Home size={18} />
            Dashboard
          </a>
          <a href="/matieres" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <BookOpen size={18} />
            Matières
          </a>
          <a href="#" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <FolderOpen size={18} />
            Ressources
          </a>
          <a href="/feed" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <Users size={18} />
            Fil d'actualité
          </a>
          <a href="/community" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <MessageSquare size={18} />
            Messages
          </a>
          <a href="/user-search" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <Search size={18} />
            Rechercher
          </a>
          <a href="/affiliations" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <LinkIcon size={18} />
            Affiliations
          </a>
          <a href="/settings" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white font-medium transition-all duration-300">
            <SettingsIcon size={18} />
            Paramètres
          </a>
          <hr className="border-border my-4 mx-3" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3.5 mx-3 rounded-xl text-destructive font-medium hover:bg-destructive hover:text-white hover:translate-x-1 transition-all duration-300 w-[calc(100%-1.5rem)]"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : ""} pt-20 px-4 lg:px-8 pb-8`}>
        {/* Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-8 rounded-[20px] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Paramètres</h1>
            <p className="opacity-75">
              Gérez votre profil, votre compte et vos préférences
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock size={16} />
              <span className="hidden sm:inline">Compte</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard size={16} />
              <span className="hidden sm:inline">Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe size={16} />
              <span className="hidden sm:inline">Préférences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary" />
                  Informations du profil
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
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
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="border-none rounded-[20px] shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="text-primary" />
                    Email du compte
                  </CardTitle>
                  <CardDescription>
                    Votre adresse email actuelle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="font-medium">{userEmail}</span>
                    <span className="text-xs text-muted-foreground">Email vérifié ✓</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none rounded-[20px] shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="text-primary" />
                    Changer le mot de passe
                  </CardTitle>
                  <CardDescription>
                    Assurez-vous d'utiliser un mot de passe sécurisé
                  </CardDescription>
                </CardHeader>
                <CardContent>
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

              <Card className="border-none rounded-[20px] shadow-md border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 />
                    Zone dangereuse
                  </CardTitle>
                  <CardDescription>
                    Actions irréversibles sur votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
          <TabsContent value="notifications">
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="text-primary" />
                  Préférences de notification
                </CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être informé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
          <TabsContent value="subscription">
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="text-primary" />
                  Abonnement actuel
                </CardTitle>
                <CardDescription>
                  Gérez votre abonnement et votre facturation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--success))]/10 rounded-xl border-2 border-[hsl(var(--primary))]/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">Plan Mensuel</h3>
                      <p className="text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent">
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
          <TabsContent value="preferences">
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="text-primary" />
                  Préférences de l'application
                </CardTitle>
                <CardDescription>
                  Personnalisez votre expérience d'apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
};

export default Settings;
