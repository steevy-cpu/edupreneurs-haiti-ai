import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, RefreshCw, Check, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIAvatarGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarGenerated: (avatarUrl: string) => void;
  userId: string;
  isSuperUser?: boolean;
  /** When true, shows onboarding step indicator and Jude-branded header */
  isOnboarding?: boolean;
}

const styles = [
  { id: "anime", label: "Anime", emoji: "🎌" },
  { id: "manga", label: "Manga", emoji: "📚" },
  { id: "chibi", label: "Chibi", emoji: "🥰" },
  { id: "cartoon", label: "Cartoon", emoji: "🎨" },
  { id: "realistic", label: "Réaliste", emoji: "📷" },
];

const hairColors = [
  { id: "black", label: "Noir", color: "#1a1a1a" },
  { id: "brown", label: "Brun", color: "#5c4033" },
  { id: "blonde", label: "Blond", color: "#f5deb3" },
  { id: "red", label: "Roux", color: "#b55239" },
  { id: "blue", label: "Bleu", color: "#4a90d9" },
  { id: "pink", label: "Rose", color: "#ff69b4" },
  { id: "purple", label: "Violet", color: "#8b5cf6" },
  { id: "white", label: "Blanc", color: "#f5f5f5" },
];

const eyeColors = [
  { id: "brown", label: "Marron", color: "#8b4513" },
  { id: "blue", label: "Bleu", color: "#4169e1" },
  { id: "green", label: "Vert", color: "#228b22" },
  { id: "hazel", label: "Noisette", color: "#c4a35a" },
  { id: "amber", label: "Ambre", color: "#ffbf00" },
  { id: "gray", label: "Gris", color: "#808080" },
  { id: "violet", label: "Violet", color: "#8b5cf6" },
  { id: "red", label: "Rouge", color: "#dc2626" },
];

const skinTones = [
  { id: "very-light", label: "Très clair", color: "#ffecd2" },
  { id: "light", label: "Clair", color: "#f5d5b8" },
  { id: "medium-light", label: "Moyen clair", color: "#d9a679" },
  { id: "medium", label: "Moyen", color: "#c68642" },
  { id: "medium-dark", label: "Moyen foncé", color: "#8d5524" },
  { id: "dark", label: "Foncé", color: "#5c3317" },
];

const expressions = [
  { id: "friendly smile", label: "Souriant", emoji: "😊" },
  { id: "confident", label: "Confiant", emoji: "😎" },
  { id: "happy", label: "Joyeux", emoji: "😄" },
  { id: "mysterious", label: "Mystérieux", emoji: "🤔" },
  { id: "cool", label: "Cool", emoji: "😏" },
  { id: "serious", label: "Sérieux", emoji: "😐" },
];

const accessories = [
  { id: "glasses", label: "Lunettes", emoji: "👓" },
  { id: "headphones", label: "Casque", emoji: "🎧" },
  { id: "hat", label: "Chapeau", emoji: "🎩" },
  { id: "earrings", label: "Boucles", emoji: "💎" },
  { id: "bandana", label: "Bandana", emoji: "🎀" },
  { id: "mask", label: "Masque", emoji: "😷" },
];

