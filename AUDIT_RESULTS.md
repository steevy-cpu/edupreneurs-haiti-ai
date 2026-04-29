## 1. BUNDLE & ASSETS

Contexte d'exécution:

```text
npm ls --depth=0 --production
=> échec avec `ELSPROBLEMS`: toutes les dépendances prod sont marquées `UNMET DEPENDENCY`
=> cause probable: `node_modules/` absent localement
```

Extrait des deps prod déclarées par `npm ls`:

```text
@hookform/resolvers
@lovable.dev/cloud-auth-js
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-aspect-ratio
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-collapsible
@radix-ui/react-context-menu
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-hover-card
@radix-ui/react-label
@radix-ui/react-menubar
@radix-ui/react-navigation-menu
@radix-ui/react-popover
@radix-ui/react-progress
@radix-ui/react-radio-group
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toast
@radix-ui/react-toggle
@radix-ui/react-toggle-group
@radix-ui/react-tooltip
@react-three/drei
@react-three/fiber
@sentry/react
@supabase/supabase-js
@tanstack/react-query
@tiptap/extension-image
@tiptap/extension-link
@tiptap/extension-youtube
@tiptap/react
@tiptap/starter-kit
canvas-confetti
chess.js
class-variance-authority
clsx
cmdk
date-fns
docx
dompurify
embla-carousel-react
emoji-picker-react
file-saver
framer-motion
html2canvas
input-otp
jspdf
katex
lovable-tagger
lucide-react
next-themes
pdfjs-dist
react
react-chessboard
react-day-picker
react-dom
react-helmet
react-hook-form
react-katex
react-markdown
react-resizable-panels
react-router-dom
recharts
sharp
sonner
svgo
tailwind-merge
tailwindcss-animate
terser
three
vaul
vite-plugin-image-optimizer
zod
```

```text
du -sh node_modules/ 2>/dev/null
node_modules absent
```

Top 30 images les plus lourdes:

```text
3.0M  src/assets/eric-thumb-up.png
3.0M  src/assets/eric-scientist.png
3.0M  src/assets/eric-biologist.png
3.0M  src/assets/background-chat.png
2.9M  src/assets/student-learning.png
2.9M  src/assets/eric-waving.png
2.9M  src/assets/eric-student-desk.png
2.9M  src/assets/eric-profile.png
2.9M  src/assets/eric-pointing-up.png
2.9M  src/assets/eric-new-profile.png
2.9M  src/assets/eric-chair-desk.png
2.9M  src/assets/eric-ai-helper.png
2.9M  public/images/eric-ai-helper.png
2.8M  src/assets/eric-right-pointing.png
2.8M  src/assets/eric-right-pointing-2.png
2.8M  src/assets/eric-pointing-left.png
2.8M  src/assets/eric-math.png
2.8M  src/assets/eric-computer.png
2.8M  src/assets/eric-celebrating.png
2.8M  public/images/jude-welcome-cscp.png
2.8M  public/images/eric-right-pointing.png
2.8M  public/images/eric-celebrating.png
2.6M  src/assets/jude-passion-discovery.png
2.6M  src/assets/eric-main00.png
2.6M  src/assets/eric-404.png
2.6M  src/assets/dashboard00.png
2.6M  src/assets/auth00.png
2.6M  public/images/jude-passion-discovery.png
2.5M  src/assets/eric-main01.png
1.6M  src/assets/eric-thinking-pose.png
```

```text
grep -rn '<img' src/ --include="*.tsx" | grep -v 'loading=' | wc -l
126

grep -rn '<img' src/ --include="*.tsx" | grep -vE 'width=|height=' | wc -l
138
```

Plus gros fichiers `src/` par nombre de lignes:

```text
191806 total
13926 src/data/sciencesSocialesLessons.ts
7046  src/data/sciencesLessons.ts
6773  src/data/mathLessons.ts
6350  src/data/espagnolLessons.ts
5938  src/data/francaisLessons.ts
5207  src/integrations/supabase/types.ts
3551  src/data/creoleLessons.ts
2362  src/data/sciencesSocialesActivities.ts
1883  src/pages/PassionDiscovery.tsx
1813  src/components/content-editor/BatchLessonGenerator.tsx
1422  src/components/content-editor/PassionVideoManager.tsx
1405  src/pages/control-center/modules/WordsModule.tsx
1302  src/data/sciencesActivities.ts
1273  src/data/passionActivities.ts
```

Constat:
- `node_modules` absent empêche toute validation runtime locale.
- Les assets bitmap dépassent massivement 2.5-3.0 Mo unitairement.
- Le volume de contenu embarqué dans `src/data/*.ts` est très élevé et gonfle le bundle applicatif.

## 2. CODE SPLITTING & LAZY LOADING

Liste complète `React.lazy` / `lazy(`:

