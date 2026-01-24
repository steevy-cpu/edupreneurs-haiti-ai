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

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target_type: 'all' | 'grade' | 'verified';
  target_grades: string[] | null;
  scheduled_for: string | null;
  sent_at: string | null;
  sent_by: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  recipients_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export const ACADEMIC_GRADES = [
  '7AF', '7e', '8AF', '8e', '9AF', 'NS1', 'NS3', 'NS4', 'Philo', 'S1'
] as const;

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

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'spam';
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export const CONTACT_STATUS = [
  { value: 'new', label: 'Nouveau', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'En cours', color: 'bg-amber-500' },
  { value: 'resolved', label: 'Résolu', color: 'bg-green-500' },
  { value: 'spam', label: 'Spam', color: 'bg-red-500' },
] as const;
