import ericAvatar from "@/assets/eric-welcome.png";
const ericProfile = '/images/eric-new-profile-300w.webp';
const ericEdupreneurs = '/images/eric-edupreneurs-300w.webp';
import judeProfile from "@/assets/jude-profile.jpeg";

export const avatarMap: Record<string, string> = {
  "jude": judeProfile,
  "eric": ericEdupreneurs,
  "eric-welcome": ericAvatar,
  "eric-profile": ericProfile,
};

/**
 * Get avatar URL with optional size optimization for Supabase storage URLs
 * @param avatarId - Avatar identifier (URL, data URI, or special avatar key)
 * @param size - Optional size in pixels for image optimization (default: 80)
 * @returns Optimized avatar URL or undefined
 */
export const getAvatarUrl = (
  avatarId: string | null | undefined, 
  size: number = 80
): string | undefined => {
  if (!avatarId) return undefined;
  
  // For Supabase storage URLs, add size transformation for bandwidth optimization
  if (avatarId.includes('supabase') && avatarId.includes('/storage/')) {
    try {
      const url = new URL(avatarId);
      url.searchParams.set('width', size.toString());
      url.searchParams.set('height', size.toString());
      url.searchParams.set('quality', '80');
      return url.toString();
    } catch {
      // If URL parsing fails, return as-is
      return avatarId;
    }
  }
  
  // Full URLs (AI-generated or external) - return as-is
  if (avatarId.startsWith('http') || avatarId.startsWith('data:')) {
    return avatarId;
  }
  
  // Look it up in the map for special avatars (eric, jude)
  return avatarMap[avatarId] || undefined;
};
