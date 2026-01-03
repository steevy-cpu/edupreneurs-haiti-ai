import ericAvatar from "@/assets/eric-welcome.png";
import ericProfile from "@/assets/eric-new-profile.png";
import ericEdupreneurs from "@/assets/eric-edupreneurs.png";
import judeProfile from "@/assets/jude-profile.jpeg";

export const avatarMap: Record<string, string> = {
  "jude": judeProfile,
  "eric": ericEdupreneurs,
  "eric-welcome": ericAvatar,
  "eric-profile": ericProfile,
};

export const getAvatarUrl = (avatarId: string | null | undefined): string | undefined => {
  if (!avatarId) return undefined;
  
  // Check if it's a full URL (AI-generated avatars stored in Supabase)
  if (avatarId.startsWith('http') || avatarId.startsWith('data:')) {
    return avatarId;
  }
  
  // Look it up in the map for special avatars (eric, jude)
  return avatarMap[avatarId] || undefined;
};
