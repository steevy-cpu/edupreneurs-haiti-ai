/**
 * @file ProfileTab.tsx
 * @description Profile tab content for the Settings page — avatar selection,
 *   profile form fields, and profile update logic.
 * @module components/settings
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Save,
  Phone,
  GraduationCap,
  School,
  FileText,
  Users,
  UserCheck,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { validateUserText } from "@/lib/textModeration";
import type { UserProfile } from "@/types/settings.types";

// Lazy load heavy avatar generator component
const AvatarSelector = lazy(() => import('@/components/AvatarSelector').then(m => ({ default: m.AvatarSelector })));

export interface ProfileTabProps {
  profile: UserProfile | null;
  followerCount: number;
  followingCount: number;
  userId: string | null;
  isFounderUser: boolean;
  /** Callback to refresh parent data after a profile update */
  onProfileUpdated: () => void;
}

export function ProfileTab({
  profile,
  followerCount,
  followingCount,
  userId,
  isFounderUser,
  onProfileUpdated,
}: ProfileTabProps) {
  const queryClient = useQueryClient();

  const [savingProfile, setSavingProfile] = useState(false);
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

  // Stability guard for lazy-loaded AvatarSelector (prevents React error #310)
  const [avatarSectionReady, setAvatarSectionReady] = useState(false);

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

  // Sync local form state when profile prop changes (initial load or refresh)
  useEffect(() => {
    if (profile) {
      setSelectedAvatar(profile.avatar_url || "");
      setProfileForm({
        fullName: profile.full_name || "",
        nickname: profile.nickname || "",
        academicGrade: profile.academic_grade || "",
        phoneNumber: profile.phone_number || "",
        bio: profile.bio || "",
        school: profile.school || "",
        gender: profile.gender || "",
        dateOfBirth: profile.date_of_birth || "",
      });
    }
  }, [profile]);

  const handleAvatarSelect = async (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);

    // If it's a full URL (AI-generated avatar), it's already saved by the generator
    // Only update for preset avatar IDs
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
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
      onProfileUpdated();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
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
    </>
  );
}
