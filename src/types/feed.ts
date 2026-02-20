// Shared types for Feed functionality

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean;
  academic_grade?: string | null; // Grade level for badge display (7AF–NS4)
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id: string | null;
  profile: Profile;
  replies?: Comment[];
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  is_public?: boolean;
  profile?: Profile;
  likes?: number;
  isLiked?: boolean;
  comments?: Comment[];
  commentCount?: number;
  shareCount?: number;
  isShared?: boolean;
}
