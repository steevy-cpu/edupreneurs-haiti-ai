# Architecture — Edupreneurs Haiti

This document describes the high-level architecture, design patterns, and technical decisions behind the Edupreneurs platform.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [App Shell Pattern](#app-shell-pattern)
4. [Provider Stack](#provider-stack)
5. [Routing](#routing)
6. [Data Fetching](#data-fetching)
7. [Backend Architecture](#backend-architecture)
8. [Authentication & Security](#authentication--security)
9. [AI Content Generation](#ai-content-generation)
10. [Real-time Subscriptions](#real-time-subscriptions)
11. [Payment System](#payment-system)
12. [Performance Strategy](#performance-strategy)
13. [Mobile Support](#mobile-support)
14. [Edge Function Domains](#edge-function-domains)

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client (React SPA)                │
│  React 18 + TypeScript + Vite + Tailwind + shadcn   │
│  TanStack Query v5 | React Router v6 | Framer Motion│
└─────────────┬───────────────────────┬───────────────┘
              │                       │
              ▼                       ▼
┌─────────────────────┐   ┌─────────────────────────┐
│   Supabase Client   │   │   Edge Functions (80+)  │
│  (PostgREST + Auth) │   │   Deno runtime          │
│  Realtime WebSocket │   │   AI, Payments, Email   │
└─────────┬───────────┘   └───────────┬─────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL + Row-Level Security         │
│              95 tables | 3 views | 50+ DB functions  │
└─────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Choices

| Concern | Solution | Rationale |
|---------|----------|-----------|
| UI Framework | React 18 | Mature ecosystem, team expertise |
| Language | TypeScript | Type safety across codebase |
| Bundler | Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS + shadcn/ui | Utility-first with accessible components |
| Animation | Framer Motion | Declarative, performant animations |
| State | TanStack Query v5 | Server state management with caching |
| Routing | React Router v6 | Nested routes, lazy loading |
| 3D | React Three Fiber | Jude avatar rendering |
| Math | KaTeX | Fast math equation rendering |
| Rich Text | Tiptap | Extensible editor for content creation |

### Component Organization

Components are organized by feature domain rather than by type:

```
src/components/
├── admin/           # Admin dashboard panels
├── auth/            # Login, signup, verification flows
├── chess/           # Chess game, board, puzzles
├── community/       # Feed, posts, comments
├── courses/         # Subject browsing, lesson viewer
├── ebooks/          # E-book reader and library
├── exams/           # Exam practice and results
├── jude/            # AI assistant (3D avatar, chat)
├── messaging/       # DM and group conversations
├── notifications/   # Notification center
├── onboarding/      # First-time user experience
├── passions/        # Interest-based learning modules
├── payments/        # Subscription and payment flows
├── quiz-battle/     # Multiplayer quiz system
├── settings/        # User preferences
├── templates/       # Document template browser
└── ui/              # shadcn/ui base components
```

---

## App Shell Pattern

A single persistent `AppShell` (`src/shell/AppShell.tsx`) mounts after login and **never unmounts** during the session. This provides:

- **Desktop**: Collapsible sidebar navigation (`AppSidebar`)
- **Mobile**: Bottom navigation bar (`ShellMobileBottomNav`)
- **Floating Layer**: Always-available elements — Jude FAB, music player, announcement banners
- **Realtime Subscriptions**: Shell-level listeners for new messages and notifications

```
┌──────────────────────────────────────────────────┐
│ AppShell (persistent after auth)                  │
│ ┌────────┐ ┌──────────────────────────────────┐  │
│ │Sidebar │ │  <Outlet /> (page content)       │  │
│ │(desktop)│ │  Lazy-loaded per route           │  │
│ │        │ │                                   │  │
│ └────────┘ └──────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────┐  │
│ │ FloatingLayer (Jude, Music, FAB, Banners)    │  │
│ └──────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────┐  │
│ │ MobileBottomNav (mobile only)                │  │
│ └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Provider Stack

Providers are ordered by strict dependency. **Do not reorder.**

```
QueryClientProvider          ← TanStack Query cache
  └─ SessionAuthProvider     ← Auth state (session, user, profile)
      └─ NetworkProvider     ← Connection quality detection
          └─ ThemeProvider   ← Light/dark mode
              └─ TooltipProvider + Toaster + Sonner
                  └─ BrowserRouter
                      └─ PresenceProvider    ← Online/offline users
                          └─ VisitorProvider ← Visitor tracking
                              └─ MusicPlayerProvider
                                  └─ FirstTimeUserProvider
```

---

## Routing

All pages use `React.lazy()` with `lazyWithRetry()` wrapper to handle stale chunk errors gracefully.

### Route Categories

| Category | Shell | Auth Required | Example Routes |
|----------|-------|---------------|----------------|
| Public | No | No | `/`, `/blog`, `/templates`, `/don` |
| Auth | No | No | `/login`, `/signup`, `/verify` |
| Authenticated | Yes | Yes | `/dashboard`, `/cours`, `/messages` |

### Legacy URL Handling

A `LegacyRedirect` component handles old URL formats and redirects to current routes.

---

## Data Fetching

### TanStack Query Configuration

```typescript
{
  staleTime: 5 * 60 * 1000,      // 5 minutes
  gcTime: 30 * 60 * 1000,         // 30 minutes garbage collection
  refetchOnWindowFocus: false,     // Disabled for 3G optimization
  retry: 1,                        // Single retry on failure
}
```

### Patterns

- **`useOptimizedQuery`** — Debounced queries with network-aware loading
- **`useOptimizedFetch`** — Batched fetch requests
- **`queryPersistence`** — localStorage caching with 7-day stale window
- **`networkAwareCache`** — Adaptive caching based on connection quality

---

## Backend Architecture

### Database (PostgreSQL)

- **95 tables** organized by domain (users, content, gamification, exams, battles, payments, community, notifications, admin)
- **3 views** — `leaderboard_profiles`, `lesson_content_flags`, `public_profiles`
- **50+ database functions** — Business logic executed server-side for security
- **Row-Level Security (RLS)** on all tables
- **Triggers** for automated side effects (versioning, notifications, streak updates)

See [DATABASE.md](./DATABASE.md) for complete schema documentation.

### Edge Functions (80+ Deno Functions)

Edge functions handle all server-side logic that requires secrets or complex processing:

- AI content generation and tutoring
- Payment processing (MonCash, NatCash, Stripe)
- Email sending (Resend)
- Push notifications (Web Push)
- Content validation
- Admin operations

**Rules:**
- Never call multiple edge functions sequentially on page load
- Always handle cold start latency with loading states
- All secrets live as edge function environment variables only

---

## Authentication & Security

### Auth Flow

1. **Signup** → Email + password → Profile creation → 6-digit email verification code
2. **Login** → Email + password → Device fingerprint check → Session creation
3. **Device Trust** → New device triggers verification challenge → Code sent via email
4. **Session** → Supabase JWT with RLS enforcement on all queries

### Security Layers

| Layer | Mechanism |
|-------|-----------|
| Database | RLS policies on all tables |
| Roles | `content_editor_roles` table (admin/editor/viewer) |
| Founders | Identified by hardcoded UUIDs in `is_founder()` DB function |
| Devices | `user_trusted_devices` + `device_verification_challenges` tables |
| Rate Limiting | `rate_limits` table + `cleanup_expired_rate_limits()` |
| Input | DOMPurify sanitization on all HTML rendering |
| Referrals | Self-referral protection in `award_referral_points()` |
| Login | `login_attempts` table with lockout after failed attempts |

---

## AI Content Generation

### System A — Job-Based (Preferred)

```
Client creates job record
       │
       ▼
ai_generation_jobs table (status: pending)
       │
       ▼
process-ai-job edge function picks up job
       │
       ▼
Sequential section generation:
  ├─ Introduction
  ├─ Objective
  ├─ Content
  ├─ Examples/Exercises
  ├─ Interactive Activities
  └─ Quiz
       │
       ▼
Each section: defensive save + 2x retry + exponential backoff
       │
       ▼
Auto-publish on completion (if all sections valid)
```

### System B — Client-Side Batch (Legacy)

Used in `BatchLessonGenerator.tsx` when System A is unavailable. Uses `isPausedRef` (useRef) to avoid stale closure bugs in the batch loop.

### AI Models Used

| Model | Use Case |
|-------|----------|
| Google Gemini 2.5 Flash | Default content generation, fast responses |
| Google Gemini 2.5 Pro | Complex reasoning, high-quality content |
| OpenAI GPT | Fallback and specialized tasks |

All AI calls go through the Lovable AI Gateway — no direct API key management needed for supported models.

---

## Real-time Subscriptions

Multiple realtime listeners run simultaneously via Supabase Realtime:

| Listener | Scope | Purpose |
|----------|-------|---------|
| Messages | Shell-level | Toast alert for new DMs |
| Notifications | Shell-level | Toast alert for new notifications |
| Feed | Page-level | Live post updates |
| Chess Match | Page-level | Move synchronization |
| Quiz Battle | Page-level | Answer synchronization |
| Presence | App-level | Online/offline user status |

**Rule:** Only activate page-level realtime subscriptions when the relevant component is mounted. Never add new always-on shell-level listeners without strong justification.

---

## Payment System

### Payment Flow

```
User selects plan
       │
       ├─ MonCash → moncash-create-payment → Digicel redirect → webhook verification
       │
       ├─ NatCash → natcash-create-transfer → Bazik.io API → admin verification
       │
       └─ Stripe  → stripe-create-donation → Checkout redirect → webhook verification
```

### Subscription Management

- `profiles.subscription_status` — active / expired / pending
- `profiles.subscription_end_date` — Expiry timestamp
- `profiles.has_free_access` — Promo/gift access flag
- `expire_subscriptions()` — DB function runs periodically to expire lapsed subscriptions
- `check-subscription-expiry` — Edge function for reminder emails

---

## Performance Strategy

### 3G-First Design (Non-Negotiable)

Users are primarily on 3G or slower connections in Haiti.

| Technique | Implementation |
|-----------|---------------|
| Code Splitting | All pages lazy-loaded via `React.lazy()` + `lazyWithRetry()` |
| Skeleton Loading | Every page has a skeleton fallback |
| Network Detection | `NetworkContext` detects 2G/slow-2G → reduced data mode |
| Adaptive Animations | `useNetworkAwareAnimations` disables heavy animations on slow connections |
| Image Optimization | `OptimizedImage` + `ProgressiveImage` components; JPEG 0.75 compression |
| Caching | TanStack Query (5min stale), localStorage (7-day), service worker |
| Pre-generated Audio | Lesson audio stored in bucket, never real-time TTS |
| YouTube Optimization | Script loading skipped on slow connections (except native Capacitor) |

---

## Mobile Support

### Capacitor v8

The app runs as a PWA and as a native app via Capacitor:

- **Platform Detection** — `Capacitor.getPlatform()` for platform-specific behavior
- **Push Notifications** — FCM for native, Web Push for browser
- **Deep Linking** — Native URL scheme handling
- **Status Bar** — Native status bar styling

### Responsive Breakpoints

- Mobile: < 768px (bottom nav, single column)
- Tablet: 768px–1024px (adapted layouts)
- Desktop: > 1024px (sidebar navigation, multi-column)

---

## Edge Function Domains

| Domain | Functions | Purpose |
|--------|-----------|---------|
| AI Generation | `process-ai-job`, `generate-lesson-content`, `generate-lesson-section`, `generate-interactive-activities`, `generate-quiz-final`, `generate-battle-questions`, `generate-studygram`, `generate-studygram-visual`, `generate-explanatory-images`, `generate-matiere-structure` | Content creation |
| AI Tutors | `jude-ai-tutor`, `eric-chat`, `home-eric-chat`, `math-ai-tutor`, `bac-philosophy-tutor`, `francais-ai-tutor`, `anglais-practice-tutor`, `spanish-practice-tutor`, `exam-tutor`, `passion-ai-tutor`, `reading-tutor`, `chess-ai-tutor` | Interactive tutoring |
| Validation | `validate-quiz-accuracy`, `validate-activities-accuracy`, `validate-quiz-content-alignment`, `validate-activities-content-alignment`, `fix-invalid-quiz`, `fix-invalid-activities` | Quality assurance |
| Payments | `moncash-create-payment`, `moncash-verify-payment`, `moncash-webhook`, `natcash-create-transfer`, `natcash-check-transfer`, `stripe-create-donation`, `stripe-donation-webhook`, `stripe-gift-payment`, `moncash-gift-payment` | Transaction processing |
| Email | `send-confirmation-email`, `send-welcome-email`, `send-password-reset-email`, `send-login-notification`, `send-farewell-email`, `send-report-confirmation`, `send-announcement`, `check-onboarding-emails` | Transactional email |
| Push | `send-push-notification`, `mark-notification-read`, `notify-mentions` | Notification delivery |
| Admin | `admin-delete-user-account`, `admin-delete-post`, `delete-user-account`, `check-birthdays`, `award-weekly-champion`, `cleanup-old-jobs` | Platform management |
| Content | `content-ai-assistant`, `analyze-curriculum-pdf`, `export-template`, `translate-text`, `youtube-search`, `suggest-youtube-videos` | Content tools |
| Auth | `reset-password`, `send-whatsapp-confirmation`, `redeem-promo-code`, `check-subscription-expiry` | Auth & subscription |
| Media | `elevenlabs-tts`, `generate-custom-avatar`, `parse-exam-vision` | Media processing |
| Misc | `generate-exercise-explanation`, `generate-quiz-quizgecko`, `check-jude-motivations` | Specialized features |

---

## Environment Variables

### Frontend (.env.local)
These are safe for the browser — Supabase anon key is designed for frontend use:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |

### Edge Functions (Supabase Dashboard → Settings → Secrets)
These are server-side only — never exposed to the browser:

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access |
| `GEMINI_API_KEY` | Google Gemini AI (lessons, tutoring) |
| `OPENAI_API_KEY` | DALL-E 3 (avatar generation) |
| `ELEVENLABS_API_KEY` | Jude voice synthesis |
| `RESEND_API_KEY` | Transactional email delivery |
| `BAZIK_API_KEY` | MonCash/NatCash payments |
| `STRIPE_SECRET_KEY` | Stripe payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `INTERNAL_SECRET` | Internal edge function authentication |

---

© 2026 EDUPRENEURS — Author: Steeve A. Celestin