```text
src/App.tsx:52:const Index = lazy(() => import("./pages/Index"));
src/App.tsx:55:const AuthLayout = lazy(() => import("./auth/layout/AuthLayout").then(m => ({ default: m.AuthLayout })));
src/App.tsx:56:const LoginPage = lazy(() => import("./auth/routes/LoginPage"));
src/App.tsx:57:const SignupLayout = lazy(() => import("./auth/routes/signup/SignupLayout"));
src/App.tsx:58:const SignupStep1 = lazy(() => import("./auth/routes/signup/Step1"));
src/App.tsx:60:const SignupStep3 = lazy(() => import("./auth/routes/signup/Step3"));
src/App.tsx:61:const SignupPaymentCallback = lazy(() => import("./auth/routes/signup/SignupPaymentCallback"));
src/App.tsx:62:const GoogleSetupPage = lazy(() => import("./pages/auth/GoogleSetupPage"));
src/App.tsx:63:const VerifyEmailPage = lazy(() => import("./auth/routes/VerifyEmailPage"));
src/App.tsx:64:const VerifyDevicePage = lazy(() => import("./auth/routes/VerifyDevicePage"));
src/App.tsx:65:const ForgotPasswordPage = lazy(() => import("./auth/routes/ForgotPasswordPage"));
src/App.tsx:66:const Dashboard = lazy(() => import("./pages/Dashboard"));
src/App.tsx:69:const Onboarding = lazy(() => import("./pages/Onboarding"));
src/App.tsx:70:const Matieres = lazy(() => import("./pages/Matieres"));
src/App.tsx:71:const ExamPreparation = lazy(() => import("./pages/ExamPreparation"));
src/App.tsx:72:const ExamsHub = lazy(() => import("./pages/ExamsHub"));
src/App.tsx:73:const ExamsHubPage = lazy(() => import("./features/exams/pages/ExamsHubPage"));
src/App.tsx:74:const Resources = lazy(() => import("./pages/Resources"));
src/App.tsx:75:const Affiliations = lazy(() => import("./pages/Affiliations"));
src/App.tsx:76:const Settings = lazy(() => import("./pages/Settings"));
src/App.tsx:77:const Leaderboard = lazy(() => import("./pages/Leaderboard"));
src/App.tsx:78:const ResetPassword = lazy(() => import("./pages/ResetPassword"));
src/App.tsx:79:const Feed = lazy(() => import("./pages/Feed"));
src/App.tsx:80:const UserSearch = lazy(() => import("./pages/UserSearch"));
src/App.tsx:81:const Profile = lazy(() => import("./pages/Profile"));
src/App.tsx:82:const Notifications = lazy(() => import("./pages/Notifications"));
src/App.tsx:83:const FollowRequests = lazy(() => import("./pages/FollowRequests"));
src/App.tsx:84:const Community = lazy(() => import("./pages/Community"));
src/App.tsx:85:const NotFound = lazy(() => import("./pages/NotFound"));
src/App.tsx:86:const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
src/App.tsx:87:const CookieSettings = lazy(() => import("./pages/CookieSettings"));
src/App.tsx:88:const Terms = lazy(() => import("./pages/Terms"));
src/App.tsx:90:const DynamicCoursePage = lazy(() => import("./pages/DynamicCoursePage"));
src/App.tsx:91:const DynamicLessonPage = lazy(() => import("./pages/DynamicLessonPage"));
src/App.tsx:94:const CustomizeAI = lazy(() => import("./pages/CustomizeAI"));
src/App.tsx:97:const DemoLessonPage = lazy(() => import("./pages/DemoLessonPage"));
src/App.tsx:101:const ChessGame = lazy(() => import("./pages/ChessGame"));
src/App.tsx:102:const ChessMultiplayerLobby = lazy(() => import("./pages/ChessMultiplayerLobby"));
src/App.tsx:103:const ChessMultiplayerGame = lazy(() => import("./pages/ChessMultiplayerGame"));
src/App.tsx:104:const GamesHub = lazy(() => import("./pages/GamesHub"));
src/App.tsx:105:const QuizBattle = lazy(() => import("./pages/QuizBattle"));
src/App.tsx:106:const QuizBattleSolo = lazy(() => import("./pages/QuizBattleSolo"));
src/App.tsx:107:const QuizBattleLobby = lazy(() => import("./pages/QuizBattleLobby"));
src/App.tsx:108:const QuizBattleMultiplayer = lazy(() => import("./pages/QuizBattleMultiplayer"));
src/App.tsx:109:const QuizBattleLeaderboard = lazy(() => import("./pages/QuizBattleLeaderboard"));
src/App.tsx:110:const ControlCenter = lazy(() => import("./pages/ControlCenter"));
src/App.tsx:111:const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
src/App.tsx:112:const ContentEditor = lazy(() => import("./pages/ContentEditor"));
src/App.tsx:113:const AIGenerationAnalytics = lazy(() => import("./pages/AIGenerationAnalytics"));
src/App.tsx:114:const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
src/App.tsx:115:const BaccExamsHub = lazy(() => import("./pages/BaccExamsHub"));
src/App.tsx:116:const Library = lazy(() => import("./pages/Library"));
src/App.tsx:117:const EbookReader = lazy(() => import("./pages/EbookReader"));
src/App.tsx:118:const Blog = lazy(() => import("./pages/Blog"));
src/App.tsx:119:const BlogPost = lazy(() => import("./pages/BlogPost"));
src/App.tsx:120:const Donate = lazy(() => import("./pages/Donate"));
src/App.tsx:121:const DonationSuccessCallback = lazy(() => import("./components/donate/DonationSuccessCallback"));
src/App.tsx:122:const GiftPayment = lazy(() => import("./pages/GiftPayment"));
src/App.tsx:123:const GiftPaymentSuccess = lazy(() => import("./pages/GiftPaymentSuccess"));
src/App.tsx:124:const GiftMonCashPayment = lazy(() => import("./pages/GiftMonCashPayment"));
src/App.tsx:125:const GiftMonCashCallback = lazy(() => import("./pages/GiftMonCashCallback"));
src/App.tsx:126:const StripeRenewalCallback = lazy(() => import("./pages/StripeRenewalCallback"));
src/App.tsx:129:const TemplatesHomePage = lazy(() => import("./pages/templates/TemplatesHomePage"));
src/App.tsx:130:const TemplatesCategoryPage = lazy(() => import("./pages/templates/TemplatesCategoryPage"));
src/App.tsx:131:const TemplateEditorPage = lazy(() => import("./pages/templates/TemplateEditorPage"));
src/App.tsx:134:const Translate = lazy(() => import("./pages/Translate"));
src/auth/layout/AuthLayout.tsx:20:const VisitorSelectorPortal = lazy(()
src/components/LazyEmojiPicker.tsx:5:const EmojiPickerLazy = lazy(() => import('emoji-picker-react'));
src/components/community/ChatComposer.tsx:9:const EmojiPicker = lazy(() => import("emoji-picker-react"));
src/components/dashboard/tabs/ProgressTab.tsx:8:const WeeklyActivityChart = lazy(()
src/components/dashboard/tabs/ProgressTab.tsx:11:const SubjectProgressChart = lazy(()
src/components/dashboard/tabs/ProgressTab.tsx:14:const LearningInsightsPanel = lazy(()
src/components/dashboard/tabs/ProgressTab.tsx:17:const AchievementsBadges = lazy(()
src/components/home/ContactSection.tsx:6:const ContactForm = lazy(() => import("@/components/home/ContactForm").then(m => ({ default: m.ContactForm })));
src/components/settings/ProfileTab.tsx:35:const AvatarSelector = lazy(() => import('@/components/AvatarSelector').then(m => ({ default: m.AvatarSelector })));
src/pages/ChessGame.tsx:22:const ChessPlayerStats = lazy(() => import('@/components/chess/ChessPlayerStats'));
src/pages/ChessGame.tsx:23:const ChessPuzzleTrainer = lazy(() => import('@/components/chess/ChessPuzzleTrainer'));
src/pages/ChessGame.tsx:24:const ChessPostGameAnalysis = lazy(() => import('@/components/chess/ChessPostGameAnalysis'));
src/pages/ChessMultiplayerGame.tsx:40:const Chessboard = lazy(()
src/pages/EbookReader.tsx:24:const EbookPDFViewer = lazy(() => import("@/components/ebook/EbookPDFViewer"));
src/pages/Index.tsx:17:const FeaturesSection = lazy(() => import("@/components/home/FeaturesSection"));
src/pages/Index.tsx:18:const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
src/pages/Index.tsx:19:const PlatformFeaturesSection = lazy(() => import("@/components/home/PlatformFeaturesSection"));
src/pages/Index.tsx:20:const CoursesSection = lazy(() => import("@/components/home/CoursesSection"));
src/pages/Index.tsx:21:const FAQSection = lazy(() => import("@/components/home/FAQSection"));
src/pages/Index.tsx:22:const AboutSection = lazy(() => import("@/components/home/AboutSection"));
src/pages/Index.tsx:23:const TeamSection = lazy(() => import("@/components/home/TeamSection"));
src/pages/Index.tsx:24:const ContactSection = lazy(() => import("@/components/home/ContactSection"));
src/pages/Index.tsx:25:const BlogSectionWrapper = lazy(() => import("@/components/home/BlogSectionWrapper"));
src/pages/Index.tsx:35:const HomeChatbot = lazy(() => import("@/components/HomeChatbot").then(module => ({ default: module.HomeChatbot })));
src/pages/Matieres.tsx:40:const ContinueLearningSection = lazy(()
src/pages/Matieres.tsx:43:const SubjectCardEnhanced = lazy(()
src/pages/Matieres.tsx:46:const SeriesComparisonCards = lazy(()
src/pages/Matieres.tsx:49:const UserStatsWidget = lazy(()
src/pages/Notifications.tsx:19:const AlertDialog = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialog })));
src/pages/Notifications.tsx:20:const AlertDialogAction = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogAction })));
src/pages/Notifications.tsx:21:const AlertDialogCancel = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogCancel })));
src/pages/Notifications.tsx:22:const AlertDialogContent = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogContent })));
src/pages/Notifications.tsx:23:const AlertDialogDescription = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogDescription })));
src/pages/Notifications.tsx:24:const AlertDialogFooter = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogFooter })));
src/pages/Notifications.tsx:25:const AlertDialogHeader = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogHeader })));
src/pages/Notifications.tsx:26:const AlertDialogTitle = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogTitle })));
src/pages/templates/TemplateEditorPage.tsx:17:const TemplateCanvas = lazy(() => import('@/components/templates/TemplateCanvas'));
src/pages/templates/TemplateEditorPage.tsx:18:const EditorSidebar = lazy(() => import('@/components/templates/EditorSidebar'));
src/pages/templates/TemplatesCategoryPage.tsx:15:const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));
src/pages/templates/TemplatesHomePage.tsx:21:const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));
src/shell/FloatingLayer.tsx:18:const JudeChatbot = lazy(() => import('@/components/JudeChatbot').then(m => ({ default: m.JudeChatbot })));
src/shell/FloatingLayer.tsx:19:const GlobalMusicPlayer = lazy(() => import('@/components/GlobalMusicPlayer').then(m => ({ default: m.GlobalMusicPlayer })));
src/shell/FloatingLayer.tsx:20:const QuickMessageFAB = lazy(() => import('@/components/shared/QuickMessageFAB'));
src/shell/FloatingLayer.tsx:21:const CookieConsent = lazy(() => import('@/components/CookieConsent').then(m => ({ default: m.CookieConsent })));
src/shell/FloatingLayer.tsx:24:const VisitorTour = lazy(() => import('@/components/visitor/VisitorTour').then(m => ({ default: m.VisitorTour })));
src/shell/FloatingLayer.tsx:27:const FirstTimeUserWelcome = lazy(() => import('@/components/firsttime/FirstTimeUserWelcome'));
src/shell/FloatingLayer.tsx:28:const OnboardingQuiz = lazy(() => import('@/components/firsttime/OnboardingQuiz'));
src/shell/FloatingLayer.tsx:29:const AvatarGenerationStep = lazy(() => import('@/components/firsttime/AvatarGenerationStep'));
src/shell/FloatingLayer.tsx:30:const FirstTimeUserTour = lazy(() => import('@/components/firsttime/FirstTimeUserTour'));
src/shell/FloatingLayer.tsx:31:const PushPermissionPrompt = lazy(() => import('@/components/firsttime/PushPermissionPrompt'));
src/shell/FloatingLayer.tsx:34:const StreakMilestoneModal = lazy(() => import('@/components/dashboard/StreakMilestoneModal'));
src/shell/wrappers/NotificationBannerWrapper.tsx:9:const NotificationPermissionBanner = lazy(()
src/shell/wrappers/PWAPromptWrapper.tsx:10:const PWAInstallPrompt = lazy(()
src/shell/wrappers/SubscriptionExpiryBannerWrapper.tsx:10:const SubscriptionExpiryBanner = lazy(() => import('@/components/SubscriptionExpiryBanner'));
```

