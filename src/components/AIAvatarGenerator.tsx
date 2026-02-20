import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, RefreshCw, Check, User, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
// Proper Vite asset import so the image is hashed and served correctly in all envs
import judeProfile from '@/assets/eric-new-profile.png';

// ─── Props (unchanged) ───
interface AIAvatarGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarGenerated: (avatarUrl: string) => void;
  userId: string;
  isSuperUser?: boolean;
  /** When true, shows onboarding step indicator and Jude-branded header */
  isOnboarding?: boolean;
}

// ─── Category type for the tab system ───
type CategoryTab = "apparence" | "style" | "tenue" | "extras";

// ─── Option data arrays ───
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
  { id: "backpack", label: "Sac à dos", emoji: "🎒" },
  { id: "bike-helmet", label: "Casque vélo", emoji: "🪖" },
];

// ─── New option arrays ───
const hairStyles = [
  { id: "court", label: "Court", emoji: "✂️" },
  { id: "long", label: "Long", emoji: "💇" },
  { id: "tresses", label: "Tresses", emoji: "🪢" },
  { id: "afro", label: "Afro", emoji: "🌀" },
  { id: "locks", label: "Locks", emoji: "🔒" },
  { id: "rase", label: "Rasé", emoji: "🪒" },
];

const outfits = [
  { id: "school-uniform", label: "Uniforme scolaire", emoji: "🎒" },
  { id: "casual", label: "Décontracté", emoji: "👕" },
  { id: "sport", label: "Sport", emoji: "🏃" },
  { id: "traditional-haitian", label: "Traditionnel haïtien", emoji: "🌺" },
  { id: "futuristic", label: "Futuriste", emoji: "🚀" },
];

const backgrounds = [
  { id: "classroom", label: "Salle de classe", emoji: "📚" },
  { id: "haitian-beach", label: "Plage haïtienne", emoji: "🌴" },
  { id: "starry-sky", label: "Ciel étoilé", emoji: "⭐" },
  { id: "modern-city", label: "Ville moderne", emoji: "🏙️" },
  { id: "tropical-nature", label: "Nature tropicale", emoji: "🌿" },
  { id: "library", label: "Bibliothèque", emoji: "📖" },
];

const specialEffects = [
  { id: "none", label: "Aucun", emoji: "➖" },
  { id: "surrounded-by-books", label: "Entouré de livres", emoji: "📚" },
  { id: "golden-light", label: "Lumière dorée", emoji: "✨" },
  { id: "watercolor", label: "Effet aquarelle", emoji: "🎨" },
  { id: "magic-particles", label: "Particules magiques", emoji: "🌟" },
  { id: "urban-neon", label: "Néon urbain", emoji: "💜" },
];

// ─── Tab definitions ───
const tabs: { id: CategoryTab; label: string; emoji: string }[] = [
  { id: "apparence", label: "Apparence", emoji: "👤" },
  { id: "style", label: "Style", emoji: "🎨" },
  { id: "tenue", label: "Tenue", emoji: "👕" },
  { id: "extras", label: "Extras", emoji: "✨" },
];

// ─── Jude reaction messages ───
const judeReactions = [
  "Beau choix! 🔥",
  "J'adore cette couleur! ✨",
  "Super style! 😎",
  "Trop bien! 🎉",
  "Parfait pour toi! 💫",
];

// ─── Reusable sub-components ───

/** Colored circle selector for skin, hair, eye colors */
const ColorCircleGrid = ({
  items,
  selected,
  onSelect,
}: {
  items: { id: string; label: string; color: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <button
        key={item.id}
        className={cn(
          "w-9 h-9 rounded-full border-2 transition-all hover:scale-110",
          selected === item.id
            ? "ring-2 ring-primary ring-offset-2 border-primary"
            : "border-border"
        )}
        style={{ backgroundColor: item.color }}
        onClick={() => onSelect(item.id)}
        title={item.label}
      />
    ))}
  </div>
);

/** Badge-style option selector */
const BadgeOptionGrid = ({
  items,
  selected,
  onSelect,
  multi = false,
}: {
  items: { id: string; label: string; emoji: string }[];
  selected: string | string[];
  onSelect: (id: string) => void;
  multi?: boolean;
}) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => {
      const isActive = multi
        ? (selected as string[]).includes(item.id)
        : selected === item.id;
      return (
        <Badge
          key={item.id}
          variant={isActive ? "default" : "outline"}
          className={cn(
            "cursor-pointer py-2 px-3 text-sm transition-all",
            isActive && "ring-2 ring-primary ring-offset-2"
          )}
          onClick={() => onSelect(item.id)}
        >
          {item.emoji} {item.label}
        </Badge>
      );
    })}
  </div>
);

