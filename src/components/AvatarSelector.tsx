import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import avatar1 from "@/assets/avatars/avatar-1.png";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar3 from "@/assets/avatars/avatar-3.png";
import avatar4 from "@/assets/avatars/avatar-4.png";
import avatar5 from "@/assets/avatars/avatar-5.png";
import avatar6 from "@/assets/avatars/avatar-6.png";
import avatar7 from "@/assets/avatars/avatar-7.png";
import avatar8 from "@/assets/avatars/avatar-8.png";

const avatarOptions = [
  { id: 1, url: avatar1, name: "Avatar 1" },
  { id: 2, url: avatar2, name: "Avatar 2" },
  { id: 3, url: avatar3, name: "Avatar 3" },
  { id: 4, url: avatar4, name: "Avatar 4" },
  { id: 5, url: avatar5, name: "Avatar 5" },
  { id: 6, url: avatar6, name: "Avatar 6" },
  { id: 7, url: avatar7, name: "Avatar 7" },
  { id: 8, url: avatar8, name: "Avatar 8" },
];

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onSelect: (avatarUrl: string) => void;
}

export const AvatarSelector = ({ selectedAvatar, onSelect }: AvatarSelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {avatarOptions.map((avatar) => (
        <Card
          key={avatar.id}
          className={cn(
            "cursor-pointer transition-all hover:scale-105 overflow-hidden",
            selectedAvatar === avatar.url
              ? "ring-2 ring-primary shadow-lg"
              : "hover:ring-1 hover:ring-primary/50"
          )}
          onClick={() => onSelect(avatar.url)}
        >
          <img
            src={avatar.url}
            alt={avatar.name}
            className="w-full h-full object-cover aspect-square"
          />
        </Card>
      ))}
    </div>
  );
};