Fichier de routes détecté (`head -100 src/App.tsx`): le routeur principal est bien `src/App.tsx` et charge les pages via `lazy(...)` et `lazyWithRetry(...)`.

Imports directs de pages dans le fichier de routes:

```text
grep -n "^import .*pages/\|^import .*features/.*/pages/" src/App.tsx
=> 0 résultat
```

Constat:
- `src/App.tsx` ne charge pas directement de pages non-lazy.
- Le code splitting route-level est en place et assez systématique.
- Risque résiduel: certaines pages lazy restent énormes (`PassionDiscovery`, `Community`, `AnalyticsPage`).

## 3. REACT QUERY & DATA FETCHING

Config et usages `QueryClient` / `staleTime` / `gcTime`:

```text
src/providers/AppProviders.tsx:48:const queryClient = new QueryClient({
src/providers/AppProviders.tsx:51:      staleTime: 1000 * 60 * 5
src/providers/AppProviders.tsx:52:      gcTime: 1000 * 60 * 30
...
src/hooks/useFeedData.ts:128:    staleTime: 1000 * 60 * 2
src/hooks/useFeedData.ts:129:    gcTime: 1000 * 60 * 15
src/hooks/useLeaderboardData.ts:77:    staleTime: getStaleTimeFor('leaderboard')
src/hooks/useLeaderboardData.ts:78:    gcTime: 1000 * 60 * 30
src/hooks/useTemplates.ts:38:    staleTime: 30 * 60 * 1000
src/hooks/useTemplates.ts:39:    gcTime: 60 * 60 * 1000
src/hooks/useThemeSync.ts:37:    staleTime: Infinity
src/hooks/useThemeSync.ts:38:    gcTime: 1000 * 60 * 60
src/utils/networkAwareCache.ts:78:        staleTime: Infinity
src/utils/networkAwareCache.ts:79:        gcTime: 1000 * 60 * 60
```

