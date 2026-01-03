import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { AIAvatarGenerator } from "./AIAvatarGenerator";

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onSelect: (avatarId: string) => void;
  userId?: string;
}

export const AvatarSelector = ({ selectedAvatar, onSelect, userId }: AvatarSelectorProps) => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Check if selectedAvatar is a custom URL
  const isCustomAvatar = selectedAvatar && 
    (selectedAvatar.startsWith('http') || selectedAvatar.startsWith('data:'));

  const handleAIAvatarGenerated = (avatarUrl: string) => {
    onSelect(avatarUrl);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Custom avatar preview if exists */}
        {isCustomAvatar && (
          <Card className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden ring-2 ring-primary shadow-lg">
            <img
              src={selectedAvatar}
              alt="Mon avatar"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </Card>
        )}

        {/* AI Generate Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:scale-105 overflow-hidden",
            "bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20",
            "hover:from-primary/30 hover:via-purple-500/30 hover:to-pink-500/30",
            "flex flex-col items-center justify-center gap-2 p-4",
            "border-dashed border-2 border-primary/50 hover:border-primary",
            "w-full max-w-xs"
          )}
          onClick={() => setShowAIGenerator(true)}
        >
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium text-center text-primary">
            {isCustomAvatar ? "Générer un nouvel avatar" : "Créer mon avatar avec l'IA"}
          </span>
        </Card>
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
