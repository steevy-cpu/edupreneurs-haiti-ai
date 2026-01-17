import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, GRADE_OPTIONS } from "@/lib/authValidation";
import { generateConfirmationCode } from "@/utils/emailService";
import { useAuth } from "./AuthContext";

export default function SignupForm() {
  const { toast } = useToast();
  const {
    signupData,
    setSignupData,
    isSigningUp,
    setIsSigningUp,
    showSignupPassword,
    setShowSignupPassword,
    signupStep,
    setSignupStep,
    totalSignupSteps,
    nicknameAvailable,
    checkingNickname,
    promoCode,
    setPromoCode,
    promoCodeValid,
    isValidatingPromo,
    promoGrantsFreeAccess,
    promoNetworkError,
    promoRateLimitSeconds,
    handleInputFocus,
    isValidNicknameFormat,
    passwordValidation,
    checkNicknameAvailability,
    debouncedValidatePromoCode,
    retryPromoValidation,
    referralCode,
    setActiveTab,
    setPendingUserId,
    setResendCooldown,
    setCanResend,
  } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCodeValid) {
      toast({
        title: "Code promotionnel requis",
        description: "Veuillez entrer un code promotionnel valide pour créer votre compte. Les méthodes de paiement seront bientôt disponibles.",
        variant: "destructive",
      });
      return;
    }
    
    const validation = signupSchema.safeParse(signupData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Données invalides",
        description: firstError?.message || "Veuillez vérifier vos informations",
        variant: "destructive",
      });
      return;
    }

    if (nicknameAvailable === false) {
      toast({
        title: "Pseudo non disponible",
        description: "Ce pseudo est déjà utilisé, veuillez en choisir un autre",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Échec de la création du compte");

      const confirmationCode = generateConfirmationCode();

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: signupData.fullName || signupData.nickname,
          nickname: signupData.nickname,
          academic_grade: signupData.academicGrade,
          phone_number: signupData.phoneNumber,
          school: signupData.school,
          gender: signupData.gender,
          date_of_birth: signupData.dateOfBirth || null,
          email_confirmed: false,
          phone_confirmed: false,
          confirmation_code: confirmationCode.trim(),
          promo_code_used: promoCodeValid ? promoCode.toUpperCase().trim() : null,
          promo_code_used_at: promoCodeValid ? new Date().toISOString() : null,
          has_free_access: promoGrantsFreeAccess,
        });

      if (profileError) throw profileError;

      if (referralCode) {
        try {
          const { data: referrerProfile, error: referrerError } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .single();

          if (!referrerError && referrerProfile) {
            const { data: newUserProfile, error: newProfileError } = await supabase
              .from("profiles")
              .select("id")
              .eq("user_id", authData.user.id)
              .single();

            if (!newProfileError && newUserProfile) {
              await supabase.from("referrals").insert({
                referrer_id: referrerProfile.id,
                referred_id: newUserProfile.id,
                status: "pending",
              });

              await supabase
                .from("profiles")
                .update({ referred_by: referrerProfile.id })
                .eq("id", newUserProfile.id);

              toast({
                title: "Parrainage enregistré! 🎉",
                description: "Vous avez été parrainé avec succès",
              });
            }
          }
        } catch (refError) {
          // Don't block signup if referral fails
        }
      }

      // Send confirmation email BEFORE signing out
      try {
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: signupData.email,
            fullName: signupData.fullName || signupData.nickname,
            nickname: signupData.nickname,
            academicGrade: signupData.academicGrade,
            confirmationCode: confirmationCode,
          }
        });
        
        // Only sign out after email sent successfully
        await supabase.auth.signOut();
        
        // Only show success toast if email was actually sent
        toast({
          title: "Inscription réussie ! 🎉",
          description: "Un code de vérification a été envoyé à votre email",
        });
      } catch (emailError) {
        // Sign out anyway but provide clear recovery message
        await supabase.auth.signOut();
        toast({
          title: "Compte créé avec avertissement",
          description: "Votre compte est créé mais l'email n'a pas pu être envoyé. Vous pouvez demander un renvoi du code.",
          variant: "destructive",
        });
        // Still proceed to verify tab so user can request resend
      }

      setPendingUserId(authData.user.id);
      setActiveTab("verify");
      setResendCooldown(60);
      setCanResend(false);
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4" name="signup-form" autoComplete="on">
      {/* Visual Step Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                signupStep >= step 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {signupStep > step ? '✓' : step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                  signupStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={signupStep >= 1 ? 'text-primary font-medium' : ''}>Compte</span>
          <span className={signupStep >= 2 ? 'text-primary font-medium' : ''}>Profil</span>
          <span className={signupStep >= 3 ? 'text-primary font-medium' : ''}>Finalisation</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(signupStep / totalSignupSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Account Info */}
      {signupStep === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold">Créez votre compte</h3>
            <p className="text-sm text-muted-foreground">Entrez vos informations de connexion</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm text-muted-foreground">
              Adresse e-mail *
            </Label>
            <Input
              id="signup-email"
              type="email"
              required
              placeholder="ex: nom@domaine.com"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              onFocus={handleInputFocus}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="next"
              inputMode="email"
              className="auth-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email-confirm" className="text-sm text-muted-foreground">
              Confirmer l'e-mail *
            </Label>
            <Input
              id="signup-email-confirm"
              type="email"
              required
              placeholder="Confirmez votre email"
              value={signupData.emailConfirm}
              onChange={(e) => setSignupData({ ...signupData, emailConfirm: e.target.value })}
              onFocus={handleInputFocus}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="next"
              inputMode="email"
              className="auth-input"
            />
            {signupData.email && signupData.emailConfirm && signupData.email !== signupData.emailConfirm && (
              <p className="text-xs text-destructive">Les emails ne correspondent pas</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-sm text-muted-foreground">
              Mot de passe *
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showSignupPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Créez un mot de passe sécurisé"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                onFocus={handleInputFocus}
                autoComplete="new-password"
                autoCapitalize="none"
                enterKeyHint="next"
                className="auth-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="space-y-1 text-xs mt-2">
              <p className={`flex items-center gap-1 ${passwordValidation.hasMinLength ? 'text-success' : 'text-muted-foreground'}`}>
                {passwordValidation.hasMinLength ? '✓' : '○'} Au moins 8 caractères
              </p>
              <p className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
                {passwordValidation.hasNumber ? '✓' : '○'} Au moins un chiffre
              </p>
              <p className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                {passwordValidation.hasUppercase ? '✓' : '○'} Au moins une majuscule
              </p>
            </div>
          </div>

          <Button 
            type="button" 
            className="w-full mt-4"
            onClick={() => {
              if (!signupData.email || !signupData.emailConfirm || !signupData.password) {
                toast({ title: "Champs requis", description: "Veuillez remplir tous les champs", variant: "destructive" });
                return;
              }
              if (signupData.email !== signupData.emailConfirm) {
                toast({ title: "Emails différents", description: "Les emails ne correspondent pas", variant: "destructive" });
                return;
              }
              if (signupData.password.length < 8) {
                toast({ title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
                return;
              }
              setSignupStep(2);
            }}
          >
            Continuer →
          </Button>
        </div>
      )}

      {/* Step 2: Profile Info */}
      {signupStep === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold">Votre profil</h3>
            <p className="text-sm text-muted-foreground">Parlez-nous un peu de vous</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="signup-fullname" className="text-sm text-muted-foreground">
                Nom complet
              </Label>
              <Input
                id="signup-fullname"
                type="text"
                placeholder="Votre nom complet"
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                onFocus={handleInputFocus}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                className="auth-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-nickname" className="text-sm text-muted-foreground">
                Pseudo *
              </Label>
              <Input
                id="signup-nickname"
                type="text"
                required
                placeholder="Choisissez un pseudo unique"
                value={signupData.nickname}
                onChange={(e) => {
                  setSignupData({ ...signupData, nickname: e.target.value });
                  checkNicknameAvailability(e.target.value);
                }}
                onFocus={handleInputFocus}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                enterKeyHint="next"
                className="auth-input"
              />
              {signupData.nickname && !isValidNicknameFormat(signupData.nickname) && (
                <p className="text-xs text-destructive">
                  Le pseudo ne peut contenir que des lettres, chiffres et underscores (pas d'emojis)
                </p>
              )}
              {checkingNickname && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Vérification...
                </p>
              )}
              {nicknameAvailable === false && isValidNicknameFormat(signupData.nickname) && (
                <p className="text-xs text-destructive">Ce pseudo est déjà utilisé</p>
              )}
              {nicknameAvailable === true && isValidNicknameFormat(signupData.nickname) && (
                <p className="text-xs text-success">Ce pseudo est disponible ✓</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="signup-grade" className="text-sm text-muted-foreground">
                Niveau académique *
              </Label>
              <Select
                value={signupData.academicGrade}
                onValueChange={(value) => {
                  // When selecting NONE, auto-fill school with N/A
                  if (value === 'NONE') {
                    setSignupData({ ...signupData, academicGrade: value, school: 'N/A' });
                  } else if (signupData.academicGrade === 'NONE' && signupData.school === 'N/A') {
                    // Clear N/A when switching away from NONE
                    setSignupData({ ...signupData, academicGrade: value, school: '' });
                  } else {
                    setSignupData({ ...signupData, academicGrade: value });
                  }
                }}
              >
                <SelectTrigger className="w-full bg-muted/50">
                  <SelectValue placeholder="Sélectionnez votre niveau..." />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {GRADE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(signupData.academicGrade === 'UNIV' || signupData.academicGrade === 'NONE') && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Note: Les matières scolaires et examens ne seront pas disponibles pour ce niveau.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-gender" className="text-sm text-muted-foreground">
                Genre *
              </Label>
              <select
                id="signup-gender"
                required
                value={signupData.gender}
                onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                className="auth-input flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm"
              >
                <option value="">Sélectionnez…</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="signup-phone" className="text-sm text-muted-foreground">
                Numéro de téléphone (optionnel)
              </Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="ex: +509 3x xx xx xx"
                value={signupData.phoneNumber}
                onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                onFocus={handleInputFocus}
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                className="auth-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-school" className="text-sm text-muted-foreground">
                {signupData.academicGrade === 'NONE' 
                  ? 'Institution (optionnel)' 
                  : signupData.academicGrade === 'UNIV' 
                    ? 'Nom de l\'université *'
                    : 'Nom de l\'école *'
                }
              </Label>
              <Input
                id="signup-school"
                type="text"
                required={signupData.academicGrade !== 'NONE'}
                disabled={signupData.academicGrade === 'NONE'}
                placeholder={
                  signupData.academicGrade === 'NONE' 
                    ? 'N/A' 
                    : signupData.academicGrade === 'UNIV'
                      ? 'ex: Université d\'État d\'Haïti'
                      : 'ex: Collège Sacré-coeur'
                }
                value={signupData.school}
                onChange={(e) => setSignupData({ ...signupData, school: e.target.value })}
                onFocus={handleInputFocus}
                autoComplete="organization"
                autoCapitalize="words"
                enterKeyHint="next"
                className={`auth-input ${signupData.academicGrade === 'NONE' ? 'bg-muted/70 cursor-not-allowed' : ''}`}
              />
              {signupData.academicGrade === 'NONE' && (
                <p className="text-xs text-muted-foreground">Ce champ est automatiquement rempli pour les autodidactes.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-dob" className="text-sm text-muted-foreground">
              Date de naissance 🎂
            </Label>
            <Input
              id="signup-dob"
              type="date"
              placeholder="JJ/MM/AAAA"
              value={signupData.dateOfBirth}
              max={new Date().toISOString().split('T')[0]}
              min="1950-01-01"
              onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
              className="auth-input"
            />
            <p className="text-xs text-muted-foreground">
              Pour recevoir un email spécial le jour de votre anniversaire! 🎉
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={() => setSignupStep(1)}
            >
              ← Retour
            </Button>
            <Button 
              type="button" 
              className="flex-1"
              disabled={checkingNickname}
              onClick={() => {
                if (!signupData.nickname || signupData.nickname.length < 3) {
                  toast({ title: "Pseudo requis", description: "Le pseudo doit contenir au moins 3 caractères", variant: "destructive" });
                  return;
                }
                if (!isValidNicknameFormat(signupData.nickname)) {
                  toast({ title: "Format invalide", description: "Le pseudo ne peut contenir que des lettres, chiffres et underscores", variant: "destructive" });
                  return;
                }
                if (nicknameAvailable === false) {
                  toast({ title: "Pseudo non disponible", description: "Ce pseudo est déjà utilisé, veuillez en choisir un autre", variant: "destructive" });
                  return;
                }
                if (nicknameAvailable === null && !checkingNickname) {
                  toast({ title: "Vérification requise", description: "Veuillez attendre la vérification du pseudo", variant: "destructive" });
                  return;
                }
                if (!signupData.academicGrade) {
                  toast({ title: "Niveau requis", description: "Veuillez sélectionner votre niveau académique", variant: "destructive" });
                  return;
                }
                if (!signupData.gender) {
                  toast({ title: "Genre requis", description: "Veuillez sélectionner votre genre", variant: "destructive" });
                  return;
                }
                // School validation - skip for NONE grade
                if (signupData.academicGrade !== 'NONE' && (!signupData.school || signupData.school.trim().length === 0)) {
                  const schoolLabel = signupData.academicGrade === 'UNIV' ? 'université' : 'école';
                  toast({ title: `${schoolLabel.charAt(0).toUpperCase() + schoolLabel.slice(1)} requise`, description: `Veuillez entrer le nom de votre ${schoolLabel}`, variant: "destructive" });
                  return;
                }
                setSignupStep(3);
              }}
            >
              {checkingNickname ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Continuer →"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment & Privacy */}
      {signupStep === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold">Dernière étape !</h3>
            <p className="text-sm text-muted-foreground">Entrez votre code promotionnel pour continuer</p>
          </div>

          {/* Promo Code Section */}
          <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <strong className="text-sm">Code promotionnel *</strong>
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Requis</span>
            </div>
            <Input
              type="text"
              placeholder="Entrez votre code promotionnel"
              value={promoCode}
              onChange={(e) => {
                const code = e.target.value;
                setPromoCode(code);
                debouncedValidatePromoCode(code);
              }}
              onFocus={handleInputFocus}
              autoCapitalize="characters"
              spellCheck="false"
              enterKeyHint="done"
              className="auth-input"
            />
            {isValidatingPromo && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Vérification du code...
              </p>
            )}
            {promoRateLimitSeconds > 0 && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                <span className="text-amber-600 dark:text-amber-400">⏳</span>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Trop de tentatives. Patientez {promoRateLimitSeconds}s avant de réessayer.
                </p>
              </div>
            )}
            {promoCode && promoCode.trim().length >= 3 && !isValidatingPromo && promoRateLimitSeconds === 0 && (
              <>
                {promoNetworkError ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-amber-600">
                      ⚠️ Erreur de connexion - vérifiez votre internet
                    </p>
                    <button
                      type="button"
                      onClick={retryPromoValidation}
                      className="text-xs text-primary underline hover:text-primary/80 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <p className={`text-xs ${promoCodeValid ? 'text-success' : 'text-destructive'}`}>
                    {promoCodeValid ? '✓ Code valide ! Vous pouvez créer votre compte.' : '✗ Code invalide'}
                  </p>
                )}
              </>
            )}
            {!promoCode && promoRateLimitSeconds === 0 && (
              <p className="text-xs text-muted-foreground">
                Contactez-nous pour obtenir un code d'accès.
              </p>
            )}
          </div>

          {/* Payment Methods - Disabled */}
          <div className="space-y-3 opacity-50">
            <div className="flex items-center gap-2">
              <strong className="block text-sm">Méthodes de paiement</strong>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Bientôt disponible</span>
            </div>
            <div className="grid gap-2 pointer-events-none">
              {[
                { value: 'moncash', label: 'MonCash', icon: '📱' },
                { value: 'natcash', label: 'NatCash', icon: '💳' },
                { value: 'carte', label: 'Carte bancaire', icon: '💳' },
              ].map((method) => (
                <div 
                  key={method.value}
                  className="flex items-center gap-3 p-4 border rounded-lg border-input bg-muted/30"
                >
                  <span className="text-xl grayscale">{method.icon}</span>
                  <span className="font-medium text-muted-foreground">{method.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Bientôt</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ✨ Essai gratuit 7 jours, puis ~200 HTG / mois.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 border border-input rounded-lg bg-muted/30">
            <input
              type="checkbox"
              id="privacy"
              required
              checked={signupData.privacy}
              onChange={(e) => setSignupData({ ...signupData, privacy: e.target.checked })}
              className="w-5 h-5 mt-0.5 rounded"
            />
            <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed">
              J'accepte les{" "}
              <Link to="/privacy-policy" className="text-primary underline font-medium" target="_blank">
                politiques de confidentialité
              </Link>
              {" "}et les conditions d'utilisation.
            </Label>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={() => setSignupStep(2)}
            >
              ← Retour
            </Button>
            <Button type="submit" disabled={isSigningUp} className="flex-1">
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte 🎉"
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
