import { LucideIcon } from "lucide-react";
import { LazyExoticComponent, ComponentType } from "react";

export interface ControlCenterModule {
  id: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  component: LazyExoticComponent<ComponentType<Record<string, never>>>;
  badge?: () => Promise<number>;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  post_id: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reporter?: {
    full_name: string;
    nickname: string;
    avatar_url: string | null;
  };
  reported_user?: {
    full_name: string;
    nickname: string;
    avatar_url: string | null;
  };
  post?: {
    content: string;
    image_url: string | null;
  };
}

export interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  academic_grade: string;
  school: string | null;
  verified: boolean;
  created_at: string;
  last_seen: string | null;
  gold_earned: number;
}

export const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'spam', label: 'Spam' },
  { value: 'misinformation', label: 'Fausses informations' },
  { value: 'other', label: 'Autre' },
] as const;

export const REPORT_STATUS = [
  { value: 'pending', label: 'En attente', color: 'bg-amber-500' },
  { value: 'reviewing', label: 'En cours', color: 'bg-blue-500' },
  { value: 'resolved', label: 'Résolu', color: 'bg-green-500' },
  { value: 'dismissed', label: 'Rejeté', color: 'bg-muted' },
] as const;
