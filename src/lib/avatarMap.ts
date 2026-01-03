import avatar1 from "@/assets/avatars/avatar-1.png";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar3 from "@/assets/avatars/avatar-3.png";
import avatar4 from "@/assets/avatars/avatar-4.png";
import avatar5 from "@/assets/avatars/avatar-5.png";
import avatar6 from "@/assets/avatars/avatar-6.png";
import avatar7 from "@/assets/avatars/avatar-7.png";
import avatar8 from "@/assets/avatars/avatar-8.png";
import avatar9 from "@/assets/avatars/avatar-9.png";
import avatar10 from "@/assets/avatars/avatar-10.png";
import avatar11 from "@/assets/avatars/avatar-11.png";
import avatar12 from "@/assets/avatars/avatar-12.png";
import ericAvatar from "@/assets/eric-welcome.png";
import ericProfile from "@/assets/eric-new-profile.png";
import ericEdupreneurs from "@/assets/eric-edupreneurs.png";
import judeProfile from "@/assets/jude-profile.jpeg";

export const avatarMap: Record<string, string> = {
  "avatar-1": avatar1,
  "avatar-2": avatar2,
  "avatar-3": avatar3,
  "avatar-4": avatar4,
  "avatar-5": avatar5,
  "avatar-6": avatar6,
  "avatar-7": avatar7,
  "avatar-8": avatar8,
  "avatar-9": avatar9,
  "avatar-10": avatar10,
  "avatar-11": avatar11,
  "avatar-12": avatar12,
  "jude": judeProfile,
  "eric": ericEdupreneurs,
  "eric-welcome": ericAvatar,
  "eric-profile": ericProfile,
};

export const getAvatarUrl = (avatarId: string | null | undefined): string | undefined => {
  if (!avatarId) return undefined;
  
  // Check for any avatar pattern (hashed or not) in the string
  const match = avatarId.match(/avatar-(\d+)/);
  if (match) {
    const avatarKey = `avatar-${match[1]}`;
    return avatarMap[avatarKey] || undefined;
  }
  
  // If it's a full URL starting with http, return it as is
  if (avatarId.startsWith('http')) {
    return avatarId;
  }
  
  // Otherwise look it up in the map
  return avatarMap[avatarId] || undefined;
};