Extrait de la config globale:

```text
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

```text
grep -rn "useQuery" src/ --include="*.tsx" --include="*.ts" | wc -l
148
```

Échantillon de 5 `useQuery`:

```text
src/components/AIAvatarGenerator.tsx:2:import { useQueryClient } from "@tanstack/react-query";
src/components/AIAvatarGenerator.tsx:215:  const queryClient = useQueryClient();
src/components/MobileBottomNav.tsx:4:import { useQueryClient } from "@tanstack/react-query";
src/components/MobileBottomNav.tsx:63:  const queryClient = useQueryClient();
src/components/YouTubeVideoSection.tsx:2:import { useQuery } from "@tanstack/react-query";
```

Constat:
- La stratégie React Query est cohérente et plutôt optimisée réseau.
- Le nombre d’usages est élevé (`148`), ce qui renforce l’importance de la cohérence des clés et des invalidations.

## 4. REALTIME SUBSCRIPTIONS (leaks potentiels)

Occurrences:

```text
src/contexts/PresenceContext.tsx
src/contexts/StreakContext.tsx
src/features/community/hooks/useCommunityRealtime.ts
src/features/community/hooks/useTypingIndicators.ts
src/hooks/useChessMultiplayer.ts
src/hooks/useFeed.ts
src/hooks/useQuizInvitations.ts
src/hooks/useRealtimeSubscription.ts
src/pages/QuizBattleLobby.tsx
src/shell/AppShell.tsx
src/utils/pushNotifications.ts
```

Analyse cleanup par fichier:

- `src/contexts/PresenceContext.tsx`: cleanup présent avec `supabase.removeChannel(...)`.
- `src/contexts/StreakContext.tsx`: cleanup présent.
- `src/features/community/hooks/useCommunityRealtime.ts`: cleanup présent pour `subscribeToMessages`; `subscribeToConversationMessages` remplace l’ancien channel via ref; `subscribeToReactions` crée un channel mais aucun cleanup explicite n’apparaît dans ce fichier.
- `src/features/community/hooks/useTypingIndicators.ts`: suppression préalable du channel avant resubscribe, mais pas de cleanup global des channels restants au `unmount`.
- `src/hooks/useChessMultiplayer.ts`: cleanup présent.
- `src/hooks/useFeed.ts`: cleanup présent.
- `src/hooks/useQuizInvitations.ts`: cleanup présent.
- `src/hooks/useRealtimeSubscription.ts`: cleanup présent à plusieurs endroits.
- `src/pages/QuizBattleLobby.tsx`: cleanup présent.
- `src/shell/AppShell.tsx`: cleanup présent pour `messagesChannel` et `notificationsChannel`.
- `src/utils/pushNotifications.ts`: faux positif, il s’agit de `pushManager.subscribe`, pas d’un channel Supabase.

Constat:
- La majorité des abonnements Supabase ont un cleanup correct.
- Deux zones méritent revue prioritaire: `useCommunityRealtime.ts` et `useTypingIndicators.ts`.

## 5. TYPESCRIPT — DETTE TECHNIQUE

```text
grep -rn "as any" src/ --include="*.ts" --include="*.tsx" | wc -l
130
```

Répartition par dossier:

```text
12 src/auth/services
11 src/features/content-editor
10 src/lib/analytics
8  src/components/content-editor
6  src/components/home
5  src/features/exams
4  src/components/settings
3  src/components/firsttime
2  src/components/quiz-battle
1  src/shell/hooks
1  src/components/visitor
1  src/components/jude3d
1  src/components/jude
1  src/components/exam
1  src/components/chess
1  src/auth/guards
```

Exemples notables:

```text
src/shell/AppShell.tsx:156: const notification = payload.new as any;
src/pages/ResetPassword.tsx:48: await supabase.rpc('check_reset_token' as any, ...)
src/hooks/useRealtimeSubscription.ts:54: 'postgres_changes' as any
src/hooks/useLessonsCache.ts:188: lessonsListCache.set(... subjectData as any ...)
src/components/JudeChatbot.tsx:366: return undefined as any;
```

```text
grep -rn "@ts-ignore\|@ts-nocheck" src/ --include="*.ts" --include="*.tsx"
=> aucun résultat
```

Constat:
- Pas de `@ts-ignore`, ce qui est positif.
- En revanche `130` usages de `as any` indiquent une dette de typage significative.
- `tsconfig.json` réduit encore la sûreté (`noImplicitAny: false`, `strictNullChecks: false`).

## 6. COMPOSANTS LOURDS

Top 20 `.tsx` les plus volumineux:

```text
1883 src/pages/PassionDiscovery.tsx
1813 src/components/content-editor/BatchLessonGenerator.tsx
1422 src/components/content-editor/PassionVideoManager.tsx
1405 src/pages/control-center/modules/WordsModule.tsx
1044 src/pages/Community.tsx
962  src/components/firsttime/OnboardingQuiz.tsx
897  src/pages/control-center/modules/PromoCodesModule.tsx
885  src/pages/AnalyticsPage.tsx
876  src/pages/ChessMultiplayerGame.tsx
867  src/pages/QuizBattleLobby.tsx
852  src/pages/Feed.tsx
813  src/pages/Notifications.tsx
806  src/components/feed/CreatePostDialog.tsx
776  src/components/AIAvatarGenerator.tsx
755  src/pages/QuizBattleMultiplayer.tsx
751  src/components/blog/BlogPostEditor.tsx
730  src/pages/control-center/modules/ReportsModule.tsx
719  src/components/exam/ExamTutorChat.tsx
715  src/components/GroupInfoDialog.tsx
708  src/components/settings/AccountTab.tsx
```

Composants >300 lignes:

```text
110 fichiers .tsx dépassent 300 lignes
```

Candidats refactor prioritaires:
- `src/pages/PassionDiscovery.tsx`
- `src/components/content-editor/BatchLessonGenerator.tsx`
- `src/components/content-editor/PassionVideoManager.tsx`
- `src/pages/control-center/modules/WordsModule.tsx`
- `src/pages/Community.tsx`

## 7. CONSOLE.LOG & DEBUG

Échantillon des logs résiduels:

```text
src/auth/guards/AuthRouteGuard.tsx:113: console.error('AuthRouteGuard: Error checking auth state:', error);
src/auth/routes/LoginPage.tsx:110: console.error('Lockout check failed:', error);
src/auth/services/device-verify.service.ts:204: console.error('Error creating device challenge:', error);
src/auth/services/device-verify.service.ts:227: console.error('Edge function invocation failed:', emailError);
src/auth/services/device-verify.service.ts:229: console.error('Email delivery error from edge function:', emailData.error);
src/auth/services/device-verify.service.ts:240: console.error('Error in createDeviceChallenge:', error);
src/auth/services/device-verify.service.ts:261: console.error('Error verifying device code:', error);
src/auth/services/device-verify.service.ts:305: console.error('Error in verifyDeviceCode:', error);
src/auth/services/device-verify.service.ts:324: console.error('Error resending device code:', error);
src/auth/services/device-verify.service.ts:360: console.error('Edge function invocation failed on resend:', emailError);
src/auth/services/device-verify.service.ts:362: console.error('Email delivery error on resend:', emailData.error);
src/auth/services/device-verify.service.ts:369: console.error('Error in resendDeviceCode:', error);
src/auth/services/gift-moncash.service.ts:50: console.error("MonCash gift link creation error:", error);
src/auth/services/gift-moncash.service.ts:59: console.error("MonCash gift link error:", err);
src/auth/services/gift-moncash.service.ts:89: console.error("MonCash gift payment error:", err);
src/auth/services/gift-moncash.service.ts:118: console.error("MonCash gift verify error:", err);
src/auth/services/gift.service.ts:52: console.error("Gift link creation error:", error);
src/auth/services/gift.service.ts:61: console.error("Gift link error:", err);
src/auth/services/gift.service.ts:89: console.error("Gift checkout error:", err);
src/auth/services/gift.service.ts:114: console.error("Gift verify error:", err);
```

```text
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "DEBUG\|isDev\|import.meta.env" | wc -l
591
```

Constat:
- Le build Vite supprime `console.log/info/debug`, mais pas `console.error/warn`.
- Le volume (`591`) reste élevé et pollue potentiellement les journaux client.

## 8. DÉPENDANCES INUTILISÉES

Commande demandée:

```text
npx depcheck --json 2>/dev/null || npx depcheck
=> non exploitable localement: `node_modules` absent
```

Vérification read-only sans installation:

```text
test -x node_modules/.bin/depcheck && node_modules/.bin/depcheck --json || echo 'depcheck not available locally (node_modules/.bin/depcheck missing)'
depcheck not available locally (node_modules/.bin/depcheck missing)
```

Conclusion:
- Audit non réalisable dans cet environnement sans installer les dépendances.
- Aucun package unused ne peut être confirmé de manière fiable ici.

## 9. DUPLICATIONS DE CODE

Commande demandée:

```text
npx jscpd src/ --min-lines 15 --min-tokens 70 --reporters console --silent
=> non exploitable localement: `node_modules` absent
```

Vérification read-only sans installation:

```text
test -x node_modules/.bin/jscpd && node_modules/.bin/jscpd src/ --min-lines 15 --min-tokens 70 --reporters console --silent | head -80 || echo 'jscpd not available locally (node_modules/.bin/jscpd missing)'
jscpd not available locally (node_modules/.bin/jscpd missing)
```

Conclusion:
- Mesure automatisée indisponible dans l’état actuel du workspace.
- Les gros composants `content-editor`, `community`, `quiz-battle` suggèrent malgré tout un risque fort de duplication.

## 10. TODO / FIXME OUBLIÉS

```text
src/components/settings/ProfileTab.tsx:359:                  placeholder="+509 XXXX XXXX"
src/lib/analytics/googleAnalytics.ts:6:const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with real Measurement ID
src/lib/analytics/googleAnalytics.ts:10:  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
src/pages/QuizBattle.tsx:172:                placeholder="XXXXXX"
src/pages/QuizBattleLobby.tsx:519:                  placeholder="XXXXXX"
```

Constat:
- Le grep demandé attrape surtout des placeholders `XXXXXX`, pas de vrais `TODO/FIXME/HACK` explicites.
- Le seul signal proche d’un oubli concret est `GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'`.