// ─── Main component ───
export const AIAvatarGenerator = ({
  open,
  onOpenChange,
  onAvatarGenerated,
  userId,
  isSuperUser = false,
  isOnboarding = false,
}: AIAvatarGeneratorProps) => {
  const queryClient = useQueryClient();

  // ─── Existing state (unchanged) ───
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
  const [generationFailed, setGenerationFailed] = useState(false);
  const [nextRegenerateDate, setNextRegenerateDate] = useState<Date | null>(null);

  // ─── New state ───
  const [activeTab, setActiveTab] = useState<CategoryTab>("apparence");
  const [selectedHairStyle, setSelectedHairStyle] = useState("court");
  const [selectedOutfit, setSelectedOutfit] = useState("casual");
  const [selectedBackground, setSelectedBackground] = useState("classroom");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [reactionMessage, setReactionMessage] = useState(judeReactions[0]);

  // ─── Jude reaction: pick a random different message on any option change ───
  const triggerReaction = useCallback(() => {
    setReactionMessage((prev) => {
      const others = judeReactions.filter((m) => m !== prev);
      return others[Math.floor(Math.random() * others.length)];
    });
  }, []);

  // Wrapper to trigger Jude reaction on any selection change
  const withReaction = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    triggerReaction();
  };

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accessoryId)
        ? prev.filter((a) => a !== accessoryId)
        : [...prev, accessoryId]
    );
    triggerReaction();
  };

  // ─── Regeneration limit check (unchanged) ───
  useEffect(() => {
    const checkRegenerationLimit = async () => {
      if (isSuperUser) {
        setCanRegenerate(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("last_avatar_generated_at")
          .eq("user_id", userId)
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
        console.error("Error checking regeneration limit:", error);
        setCanRegenerate(true);
      }
    };
    if (open && userId) {
      checkRegenerationLimit();
    }
  }, [open, userId, isSuperUser]);

  // ─── Generate handler — now passes new params to edge function ───
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationFailed(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-custom-avatar", {
        body: {
          gender,
          style: selectedStyle,
          hairColor: selectedHairColor,
          eyeColor: selectedEyeColor,
          skinTone: selectedSkinTone,
          expression: selectedExpression,
          accessories: selectedAccessories,
          // New parameters with safe defaults for backward compat
          hairStyle: selectedHairStyle,
          outfitStyle: selectedOutfit,
          background: selectedBackground,
          specialEffect: selectedEffect,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setGeneratedImage(data.imageUrl);
      toast.success("Avatar généré avec succès!");
    } catch (error) {
      console.error("Error generating avatar:", error);
      if (isOnboarding) {
        setGenerationFailed(true);
      } else {
        toast.error("La génération d'avatar est temporairement indisponible. Réessaie plus tard.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Save handler (completely unchanged) ───
  const handleSaveAvatar = async () => {
    if (!generatedImage || !userId) return;
    setIsSaving(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = generatedImage;
      });
      const canvas = document.createElement("canvas");
      const MAX_SIZE = 256;
      let width = img.width;
      let height = img.height;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to compress image"))),
          "image/jpeg",
          0.75
        );
      });
      console.log(`Avatar compressed: ${(blob.size / 1024).toFixed(1)}KB`);
      const fileName = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(fileName);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          last_avatar_generated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (updateError) throw updateError;
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Avatar enregistré!");
      onAvatarGenerated(publicUrl);
      onOpenChange(false);
      setGeneratedImage(null);
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Close handler (unchanged) ───
  const handleClose = () => {
    if (!isGenerating && !isSaving) {
      setGeneratedImage(null);
      onOpenChange(false);
    }
  };

  // ─── Render category content based on active tab ───
  const renderCategoryContent = () => {
    switch (activeTab) {
      case "apparence":
        return (
          <div className="space-y-4">
            {/* Gender — large cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Genre</label>
              <div className="grid grid-cols-2 gap-2">
                {(["male", "female"] as const).map((g) => (
                  <Card
                    key={g}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-3 cursor-pointer transition-all hover:scale-[1.02]",
                      gender === g
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => withReaction(setGender)(g)}
                  >
                    <span className="text-2xl">{g === "male" ? "🧑" : "👩"}</span>
                    <span className="text-sm font-medium">{g === "male" ? "Masculin" : "Féminin"}</span>
                  </Card>
                ))}
              </div>
            </div>
            {/* Skin tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teint</label>
              <ColorCircleGrid items={skinTones} selected={selectedSkinTone} onSelect={withReaction(setSelectedSkinTone)} />
            </div>
            {/* Hair style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coiffure</label>
              <BadgeOptionGrid items={hairStyles} selected={selectedHairStyle} onSelect={withReaction(setSelectedHairStyle)} />
            </div>
            {/* Hair color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Couleur des cheveux</label>
              <ColorCircleGrid items={hairColors} selected={selectedHairColor} onSelect={withReaction(setSelectedHairColor)} />
            </div>
            {/* Eye color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Couleur des yeux</label>
              <ColorCircleGrid items={eyeColors} selected={selectedEyeColor} onSelect={withReaction(setSelectedEyeColor)} />
            </div>
          </div>
        );

      case "style":
        return (
          <div className="space-y-4">
            {/* Art style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style artistique</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((s) => (
                  <Card
                    key={s.id}
                    className={cn(
                      "flex items-center gap-2 p-3 cursor-pointer transition-all hover:scale-[1.02]",
                      selectedStyle === s.id
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => withReaction(setSelectedStyle)(s.id)}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                  </Card>
                ))}
              </div>
            </div>
            {/* Expression */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expression</label>
              <BadgeOptionGrid items={expressions} selected={selectedExpression} onSelect={withReaction(setSelectedExpression)} />
            </div>
          </div>
        );

      case "tenue":
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tenue vestimentaire</label>
              <div className="grid grid-cols-2 gap-2">
                {outfits.map((o) => (
                  <Card
                    key={o.id}
                    className={cn(
                      "flex items-center gap-2 p-3 cursor-pointer transition-all hover:scale-[1.02]",
                      selectedOutfit === o.id
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => withReaction(setSelectedOutfit)(o.id)}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className="text-sm font-medium">{o.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case "extras":
        return (
          <div className="space-y-4">
            {/* Accessories — multi-select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accessoires</label>
              <BadgeOptionGrid
                items={accessories}
                selected={selectedAccessories}
                onSelect={toggleAccessory}
                multi
              />
            </div>
            {/* Background */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arrière-plan</label>
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((bg) => (
                  <Card
                    key={bg.id}
                    className={cn(
                      "flex items-center gap-2 p-3 cursor-pointer transition-all hover:scale-[1.02]",
                      selectedBackground === bg.id
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => withReaction(setSelectedBackground)(bg.id)}
                  >
                    <span className="text-lg">{bg.emoji}</span>
                    <span className="text-xs font-medium">{bg.label}</span>
                  </Card>
                ))}
              </div>
            </div>
            {/* Special effect */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effet spécial</label>
              <div className="grid grid-cols-2 gap-2">
                {specialEffects.map((fx) => (
                  <Card
                    key={fx.id}
                    className={cn(
                      "flex items-center gap-2 p-3 cursor-pointer transition-all hover:scale-[1.02]",
                      selectedEffect === fx.id
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => withReaction(setSelectedEffect)(fx.id)}
                  >
                    <span className="text-lg">{fx.emoji}</span>
                    <span className="text-xs font-medium">{fx.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mx-0 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* ─── Header ─── */}
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 p-4 shrink-0">
          {isOnboarding && (
            <p className="text-xs font-medium text-primary mb-2 tracking-wide uppercase">
              Étape 2 sur 3 — Ton avatar
            </p>
          )}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {isOnboarding ? "Crée ton avatar unique! 🎨" : "Créateur d'avatar IA"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ─── Body: two-panel layout ─── */}
        <div className="overflow-y-auto flex-1 flex flex-col md:flex-row">
          {/* ─── Left panel: preview + Jude ─── */}
          <div className="shrink-0 md:w-48 h-40 md:h-auto flex flex-row md:flex-col items-center gap-3 p-4 border-b md:border-b-0 md:border-r border-border bg-muted/30">
            {/* Avatar preview or pulsing placeholder */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl shadow-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Avatar généré"
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Pulsing silhouette placeholder */
                <div className="w-full h-full flex items-center justify-center animate-pulse">
                  <User className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Jude reaction area */}
            <div className="flex flex-col items-center gap-1 min-w-0">
              <img
                src={judeProfile}
                alt="Jude"
                className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover"
              />
              {/* Speech bubble with AnimatePresence fade */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={reactionMessage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-medium text-center whitespace-nowrap shadow-sm"
                >
                  {reactionMessage}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Right panel: tabs + controls ─── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Custom pill tab selector — horizontal scrollable */}
            <div className="shrink-0 px-3 pt-3 pb-2">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tab.emoji} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category content with slide animation */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCategoryContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ─── Footer (logic unchanged, visual refresh) ─── */}
        <div className="p-4 border-t bg-background shrink-0 space-y-2">
          {/* Cooldown notice */}
          {!canRegenerate && nextRegenerateDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Tu pourras générer un nouvel avatar le{" "}
                {nextRegenerateDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </span>
            </div>
          )}

          {/* Onboarding fallback: friendly error with skip option (unchanged) */}
          {generationFailed && isOnboarding && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <span>
                  La génération d'avatar est temporairement indisponible. Tu pourras en créer un depuis tes paramètres plus tard.
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setGenerationFailed(false); handleGenerate(); }}
                  className="flex-1 h-12"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12"
                >
                  Continuer sans avatar
                </Button>
              </div>
            </div>
          )}

          {/* Main action buttons */}
          {!generationFailed && !generatedImage ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !canRegenerate}
              className={cn(
                "w-full h-12",
                canRegenerate && !isGenerating && "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : !canRegenerate ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Reviens dans quelques jours
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  ✨ Créer mon avatar
                </>
              )}
            </Button>
          ) : !generationFailed ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
                className="flex-1 h-12"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                🔄 Régénérer
              </Button>
              <Button
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                ✅ Utiliser cet avatar
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
