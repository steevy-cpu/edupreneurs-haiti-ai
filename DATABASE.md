# Database Schema — Edupreneurs Haiti

Complete schema reference for the Edupreneurs platform database. All tables are protected by Row-Level Security (RLS).

**Total: 95 tables | 3 views | 50+ database functions | 7 enums**

---

## Table of Contents

1. [Users & Authentication](#1-users--authentication)
2. [Content & Lessons](#2-content--lessons)
3. [Gamification & Streaks](#3-gamification--streaks)
4. [Exams](#4-exams)
5. [Quiz Battles](#5-quiz-battles)
6. [Chess](#6-chess)
7. [Payments & Subscriptions](#7-payments--subscriptions)
8. [Community & Social](#8-community--social)
9. [Messaging](#9-messaging)
10. [Notifications](#10-notifications)
11. [AI & Generation](#11-ai--generation)
12. [Passions & Enrichment](#12-passions--enrichment)
13. [E-Books & Templates](#13-e-books--templates)
14. [Administration](#14-administration)
15. [Enums](#15-enums)
16. [Views](#16-views)

---

## 1. Users & Authentication

### `profiles`

Stores user profile data. Follows a two-stage model: minimal data at signup, full enrichment during onboarding.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Profile record identifier |
| user_id | uuid (unique) | References the authenticated user |
| full_name | text (nullable) | User's full name (set during onboarding) |
| nickname | text (nullable) | Unique display name |
| academic_grade | text (nullable) | Current grade level (e.g., "7AF", "NS4") |
| avatar_url | text (nullable) | URL to profile picture |
| bio | text (nullable) | Short user biography |
| email_confirmed | boolean | Whether email has been verified |
| confirmation_code | text (nullable) | 6-digit email verification code |
| phone_number | text (nullable) | User's phone number |
| phone_confirmed | boolean (nullable) | Whether phone has been verified |
| gender | text (nullable) | User's gender |
| date_of_birth | date (nullable) | Date of birth for birthday features |
| school | text (nullable) | School name |
| subscription_status | text | Subscription state (active/expired/pending) |
| subscription_end_date | timestamptz (nullable) | When subscription expires |
| has_free_access | boolean (nullable) | Whether user has promotional free access |
| gold_earned | integer | Total gold currency earned |
| affiliation_points | integer (nullable) | Points from referral program |
| referral_code | text (nullable) | Auto-generated unique referral code |
| referred_by | uuid (nullable) | FK → profiles.id of referrer |
| referral_source | text (nullable) | How the user heard about the platform |
| current_streak | integer | Current consecutive daily login streak |
| longest_streak | integer | Highest streak ever achieved |
| streak_freeze_count | integer | Available streak freeze tokens |
| last_activity_date | date (nullable) | Last recorded activity for streak tracking |
| last_seen | timestamptz (nullable) | Last online timestamp |
| last_feed_visit | timestamptz (nullable) | Last time user visited the social feed |
| verified | boolean (nullable) | Whether account is admin-verified |
| is_system_account | boolean (nullable) | Flag for bot/system accounts |
| theme_preference | text (nullable) | Light/dark mode preference |
| onboarding_tour_completed | boolean (nullable) | Whether user finished the guided tour |
| onboarding_tour_completed_at | timestamptz (nullable) | When tour was completed |
| payment_order_id | text (nullable) | Last payment order reference |
| promo_code_used | text (nullable) | Promo code redeemed by user |
| promo_code_used_at | timestamptz (nullable) | When promo code was redeemed |
| exams_completed | integer (nullable) | Total exam sessions completed |
| best_exam_score_percent | numeric (nullable) | Highest exam score percentage |
| last_avatar_generated_at | timestamptz (nullable) | Rate limiting for AI avatar generation |
| sent_expiry_reminders | jsonb (nullable) | Tracks which expiry reminder emails were sent |
| sent_jude_motivations | jsonb (nullable) | Tracks motivational messages sent by Jude |
| sent_onboarding_emails | jsonb (nullable) | Tracks onboarding email sequence |
| created_at | timestamptz | Account creation timestamp |
| updated_at | timestamptz (nullable) | Last profile update |

**Relationships:** `referred_by` → `profiles.id`

---

### `password_reset_tokens`

Stores time-limited tokens for password reset flow.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Token record identifier |
| user_id | uuid | The user requesting the reset |
| token | text | Unique reset token (hex-encoded) |
| expires_at | timestamptz | Token expiration (1 hour from creation) |
| used | boolean | Whether token has been consumed |
| created_at | timestamptz | When the token was generated |

---

### `login_attempts`

Tracks failed login attempts for brute-force protection.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| email | text | Email address being attempted |
| failed_count | integer | Number of consecutive failed attempts |
| last_failed_at | timestamptz (nullable) | Timestamp of last failure |
| locked_at | timestamptz (nullable) | When account was locked (if applicable) |
| reset_requested_at | timestamptz (nullable) | When a reset was requested during lockout |
| created_at | timestamptz | First attempt timestamp |
| updated_at | timestamptz | Last update |

---

### `device_verification_challenges`

Manages verification challenges for unrecognized devices.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Challenge identifier |
| user_id | uuid | User being verified |
| device_fingerprint | text | Browser/device fingerprint hash |
| hardware_fingerprint | text (nullable) | Hardware-level fingerprint |
| verification_code | text | 6-digit verification code |
| expires_at | timestamptz | Challenge expiration |
| attempts | integer | Number of verification attempts made |
| max_attempts | integer | Maximum allowed attempts |
| verified_at | timestamptz (nullable) | When successfully verified |
| device_name | text (nullable) | Human-readable device description |
| browser | text (nullable) | Browser name |
| os | text (nullable) | Operating system |
| created_at | timestamptz | Challenge creation time |

---

### `user_trusted_devices`

Stores devices that have been verified and trusted by the user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Device record identifier |
| user_id | uuid | Device owner |
| device_fingerprint | text | Browser/device fingerprint hash |
| hardware_fingerprint | text (nullable) | Hardware-level fingerprint |
| device_name | text (nullable) | Human-readable device description |
| browser | text (nullable) | Browser name |
| os | text (nullable) | Operating system |
| ip_address | text (nullable) | Last known IP address |
| is_trusted | boolean | Whether device is currently trusted |
| first_login_at | timestamptz (nullable) | First login from this device |
| last_login_at | timestamptz (nullable) | Most recent login from this device |
| created_at | timestamptz | Record creation |

---

### `referrals`

Tracks referral relationships between users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Referral record identifier |
| referrer_id | uuid | FK → profiles.id of the referrer |
| referred_id | uuid | FK → profiles.id of the referred user |
| status | text | Referral status (pending/rewarded) |
| points_awarded | integer (nullable) | Points given to the referrer |
| rewarded_at | timestamptz (nullable) | When points were awarded |
| created_at | timestamptz | When the referral was created |

**Relationships:** `referrer_id` → `profiles.id`, `referred_id` → `profiles.id`

---

### `rate_limits`

Sliding-window rate limiting for sensitive operations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| key | text | Rate limit key (action + identifier) |
| request_count | integer (nullable) | Number of requests in the window |
| window_start | timestamptz (nullable) | Start of the current window |
| expires_at | timestamptz | When this rate limit entry expires |

---

### `content_editor_roles`

Role-based access control for content management.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| user_id | uuid | User with the role |
| role | enum (`content_editor_role`) | Role level: admin, editor, or viewer |
| granted_by | uuid (nullable) | Who granted this role |
| granted_at | timestamptz | When the role was assigned |

---

### `app_settings`

Key-value store for application-wide configuration.

| Column | Type | Description |
|--------|------|-------------|
| key | text (PK) | Setting identifier |
| value | jsonb | Setting value |
| updated_at | timestamptz | Last update |

---

## 2. Content & Lessons

### `subjects`

Academic subjects organized by grade level.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Subject identifier |
| name | text | Subject name (e.g., "Mathématiques") |
| slug | text | URL-friendly identifier |
| description | text (nullable) | Subject description |
| grade_level | text | Target grade level |
| series | text (nullable) | Baccalauréat series (if applicable) |
| icon_name | text (nullable) | Lucide icon name |
| color | text (nullable) | Theme color for the subject |
| lesson_count | integer (nullable) | Cached count of lessons |
| exercise_count | integer (nullable) | Cached count of exercises |
| created_by | uuid (nullable) | Creator user ID |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update |

---

### `lessons`

Core lesson content with structured sections.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Lesson identifier |
| subject_id | uuid | FK → subjects.id |
| title | text | Lesson title |
| slug | text | URL-friendly identifier |
| grade_level | text | Target grade level |
| order_index | integer | Sort order within subject |
| mois | text (nullable) | Month/period in the curriculum |
| objectif | text (nullable) | Learning objective (HTML) |
| introduction | text (nullable) | Lesson introduction (HTML) |
| contenu | text (nullable) | Main content body (HTML) |
| exemples_exercices | text (nullable) | Examples and exercises (HTML) |
| activites_interactives | text (nullable) | Interactive activities (HTML/JSON) |
| quiz_final | text (nullable) | Final quiz (HTML/JSON) |
| suggested_videos | text (nullable) | AI-suggested YouTube videos |
| youtube_url | text (nullable) | Primary YouTube video URL |
| references | text[] (nullable) | Reference sources |
| is_published | boolean | Whether lesson is visible to students |
| workflow_status | enum (`workflow_status`) | Content pipeline status |
| review_notes | text (nullable) | Editor review notes |
| reviewed_by | uuid (nullable) | Editor who reviewed |
| scheduled_publish_at | timestamptz (nullable) | Scheduled publication time |
| activities_count | integer (nullable) | Cached count of interactive activities |
| quiz_count | integer (nullable) | Cached count of quiz questions |
| content_alignment_score | numeric (nullable) | AI-assessed curriculum alignment score |
| activities_alignment_score | numeric (nullable) | AI-assessed activities alignment |
| last_content_validated_at | timestamptz (nullable) | Last content validation run |
| last_activities_validated_at | timestamptz (nullable) | Last activities validation |
| needs_quiz_regeneration | boolean (nullable) | Flag for quiz regeneration |
| needs_activities_regeneration | boolean (nullable) | Flag for activities regeneration |
| validation_details_json | jsonb (nullable) | Detailed validation results |
| audio_introduction_url | text (nullable) | TTS audio for introduction |
| audio_objectif_url | text (nullable) | TTS audio for objective |
| audio_contenu_url | text (nullable) | TTS audio for content |
| audio_exemples_url | text (nullable) | TTS audio for examples |
| audio_generated_at | timestamptz (nullable) | When audio was generated |
| created_by | uuid (nullable) | Content creator |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update |

**Relationships:** `subject_id` → `subjects.id`
**Trigger:** `update_lesson_counts` — auto-updates `activities_count` and `quiz_count` on content change
**Trigger:** `create_lesson_version` — creates a version snapshot on every update

---

### `lesson_versions`

Version history for lesson content. Automatically created by trigger.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Version record identifier |
| lesson_id | uuid | FK → lessons.id |
| version_number | integer | Sequential version number |
| title | text | Lesson title at this version |
| slug | text | Slug at this version |
| objectif | text (nullable) | Objective content |
| introduction | text (nullable) | Introduction content |
| contenu | text (nullable) | Main content |
| exemples_exercices | text (nullable) | Examples content |
| grade_level | text | Grade level |
| is_current | boolean | Whether this is the active version |
| created_by | uuid | Who created this version |
| created_at | timestamptz | Version creation time |

**Relationships:** `lesson_id` → `lessons.id`

---

### `lesson_assets`

Structured content assets (quiz, activities) stored as validated JSON.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Asset identifier |
| lesson_id | uuid | FK → lessons.id |
| kind | enum (`asset_kind`) | Asset type: quiz_final, activities, outline, keywords |
| payload_json | jsonb | The structured content data |
| schema_version | integer | Schema version for migration support |
| status | enum (`asset_status`) | Pipeline status: draft → validating → validated → published |
| validation_report_json | jsonb (nullable) | AI validation results |
| generated_by | uuid (nullable) | User who triggered generation |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

**Relationships:** `lesson_id` → `lessons.id`, `generated_by` → `profiles.user_id`

---

### `lesson_videos`

YouTube videos associated with lessons.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Video record identifier |
| lesson_id | uuid | FK → lessons.id |
| video_id | text | YouTube video ID |
| youtube_url | text | Full YouTube URL |
| title | text (nullable) | Video title |
| description | text (nullable) | Video description |
| is_primary | boolean | Whether this is the main lesson video |
| order_index | integer | Sort order |
| added_by | uuid (nullable) | Who added the video |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

**Relationships:** `lesson_id` → `lessons.id`

---

### `lesson_completions`

Tracks which lessons a user has completed.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Completion record |
| user_id | uuid | User who completed the lesson |
| lesson_slug | text | Slug of the completed lesson |
| subject | text | Subject identifier |
| score | integer (nullable) | Completion score (if applicable) |
| completed_at | timestamptz | When the lesson was completed |

---

### `lesson_feedback`

User ratings and comments on lessons.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Feedback record |
| lesson_id | uuid | FK → lessons.id |
| user_id | uuid | User who left feedback |
| rating | text | Rating value |
| comment | text (nullable) | Optional comment |
| created_at | timestamptz | Feedback timestamp |
| updated_at | timestamptz | Last update |

**Relationships:** `lesson_id` → `lessons.id`

---

### `lesson_comments`

Editor/reviewer comments on lesson content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Comment identifier |
| lesson_id | uuid | FK → lessons.id |
| user_id | uuid | Commenter |
| comment | text | Comment text |
| created_at | timestamptz | Comment time |
| updated_at | timestamptz | Last update |

**Relationships:** `lesson_id` → `lessons.id`

---

### `lesson_notes`

Personal notes saved by users for lessons.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Note identifier |
| lesson_id | uuid | Associated lesson |
| user_id | uuid | Note owner |
| notes | text (nullable) | Note content |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

### `notes`

General-purpose personal notes by topic.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Note identifier |
| user_id | uuid | Note owner |
| lesson_topic | text | Topic/subject of the note |
| content | text (nullable) | Note content |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Auto-updated via trigger |

---

### `content_change_log`

Audit trail for content modifications.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Log entry identifier |
| change_type | text | Type of change (create/update/delete) |
| changed_by | uuid | User who made the change |
| lesson_id | uuid (nullable) | FK → lessons.id |
| subject_id | uuid (nullable) | FK → subjects.id |
| previous_content | jsonb (nullable) | Content before the change |
| new_content | jsonb (nullable) | Content after the change |
| timestamp | timestamptz | When the change occurred |

**Relationships:** `lesson_id` → `lessons.id`, `subject_id` → `subjects.id`

---

### `curriculum_analysis_logs`

Records of AI-powered curriculum gap analysis.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Analysis record |
| subject_id | uuid (nullable) | FK → subjects.id |
| grade_level | text | Grade analyzed |
| pdf_name | text | Curriculum PDF filename |
| topics_found | jsonb (nullable) | Topics identified in the PDF |
| existing_lessons | jsonb (nullable) | Lessons already covering these topics |
| missing_topics | jsonb (nullable) | Topics not yet covered |
| partial_matches | jsonb (nullable) | Partially covered topics |
| suggestions | jsonb (nullable) | AI suggestions for new content |
| analyzed_by | uuid | User who ran the analysis |
| created_at | timestamptz | Analysis timestamp |

**Relationships:** `subject_id` → `subjects.id`

---

### `quiz_validations`

AI validation results for individual quiz questions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Validation record |
| lesson_id | uuid | FK → lessons.id |
| content_type | text | What's being validated (quiz/activity) |
| question_index | integer | Question number within the quiz |
| validation_status | text | Status (valid/invalid/needs_review) |
| original_answer | text (nullable) | Answer before correction |
| corrected_answer | text (nullable) | AI-corrected answer |
| error_description | text (nullable) | Description of the error found |
| ai_analysis | text (nullable) | AI reasoning |
| ai_confidence_score | numeric (nullable) | Confidence in the validation |
| validated_by | uuid (nullable) | Human validator (if manually reviewed) |
| validated_at | timestamptz (nullable) | Validation timestamp |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last update |

**Relationships:** `lesson_id` → `lessons.id`

---

### `banned_youtube_videos`

YouTube videos blocked from being suggested.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| video_id | text | YouTube video ID |
| reason | text (nullable) | Why the video was banned |
| banned_by | uuid | Admin who banned it |
| banned_at | timestamptz | When it was banned |

---

### `daily_words`

Vocabulary words for the daily word feature.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Word identifier |
| word | text | The vocabulary word |
| phonetic | text | Phonetic pronunciation |
| part_of_speech | text | Grammatical category |
| definition | text | Word definition |
| example | text | Example sentence |
| category | text (nullable) | Word category |
| difficulty_level | text (nullable) | Difficulty tier |
| audio_url | text (nullable) | Pronunciation audio URL |
| audio_source | text (nullable) | Audio provider |
| display_order | integer (nullable) | Sort order |
| is_active | boolean | Whether word is in rotation |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

### `user_daily_word`

Tracks which daily word was shown to each user on each date.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| user_id | uuid | User |
| word_id | uuid | FK → daily_words.id |
| date | date | The date this word was assigned |
| created_at | timestamptz | Creation time |

**Relationships:** `word_id` → `daily_words.id`

---

### `user_seen_words`

Tracks which vocabulary words a user has already seen.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| user_id | uuid | User |
| word_id | uuid | FK → daily_words.id |
| seen_at | timestamptz | When the word was seen |

**Relationships:** `word_id` → `daily_words.id`

---

### `study_sessions`

Tracks timed study sessions for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Session identifier |
| user_id | uuid | Student |
| subject_slug | text | Subject being studied |
| lesson_slug | text (nullable) | Specific lesson (if applicable) |
| duration_minutes | integer | Session length |
| started_at | timestamptz | Session start |
| ended_at | timestamptz (nullable) | Session end |
| created_at | timestamptz | Record creation |

---

### `study_music_tracks`

YouTube music tracks available in the study music player.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Track identifier |
| title | text | Track title |
| youtube_id | text | YouTube video ID |
| thumbnail_url | text | Track thumbnail |
| sort_order | integer | Display order |
| is_active | boolean | Whether track is available |
| created_by | uuid (nullable) | FK → profiles.user_id |
| created_at | timestamptz | Creation time |

**Relationships:** `created_by` → `profiles.user_id`

---

### `user_favorites`

User's favorite subjects for quick access.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| user_id | uuid | User |
| subject_slug | text | Favorited subject |
| created_at | timestamptz | When favorited |

---

### `user_goals`

Personal learning goals set by the user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Goal identifier |
| user_id | uuid | Goal owner |
| goal_type | text | Type of goal |
| target_value | integer | Target to reach |
| current_value | integer | Current progress |
| completed | boolean | Whether goal is achieved |
| start_date | date | Goal start date |
| end_date | date (nullable) | Goal deadline |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

## 3. Gamification & Streaks

### `achievements`

General platform achievements earned by users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Achievement record |
| user_id | uuid | User who earned it |
| achievement_name | text | Achievement title |
| achievement_type | text | Category of achievement |
| description | text (nullable) | Achievement description |
| icon | text (nullable) | Icon identifier |
| points_awarded | integer | Gold points awarded |
| earned_at | timestamptz | When earned |

---

### `streak_milestones`

Badge rewards for reaching streak milestones (7 days, 30 days, etc.).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Milestone record |
| user_id | uuid | FK → profiles.id |
| milestone_days | integer | Days threshold reached |
| badge_title | text | Badge name |
| badge_icon_url | text | Badge icon URL |
| earned_at | timestamptz | When earned |

**Relationships:** `user_id` → `profiles.id`

---

## 4. Exams

### `official_exams`

Official Baccalauréat and other standardized exams.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Exam identifier |
| title | text | Exam title |
| subject | text | Subject name |
| subject_slug | text (nullable) | URL-friendly subject |
| grade_level | text | Target grade |
| year | integer | Exam year |
| session | text (nullable) | Exam session (e.g., "Juin") |
| series | text (nullable) | Baccalauréat series |
| track | text (nullable) | Academic track |
| exam_type | text (nullable) | Type of exam |
| is_model_exam | boolean (nullable) | Whether this is a model/practice exam |
| total_exercises | integer | Number of exercises |
| total_points | integer | Maximum points |
| duration_minutes | integer (nullable) | Exam duration |
| pdf_url | text (nullable) | Original exam PDF URL |
| reference_texts | jsonb (nullable) | Reference texts included in the exam |
| version | integer (nullable) | Exam version |
| version_number | integer (nullable) | Internal version tracking |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

### `exam_exercises`

Individual exercises within an exam.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Exercise identifier |
| exam_id | uuid | FK → official_exams.id |
| exercise_number | integer | Exercise order |
| exercise_type | text | Type (QCM, essay, calculation, etc.) |
| question_text | text | Exercise prompt text |
| concept | text | Concept being tested |
| concept_tags | text[] (nullable) | Tags for categorization |
| difficulty | text (nullable) | Difficulty level |
| points | integer | Points for this exercise |
| correct_answer | text (nullable) | Expected answer (for simple types) |
| options | jsonb (nullable) | Multiple choice options (legacy) |
| options_json | jsonb (nullable) | Structured options |
| answer_json | jsonb (nullable) | Structured answer |
| prompt_blocks | jsonb (nullable) | Rich content blocks for the prompt |
| explanation | text (nullable) | Solution explanation |
| explanation_blocks | jsonb (nullable) | Rich content blocks for explanation |
| created_at | timestamptz | Creation time |

**Relationships:** `exam_id` → `official_exams.id`

---

### `exam_practice_sessions`

User practice sessions on official exams.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Session identifier |
| user_id | uuid | Student |
| exam_id | uuid | FK → official_exams.id |
| mode | text (nullable) | Practice mode (timed/untimed) |
| current_exercise | integer | Current exercise number |
| completed_exercises | jsonb | Map of exercise completion status |
| score | integer | Running score |
| time_remaining | integer (nullable) | Seconds remaining (timed mode) |
| started_at | timestamptz | Session start |
| completed_at | timestamptz (nullable) | Session completion |
| updated_at | timestamptz | Last update |

**Relationships:** `exam_id` → `official_exams.id`

---

### `exam_practice_conversations`

AI tutor conversation history within exam practice.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message identifier |
| user_id | uuid | Student |
| session_id | uuid | FK → exam_practice_sessions.id |
| exercise_id | uuid | FK → exam_exercises.id |
| message_role | text | Message author (user/assistant) |
| message_content | text | Message text |
| created_at | timestamptz | Message timestamp |

**Relationships:** `session_id` → `exam_practice_sessions.id`, `exercise_id` → `exam_exercises.id`

---

### `exam_tutor_chats`

AI tutor chat messages with rich block content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Chat message identifier |
| user_id | uuid | Student |
| session_id | uuid | FK → exam_practice_sessions.id |
| exercise_id | uuid | FK → exam_exercises.id |
| role | text | Message role (user/assistant) |
| content | text | Text content |
| blocks | jsonb (nullable) | Rich content blocks (math, code, etc.) |
| created_at | timestamptz | Message timestamp |

**Relationships:** `session_id` → `exam_practice_sessions.id`, `exercise_id` → `exam_exercises.id`

---

### `exam_exercise_completions`

Tracks individual exercise completions per user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Completion record |
| user_id | uuid | Student |
| exam_id | uuid | Exam identifier |
| exercise_number | integer | Which exercise was completed |
| completed_at | timestamptz | Completion time |

---

## 5. Quiz Battles

### `quiz_battles`

Multiplayer quiz battle sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Battle identifier |
| created_by | uuid | User who created the battle |
| subject_id | uuid (nullable) | FK → subjects.id |
| lesson_id | uuid (nullable) | FK → lessons.id |
| grade_level | text | Target grade level |
| difficulty | enum (`quiz_difficulty`) | easy, medium, or hard |
| mode | enum (`quiz_battle_mode`) | solo, friend, or random |
| status | enum (`quiz_battle_status`) | waiting, in_progress, completed, cancelled |
| questions | jsonb | Array of battle questions |
| total_questions | integer | Number of questions |
| time_per_question | integer | Seconds allowed per question |
| max_players | integer | Maximum participants |
| current_question_index | integer (nullable) | Current question being played |
| round_answers | jsonb (nullable) | Answers for current round |
| round_started_at | timestamptz (nullable) | When current round started |
| invite_code | text (nullable) | Code for friend invitations |
| winner_id | uuid (nullable) | Battle winner |
| started_at | timestamptz (nullable) | Battle start time |
| ended_at | timestamptz (nullable) | Battle end time |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

**Relationships:** `subject_id` → `subjects.id`, `lesson_id` → `lessons.id`

---

### `quiz_battle_players`

Players participating in a quiz battle.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Player record |
| battle_id | uuid | FK → quiz_battles.id |
| user_id | uuid | Player |
| score | integer | Current score |
| correct_answers | integer | Number of correct answers |
| current_question | integer | Current question index |
| answers | jsonb | All submitted answers |
| time_per_question | jsonb | Time taken per question |
| is_ready | boolean | Whether player is ready to start |
| finished_at | timestamptz (nullable) | When player finished |
| created_at | timestamptz | Join time |

**Relationships:** `battle_id` → `quiz_battles.id`

---

### `quiz_battle_stats`

Aggregate battle statistics per user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Stats record |
| user_id | uuid | Player |
| total_battles | integer | Total battles played |
| battles_won | integer | Victories |
| battles_lost | integer | Defeats |
| battles_drawn | integer | Draws |
| solo_battles | integer | Solo mode battles |
| multi_battles | integer | Multiplayer battles |
| total_questions_answered | integer | Total questions answered |
| total_correct_answers | integer | Total correct answers |
| perfect_games | integer | Battles with 100% accuracy |
| current_streak | integer | Current winning streak |
| longest_streak | integer | Best winning streak |
| total_xp | integer | Total experience points |
| level | integer | Current battle level |
| rank_points | integer | Ranking score |
| avg_response_time_ms | numeric (nullable) | Average answer time |
| created_at | timestamptz | First battle |
| updated_at | timestamptz | Last update |

---

### `quiz_battle_subject_stats`

Per-subject battle performance.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| user_id | uuid | Player |
| subject_id | uuid | FK → subjects.id |
| total_answers | integer | Answers in this subject |
| correct_answers | integer | Correct answers |
| created_at | timestamptz | First record |
| updated_at | timestamptz | Last update |

**Relationships:** `subject_id` → `subjects.id`

---

### `quiz_battle_badges`

Badges earned through quiz battles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Badge record |
| user_id | uuid | Badge earner |
| badge_key | text | Unique badge identifier |
| badge_name | text | Display name |
| description | text (nullable) | Badge description |
| icon | text | Icon identifier |
| subject_id | uuid (nullable) | FK → subjects.id (if subject-specific) |
| earned_at | timestamptz | When earned |

**Relationships:** `subject_id` → `subjects.id`

---

### `quiz_battle_weekly_xp`

Weekly XP tracking for leaderboard reset.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record identifier |
| user_id | uuid | Player |
| week_start | date | Start of the tracking week |
| xp_earned | integer | XP earned this week |
| battles_played | integer | Battles played this week |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last update |

---

### `quiz_battle_invitations`

Direct battle invitations between users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Invitation identifier |
| sender_id | uuid | User who sent the invitation |
| recipient_id | uuid | User being invited |
| subject_id | uuid | FK → subjects.id |
| grade_level | text | Grade level for the battle |
| difficulty | text | Difficulty setting |
| status | text | Invitation status (pending/accepted/declined/expired) |
| battle_id | uuid (nullable) | FK → quiz_battles.id (once battle starts) |
| expires_at | timestamptz | Invitation expiration |
| responded_at | timestamptz (nullable) | When recipient responded |
| created_at | timestamptz | Invitation sent time |

**Relationships:** `battle_id` → `quiz_battles.id`, `subject_id` → `subjects.id`

---

### `quiz_battle_matchmaking`

Queue for random matchmaking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Queue entry |
| user_id | uuid | Player searching for a match |
| grade_level | text | Preferred grade level |
| subject_id | uuid (nullable) | FK → subjects.id |
| difficulty | enum (`quiz_difficulty`) | Preferred difficulty |
| matched_with | uuid (nullable) | Matched opponent |
| battle_id | uuid (nullable) | FK → quiz_battles.id |
| expires_at | timestamptz | Queue entry expiration |
| joined_at | timestamptz | When player entered queue |

**Relationships:** `battle_id` → `quiz_battles.id`, `subject_id` → `subjects.id`

---

## 6. Chess

### `chess_matches`

Multiplayer chess match state.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Match identifier |
| white_player_id | uuid | White pieces player |
| black_player_id | uuid (nullable) | Black pieces player |
| created_by | uuid | Match creator |
| status | enum (`chess_match_status`) | waiting, playing, completed, cancelled, abandoned |
| current_fen | text | Current board position (FEN notation) |
| current_turn | text | Whose turn (w/b) |
| move_history | jsonb | Array of all moves |
| time_control | text | Time control format |
| time_per_player | integer (nullable) | Seconds per player |
| white_time_remaining | integer (nullable) | White's remaining time |
| black_time_remaining | integer (nullable) | Black's remaining time |
| difficulty | text (nullable) | AI difficulty (for AI matches) |
| invite_code | text (nullable) | Code for friend invitations |
| is_public | boolean | Whether match is joinable by anyone |
| result | text (nullable) | Match result |
| result_reason | text (nullable) | How the match ended |
| winner_id | uuid (nullable) | Winner |
| rematch_requested_by | uuid (nullable) | Who requested a rematch |
| rematch_from_id | uuid (nullable) | FK → chess_matches.id (original match) |
| rematch_match_id | uuid (nullable) | FK → chess_matches.id (rematch) |
| started_at | timestamptz (nullable) | Match start |
| ended_at | timestamptz (nullable) | Match end |
| last_move_at | timestamptz (nullable) | Time of last move |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

### `chess_games`

Historical record of completed chess games.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Game record |
| user_id | uuid | Player this record belongs to |
| opponent_type | text | human or AI |
| opponent_id | uuid (nullable) | Opponent user ID |
| match_id | uuid (nullable) | FK → chess_matches.id |
| is_multiplayer | boolean (nullable) | Whether this was online multiplayer |
| difficulty | text (nullable) | AI difficulty level |
| time_control | text (nullable) | Time control used |
| result | text | win, loss, or draw |
| elo_change | integer (nullable) | ELO rating change |
| moves_count | integer | Total moves in the game |
| final_fen | text (nullable) | Final board position |
| move_history | jsonb (nullable) | Full move list |
| opening_name | text (nullable) | Detected opening |
| analysis | jsonb (nullable) | Post-game analysis data |
| brilliant_moves | integer (nullable) | Count of brilliant moves |
| good_moves | integer (nullable) | Count of good moves |
| inaccuracies | integer (nullable) | Count of inaccuracies |
| mistakes | integer (nullable) | Count of mistakes |
| blunders | integer (nullable) | Count of blunders |
| total_time_seconds | integer (nullable) | Total game duration |
| started_at | timestamptz | Game start |
| ended_at | timestamptz (nullable) | Game end |
| created_at | timestamptz | Record creation |

**Relationships:** `match_id` → `chess_matches.id`

---

### `chess_player_stats`

Aggregate chess statistics per player.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Stats record |
| user_id | uuid | Player |
| elo_rating | integer | Current ELO rating (starts at 1000) |
| games_played | integer | Total games |
| games_won | integer | Wins |
| games_lost | integer | Losses |
| games_drawn | integer | Draws |
| total_moves | integer | Total moves made |
| avg_time_per_move | numeric (nullable) | Average move time |
| current_winning_streak | integer | Current consecutive wins |
| longest_winning_streak | integer | Best streak |
| created_at | timestamptz | First game |
| updated_at | timestamptz | Last update |

---

### `chess_puzzles`

Tactical puzzles for practice.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Puzzle identifier |
| fen | text | Starting position (FEN) |
| solution | text[] | Correct move sequence |
| difficulty | text | Puzzle difficulty |
| theme | text (nullable) | Tactical theme |
| hint | text (nullable) | Hint text |
| explanation | text (nullable) | Solution explanation |
| is_daily | boolean (nullable) | Whether this is a daily puzzle |
| daily_date | date (nullable) | Date for daily puzzle |
| created_at | timestamptz | Creation time |

---

### `chess_puzzle_attempts`

User attempts on puzzles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Attempt record |
| user_id | uuid | Player |
| puzzle_id | uuid | FK → chess_puzzles.id |
| solved | boolean | Whether puzzle was solved |
| attempts | integer | Number of attempts |
| time_seconds | integer (nullable) | Time to solve |
| created_at | timestamptz | Attempt time |

**Relationships:** `puzzle_id` → `chess_puzzles.id`

---

### `chess_achievements`

Chess-specific achievements.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Achievement record |
| user_id | uuid | Player |
| achievement_key | text | Unique achievement identifier |
| achievement_name | text | Display name |
| achievement_description | text (nullable) | Description |
| icon | text (nullable) | Icon |
| earned_at | timestamptz | When earned |

---

### `chess_match_chat`

In-game chat messages during chess matches.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message identifier |
| match_id | uuid | FK → chess_matches.id |
| sender_id | uuid | Message sender |
| message | text | Chat message |
| created_at | timestamptz | Message time |

**Relationships:** `match_id` → `chess_matches.id`

---

## 7. Payments & Subscriptions

### `payment_transactions`

All payment transactions across all providers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Transaction identifier |
| user_id | uuid | Paying user |
| order_id | text | Unique order reference |
| provider | text | Payment provider (moncash/natcash/stripe) |
| amount | numeric | Transaction amount |
| currency | text | Currency code (HTG/USD) |
| status | text | Transaction status |
| description | text (nullable) | Transaction description |
| transaction_id | text (nullable) | Provider transaction reference |
| payment_token | text (nullable) | Payment token |
| payer_phone | text (nullable) | Payer's phone number |
| natcash_phone | text (nullable) | NatCash phone number |
| natcash_reference | text (nullable) | NatCash reference |
| receipt_url | text (nullable) | Receipt image URL |
| admin_verified | boolean (nullable) | Whether admin has verified |
| verified_by | uuid (nullable) | Admin who verified |
| verified_at | timestamptz (nullable) | Verification time |
| verification_notes | text (nullable) | Admin notes |
| metadata | jsonb (nullable) | Additional provider data |
| completed_at | timestamptz (nullable) | Completion time |
| created_at | timestamptz | Transaction start |
| updated_at | timestamptz | Last update |

---

### `natcash_transfers`

NatCash transfer records via Bazik.io API.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Transfer identifier |
| user_id | uuid | User initiating payment |
| initiated_by | uuid | Who started the transfer |
| wallet | text | NatCash wallet number |
| recipient_first_name | text | Recipient first name |
| recipient_last_name | text | Recipient last name |
| recipient_email | text (nullable) | Recipient email |
| amount | numeric | Transfer amount |
| fees | numeric (nullable) | Transaction fees |
| total | numeric (nullable) | Total with fees |
| currency | text | Currency code |
| reference_id | text | Unique reference |
| bazik_transaction_id | text (nullable) | Bazik.io transaction ID |
| status | text | Transfer status |
| description | text (nullable) | Transfer description |
| transfer_type | text (nullable) | Type of transfer |
| metadata | jsonb (nullable) | Additional data |
| completed_at | timestamptz (nullable) | Completion time |
| created_at | timestamptz | Transfer initiation |
| updated_at | timestamptz | Last update |

---

### `donations`

Monetary donations to the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Donation identifier |
| order_id | text | Unique order reference |
| provider | text | Payment provider |
| amount | numeric | Donation amount |
| currency | text | Currency code |
| donor_name | text (nullable) | Donor's name |
| donor_email | text (nullable) | Donor's email |
| donor_message | text (nullable) | Optional message |
| status | text | Donation status |
| created_at | timestamptz | Donation time |

---

### `gift_subscriptions`

Subscriptions purchased by one person for another student.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Gift identifier |
| token | text | Unique gift claim token |
| student_name | text | Recipient student name |
| student_email | text | Recipient email |
| student_user_id | uuid (nullable) | FK to user (once claimed) |
| payer_email | text (nullable) | Payer's email |
| payment_gateway | text | Payment method used |
| payment_mode | text | Payment mode |
| amount_cents | integer | Amount in cents (USD) |
| amount_htg | numeric (nullable) | Amount in HTG |
| status | text | Gift status (pending/completed/expired) |
| stripe_session_id | text (nullable) | Stripe session reference |
| stripe_subscription_id | text (nullable) | Stripe subscription reference |
| moncash_order_id | text (nullable) | MonCash order reference |
| expires_at | timestamptz | When the gifted subscription expires |
| completed_at | timestamptz (nullable) | When gift was claimed |
| created_at | timestamptz | Gift creation |

---

### `promo_codes`

Promotional codes for gold rewards or free access.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Promo code identifier |
| code | text | The promo code string |
| gold_reward | integer | Gold awarded on redemption |
| grants_free_access | boolean (nullable) | Whether code grants free subscription |
| is_active | boolean | Whether code is currently valid |
| max_uses | integer (nullable) | Maximum redemption count |
| current_uses | integer | Current redemption count |
| expires_at | timestamptz (nullable) | Expiration date |
| created_at | timestamptz | Creation time |

---

### `promo_partners`

Organizations partnered for promotional campaigns.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Partner identifier |
| name | text | Organization name |
| organization_type | text | Type of organization |
| contact_email | text (nullable) | Partner contact |
| promo_code_id | uuid (nullable) | FK → promo_codes.id |
| notes | text (nullable) | Internal notes |
| created_at | timestamptz | Partnership start |
| updated_at | timestamptz | Last update |

**Relationships:** `promo_code_id` → `promo_codes.id`

---

### `user_promo_redemptions`

Tracks which users have redeemed which promo codes.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Redemption record |
| user_id | uuid | User who redeemed |
| promo_code_id | uuid | FK → promo_codes.id |
| code | text | The code that was redeemed |
| gold_awarded | integer | Gold given |
| redeemed_at | timestamptz | Redemption time |

**Relationships:** `promo_code_id` → `promo_codes.id`

---

## 8. Community & Social

### `posts`

Social feed posts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Post identifier |
| user_id | uuid | Post author |
| content | text | Post text content |
| image_url | text (nullable) | Attached image URL |
| video_url | text (nullable) | Attached video URL |
| is_public | boolean | Visibility (public or followers-only) |
| created_at | timestamptz | Post time |
| updated_at | timestamptz | Last edit |

---

### `post_comments`

Comments on posts (supports threading).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Comment identifier |
| post_id | uuid | FK → posts.id |
| user_id | uuid | Commenter |
| content | text | Comment text |
| parent_comment_id | uuid (nullable) | FK → post_comments.id (for replies) |
| created_at | timestamptz | Comment time |

**Relationships:** `post_id` → `posts.id`, `parent_comment_id` → `post_comments.id`

---

### `post_likes`

Likes on posts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Like record |
| post_id | uuid | FK → posts.id |
| user_id | uuid | User who liked |
| created_at | timestamptz | Like time |

**Relationships:** `post_id` → `posts.id`

---

### `post_shares`

Share records for posts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Share record |
| post_id | uuid | FK → posts.id |
| user_id | uuid | User who shared |
| created_at | timestamptz | Share time |

**Relationships:** `post_id` → `posts.id`

---

### `follows`

Follow relationships between users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Follow record |
| follower_id | uuid | User who follows |
| following_id | uuid | User being followed |
| status | enum (`follow_status`) | pending, accepted, or rejected |
| created_at | timestamptz | Follow request time |

---

### `blog_authors`

Blog author profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Author identifier |
| user_id | uuid | Associated user |
| display_name | text | Author display name |
| bio | text (nullable) | Author biography |
| avatar_url | text (nullable) | Author photo |
| role | text | Author role |
| created_at | timestamptz | Record creation |

---

### `blog_posts`

Published blog articles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Post identifier |
| author_id | uuid (nullable) | FK → blog_authors.id |
| title | text | Article title |
| slug | text | URL-friendly identifier |
| content | text | Article body (HTML) |
| excerpt | text (nullable) | Short summary |
| cover_image_url | text (nullable) | Cover image |
| status | text | Publication status (draft/published) |
| published_at | timestamptz (nullable) | Publication date |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

**Relationships:** `author_id` → `blog_authors.id`

---

## 9. Messaging

### `conversations`

Chat conversation containers (1:1 or group).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Conversation identifier |
| is_group | boolean | Whether this is a group conversation |
| group_id | uuid (nullable) | FK → group_chats.id |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last activity |

**Relationships:** `group_id` → `group_chats.id`

---

### `conversation_participants`

Users participating in a conversation.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Participant record |
| conversation_id | uuid | FK → conversations.id |
| user_id | uuid | Participant |
| visible_from_message_id | uuid (nullable) | Messages visible from this point (for "delete chat" without losing data) |
| joined_at | timestamptz | When user joined |

**Relationships:** `conversation_id` → `conversations.id`

---

### `messages`

Individual chat messages.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message identifier |
| conversation_id | uuid | FK → conversations.id |
| sender_id | uuid | Message author |
| content | text | Message text |
| image_url | text (nullable) | Attached image |
| video_url | text (nullable) | Attached video |
| thumbnail_url | text (nullable) | Video thumbnail |
| document_url | text (nullable) | Attached document |
| document_name | text (nullable) | Document filename |
| replied_to_id | uuid (nullable) | FK → messages.id (reply thread) |
| shared_post_id | uuid (nullable) | FK → posts.id (shared post) |
| read | boolean | Whether recipient has read |
| edited_at | timestamptz (nullable) | Last edit time |
| created_at | timestamptz | Message time |

**Relationships:** `conversation_id` → `conversations.id`, `replied_to_id` → `messages.id`, `shared_post_id` → `posts.id`

---

### `message_reactions`

Emoji reactions on messages.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Reaction record |
| message_id | uuid | FK → messages.id |
| user_id | uuid | User who reacted |
| emoji | text | Emoji character |
| created_at | timestamptz | Reaction time |

**Relationships:** `message_id` → `messages.id`

---

### `group_chats`

Group chat metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Group identifier |
| name | text | Group name |
| description | text (nullable) | Group description |
| avatar_url | text (nullable) | Group icon |
| created_by | uuid | Group creator |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

### `group_members`

Members of group chats with roles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Member record |
| group_id | uuid | FK → group_chats.id |
| user_id | uuid | Group member |
| role | text | Member role (admin/member) |
| joined_at | timestamptz | Join time |

**Relationships:** `group_id` → `group_chats.id`

---

### `english_practice_conversations`

AI English tutor conversation history.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message identifier |
| user_id | uuid | Student |
| session_id | text | Conversation session |
| lesson_slug | text | Lesson context |
| grade_level | text | Student grade |
| message_role | text | Message author (user/assistant) |
| message_content | text | Message text |
| created_at | timestamptz | Message time |

**Relationships:** `user_id` → `profiles.user_id`

---

### `spanish_practice_conversations`

AI Spanish tutor conversation history.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message identifier |
| user_id | uuid | Student |
| session_id | text | Conversation session |
| lesson_slug | text | Lesson context |
| grade_level | text | Student grade |
| message_role | text | Message author (user/assistant) |
| message_content | text | Message text |
| created_at | timestamptz | Message time |

---

## 10. Notifications

### `notifications`

In-app notification records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Notification identifier |
| user_id | uuid | Notification recipient |
| actor_id | uuid | User who triggered the notification |
| type | text | Notification type (follow_request, new_post, etc.) |
| post_id | uuid (nullable) | FK → posts.id (if related to a post) |
| content | text (nullable) | Additional content |
| read | boolean | Whether notification has been read |
| created_at | timestamptz | Notification time |

**Relationships:** `post_id` → `posts.id`

---

### `notification_preferences`

Per-category notification opt-in/opt-out settings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Preference record |
| user_id | uuid | User |
| category | text | Notification category |
| enabled | boolean | Whether this category is enabled |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last update |

---

### `push_subscriptions`

Web Push subscription data per device.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Subscription identifier |
| user_id | uuid | Subscriber |
| subscription | jsonb | Push subscription object (endpoint, keys) |
| device_id | text (nullable) | Device identifier |
| browser | text (nullable) | Browser name |
| os | text (nullable) | Operating system |
| domain | text (nullable) | Domain the subscription belongs to |
| last_used_at | timestamptz (nullable) | Last push sent |
| created_at | timestamptz | Subscription time |
| updated_at | timestamptz | Last update |

---

### `announcements`

Admin announcements sent to users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Announcement identifier |
| title | text | Announcement title |
| message | text | Announcement body |
| sent_by | uuid | Admin who sent it |
| target_type | text | Audience type (all/grade/specific) |
| target_grades | text[] (nullable) | Specific grades targeted |
| status | text | Delivery status |
| recipients_count | integer (nullable) | Total recipients |
| success_count | integer (nullable) | Successfully delivered |
| scheduled_for | timestamptz (nullable) | Scheduled delivery time |
| sent_at | timestamptz (nullable) | Actual delivery time |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

## 11. AI & Generation

### `ai_generation_jobs`

Background AI content generation jobs.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Job identifier |
| lesson_id | uuid | FK → lessons.id |
| job_type | text | Type of generation (full_lesson, quiz, activities, etc.) |
| config | jsonb | Job configuration parameters |
| status | enum (`ai_job_status`) | pending, running, completed, failed, cancelled |
| progress | jsonb (nullable) | Section-by-section progress |
| current_section | text (nullable) | Currently generating section |
| result_content | jsonb (nullable) | Generated content output |
| error_message | text (nullable) | Error details (if failed) |
| created_by | uuid (nullable) | FK → profiles.user_id |
| started_at | timestamptz (nullable) | Processing start |
| completed_at | timestamptz (nullable) | Processing end |
| created_at | timestamptz | Job creation |
| updated_at | timestamptz | Last update |

**Relationships:** `lesson_id` → `lessons.id`, `created_by` → `profiles.user_id`

---

### `ai_generation_logs`

Detailed logs for each AI generation call.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Log entry identifier |
| lesson_id | uuid (nullable) | FK → lessons.id |
| section_name | text | Which section was generated |
| model_used | text (nullable) | AI model identifier |
| prompt_used | text (nullable) | Prompt sent to the model |
| response_content | text (nullable) | Raw model response |
| success | boolean | Whether generation succeeded |
| error_message | text (nullable) | Error details |
| generation_time_ms | integer (nullable) | Generation duration |
| word_count | integer (nullable) | Words in the response |
| target_words | integer (nullable) | Target word count |
| quality_score | numeric (nullable) | Automated quality score |
| has_html_tags | boolean (nullable) | Whether response contains HTML |
| has_tailwind_classes | boolean (nullable) | Whether response contains Tailwind classes |
| has_emojis | boolean (nullable) | Whether response contains emojis |
| mentions_haiti | boolean (nullable) | Whether content references Haiti |
| retry_count | integer (nullable) | Number of retries needed |
| additional_context | text (nullable) | Extra context provided |
| generated_by | uuid (nullable) | FK → profiles.user_id |
| created_at | timestamptz | Log timestamp |

**Relationships:** `lesson_id` → `lessons.id`, `generated_by` → `profiles.user_id`

---

### `jude_animation_config`

Configuration for Jude AI avatar animations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Config record |
| animation_name | text | Internal animation identifier |
| display_name | text | Human-readable name |
| description | text (nullable) | Animation description |
| trigger_keywords | text[] (nullable) | Keywords that trigger this animation |
| duration_ms | integer (nullable) | Animation duration |
| loop | boolean (nullable) | Whether animation loops |
| priority | integer (nullable) | Animation priority |
| created_at | timestamptz | Creation time |

---

### `jude_audio_cache`

Cache for Jude's TTS audio to avoid redundant generation.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Cache entry |
| text_hash | text | Hash of the text content |
| text_content | text | Original text |
| audio_url | text | Cached audio file URL |
| duration_ms | integer (nullable) | Audio duration |
| phoneme_data | jsonb (nullable) | Phoneme alignment data for lip sync |
| voice_id | text (nullable) | ElevenLabs voice identifier |
| use_count | integer | Times this cache entry was used |
| last_used_at | timestamptz (nullable) | Last access time |
| created_at | timestamptz | Cache creation |

---

### `user_jude_preferences`

Per-user preferences for the Jude AI assistant.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Preference record |
| user_id | uuid | User |
| enable_voice | boolean (nullable) | Whether voice is enabled |
| enable_3d | boolean (nullable) | Whether 3D avatar is enabled |
| voice_speed | numeric (nullable) | Voice playback speed |
| animation_speed | numeric (nullable) | Animation speed |
| preferred_language | text (nullable) | Preferred response language |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last update |

---

## 12. Passions & Enrichment

### `user_passion_preferences`

Quiz results that determine a user's passion interests.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Preference record |
| user_id | uuid | User |
| chess_score | numeric (nullable) | Interest score for chess |
| music_score | numeric (nullable) | Interest score for music |
| arts_score | numeric (nullable) | Interest score for visual arts |
| literature_score | numeric (nullable) | Interest score for literature |
| quiz_completed | boolean (nullable) | Whether interest quiz was taken |
| completed_at | timestamptz (nullable) | Quiz completion time |
| created_at | timestamptz | Record creation |
| updated_at | timestamptz | Last update |

---

### `passion_module_progress`

Progress tracking for passion learning modules.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Progress record |
| user_id | uuid | Student |
| category_id | text | Passion category |
| module_id | text | Module identifier |
| progress_percentage | numeric (nullable) | Completion percentage |
| completed | boolean (nullable) | Whether module is complete |
| completed_at | timestamptz (nullable) | Completion time |
| created_at | timestamptz | Start time |
| updated_at | timestamptz | Last update |

---

### `passion_activity_videos`

Videos assigned to specific passion activities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Video record |
| category_id | text | Passion category |
| module_id | text | Module identifier |
| activity_id | text | Activity identifier |
| youtube_url | text (nullable) | YouTube video URL |
| title | text (nullable) | Video title |
| updated_by | uuid (nullable) | Last editor |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

### `passion_recommended_videos`

Curated YouTube videos for passion modules.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Video record |
| category_id | text | Passion category |
| module_id | text | Module identifier |
| video_id | text | YouTube video ID |
| youtube_url | text | Full YouTube URL |
| title | text (nullable) | Video title |
| channel_title | text (nullable) | YouTube channel name |
| thumbnail | text (nullable) | Video thumbnail URL |
| display_order | integer (nullable) | Sort order |
| created_by | uuid (nullable) | Who added it |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

## 13. E-Books & Templates

### `ebooks`

Digital books available in the library.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | E-book identifier |
| title | text | Book title |
| author | text (nullable) | Book author |
| description | text (nullable) | Book description |
| file_url | text | PDF file URL |
| cover_url | text (nullable) | Cover image URL |
| category | text (nullable) | Book category |
| language | text | Book language |
| page_count | integer (nullable) | Number of pages |
| is_published | boolean | Whether visible to users |
| uploaded_by | uuid (nullable) | FK → profiles.user_id |
| created_at | timestamptz | Upload time |
| updated_at | timestamptz | Last update |

**Relationships:** `uploaded_by` → `profiles.user_id`

---

### `ebook_reading_progress`

Per-user reading progress for e-books.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Progress record |
| user_id | uuid | Reader |
| ebook_id | uuid | FK → ebooks.id |
| current_page | integer | Current page number |
| is_completed | boolean | Whether book is finished |
| last_read_at | timestamptz | Last reading session |

**Relationships:** `ebook_id` → `ebooks.id`

---

### `ebook_comments`

Comments and ratings on e-books.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Comment record |
| ebook_id | uuid | FK → ebooks.id |
| user_id | uuid | Commenter |
| comment | text | Comment text |
| rating | integer (nullable) | Star rating |
| created_at | timestamptz | Comment time |

**Relationships:** `ebook_id` → `ebooks.id`

---

### `template_categories`

Categories for document templates.

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Category identifier |
| name | text | Category name (French) |
| name_ht | text (nullable) | Category name (Haitian Creole) |
| description | text (nullable) | Category description |
| icon | text | Icon identifier |
| order_index | integer | Sort order |
| created_at | timestamptz | Creation time |

---

### `templates`

Downloadable document templates.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Template identifier |
| title | text | Template title (French) |
| title_ht | text (nullable) | Template title (Haitian Creole) |
| description | text | Template description |
| category | text | FK → template_categories.id |
| slug | text | URL-friendly identifier |
| schema | jsonb | Template field schema |
| language | text | Default language |
| is_published | boolean | Whether visible to users |
| is_featured | boolean | Whether featured on homepage |
| download_count | integer | Total downloads |
| thumbnail_url | text (nullable) | Preview image |
| og_image_url | text (nullable) | Social share image |
| seo_title | text (nullable) | SEO title |
| seo_description | text (nullable) | SEO description |
| tags | text[] (nullable) | Search tags |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

**Relationships:** `category` → `template_categories.id`

---

## 14. Administration

### `contact_submissions`

Public contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Submission identifier |
| name | text | Submitter name |
| email | text | Submitter email |
| message | text | Message content |
| status | text | Review status (pending/reviewed/resolved) |
| admin_notes | text (nullable) | Admin internal notes |
| reviewed_by | uuid (nullable) | Admin who reviewed |
| reviewed_at | timestamptz (nullable) | Review time |
| ip_address | text (nullable) | Submitter IP |
| user_agent | text (nullable) | Browser user agent |
| created_at | timestamptz | Submission time |
| updated_at | timestamptz | Last update |

---

### `user_reports`

Reports filed by users against other users or content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Report identifier |
| reporter_id | uuid | User filing the report |
| reported_user_id | uuid | User being reported |
| post_id | uuid (nullable) | FK → posts.id (if reporting a post) |
| reason | text | Report reason category |
| description | text (nullable) | Detailed description |
| status | text | Report status (pending/reviewed/resolved/dismissed) |
| admin_notes | text (nullable) | Admin notes |
| reviewed_by | uuid (nullable) | Admin who reviewed |
| reviewed_at | timestamptz (nullable) | Review time |
| created_at | timestamptz | Report time |
| updated_at | timestamptz | Last update |

**Relationships:** `post_id` → `posts.id`

---

## 15. Enums

| Enum Name | Values | Used By |
|-----------|--------|---------|
| `ai_job_status` | pending, running, completed, failed, cancelled | ai_generation_jobs |
| `asset_kind` | quiz_final, activities, outline, keywords | lesson_assets |
| `asset_status` | draft, validating, validated, rejected, published | lesson_assets |
| `chess_match_status` | waiting, playing, completed, cancelled, abandoned | chess_matches |
| `content_editor_role` | admin, editor, viewer | content_editor_roles |
| `follow_status` | pending, accepted, rejected | follows |
| `quiz_battle_mode` | solo, friend, random | quiz_battles |
| `quiz_battle_status` | waiting, in_progress, completed, cancelled | quiz_battles |
| `quiz_difficulty` | easy, medium, hard | quiz_battles, quiz_battle_matchmaking |
| `workflow_status` | draft, in_review, approved, published, rejected | lessons |

---

## 16. Views

### `leaderboard_profiles`

Read-only view exposing safe profile data for the public leaderboard. Excludes system accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Profile ID |
| user_id | uuid | User ID |
| nickname | text | Display name |
| avatar_url | text | Profile picture |
| academic_grade | text | Grade level |
| gold_earned | integer | Total gold |
| affiliation_points | integer | Referral points |
| verified | boolean | Verified status |
| created_at | timestamptz | Account creation |

---

### `lesson_content_flags`

Read-only view showing which content sections exist for each lesson.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Lesson ID |
| has_objectif | boolean | Whether objective exists |
| has_introduction | boolean | Whether introduction exists |
| has_contenu | boolean | Whether main content exists |
| has_exemples | boolean | Whether examples exist |
| has_activities | boolean | Whether activities exist |
| has_quiz | boolean | Whether quiz exists |

---

### `public_profiles`

Read-only view exposing safe profile data for public profile pages.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Profile ID |
| user_id | uuid | User ID |
| full_name | text | User's full name |
| nickname | text | Display name |
| avatar_url | text | Profile picture |
| bio | text | User biography |
| academic_grade | text | Grade level |
| gold_earned | integer | Total gold |
| affiliation_points | integer | Referral points |
| verified | boolean | Verified status |
| created_at | timestamptz | Account creation |

---

> **Note**: This document describes the schema structure only. It does not include actual data, user information, or security policy implementation details. All tables are protected by Row-Level Security (RLS) policies.

---

© 2026 EDUPRENEURS — Author: Steeve A. Celestin
