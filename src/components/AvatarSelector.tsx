import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { avatarMap } from "@/lib/avatarMap";

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
}

export const AvatarSelector = ({ selectedAvatar, onSelect }: AvatarSelectorProps) => {
  // Normalize selectedAvatar to compare with avatar IDs
  const normalizedSelected = selectedAvatar?.match(/avatar-(\d+)/)
    ? `avatar-${selectedAvatar.match(/avatar-(\d+)/)?.[1]}`
    : selectedAvatar;

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {avatarOptions.map((avatar) => (
        <Card
          key={avatar.id}
          className={cn(
            "cursor-pointer transition-all hover:scale-105 overflow-hidden",
            normalizedSelected === avatar.id
              ? "ring-2 ring-primary shadow-lg"
              : "hover:ring-1 hover:ring-primary/50"
          )}
          onClick={() => onSelect(avatar.id)}
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
