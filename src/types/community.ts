// Shared types for Community/Messages feature

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean;
  last_seen?: string | null;
}

export interface GroupChat {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
  created_by: string;
  member_count?: number;
}

export interface Conversation {
  id: string;
  created_at: string;
  is_group: boolean;
  group_id?: string | null;
  updated_at?: string;
  group?: GroupChat;
  otherUser?: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  participants?: {
    user_id: string;
    profile: Profile;
  }[];
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  conversation_id?: string;
  profile?: Profile;
  shared_post_id?: string | null;
  replied_to_id?: string | null;
  replied_to?: Message;
  image_url?: string | null;
  video_url?: string | null;
  edited_at?: string | null;
  shared_post?: {
    id: string;
    content: string;
    image_url: string | null;
    user_id: string;
    profile?: Profile;
  };
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Jude's user ID constant (AI assistant)
export const JUDE_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';