## 11. EDGE FUNCTIONS (analyse statique)

Liste des Edge Functions:

```text
88 entrées dans supabase/functions/
```

Noms:

```text
_shared
admin-delete-post
admin-delete-user-account
analyze-curriculum-pdf
anglais-practice-tutor
award-weekly-champion
bac-philosophy-tutor
batch-generate-word-audio
check-birthdays
check-jude-motivations
check-onboarding-emails
check-subscription-expiry
chess-ai-tutor
cleanup-old-jobs
content-ai-assistant
create-stripe-renewal
delete-user-account
elevenlabs-tts
eric-chat
exam-tutor
export-template
fix-invalid-activities
fix-invalid-quiz
francais-ai-tutor
generate-battle-questions
generate-custom-avatar
generate-exercise-explanation
generate-explanatory-images
generate-interactive-activities
generate-jude-feedback-audio
generate-jude-voice
generate-lesson-content
generate-lesson-section
generate-matiere-structure
generate-quiz-final
generate-quiz-quizgecko
generate-studygram
generate-studygram-visual
generate-word-audio
home-eric-chat
indexnow-submit
jude-ai-tutor
mark-notification-read
math-ai-tutor
moncash-check-status
moncash-create-payment
moncash-gift-payment
moncash-verify-payment
moncash-webhook
notify-mentions
parse-exam-vision
passion-ai-tutor
process-ai-job
reading-tutor
redeem-promo-code
reset-password
send-announcement
send-confirmation-email
send-daily-word-notification
send-device-verification-email
send-donation-thank-you
send-farewell-email
send-login-notification
send-password-reset-email
send-push-notification
send-report-confirmation
send-welcome-email
send-whatsapp-confirmation
spanish-practice-tutor
stripe-create-donation
stripe-donation-webhook
stripe-gift-payment
stripe-gift-webhook
submit-contact-form
suggest-youtube-videos
sync-internal-secret
test-all-emails
translate-text
update-streak
validate-activities-accuracy
validate-activities-content-alignment
validate-promo-code
validate-quiz-accuracy
validate-quiz-content-alignment
verify-gift-payment
verify-moncash-gift
verify-stripe-renewal
youtube-search
```

