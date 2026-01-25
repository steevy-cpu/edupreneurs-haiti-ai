/**
 * Step2 - Profile Info (Name, Nickname, Grade, Gender, etc.)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateStep2, checkNicknameAvailability } from "../../services/signup.service";
import { saveSignupProgress, getSignupProgress, saveAuthFlow } from "../../store/authFlow.store";
import { GRADE_OPTIONS } from "@/lib/authValidation";

export default function SignupStep2() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Local form state
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [academicGrade, setAcademicGrade] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [school, setSchool] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  // Nickname availability state
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const nicknameCheckTimer = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const saved = getSignupProgress();
    if (saved.fullName) setFullName(saved.fullName);
    if (saved.nickname) setNickname(saved.nickname);
    if (saved.academicGrade) setAcademicGrade(saved.academicGrade);
    if (saved.phoneNumber) setPhoneNumber(saved.phoneNumber);
    if (saved.school) setSchool(saved.school);
    if (saved.gender) setGender(saved.gender);
    if (saved.dateOfBirth) setDateOfBirth(saved.dateOfBirth);
    
    // Check nickname availability if saved
    if (saved.nickname && saved.nickname.length >= 3) {
      handleNicknameCheck(saved.nickname);
    }
  }, []);

  // Validate nickname format
  const isValidNicknameFormat = (nick: string): boolean => {
    return /^[a-zA-Z0-9_]*$/.test(nick);
  };

  // Debounced nickname check with abort controller
  const handleNicknameCheck = useCallback(async (nick: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!isValidNicknameFormat(nick) || nick.length < 3) {
      setNicknameAvailable(null);
      setCheckingNickname(false);
      return;
    }

    setCheckingNickname(true);
    abortControllerRef.current = new AbortController();

    // Debounce
    if (nicknameCheckTimer.current) {
      clearTimeout(nicknameCheckTimer.current);
    }

    nicknameCheckTimer.current = setTimeout(async () => {
      const result = await checkNicknameAvailability(nick);
      setNicknameAvailable(result);
      setCheckingNickname(false);
    }, 500);
  }, []);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    handleNicknameCheck(value);
  };

  const handleGradeChange = (value: string) => {
    if (value === 'NONE') {
      setAcademicGrade(value);
      setSchool('N/A');
    } else if (academicGrade === 'NONE' && school === 'N/A') {
      setAcademicGrade(value);
      setSchool('');
    } else {
      setAcademicGrade(value);
    }
  };

  const handleBack = () => {
    // Save current progress before going back
    saveSignupProgress({ fullName, nickname, academicGrade, phoneNumber, school, gender, dateOfBirth });
    navigate('/auth/signup/step-1');
  };

  const handleContinue = () => {
    const validation = validateStep2({ nickname, academicGrade, gender, school });
    if (!validation.valid) {
      toast({ 
        title: "Données invalides", 
        description: validation.error, 
        variant: "destructive" 
      });
      return;
    }

    if (nicknameAvailable === false) {
      toast({ 
        title: "Pseudo non disponible", 
        description: "Ce pseudo est déjà utilisé, veuillez en choisir un autre", 
        variant: "destructive" 
      });
      return;
    }

    if (nicknameAvailable === null && !checkingNickname) {
      toast({ 
        title: "Vérification requise", 
        description: "Veuillez attendre la vérification du pseudo", 
        variant: "destructive" 
      });
      return;
    }

    // Save progress and update flow state
    saveSignupProgress({ fullName, nickname, academicGrade, phoneNumber, school, gender, dateOfBirth });
    saveAuthFlow({ flow: 'signup', step: 3 });
    
    navigate('/auth/signup/step-3');
  };

  return (
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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            enterKeyHint="next"
            className="auth-input"
          />
          {nickname && !isValidNicknameFormat(nickname) && (
            <p className="text-xs text-destructive">
              Le pseudo ne peut contenir que des lettres, chiffres et underscores (pas d'emojis)
            </p>
          )}
          {checkingNickname && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Vérification...
            </p>
          )}
          {nicknameAvailable === false && isValidNicknameFormat(nickname) && (
            <p className="text-xs text-destructive">Ce pseudo est déjà utilisé</p>
          )}
          {nicknameAvailable === true && isValidNicknameFormat(nickname) && (
            <p className="text-xs text-success">Ce pseudo est disponible ✓</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="signup-grade" className="text-sm text-muted-foreground">
            Niveau académique *
          </Label>
          <Select value={academicGrade} onValueChange={handleGradeChange}>
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
          {(academicGrade === 'UNIV' || academicGrade === 'NONE') && (
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
            value={gender}
            onChange={(e) => setGender(e.target.value)}
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
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            enterKeyHint="next"
            className="auth-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-school" className="text-sm text-muted-foreground">
            {academicGrade === 'NONE' 
              ? 'Institution (optionnel)' 
              : academicGrade === 'UNIV' 
                ? 'Nom de l\'université *'
                : 'Nom de l\'école *'
            }
          </Label>
          <Input
            id="signup-school"
            type="text"
            required={academicGrade !== 'NONE'}
            disabled={academicGrade === 'NONE'}
            placeholder={
              academicGrade === 'NONE' 
                ? 'N/A' 
                : academicGrade === 'UNIV'
                  ? 'ex: Université d\'État d\'Haïti'
                  : 'ex: Collège Sacré-coeur'
            }
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            autoComplete="organization"
            autoCapitalize="words"
            enterKeyHint="next"
            className={`auth-input ${academicGrade === 'NONE' ? 'bg-muted/70 cursor-not-allowed' : ''}`}
          />
          {academicGrade === 'NONE' && (
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
          value={dateOfBirth}
          max={new Date().toISOString().split('T')[0]}
          min="1950-01-01"
          onChange={(e) => setDateOfBirth(e.target.value)}
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
          onClick={handleBack}
        >
          ← Retour
        </Button>
        <Button 
          type="button" 
          className="flex-1"
          disabled={checkingNickname}
          onClick={handleContinue}
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
  );
}
