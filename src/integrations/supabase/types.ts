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
      achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_generation_jobs: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          current_section: string | null
          error_message: string | null
          id: string
          job_type: string
          lesson_id: string
          progress: Json | null
          result_content: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["ai_job_status"] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          current_section?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          lesson_id: string
          progress?: Json | null
          result_content?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_job_status"] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          current_section?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          lesson_id?: string
          progress?: Json | null
          result_content?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_job_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_generation_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_generation_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_generation_jobs_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generation_logs: {
        Row: {
          additional_context: string | null
          created_at: string | null
          error_message: string | null
          generated_by: string | null
          generation_time_ms: number | null
          has_emojis: boolean | null
          has_html_tags: boolean | null
          has_tailwind_classes: boolean | null
          id: string
          lesson_id: string | null
          mentions_haiti: boolean | null
          model_used: string | null
          prompt_used: string | null
          quality_score: number | null
          response_content: string | null
          retry_count: number | null
          section_name: string
          success: boolean | null
          target_words: number | null
          word_count: number | null
        }
        Insert: {
          additional_context?: string | null
          created_at?: string | null
          error_message?: string | null
          generated_by?: string | null
          generation_time_ms?: number | null
          has_emojis?: boolean | null
          has_html_tags?: boolean | null
          has_tailwind_classes?: boolean | null
          id?: string
          lesson_id?: string | null
          mentions_haiti?: boolean | null
          model_used?: string | null
          prompt_used?: string | null
          quality_score?: number | null
          response_content?: string | null
          retry_count?: number | null
          section_name: string
          success?: boolean | null
          target_words?: number | null
          word_count?: number | null
        }
        Update: {
          additional_context?: string | null
          created_at?: string | null
          error_message?: string | null
          generated_by?: string | null
          generation_time_ms?: number | null
          has_emojis?: boolean | null
          has_html_tags?: boolean | null
          has_tailwind_classes?: boolean | null
          id?: string
          lesson_id?: string | null
          mentions_haiti?: boolean | null
          model_used?: string | null
          prompt_used?: string | null
          quality_score?: number | null
          response_content?: string | null
          retry_count?: number | null
          section_name?: string
          success?: boolean | null
          target_words?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_logs_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_generation_logs_generated_by"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_ai_generation_logs_generated_by"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_ai_generation_logs_generated_by"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      announcements: {
        Row: {
          created_at: string | null
          id: string
          message: string
          recipients_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          sent_by: string
          status: string
          success_count: number | null
          target_grades: string[] | null
          target_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by: string
          status?: string
          success_count?: number | null
          target_grades?: string[] | null
          target_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string
          status?: string
          success_count?: number | null
          target_grades?: string[] | null
          target_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
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
      blog_authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "blog_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      chess_achievements: {
        Row: {
          achievement_description: string | null
          achievement_key: string
          achievement_name: string
          earned_at: string
          icon: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_key: string
          achievement_name: string
          earned_at?: string
          icon?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_key?: string
          achievement_name?: string
          earned_at?: string
          icon?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chess_games: {
        Row: {
          analysis: Json | null
          blunders: number | null
          brilliant_moves: number | null
          created_at: string
          difficulty: string | null
          elo_change: number | null
          ended_at: string | null
          final_fen: string | null
          good_moves: number | null
          id: string
          inaccuracies: number | null
          is_multiplayer: boolean | null
          match_id: string | null
          mistakes: number | null
          move_history: Json | null
          moves_count: number
          opening_name: string | null
          opponent_id: string | null
          opponent_type: string
          result: string
          started_at: string
          time_control: string | null
          total_time_seconds: number | null
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          blunders?: number | null
          brilliant_moves?: number | null
          created_at?: string
          difficulty?: string | null
          elo_change?: number | null
          ended_at?: string | null
          final_fen?: string | null
          good_moves?: number | null
          id?: string
          inaccuracies?: number | null
          is_multiplayer?: boolean | null
          match_id?: string | null
          mistakes?: number | null
          move_history?: Json | null
          moves_count?: number
          opening_name?: string | null
          opponent_id?: string | null
          opponent_type?: string
          result: string
          started_at?: string
          time_control?: string | null
          total_time_seconds?: number | null
          user_id: string
        }
        Update: {
          analysis?: Json | null
          blunders?: number | null
          brilliant_moves?: number | null
          created_at?: string
          difficulty?: string | null
          elo_change?: number | null
          ended_at?: string | null
          final_fen?: string | null
          good_moves?: number | null
          id?: string
          inaccuracies?: number | null
          is_multiplayer?: boolean | null
          match_id?: string | null
          mistakes?: number | null
          move_history?: Json | null
          moves_count?: number
          opening_name?: string | null
          opponent_id?: string | null
          opponent_type?: string
          result?: string
          started_at?: string
          time_control?: string | null
          total_time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chess_games_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "chess_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      chess_match_chat: {
        Row: {
          created_at: string
          id: string
          match_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chess_match_chat_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "chess_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      chess_matches: {
        Row: {
          black_player_id: string | null
          black_time_remaining: number | null
          created_at: string
          created_by: string
          current_fen: string
          current_turn: string
          difficulty: string | null
          ended_at: string | null
          id: string
          invite_code: string | null
          is_public: boolean
          last_move_at: string | null
          move_history: Json
          rematch_from_id: string | null
          rematch_match_id: string | null
          rematch_requested_by: string | null
          result: string | null
          result_reason: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["chess_match_status"]
          time_control: string
          time_per_player: number | null
          updated_at: string
          white_player_id: string
          white_time_remaining: number | null
          winner_id: string | null
        }
        Insert: {
          black_player_id?: string | null
          black_time_remaining?: number | null
          created_at?: string
          created_by: string
          current_fen?: string
          current_turn?: string
          difficulty?: string | null
          ended_at?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean
          last_move_at?: string | null
          move_history?: Json
          rematch_from_id?: string | null
          rematch_match_id?: string | null
          rematch_requested_by?: string | null
          result?: string | null
          result_reason?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["chess_match_status"]
          time_control?: string
          time_per_player?: number | null
          updated_at?: string
          white_player_id: string
          white_time_remaining?: number | null
          winner_id?: string | null
        }
        Update: {
          black_player_id?: string | null
          black_time_remaining?: number | null
          created_at?: string
          created_by?: string
          current_fen?: string
          current_turn?: string
          difficulty?: string | null
          ended_at?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean
          last_move_at?: string | null
          move_history?: Json
          rematch_from_id?: string | null
          rematch_match_id?: string | null
          rematch_requested_by?: string | null
          result?: string | null
          result_reason?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["chess_match_status"]
          time_control?: string
          time_per_player?: number | null
          updated_at?: string
          white_player_id?: string
          white_time_remaining?: number | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chess_matches_rematch_from_id_fkey"
            columns: ["rematch_from_id"]
            isOneToOne: false
            referencedRelation: "chess_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chess_matches_rematch_match_id_fkey"
            columns: ["rematch_match_id"]
            isOneToOne: false
            referencedRelation: "chess_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      chess_player_stats: {
        Row: {
          avg_time_per_move: number | null
          created_at: string
          current_winning_streak: number
          elo_rating: number
          games_drawn: number
          games_lost: number
          games_played: number
          games_won: number
          id: string
          longest_winning_streak: number
          total_moves: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_time_per_move?: number | null
          created_at?: string
          current_winning_streak?: number
          elo_rating?: number
          games_drawn?: number
          games_lost?: number
          games_played?: number
          games_won?: number
          id?: string
          longest_winning_streak?: number
          total_moves?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_time_per_move?: number | null
          created_at?: string
          current_winning_streak?: number
          elo_rating?: number
          games_drawn?: number
          games_lost?: number
          games_played?: number
          games_won?: number
          id?: string
          longest_winning_streak?: number
          total_moves?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chess_puzzle_attempts: {
        Row: {
          attempts: number
          created_at: string
          id: string
          puzzle_id: string
          solved: boolean
          time_seconds: number | null
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          puzzle_id: string
          solved?: boolean
          time_seconds?: number | null
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          puzzle_id?: string
          solved?: boolean
          time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chess_puzzle_attempts_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "chess_puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      chess_puzzles: {
        Row: {
          created_at: string
          daily_date: string | null
          difficulty: string
          explanation: string | null
          fen: string
          hint: string | null
          id: string
          is_daily: boolean | null
          solution: string[]
          theme: string | null
        }
        Insert: {
          created_at?: string
          daily_date?: string | null
          difficulty: string
          explanation?: string | null
          fen: string
          hint?: string | null
          id?: string
          is_daily?: boolean | null
          solution: string[]
          theme?: string | null
        }
        Update: {
          created_at?: string
          daily_date?: string | null
          difficulty?: string
          explanation?: string | null
          fen?: string
          hint?: string | null
          id?: string
          is_daily?: boolean | null
          solution?: string[]
          theme?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
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
      curriculum_analysis_logs: {
        Row: {
          analyzed_by: string
          created_at: string
          existing_lessons: Json | null
          grade_level: string
          id: string
          missing_topics: Json | null
          partial_matches: Json | null
          pdf_name: string
          subject_id: string | null
          suggestions: Json | null
          topics_found: Json | null
        }
        Insert: {
          analyzed_by: string
          created_at?: string
          existing_lessons?: Json | null
          grade_level: string
          id?: string
          missing_topics?: Json | null
          partial_matches?: Json | null
          pdf_name: string
          subject_id?: string | null
          suggestions?: Json | null
          topics_found?: Json | null
        }
        Update: {
          analyzed_by?: string
          created_at?: string
          existing_lessons?: Json | null
          grade_level?: string
          id?: string
          missing_topics?: Json | null
          partial_matches?: Json | null
          pdf_name?: string
          subject_id?: string | null
          suggestions?: Json | null
          topics_found?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_analysis_logs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_words: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string | null
          definition: string
          difficulty_level: string | null
          display_order: number | null
          example: string
          id: string
          is_active: boolean | null
          part_of_speech: string
          phonetic: string
          updated_at: string | null
          word: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          definition: string
          difficulty_level?: string | null
          display_order?: number | null
          example: string
          id?: string
          is_active?: boolean | null
          part_of_speech: string
          phonetic: string
          updated_at?: string | null
          word: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          definition?: string
          difficulty_level?: string | null
          display_order?: number | null
          example?: string
          id?: string
          is_active?: boolean | null
          part_of_speech?: string
          phonetic?: string
          updated_at?: string | null
          word?: string
        }
        Relationships: []
      }
      device_verification_challenges: {
        Row: {
          attempts: number | null
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          expires_at: string
          hardware_fingerprint: string | null
          id: string
          max_attempts: number | null
          os: string | null
          user_id: string
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          expires_at?: string
          hardware_fingerprint?: string | null
          id?: string
          max_attempts?: number | null
          os?: string | null
          user_id: string
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          expires_at?: string
          hardware_fingerprint?: string | null
          id?: string
          max_attempts?: number | null
          os?: string | null
          user_id?: string
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      ebook_comments: {
        Row: {
          comment: string
          created_at: string
          ebook_id: string
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          ebook_id: string
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          ebook_id?: string
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_comments_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_reading_progress: {
        Row: {
          current_page: number
          ebook_id: string
          id: string
          is_completed: boolean
          last_read_at: string
          user_id: string
        }
        Insert: {
          current_page?: number
          ebook_id: string
          id?: string
          is_completed?: boolean
          last_read_at?: string
          user_id: string
        }
        Update: {
          current_page?: number
          ebook_id?: string
          id?: string
          is_completed?: boolean
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_reading_progress_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebooks: {
        Row: {
          author: string | null
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          file_url: string
          id: string
          is_published: boolean
          language: string
          page_count: number | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          is_published?: boolean
          language?: string
          page_count?: number | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          is_published?: boolean
          language?: string
          page_count?: number | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebooks_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ebooks_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ebooks_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      english_practice_conversations: {
        Row: {
          created_at: string | null
          grade_level: string
          id: string
          lesson_slug: string
          message_content: string
          message_role: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grade_level: string
          id?: string
          lesson_slug: string
          message_content: string
          message_role: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          grade_level?: string
          id?: string
          lesson_slug?: string
          message_content?: string
          message_role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exam_exercises: {
        Row: {
          concept: string
          correct_answer: string | null
          created_at: string
          exam_id: string
          exercise_number: number
          exercise_type: string
          explanation: string | null
          id: string
          options: Json | null
          points: number
          question_text: string
        }
        Insert: {
          concept: string
          correct_answer?: string | null
          created_at?: string
          exam_id: string
          exercise_number: number
          exercise_type?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number
          question_text: string
        }
        Update: {
          concept?: string
          correct_answer?: string | null
          created_at?: string
          exam_id?: string
          exercise_number?: number
          exercise_type?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_exercises_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "official_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_practice_conversations: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          message_content: string
          message_role: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          message_content: string
          message_role: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          message_content?: string
          message_role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_practice_conversations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exam_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_practice_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exam_practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_practice_sessions: {
        Row: {
          completed_at: string | null
          completed_exercises: Json
          current_exercise: number
          exam_id: string
          id: string
          score: number
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_exercises?: Json
          current_exercise?: number
          exam_id: string
          id?: string
          score?: number
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_exercises?: Json
          current_exercise?: number
          exam_id?: string
          id?: string
          score?: number
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_practice_sessions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "official_exams"
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
      jude_animation_config: {
        Row: {
          animation_name: string
          created_at: string | null
          description: string | null
          display_name: string
          duration_ms: number | null
          id: string
          loop: boolean | null
          priority: number | null
          trigger_keywords: string[] | null
        }
        Insert: {
          animation_name: string
          created_at?: string | null
          description?: string | null
          display_name: string
          duration_ms?: number | null
          id?: string
          loop?: boolean | null
          priority?: number | null
          trigger_keywords?: string[] | null
        }
        Update: {
          animation_name?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          duration_ms?: number | null
          id?: string
          loop?: boolean | null
          priority?: number | null
          trigger_keywords?: string[] | null
        }
        Relationships: []
      }
      jude_audio_cache: {
        Row: {
          audio_url: string
          created_at: string | null
          duration_ms: number | null
          id: string
          last_used_at: string | null
          phoneme_data: Json | null
          text_content: string
          text_hash: string
          use_count: number | null
          voice_id: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          last_used_at?: string | null
          phoneme_data?: Json | null
          text_content: string
          text_hash: string
          use_count?: number | null
          voice_id?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          last_used_at?: string | null
          phoneme_data?: Json | null
          text_content?: string
          text_hash?: string
          use_count?: number | null
          voice_id?: string | null
        }
        Relationships: []
      }
      lesson_assets: {
        Row: {
          created_at: string | null
          generated_by: string | null
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          lesson_id: string
          payload_json: Json
          schema_version: number | null
          status: Database["public"]["Enums"]["asset_status"] | null
          updated_at: string | null
          validation_report_json: Json | null
        }
        Insert: {
          created_at?: string | null
          generated_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["asset_kind"]
          lesson_id: string
          payload_json: Json
          schema_version?: number | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string | null
          validation_report_json?: Json | null
        }
        Update: {
          created_at?: string | null
          generated_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          lesson_id?: string
          payload_json?: Json
          schema_version?: number | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string | null
          validation_report_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_assets_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_assets_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_assets_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_assets_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
      lesson_videos: {
        Row: {
          added_by: string | null
          created_at: string | null
          description: string | null
          id: string
          is_primary: boolean | null
          lesson_id: string
          order_index: number
          title: string | null
          updated_at: string | null
          video_id: string
          youtube_url: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          lesson_id: string
          order_index?: number
          title?: string | null
          updated_at?: string | null
          video_id: string
          youtube_url: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          lesson_id?: string
          order_index?: number
          title?: string | null
          updated_at?: string | null
          video_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          activites_interactives: string | null
          activities_alignment_score: number | null
          activities_count: number | null
          audio_contenu_url: string | null
          audio_exemples_url: string | null
          audio_generated_at: string | null
          audio_introduction_url: string | null
          audio_objectif_url: string | null
          content_alignment_score: number | null
          contenu: string | null
          created_at: string
          created_by: string | null
          exemples_exercices: string | null
          grade_level: string
          id: string
          introduction: string | null
          is_published: boolean | null
          last_activities_validated_at: string | null
          last_content_validated_at: string | null
          mois: string | null
          needs_activities_regeneration: boolean | null
          needs_quiz_regeneration: boolean | null
          objectif: string | null
          order_index: number
          quiz_count: number | null
          quiz_final: string | null
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
          activites_interactives?: string | null
          activities_alignment_score?: number | null
          activities_count?: number | null
          audio_contenu_url?: string | null
          audio_exemples_url?: string | null
          audio_generated_at?: string | null
          audio_introduction_url?: string | null
          audio_objectif_url?: string | null
          content_alignment_score?: number | null
          contenu?: string | null
          created_at?: string
          created_by?: string | null
          exemples_exercices?: string | null
          grade_level: string
          id?: string
          introduction?: string | null
          is_published?: boolean | null
          last_activities_validated_at?: string | null
          last_content_validated_at?: string | null
          mois?: string | null
          needs_activities_regeneration?: boolean | null
          needs_quiz_regeneration?: boolean | null
          objectif?: string | null
          order_index?: number
          quiz_count?: number | null
          quiz_final?: string | null
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
          activites_interactives?: string | null
          activities_alignment_score?: number | null
          activities_count?: number | null
          audio_contenu_url?: string | null
          audio_exemples_url?: string | null
          audio_generated_at?: string | null
          audio_introduction_url?: string | null
          audio_objectif_url?: string | null
          content_alignment_score?: number | null
          contenu?: string | null
          created_at?: string
          created_by?: string | null
          exemples_exercices?: string | null
          grade_level?: string
          id?: string
          introduction?: string | null
          is_published?: boolean | null
          last_activities_validated_at?: string | null
          last_content_validated_at?: string | null
          mois?: string | null
          needs_activities_regeneration?: boolean | null
          needs_quiz_regeneration?: boolean | null
          objectif?: string | null
          order_index?: number
          quiz_count?: number | null
          quiz_final?: string | null
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
      official_exams: {
        Row: {
          created_at: string
          grade_level: string
          id: string
          is_model_exam: boolean | null
          pdf_url: string | null
          reference_texts: Json | null
          series: string | null
          session: string | null
          subject: string
          title: string
          total_exercises: number
          total_points: number
          updated_at: string
          version_number: number | null
          year: number
        }
        Insert: {
          created_at?: string
          grade_level: string
          id?: string
          is_model_exam?: boolean | null
          pdf_url?: string | null
          reference_texts?: Json | null
          series?: string | null
          session?: string | null
          subject: string
          title: string
          total_exercises?: number
          total_points?: number
          updated_at?: string
          version_number?: number | null
          year: number
        }
        Update: {
          created_at?: string
          grade_level?: string
          id?: string
          is_model_exam?: boolean | null
          pdf_url?: string | null
          reference_texts?: Json | null
          series?: string | null
          session?: string | null
          subject?: string
          title?: string
          total_exercises?: number
          total_points?: number
          updated_at?: string
          version_number?: number | null
          year?: number
        }
        Relationships: []
      }
      passion_activity_videos: {
        Row: {
          activity_id: string
          category_id: string
          created_at: string | null
          id: string
          module_id: string
          title: string | null
          updated_at: string | null
          updated_by: string | null
          youtube_url: string | null
        }
        Insert: {
          activity_id: string
          category_id: string
          created_at?: string | null
          id?: string
          module_id: string
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          youtube_url?: string | null
        }
        Update: {
          activity_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
          module_id?: string
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          youtube_url?: string | null
        }
        Relationships: []
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
      passion_recommended_videos: {
        Row: {
          category_id: string
          channel_title: string | null
          created_at: string | null
          created_by: string | null
          display_order: number | null
          id: string
          module_id: string
          thumbnail: string | null
          title: string | null
          updated_at: string | null
          video_id: string
          youtube_url: string
        }
        Insert: {
          category_id: string
          channel_title?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          id?: string
          module_id: string
          thumbnail?: string | null
          title?: string | null
          updated_at?: string | null
          video_id: string
          youtube_url: string
        }
        Update: {
          category_id?: string
          channel_title?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          id?: string
          module_id?: string
          thumbnail?: string | null
          title?: string | null
          updated_at?: string | null
          video_id?: string
          youtube_url?: string
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
      payment_transactions: {
        Row: {
          admin_verified: boolean | null
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          natcash_phone: string | null
          natcash_reference: string | null
          order_id: string
          payer_phone: string | null
          payment_token: string | null
          provider: string
          receipt_url: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_verified?: boolean | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          natcash_phone?: string | null
          natcash_reference?: string | null
          order_id: string
          payer_phone?: string | null
          payment_token?: string | null
          provider: string
          receipt_url?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_verified?: boolean | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          natcash_phone?: string | null
          natcash_reference?: string | null
          order_id?: string
          payer_phone?: string | null
          payment_token?: string | null
          provider?: string
          receipt_url?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
          is_public: boolean
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_public?: boolean
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_public?: boolean
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
          date_of_birth: string | null
          email_confirmed: boolean | null
          full_name: string
          gender: string | null
          gold_earned: number
          has_free_access: boolean | null
          id: string
          is_system_account: boolean | null
          last_avatar_generated_at: string | null
          last_feed_visit: string | null
          last_seen: string | null
          nickname: string
          onboarding_tour_completed: boolean | null
          onboarding_tour_completed_at: string | null
          phone_confirmed: boolean | null
          phone_number: string
          phone_verification_request_id: string | null
          phone_verification_sent_at: string | null
          promo_code_used: string | null
          promo_code_used_at: string | null
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
          date_of_birth?: string | null
          email_confirmed?: boolean | null
          full_name: string
          gender?: string | null
          gold_earned?: number
          has_free_access?: boolean | null
          id?: string
          is_system_account?: boolean | null
          last_avatar_generated_at?: string | null
          last_feed_visit?: string | null
          last_seen?: string | null
          nickname: string
          onboarding_tour_completed?: boolean | null
          onboarding_tour_completed_at?: string | null
          phone_confirmed?: boolean | null
          phone_number: string
          phone_verification_request_id?: string | null
          phone_verification_sent_at?: string | null
          promo_code_used?: string | null
          promo_code_used_at?: string | null
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
          date_of_birth?: string | null
          email_confirmed?: boolean | null
          full_name?: string
          gender?: string | null
          gold_earned?: number
          has_free_access?: boolean | null
          id?: string
          is_system_account?: boolean | null
          last_avatar_generated_at?: string | null
          last_feed_visit?: string | null
          last_seen?: string | null
          nickname?: string
          onboarding_tour_completed?: boolean | null
          onboarding_tour_completed_at?: string | null
          phone_confirmed?: boolean | null
          phone_number?: string
          phone_verification_request_id?: string | null
          phone_verification_sent_at?: string | null
          promo_code_used?: string | null
          promo_code_used_at?: string | null
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
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
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
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          gold_reward: number
          grants_free_access: boolean | null
          id: string
          is_active: boolean | null
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          gold_reward?: number
          grants_free_access?: boolean | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          gold_reward?: number
          grants_free_access?: boolean | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          browser: string | null
          created_at: string
          device_id: string | null
          domain: string | null
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
          domain?: string | null
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
          domain?: string | null
          id?: string
          last_used_at?: string | null
          os?: string | null
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_battle_badges: {
        Row: {
          badge_key: string
          badge_name: string
          description: string | null
          earned_at: string
          icon: string
          id: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          badge_key: string
          badge_name: string
          description?: string | null
          earned_at?: string
          icon?: string
          id?: string
          subject_id?: string | null
          user_id: string
        }
        Update: {
          badge_key?: string
          badge_name?: string
          description?: string | null
          earned_at?: string
          icon?: string
          id?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battle_badges_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battle_invitations: {
        Row: {
          battle_id: string | null
          created_at: string
          difficulty: string
          expires_at: string
          grade_level: string
          id: string
          recipient_id: string
          responded_at: string | null
          sender_id: string
          status: string
          subject_id: string
        }
        Insert: {
          battle_id?: string | null
          created_at?: string
          difficulty: string
          expires_at?: string
          grade_level: string
          id?: string
          recipient_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
          subject_id: string
        }
        Update: {
          battle_id?: string | null
          created_at?: string
          difficulty?: string
          expires_at?: string
          grade_level?: string
          id?: string
          recipient_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battle_invitations_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "quiz_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_battle_invitations_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battle_matchmaking: {
        Row: {
          battle_id: string | null
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          expires_at: string
          grade_level: string
          id: string
          joined_at: string
          matched_with: string | null
          subject_id: string | null
          user_id: string
        }
        Insert: {
          battle_id?: string | null
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          expires_at?: string
          grade_level: string
          id?: string
          joined_at?: string
          matched_with?: string | null
          subject_id?: string | null
          user_id: string
        }
        Update: {
          battle_id?: string | null
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          expires_at?: string
          grade_level?: string
          id?: string
          joined_at?: string
          matched_with?: string | null
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battle_matchmaking_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "quiz_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_battle_matchmaking_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battle_players: {
        Row: {
          answers: Json
          battle_id: string
          correct_answers: number
          created_at: string
          current_question: number
          finished_at: string | null
          id: string
          is_ready: boolean
          score: number
          time_per_question: Json
          user_id: string
        }
        Insert: {
          answers?: Json
          battle_id: string
          correct_answers?: number
          created_at?: string
          current_question?: number
          finished_at?: string | null
          id?: string
          is_ready?: boolean
          score?: number
          time_per_question?: Json
          user_id: string
        }
        Update: {
          answers?: Json
          battle_id?: string
          correct_answers?: number
          created_at?: string
          current_question?: number
          finished_at?: string | null
          id?: string
          is_ready?: boolean
          score?: number
          time_per_question?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battle_players_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "quiz_battles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battle_stats: {
        Row: {
          avg_response_time_ms: number | null
          battles_drawn: number
          battles_lost: number
          battles_won: number
          created_at: string
          current_streak: number
          id: string
          level: number
          longest_streak: number
          multi_battles: number
          perfect_games: number
          rank_points: number
          solo_battles: number
          total_battles: number
          total_correct_answers: number
          total_questions_answered: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_response_time_ms?: number | null
          battles_drawn?: number
          battles_lost?: number
          battles_won?: number
          created_at?: string
          current_streak?: number
          id?: string
          level?: number
          longest_streak?: number
          multi_battles?: number
          perfect_games?: number
          rank_points?: number
          solo_battles?: number
          total_battles?: number
          total_correct_answers?: number
          total_questions_answered?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_response_time_ms?: number | null
          battles_drawn?: number
          battles_lost?: number
          battles_won?: number
          created_at?: string
          current_streak?: number
          id?: string
          level?: number
          longest_streak?: number
          multi_battles?: number
          perfect_games?: number
          rank_points?: number
          solo_battles?: number
          total_battles?: number
          total_correct_answers?: number
          total_questions_answered?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_battle_subject_stats: {
        Row: {
          correct_answers: number
          created_at: string
          id: string
          subject_id: string
          total_answers: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_answers?: number
          created_at?: string
          id?: string
          subject_id: string
          total_answers?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_answers?: number
          created_at?: string
          id?: string
          subject_id?: string
          total_answers?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battle_subject_stats_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battle_weekly_xp: {
        Row: {
          battles_played: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          week_start: string
          xp_earned: number
        }
        Insert: {
          battles_played?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          week_start: string
          xp_earned?: number
        }
        Update: {
          battles_played?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          week_start?: string
          xp_earned?: number
        }
        Relationships: []
      }
      quiz_battles: {
        Row: {
          created_at: string
          created_by: string
          current_question_index: number | null
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          ended_at: string | null
          grade_level: string
          id: string
          invite_code: string | null
          lesson_id: string | null
          max_players: number
          mode: Database["public"]["Enums"]["quiz_battle_mode"]
          questions: Json
          round_answers: Json | null
          round_started_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["quiz_battle_status"]
          subject_id: string | null
          time_per_question: number
          total_questions: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          current_question_index?: number | null
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          ended_at?: string | null
          grade_level: string
          id?: string
          invite_code?: string | null
          lesson_id?: string | null
          max_players?: number
          mode?: Database["public"]["Enums"]["quiz_battle_mode"]
          questions?: Json
          round_answers?: Json | null
          round_started_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["quiz_battle_status"]
          subject_id?: string | null
          time_per_question?: number
          total_questions?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          current_question_index?: number | null
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          ended_at?: string | null
          grade_level?: string
          id?: string
          invite_code?: string | null
          lesson_id?: string | null
          max_players?: number
          mode?: Database["public"]["Enums"]["quiz_battle_mode"]
          questions?: Json
          round_answers?: Json | null
          round_started_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["quiz_battle_status"]
          subject_id?: string | null
          time_per_question?: number
          total_questions?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battles_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_battles_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_validations: {
        Row: {
          ai_analysis: string | null
          ai_confidence_score: number | null
          content_type: string
          corrected_answer: string | null
          created_at: string
          error_description: string | null
          id: string
          lesson_id: string
          original_answer: string | null
          question_index: number
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          validation_status: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_confidence_score?: number | null
          content_type: string
          corrected_answer?: string | null
          created_at?: string
          error_description?: string | null
          id?: string
          lesson_id: string
          original_answer?: string | null
          question_index: number
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string
        }
        Update: {
          ai_analysis?: string | null
          ai_confidence_score?: number | null
          content_type?: string
          corrected_answer?: string | null
          created_at?: string
          error_description?: string | null
          id?: string
          lesson_id?: string
          original_answer?: string | null
          question_index?: number
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_validations_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          expires_at: string
          id: string
          key: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          expires_at: string
          id?: string
          key: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          expires_at?: string
          id?: string
          key?: string
          request_count?: number | null
          window_start?: string | null
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
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "leaderboard_profiles"
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
      spanish_practice_conversations: {
        Row: {
          created_at: string | null
          grade_level: string
          id: string
          lesson_slug: string
          message_content: string
          message_role: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grade_level: string
          id?: string
          lesson_slug: string
          message_content: string
          message_role: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          grade_level?: string
          id?: string
          lesson_slug?: string
          message_content?: string
          message_role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          ended_at: string | null
          id: string
          lesson_slug: string | null
          started_at: string
          subject_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          lesson_slug?: string | null
          started_at?: string
          subject_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          lesson_slug?: string | null
          started_at?: string
          subject_slug?: string
          user_id?: string
        }
        Relationships: []
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
          series: string | null
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
          series?: string | null
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
          series?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      template_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          name_ht: string | null
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id: string
          name: string
          name_ht?: string | null
          order_index?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          name_ht?: string | null
          order_index?: number
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          created_at: string
          description: string
          download_count: number
          id: string
          is_featured: boolean
          is_published: boolean
          language: string
          og_image_url: string | null
          schema: Json
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          title_ht: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          download_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: string
          og_image_url?: string | null
          schema: Json
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          title_ht?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          download_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: string
          og_image_url?: string | null
          schema?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          title_ht?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_word: {
        Row: {
          created_at: string | null
          date: string
          id: string
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_word_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "daily_words"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          subject_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          completed: boolean
          created_at: string
          current_value: number
          end_date: string | null
          goal_type: string
          id: string
          start_date: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          current_value?: number
          end_date?: string | null
          goal_type: string
          id?: string
          start_date?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          current_value?: number
          end_date?: string | null
          goal_type?: string
          id?: string
          start_date?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_jude_preferences: {
        Row: {
          animation_speed: number | null
          created_at: string | null
          enable_3d: boolean | null
          enable_voice: boolean | null
          id: string
          preferred_language: string | null
          updated_at: string | null
          user_id: string
          voice_speed: number | null
        }
        Insert: {
          animation_speed?: number | null
          created_at?: string | null
          enable_3d?: boolean | null
          enable_voice?: boolean | null
          id?: string
          preferred_language?: string | null
          updated_at?: string | null
          user_id: string
          voice_speed?: number | null
        }
        Update: {
          animation_speed?: number | null
          created_at?: string | null
          enable_3d?: boolean | null
          enable_voice?: boolean | null
          id?: string
          preferred_language?: string | null
          updated_at?: string | null
          user_id?: string
          voice_speed?: number | null
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
      user_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_seen_words: {
        Row: {
          id: string
          seen_at: string | null
          user_id: string
          word_id: string
        }
        Insert: {
          id?: string
          seen_at?: string | null
          user_id: string
          word_id: string
        }
        Update: {
          id?: string
          seen_at?: string | null
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_seen_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "daily_words"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trusted_devices: {
        Row: {
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          first_login_at: string | null
          hardware_fingerprint: string | null
          id: string
          ip_address: string | null
          is_trusted: boolean | null
          last_login_at: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          first_login_at?: string | null
          hardware_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_login_at?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          first_login_at?: string | null
          hardware_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_login_at?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_profiles: {
        Row: {
          academic_grade: string | null
          affiliation_points: number | null
          avatar_url: string | null
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
          gold_earned?: number | null
          id?: string | null
          nickname?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
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
      accept_chess_rematch: {
        Args: { p_match_id: string; p_user_id: string }
        Returns: Json
      }
      accept_quiz_invitation: {
        Args: { p_invitation_id: string }
        Returns: string
      }
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
      can_view_post: {
        Args: { _is_public: boolean; _post_user_id: string; _user_id: string }
        Returns: boolean
      }
      check_lesson_publishable: {
        Args: { p_lesson_id: string }
        Returns: boolean
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
      cleanup_expired_rate_limits: { Args: never; Returns: number }
      count_activities_in_html: {
        Args: { html_content: string }
        Returns: number
      }
      count_quiz_in_html: { Args: { html_content: string }; Returns: number }
      create_conversation: { Args: never; Returns: string }
      create_device_challenge: {
        Args: {
          p_browser: string
          p_device_fingerprint: string
          p_device_name: string
          p_hardware_fingerprint: string
          p_os: string
          p_user_id: string
        }
        Returns: Json
      }
      create_group_chat: {
        Args: { p_avatar_url?: string; p_description?: string; p_name: string }
        Returns: string
      }
      end_chess_match: {
        Args: {
          p_match_id: string
          p_result: string
          p_result_reason: string
          p_winner_id: string
        }
        Returns: Json
      }
      find_match_by_invite_code: { Args: { p_code: string }; Returns: Json }
      generate_blog_slug: { Args: { title: string }; Returns: string }
      generate_chess_invite_code: { Args: never; Returns: string }
      generate_invite_code: { Args: never; Returns: string }
      generate_password_reset_token: {
        Args: { user_email: string }
        Returns: {
          full_name: string
          token: string
          user_id: string
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      get_leaderboard_profiles: {
        Args: { limit_count?: number }
        Returns: {
          academic_grade: string
          affiliation_points: number
          avatar_url: string
          created_at: string
          gold_earned: number
          id: string
          nickname: string
          user_id: string
          verified: boolean
        }[]
      }
      get_new_feed_posts_count: { Args: { p_user_id: string }; Returns: number }
      get_notification_preference: {
        Args: { p_category: string; p_user_id: string }
        Returns: boolean
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          academic_grade: string
          affiliation_points: number
          avatar_url: string
          bio: string
          created_at: string
          gold_earned: number
          id: string
          nickname: string
          user_id: string
          verified: boolean
        }[]
      }
      increment_template_downloads: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_battle_participant: {
        Args: { battle_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_chess_match_participant: {
        Args: { match_uuid: string; user_uuid: string }
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
      is_founder:
        | { Args: never; Returns: boolean }
        | { Args: { check_user_id: string }; Returns: boolean }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_jude_post: { Args: { _user_id: string }; Returns: boolean }
      join_chess_match: {
        Args: { p_match_id: string; p_user_id: string }
        Returns: Json
      }
      level_from_xp: { Args: { xp: number }; Returns: number }
      notify_group_deletion: {
        Args: {
          p_admin_id: string
          p_admin_name: string
          p_group_id: string
          p_group_name: string
        }
        Returns: undefined
      }
      recover_verification_by_email: {
        Args: { p_email: string }
        Returns: Json
      }
      remove_user_from_group: {
        Args: {
          p_conversation_id: string
          p_group_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      request_chess_rematch: {
        Args: { p_match_id: string; p_user_id: string }
        Returns: Json
      }
      resend_device_challenge: {
        Args: { p_challenge_id: string }
        Returns: Json
      }
      resend_verification_code: { Args: { p_user_id: string }; Returns: Json }
      start_direct_conversation: {
        Args: { other_user_id: string }
        Returns: string
      }
      submit_chess_move:
        | {
            Args: {
              p_from_square: string
              p_match_id: string
              p_new_fen: string
              p_promotion?: string
              p_to_square: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_from_square: string
              p_match_id: string
              p_new_fen: string
              p_promotion?: string
              p_time_remaining?: number
              p_to_square: string
              p_user_id: string
            }
            Returns: Json
          }
      submit_multiplayer_answer: {
        Args: {
          p_answer: number
          p_battle_id: string
          p_is_correct: boolean
          p_question_index: number
          p_user_id: string
        }
        Returns: Json
      }
      update_app_setting: {
        Args: { _key: string; _value: Json }
        Returns: undefined
      }
      user_has_active_battle: { Args: { p_user_id: string }; Returns: boolean }
      verify_device_challenge: {
        Args: {
          p_challenge_id: string
          p_code: string
          p_trust_device?: boolean
        }
        Returns: Json
      }
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
      xp_for_level: { Args: { lvl: number }; Returns: number }
    }
    Enums: {
      ai_job_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      asset_kind: "quiz_final" | "activities" | "outline" | "keywords"
      asset_status:
        | "draft"
        | "validating"
        | "validated"
        | "rejected"
        | "published"
      chess_match_status:
        | "waiting"
        | "playing"
        | "completed"
        | "cancelled"
        | "abandoned"
      content_editor_role: "admin" | "editor" | "viewer"
      follow_status: "pending" | "accepted" | "rejected"
      quiz_battle_mode: "solo" | "friend" | "random"
      quiz_battle_status: "waiting" | "in_progress" | "completed" | "cancelled"
      quiz_difficulty: "easy" | "medium" | "hard"
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
      ai_job_status: ["pending", "running", "completed", "failed", "cancelled"],
      asset_kind: ["quiz_final", "activities", "outline", "keywords"],
      asset_status: [
        "draft",
        "validating",
        "validated",
        "rejected",
        "published",
      ],
      chess_match_status: [
        "waiting",
        "playing",
        "completed",
        "cancelled",
        "abandoned",
      ],
      content_editor_role: ["admin", "editor", "viewer"],
      follow_status: ["pending", "accepted", "rejected"],
      quiz_battle_mode: ["solo", "friend", "random"],
      quiz_battle_status: ["waiting", "in_progress", "completed", "cancelled"],
      quiz_difficulty: ["easy", "medium", "hard"],
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