Taille de chaque `index.ts`:

```text
249 supabase/functions/admin-delete-post/index.ts
232 supabase/functions/admin-delete-user-account/index.ts
233 supabase/functions/analyze-curriculum-pdf/index.ts
211 supabase/functions/anglais-practice-tutor/index.ts
155 supabase/functions/award-weekly-champion/index.ts
276 supabase/functions/bac-philosophy-tutor/index.ts
216 supabase/functions/batch-generate-word-audio/index.ts
150 supabase/functions/check-birthdays/index.ts
322 supabase/functions/check-jude-motivations/index.ts
320 supabase/functions/check-onboarding-emails/index.ts
414 supabase/functions/check-subscription-expiry/index.ts
309 supabase/functions/chess-ai-tutor/index.ts
50  supabase/functions/cleanup-old-jobs/index.ts
783 supabase/functions/content-ai-assistant/index.ts
127 supabase/functions/create-stripe-renewal/index.ts
195 supabase/functions/delete-user-account/index.ts
196 supabase/functions/elevenlabs-tts/index.ts
303 supabase/functions/eric-chat/index.ts
611 supabase/functions/exam-tutor/index.ts
417 supabase/functions/export-template/index.ts
589 supabase/functions/fix-invalid-activities/index.ts
479 supabase/functions/fix-invalid-quiz/index.ts
387 supabase/functions/francais-ai-tutor/index.ts
357 supabase/functions/generate-battle-questions/index.ts
279 supabase/functions/generate-custom-avatar/index.ts
137 supabase/functions/generate-exercise-explanation/index.ts
322 supabase/functions/generate-explanatory-images/index.ts
490 supabase/functions/generate-interactive-activities/index.ts
163 supabase/functions/generate-jude-feedback-audio/index.ts
214 supabase/functions/generate-jude-voice/index.ts
335 supabase/functions/generate-lesson-content/index.ts
422 supabase/functions/generate-lesson-section/index.ts
207 supabase/functions/generate-matiere-structure/index.ts
478 supabase/functions/generate-quiz-final/index.ts
286 supabase/functions/generate-quiz-quizgecko/index.ts
373 supabase/functions/generate-studygram-visual/index.ts
228 supabase/functions/generate-studygram/index.ts
223 supabase/functions/generate-word-audio/index.ts
286 supabase/functions/home-eric-chat/index.ts
111 supabase/functions/indexnow-submit/index.ts
533 supabase/functions/jude-ai-tutor/index.ts
107 supabase/functions/mark-notification-read/index.ts
192 supabase/functions/math-ai-tutor/index.ts
131 supabase/functions/moncash-check-status/index.ts
201 supabase/functions/moncash-create-payment/index.ts
167 supabase/functions/moncash-gift-payment/index.ts
244 supabase/functions/moncash-verify-payment/index.ts
385 supabase/functions/moncash-webhook/index.ts
209 supabase/functions/notify-mentions/index.ts
334 supabase/functions/parse-exam-vision/index.ts
198 supabase/functions/passion-ai-tutor/index.ts
572 supabase/functions/process-ai-job/index.ts
192 supabase/functions/reading-tutor/index.ts
191 supabase/functions/redeem-promo-code/index.ts
141 supabase/functions/reset-password/index.ts
325 supabase/functions/send-announcement/index.ts
139 supabase/functions/send-confirmation-email/index.ts
363 supabase/functions/send-daily-word-notification/index.ts
164 supabase/functions/send-device-verification-email/index.ts
139 supabase/functions/send-donation-thank-you/index.ts
202 supabase/functions/send-farewell-email/index.ts
135 supabase/functions/send-login-notification/index.ts
121 supabase/functions/send-password-reset-email/index.ts
398 supabase/functions/send-push-notification/index.ts
103 supabase/functions/send-report-confirmation/index.ts
126 supabase/functions/send-welcome-email/index.ts
93  supabase/functions/send-whatsapp-confirmation/index.ts
181 supabase/functions/spanish-practice-tutor/index.ts
137 supabase/functions/stripe-create-donation/index.ts
125 supabase/functions/stripe-donation-webhook/index.ts
169 supabase/functions/stripe-gift-payment/index.ts
235 supabase/functions/stripe-gift-webhook/index.ts
81  supabase/functions/submit-contact-form/index.ts
288 supabase/functions/suggest-youtube-videos/index.ts
57  supabase/functions/sync-internal-secret/index.ts
550 supabase/functions/test-all-emails/index.ts
183 supabase/functions/translate-text/index.ts
209 supabase/functions/update-streak/index.ts
188 supabase/functions/validate-activities-accuracy/index.ts
227 supabase/functions/validate-activities-content-alignment/index.ts
121 supabase/functions/validate-promo-code/index.ts
185 supabase/functions/validate-quiz-accuracy/index.ts
196 supabase/functions/validate-quiz-content-alignment/index.ts
252 supabase/functions/verify-gift-payment/index.ts
282 supabase/functions/verify-moncash-gift/index.ts
216 supabase/functions/verify-stripe-renewal/index.ts
132 supabase/functions/youtube-search/index.ts
22254 total
```

