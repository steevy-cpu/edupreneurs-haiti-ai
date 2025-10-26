export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      banned_youtube_videos: {
        Row: {
          banned_at: string | null
          banned_by: string
          id: string
          reason: string | null
          video_id: string
        }
        Insert: {
          banned_at?: string | null
          banned_by: string
          id?: string
          reason?: string | null
          video_id: string
        }
        Update: {
          banned_at?: string | null
          banned_by?: string
          id?: string
          reason?: string | null
          video_id?: string
        }
        Relationships: []
      }
      content_change_log: {
        Row: {
          change_type: string
          changed_by: string
          id: string
          lesson_id: string | null
          new_content: Json | null
          previous_content: Json | null
          subject_id: string | null
          timestamp: string
        }
        Insert: {
          change_type: string
          changed_by: string
          id?: string
          lesson_id?: string | null
          new_content?: Json | null
          previous_content?: Json | null
          subject_id?: string | null
          timestamp?: string
        }
        Update: {
          change_type?: string
          changed_by?: string
          id?: string
          lesson_id?: string | null
          new_content?: Json | null
          previous_content?: Json | null
          subject_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_change_log_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_change_log_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_editor_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["content_editor_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["content_editor_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["content_editor_role"]
          user_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
          visible_from_message_id: string | null
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
          visible_from_message_id?: string | null
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
          visible_from_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          is_group: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          is_group?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          is_group?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          status: Database["public"]["Enums"]["follow_status"]
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          status?: Database["public"]["Enums"]["follow_status"]
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          status?: Database["public"]["Enums"]["follow_status"]
        }
        Relationships: []
      }
      group_chats: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string
          id: string
          lesson_slug: string
          score: number | null
          subject: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_slug: string
          score?: number | null
          subject: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_slug?: string
          score?: number | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_notes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_versions: {
        Row: {
          contenu: string | null
          created_at: string
          created_by: string
          exemples_exercices: string | null
          grade_level: string
          id: string
          introduction: string | null
          is_current: boolean | null
          lesson_id: string
          objectif: string | null
          slug: string
          title: string
          version_number: number
        }
        Insert: {
          contenu?: string | null
          created_at?: string
          created_by: string
          exemples_exercices?: string | null
          grade_level: string
          id?: string
          introduction?: string | null
          is_current?: boolean | null
          lesson_id: string
          objectif?: string | null
          slug: string
          title: string
          version_number: number
        }
        Update: {
          contenu?: string | null
          created_at?: string
          created_by?: string
          exemples_exercices?: string | null
          grade_level?: string
          id?: string
          introduction?: string | null
          is_current?: boolean | null
          lesson_id?: string
          objectif?: string | null
          slug?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_versions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          contenu: string | null
          created_at: string
          created_by: string | null
          exemples_exercices: string | null
          grade_level: string
          id: string
          introduction: string | null
          is_published: boolean | null
          mois: string | null
          objectif: string | null
          order_index: number
          references: string[] | null
          review_notes: string | null
          reviewed_by: string | null
          scheduled_publish_at: string | null
          slug: string
          subject_id: string
          title: string
          updated_at: string
          workflow_status: Database["public"]["Enums"]["workflow_status"] | null
          youtube_url: string | null
        }
        Insert: {
          contenu?: string | null
          created_at?: string
          created_by?: string | null
          exemples_exercices?: string | null
          grade_level: string
          id?: string
          introduction?: string | null
          is_published?: boolean | null
          mois?: string | null
          objectif?: string | null
          order_index?: number
          references?: string[] | null
          review_notes?: string | null
          reviewed_by?: string | null
          scheduled_publish_at?: string | null
          slug: string
          subject_id: string
          title: string
          updated_at?: string
          workflow_status?:
            | Database["public"]["Enums"]["workflow_status"]
            | null
          youtube_url?: string | null
        }
        Update: {
          contenu?: string | null
          created_at?: string
          created_by?: string | null
          exemples_exercices?: string | null
          grade_level?: string
          id?: string
          introduction?: string | null
          is_published?: boolean | null
          mois?: string | null
          objectif?: string | null
          order_index?: number
          references?: string[] | null
          review_notes?: string | null
          reviewed_by?: string | null
          scheduled_publish_at?: string | null
          slug?: string
          subject_id?: string
          title?: string
          updated_at?: string
          workflow_status?:
            | Database["public"]["Enums"]["workflow_status"]
            | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          read: boolean
          replied_to_id: string | null
          sender_id: string
          shared_post_id: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          read?: boolean
          replied_to_id?: string | null
          sender_id: string
          shared_post_id?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          read?: boolean
          replied_to_id?: string | null
          sender_id?: string
          shared_post_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_replied_to_id_fkey"
            columns: ["replied_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          lesson_topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          lesson_topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          lesson_topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          content: string | null
          created_at: string
          id: string
          post_id: string | null
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          content?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          content?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      passion_module_progress: {
        Row: {
          category_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_grade: string
          affiliation_points: number | null
          avatar_url: string | null
          bio: string | null
          confirmation_code: string | null
          created_at: string | null
          email_confirmed: boolean | null
          full_name: string
          gender: string | null
          gold_earned: number
          id: string
          is_system_account: boolean | null
          nickname: string
          phone_confirmed: boolean | null
          phone_number: string
          referral_code: string | null
          referred_by: string | null
          school: string | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          academic_grade: string
          affiliation_points?: number | null
          avatar_url?: string | null
          bio?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          email_confirmed?: boolean | null
          full_name: string
          gender?: string | null
          gold_earned?: number
          id?: string
          is_system_account?: boolean | null
          nickname: string
          phone_confirmed?: boolean | null
          phone_number: string
          referral_code?: string | null
          referred_by?: string | null
          school?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          academic_grade?: string
          affiliation_points?: number | null
          avatar_url?: string | null
          bio?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          email_confirmed?: boolean | null
          full_name?: string
          gender?: string | null
          gold_earned?: number
          id?: string
          is_system_account?: boolean | null
          nickname?: string
          phone_confirmed?: boolean | null
          phone_number?: string
          referral_code?: string | null
          referred_by?: string | null
          school?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          browser: string | null
          created_at: string
          device_id: string | null
          id: string
          last_used_at: string | null
          os: string | null
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          last_used_at?: string | null
          os?: string | null
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          last_used_at?: string | null
          os?: string | null
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          points_awarded: number | null
          referred_id: string
          referrer_id: string
          rewarded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          referred_id: string
          referrer_id: string
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          referred_id?: string
          referrer_id?: string
          rewarded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          exercise_count: number | null
          grade_level: string
          icon_name: string | null
          id: string
          lesson_count: number | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exercise_count?: number | null
          grade_level: string
          icon_name?: string | null
          id?: string
          lesson_count?: number | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exercise_count?: number | null
          grade_level?: string
          icon_name?: string | null
          id?: string
          lesson_count?: number | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_passion_preferences: {
        Row: {
          arts_score: number | null
          chess_score: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          literature_score: number | null
          music_score: number | null
          quiz_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arts_score?: number | null
          chess_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          literature_score?: number | null
          music_score?: number | null
          quiz_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arts_score?: number | null
          chess_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          literature_score?: number | null
          music_score?: number | null
          quiz_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          academic_grade: string | null
          affiliation_points: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          gold_earned: number | null
          id: string | null
          nickname: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          academic_grade?: string | null
          affiliation_points?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          gold_earned?: number | null
          id?: string | null
          nickname?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          academic_grade?: string | null
          affiliation_points?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          gold_earned?: number | null
          id?: string | null
          nickname?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_to_group: {
        Args: {
          p_conversation_id: string
          p_group_id: string
          p_role?: string
          p_user_id: string
          p_visible_from_message_id?: string
        }
        Returns: undefined
      }
      award_referral_points: {
        Args: {
          p_points?: number
          p_referred_id: string
          p_referrer_id: string
        }
        Returns: undefined
      }
      check_nickname_available: {
        Args: { nickname_input: string }
        Returns: boolean
      }
      check_reset_token: {
        Args: { reset_token: string }
        Returns: {
          email: string
          user_id: string
          valid: boolean
        }[]
      }
      create_conversation: { Args: never; Returns: string }
      create_group_chat: {
        Args: { p_avatar_url?: string; p_description?: string; p_name: string }
        Returns: string
      }
      generate_password_reset_token: {
        Args: { user_email: string }
        Returns: {
          full_name: string
          token: string
          user_id: string
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      get_notification_preference: {
        Args: { p_category: string; p_user_id: string }
        Returns: boolean
      }
      is_content_editor: {
        Args: {
          _min_role?: Database["public"]["Enums"]["content_editor_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conversation_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      notify_group_deletion: {
        Args: {
          p_admin_id: string
          p_admin_name: string
          p_group_id: string
          p_group_name: string
        }
        Returns: undefined
      }
      remove_user_from_group: {
        Args: {
          p_conversation_id: string
          p_group_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      resend_verification_code: { Args: { p_user_id: string }; Returns: Json }
      verify_email_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      verify_reset_token: {
        Args: { reset_token: string }
        Returns: {
          email: string
          user_id: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      content_editor_role: "admin" | "editor" | "viewer"
      follow_status: "pending" | "accepted" | "rejected"
      workflow_status:
        | "draft"
        | "in_review"
        | "approved"
        | "published"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_editor_role: ["admin", "editor", "viewer"],
      follow_status: ["pending", "accepted", "rejected"],
      workflow_status: [
        "draft",
        "in_review",
        "approved",
        "published",
        "rejected",
      ],
    },
  },
} as const
