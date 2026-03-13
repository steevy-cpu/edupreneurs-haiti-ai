# Edupreneurs Haiti

An AI-powered educational platform empowering Haitian students (grades 7AF–NS4/Baccalauréat) with interactive learning experiences, real-time AI tutoring, and curriculum-aligned content.

**Live**: [mon-edupreneur.com](https://mon-edupreneur.com)

---

## Features

### Core Learning
- **AI-Generated Lessons** — Curriculum-aligned content with structured sections (objective, introduction, content, examples, exercises)
- **Interactive Activities** — Gamified exercises with drag-and-drop, matching, fill-in-the-blank, and more
- **Quiz System** — Auto-generated quizzes with AI validation and accuracy scoring
- **Official Exam Practice** — Real Baccalauréat exams with step-by-step AI tutoring
- **Content Validation Workflow** — Draft → Review → Approve → Publish pipeline with AI quality checks

### AI Tutors (11 Specialized)
- **Jude** — General AI assistant with 3D avatar and voice (ElevenLabs TTS)
- **Eric** — Home page conversational assistant
- **Subject Tutors** — Math, Philosophy (BAC), French, English, Spanish
- **Exam Tutor** — Exercise-by-exercise guidance for official exams
- **Passion Tutor** — Interest-based learning (chess, arts, music, literature)
- **Reading Tutor** — Guided reading comprehension

### Gamification
- **Gold System** — Earn gold for completing lessons, quizzes, and activities
- **Streaks** — Daily login streaks with freeze protection and milestone badges
- **Quiz Battles** — Real-time multiplayer quiz competitions (solo, friend, random matchmaking)
- **Chess** — Full multiplayer chess with ELO rating, puzzles, and AI analysis
- **Leaderboard** — Global ranking by gold earned and affiliation points

### Community & Social
- **Social Feed** — Posts with likes, comments, shares, and visibility controls
- **Direct Messaging** — Real-time 1:1 and group conversations with media sharing
- **Follow System** — Follow requests with accept/reject workflow
- **Notifications** — In-app + Web Push notifications for all social interactions

### Payments & Subscriptions
- **MonCash** (HTG) — Haiti's mobile money via Digicel
- **NatCash** (HTG) — Via Bazik.io API with admin verification
- **Stripe** (USD) — International credit/debit card payments
- **Gift Subscriptions** — Pay for another student's access
- **Promo Codes** — Partner-based promotional access with usage tracking

### Platform
- **Progressive Web App** — Installable with offline capabilities via service worker
- **Multi-Language** — French and Haitian Creole support
- **Responsive Design** — Mobile-first, optimized for 3G connections in Haiti
- **E-Books Library** — PDF reader with progress tracking and comments
- **Study Music** — Background YouTube music player for focused studying
- **Document Templates** — Downloadable academic templates (CV, letters, reports)
- **Blog** — Admin-managed blog with rich text editor
- **Daily Word** — Vocabulary builder with audio pronunciation
- **StudyGram** — AI-generated visual study cards for social sharing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Framer Motion |
| **State** | TanStack Query v5, React Context |
| **Routing** | React Router v6 (lazy-loaded) |
| **Backend** | Lovable Cloud (PostgreSQL + RLS + Edge Functions) |
| **Edge Functions** | 80+ Deno functions for AI, payments, email, etc. |
| **AI Models** | Google Gemini 2.5 Flash/Pro, OpenAI GPT via Lovable AI Gateway |
| **Audio/TTS** | ElevenLabs (voice: "Eric") |
| **3D** | React Three Fiber + Three.js (Jude avatar) |
| **Math** | KaTeX + react-katex |
| **Rich Text** | Tiptap editor |
| **Email** | Resend (noreply@mon-edupreneur.com) |
| **Push** | Web Push API + FCM |
| **Mobile** | Capacitor v8 (iOS + Android) |
| **Monitoring** | Sentry |

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

See [DATABASE.md](./DATABASE.md) for complete database schema reference.

---

## Development

### Prerequisites

- Node.js 18+ & npm ([install with nvm](https://github.com/nvm-sh/nvm))

### Setup

```sh
git clone <repository-url>
cd edupreneurs
npm install
npm run dev
```

### Key Directories

```
src/
├── components/      # React components (organized by feature)
├── hooks/           # Custom React hooks
├── pages/           # Route-level page components
├── shell/           # AppShell (sidebar, bottom nav, floating layer)
├── utils/           # Utility functions (all JSDoc-documented)
├── integrations/    # Supabase client & types (auto-generated)
├── contexts/        # React context providers
├── assets/          # Static images and assets
└── styles/          # Global CSS and design tokens

supabase/
├── functions/       # 80+ Deno edge functions (all JSDoc-documented)
├── migrations/      # Database migrations (auto-managed)
└── config.toml      # Edge function configuration
```

---

## Performance Standards

This platform serves students primarily on 3G or slower connections in Haiti. Every feature is evaluated against this reality:

- All pages lazy-loaded with skeleton fallbacks
- `lazyWithRetry()` wrapper prevents infinite reload on stale chunks
- TanStack Query: 5min stale, 30min GC, no window-focus refetch, 1 retry
- Network-aware animations and data loading (2G/slow-2G detection)
- Image compression before upload (JPEG 0.75, avatars 256×256)
- Service worker caching for offline resilience
- Pre-generated audio (never real-time TTS per request)

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

## Security

- All tables protected by Row-Level Security (RLS)
- Role-based access via `content_editor_roles` table
- Device trust system with verification challenges
- Rate limiting on sensitive operations
- Input sanitization with DOMPurify on all HTML
- All API keys and secrets stored as environment variables in edge functions
- No sensitive data committed to the codebase

---

## Access

This project is maintained privately. For collaboration inquiries, contact the repository owner.

---

## License

Proprietary — All rights reserved

© 2026 EDUPRENEURS — Author: Steeve A. Celestin