export const AIAvatarGenerator = ({ open, onOpenChange, onAvatarGenerated, userId, isSuperUser = false, isOnboarding = false }: AIAvatarGeneratorProps) => {
  const queryClient = useQueryClient();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedStyle, setSelectedStyle] = useState("anime");
  const [selectedHairColor, setSelectedHairColor] = useState("black");
  const [selectedEyeColor, setSelectedEyeColor] = useState("brown");
  const [selectedSkinTone, setSelectedSkinTone] = useState("medium");
  const [selectedExpression, setSelectedExpression] = useState("friendly smile");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [nextRegenerateDate, setNextRegenerateDate] = useState<Date | null>(null);

  // Check if user can regenerate avatar (3-day limit, except for super users)
  useEffect(() => {
    const checkRegenerationLimit = async () => {
      if (isSuperUser) {
        setCanRegenerate(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('last_avatar_generated_at')
          .eq('user_id', userId)
          .single();

        if (error || !data?.last_avatar_generated_at) {
          setCanRegenerate(true);
          return;
        }

        const lastGenerated = new Date(data.last_avatar_generated_at);
        const threeDaysLater = new Date(lastGenerated.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now < threeDaysLater) {
          setCanRegenerate(false);
          setNextRegenerateDate(threeDaysLater);
        } else {
          setCanRegenerate(true);
        }
      } catch (error) {
        console.error('Error checking regeneration limit:', error);
        setCanRegenerate(true);
      }
    };

    if (open && userId) {
      checkRegenerationLimit();
    }
  }, [open, userId, isSuperUser]);

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories(prev =>
      prev.includes(accessoryId)
        ? prev.filter(a => a !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-custom-avatar', {
        body: {
          gender,
          style: selectedStyle,
          hairColor: selectedHairColor,
          eyeColor: selectedEyeColor,
          skinTone: selectedSkinTone,
          expression: selectedExpression,
          accessories: selectedAccessories,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedImage(data.imageUrl);
      toast.success("Avatar généré avec succès!");
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!generatedImage || !userId) return;

    setIsSaving(true);
    try {
      // Create an image element from the base64 data for compression
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = generatedImage;
      });

      // Create canvas for compression and resizing
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 256; // Optimal size for avatars (good quality at small display sizes)
      
      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // High-quality image smoothing for resize
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG blob (quality 0.75 balances size and quality for 3G)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Failed to compress image')),
          'image/jpeg',
          0.75
        );
      });

      console.log(`Avatar compressed: ${(blob.size / 1024).toFixed(1)}KB`);

      // Upload to storage with JPEG extension
      const fileName = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL and timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          last_avatar_generated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Invalidate cached profile to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success("Avatar enregistré!");
      onAvatarGenerated(publicUrl);
      onOpenChange(false);
      
      // Reset state
      setGeneratedImage(null);
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating && !isSaving) {
      setGeneratedImage(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mx-0 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 p-4 shrink-0">
          {isOnboarding && (
            <p className="text-xs font-medium text-primary mb-2 tracking-wide uppercase">
              Étape 2 sur 3 — Ton avatar
            </p>
          )}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {isOnboarding ? "Crée ton avatar unique! 🎨" : "Créer un avatar IA"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-5">
          {/* Gender Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Genre</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={gender === "male" ? "default" : "outline"}
                onClick={() => setGender("male")}
                className="h-12"
              >
                <User className="h-4 w-4 mr-2" />
                Masculin
              </Button>
              <Button
                variant={gender === "female" ? "default" : "outline"}
                onClick={() => setGender("female")}
                className="h-12"
              >
                <User className="h-4 w-4 mr-2" />
                Féminin
              </Button>
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <Badge
                  key={style.id}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-2 px-3 text-sm transition-all",
                    selectedStyle === style.id && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  {style.emoji} {style.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur des cheveux</label>
            <div className="flex flex-wrap gap-2">
              {hairColors.map((color) => (
                <button
                  key={color.id}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all hover:scale-110",
                    selectedHairColor === color.id
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.color }}
                  onClick={() => setSelectedHairColor(color.id)}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Eye Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur des yeux</label>
            <div className="flex flex-wrap gap-2">
              {eyeColors.map((color) => (
                <button
                  key={color.id}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all hover:scale-110",
                    selectedEyeColor === color.id
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.color }}
                  onClick={() => setSelectedEyeColor(color.id)}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Teint</label>
            <div className="flex flex-wrap gap-2">
              {skinTones.map((tone) => (
                <button
                  key={tone.id}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all hover:scale-110",
                    selectedSkinTone === tone.id
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "border-border"
                  )}
                  style={{ backgroundColor: tone.color }}
                  onClick={() => setSelectedSkinTone(tone.id)}
                  title={tone.label}
                />
              ))}
            </div>
          </div>

          {/* Expression */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Expression</label>
            <div className="flex flex-wrap gap-2">
              {expressions.map((expr) => (
                <Badge
                  key={expr.id}
                  variant={selectedExpression === expr.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-2 px-3 text-sm transition-all",
                    selectedExpression === expr.id && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setSelectedExpression(expr.id)}
                >
                  {expr.emoji} {expr.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Accessoires (optionnel)</label>
            <div className="flex flex-wrap gap-2">
              {accessories.map((acc) => (
                <Badge
                  key={acc.id}
                  variant={selectedAccessories.includes(acc.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-2 px-3 text-sm transition-all",
                    selectedAccessories.includes(acc.id) && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => toggleAccessory(acc.id)}
                >
                  {acc.emoji} {acc.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preview */}
          {generatedImage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Aperçu</label>
              <Card className="p-4 flex justify-center">
                <img
                  src={generatedImage}
                  alt="Generated avatar"
                  className="w-48 h-48 rounded-lg object-cover shadow-lg"
                />
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-background shrink-0 space-y-2">
          {!canRegenerate && nextRegenerateDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Tu pourras générer un nouvel avatar le {nextRegenerateDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </span>
            </div>
          )}
          {!generatedImage ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !canRegenerate}
              className="w-full h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : !canRegenerate ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Reviens dans quelques jours
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer l'avatar
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
                className="flex-1 h-12"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                Régénérer
              </Button>
              <Button
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className="flex-1 h-12"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Utiliser
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