Imports externes les plus fréquents:

```text
52 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
37 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
36 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
30 import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
22 import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
18 import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
12 import { Resend } from "https://esm.sh/resend@4.0.0";
11 import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
10 import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";
10 import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";
9  import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";
7  import Stripe from "https://esm.sh/stripe@18.5.0";
6  import { createClient } from "npm:@supabase/supabase-js@2.57.2";
5  import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
```

Constat:
- Surface serveur très large: `88` fonctions, `22 254` lignes cumulées.
- Hétérogénéité de versions Deno Std et Supabase JS.
- Plusieurs fonctions dépassent 500 lignes (`content-ai-assistant`, `exam-tutor`, `process-ai-job`, `test-all-emails`).

## 12. CONFIGURATION CRITIQUE

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  cacheDir: "node_modules/.vite-edupreneurs-v4",
  optimizeDeps: {
    exclude: ["react-chessboard"],
    include: ["next-themes", "react-router-dom", "framer-motion"],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      exclude: [
        '**/jude-profile-transparent.png',
        '**/champion-transparent.png',
        '**/jude-passion-discovery.png',
      ],
      png: { quality: 65, compressionLevel: 9, palette: false },
      jpeg: { quality: 65, mozjpeg: true },
      jpg: { quality: 65, mozjpeg: true },
      webp: { lossless: false, quality: 65, alphaQuality: 70, effort: 6, smartSubsample: true },
      avif: { lossless: false, quality: 45, effort: 9, chromaSubsampling: '4:2:0' },
      gif: {},
      svg: {
        plugins: [
          'removeViewBox',
          'sortAttrs',
          'removeDimensions',
          'removeMetadata',
          'removeComments',
          'cleanupIds',
        ],
      },
      cache: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom", "framer-motion", "three", "@react-three/fiber"],
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
      format: { comments: false },
    },
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router')) return 'react-core';
          if (id.includes('@supabase/')) return 'supabase';
          if (id.includes('@tanstack/')) return 'query';
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
}));
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strictNullChecks": false
  },
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

