import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { avatarMap } from "@/lib/avatarMap";
import { Sparkles } from "lucide-react";
import { AIAvatarGenerator } from "./AIAvatarGenerator";

const avatarOptions = [
  { id: "avatar-1", url: avatarMap["avatar-1"], name: "Avatar 1" },
  { id: "avatar-2", url: avatarMap["avatar-2"], name: "Avatar 2" },
  { id: "avatar-3", url: avatarMap["avatar-3"], name: "Avatar 3" },
  { id: "avatar-4", url: avatarMap["avatar-4"], name: "Avatar 4" },
  { id: "avatar-5", url: avatarMap["avatar-5"], name: "Avatar 5" },
  { id: "avatar-6", url: avatarMap["avatar-6"], name: "Avatar 6" },
  { id: "avatar-7", url: avatarMap["avatar-7"], name: "Avatar 7" },
  { id: "avatar-8", url: avatarMap["avatar-8"], name: "Avatar 8" },
  { id: "avatar-9", url: avatarMap["avatar-9"], name: "Avatar 9" },
  { id: "avatar-10", url: avatarMap["avatar-10"], name: "Avatar 10" },
  { id: "avatar-11", url: avatarMap["avatar-11"], name: "Avatar 11" },
  { id: "avatar-12", url: avatarMap["avatar-12"], name: "Avatar 12" },
];

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onSelect: (avatarId: string) => void;
  userId?: string;
}

export const AvatarSelector = ({ selectedAvatar, onSelect, userId }: AvatarSelectorProps) => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Normalize selectedAvatar to compare with avatar IDs
  const normalizedSelected = selectedAvatar?.match(/avatar-(\d+)/)
    ? `avatar-${selectedAvatar.match(/avatar-(\d+)/)?.[1]}`
    : selectedAvatar;

  // Check if selectedAvatar is a custom URL (not a preset avatar)
  const isCustomAvatar = selectedAvatar && 
    !selectedAvatar.match(/avatar-(\d+)/) && 
    (selectedAvatar.startsWith('http') || selectedAvatar.startsWith('data:'));

  const handleAIAvatarGenerated = (avatarUrl: string) => {
    onSelect(avatarUrl);
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {/* AI Generate Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:scale-105 overflow-hidden aspect-square",
            "bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20",
            "hover:from-primary/30 hover:via-purple-500/30 hover:to-pink-500/30",
            "flex flex-col items-center justify-center gap-1 p-2",
            "border-dashed border-2 border-primary/50 hover:border-primary"
          )}
          onClick={() => setShowAIGenerator(true)}
        >
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-[10px] sm:text-xs font-medium text-center text-primary">
            Créer IA
          </span>
        </Card>

        {/* Custom avatar preview if exists */}
        {isCustomAvatar && (
          <Card
            className={cn(
              "cursor-pointer transition-all hover:scale-105 overflow-hidden",
              "ring-2 ring-primary shadow-lg"
            )}
          >
            <img
              src={selectedAvatar}
              alt="Custom avatar"
              className="w-full h-full object-cover aspect-square"
              loading="lazy"
              decoding="async"
            />
          </Card>
        )}

        {/* Preset avatars */}
        {avatarOptions.map((avatar) => (
          <Card
            key={avatar.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-105 overflow-hidden",
              normalizedSelected === avatar.id && !isCustomAvatar
                ? "ring-2 ring-primary shadow-lg"
                : "hover:ring-1 hover:ring-primary/50"
            )}
            onClick={() => onSelect(avatar.id)}
          >
            <img
              src={avatar.url}
              alt={avatar.name}
              className="w-full h-full object-cover aspect-square"
              loading="lazy"
              decoding="async"
            />
          </Card>
        ))}
      </div>

      {userId && (
        <AIAvatarGenerator
          open={showAIGenerator}
          onOpenChange={setShowAIGenerator}
          onAvatarGenerated={handleAIAvatarGenerated}
          userId={userId}
        />
      )}
    </>
  );
};
