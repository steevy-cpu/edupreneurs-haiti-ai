/**
 * @file settings.types.ts
 * @description Business/data model types for the Settings page.
 * @module types
 */

/** User profile data shape used on the Settings page */
export interface UserProfile {
  id: string;
  full_name: string;
  nickname: string;
  academic_grade: string;
  phone_number: string;
  user_id: string;
  bio: string | null;
  school: string | null;
  avatar_url: string | null;
  gender: string | null;
  date_of_birth: string | null;
}

/** A group of notification categories with a user-facing label */
export interface NotificationGroup {
  key: string;
  categories: string[];
  label: string;
  description: string;
}