```text
cat package.json | grep -c '"'
111
```

Constat:
- `vite.config.ts` contient déjà des optimisations utiles, mais elles compensent un volume applicatif encore très élevé.
- `tsconfig.json` privilégie la permissivité à la robustesse.

## RÉSUMÉ EXÉCUTIF

### 🔴 Top 5 Red Flags
- `node_modules` absent: impossible de valider build, unused deps ou duplications de manière fiable dans cet environnement.
- Assets image extrêmement lourds: plusieurs fichiers à `2.6-3.0 Mo`, avec doublons entre `src/assets/` et `public/images/`.
- Données métier massivement embarquées dans le frontend: `src/data/*.ts` contient des fichiers jusqu’à `13 926` lignes.
- Dette TypeScript importante: `130` usages de `as any`, plus `strictNullChecks: false` et `noImplicitAny: false`.
- Surface realtime complexe avec risque de fuite sur `useCommunityRealtime.ts` et `useTypingIndicators.ts`.

### 🟡 Top 5 Améliorations Moyennes
- Réduire les composants géants: `110` fichiers `.tsx` dépassent `300` lignes.
- Standardiser les imports Edge Functions: versions Deno Std et Supabase JS hétérogènes.
- Réduire les logs client: `591` occurrences `console.*` hors filtres dev.
- Compléter l’hygiène image HTML: `126` balises `<img>` sans `loading=`, `138` sans `width/height`.
- Vérifier le paramétrage analytics: `GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'` ressemble à une config non finalisée.

### 🟢 Top 5 Quick Wins
- Tout le routeur principal `src/App.tsx` est déjà lazy-loaded: base saine pour continuer le découpage.
- React Query est bien configuré globalement pour limiter les refetchs réseau.
- Ajouter `loading="lazy"` et dimensions explicites sur les `<img>` restants.
- Éliminer les doublons d’images entre `src/assets/` et `public/images/`.
- Prioriser la refonte de 5 fichiers critiques: `PassionDiscovery.tsx`, `BatchLessonGenerator.tsx`, `PassionVideoManager.tsx`, `WordsModule.tsx`, `Community.tsx`.
