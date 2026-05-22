import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, ComponentType, useEffect } from "react";
import { AppProviders } from "@/providers/AppProviders";
import { LegacyRedirect } from "@/components/LegacyRedirect";
import { HeroSkeleton } from "@/components/shared/HeroSkeleton";
import { DashboardFullSkeleton } from "@/components/shared/SkeletonLoaders";
import { 
  AuthSkeleton, 
  CommunitySkeleton, 
  FeedSkeleton, 
  ProfileSkeleton, 
  MatieresSkeleton,
  NotificationsSkeleton,
  CourseSkeleton,
  GenericPageSkeleton 
} from "@/components/shared/PageSkeletons";
import { AppShell } from "@/shell";
import { AuthMusicSync } from "@/components/auth/AuthMusicSync";
import { VisitorMusicSync } from "@/components/visitor/VisitorMusicSync";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { initTikTokPixel, trackPageView as trackTikTokPageView } from "@/lib/analytics/tiktokPixel";
import { initGoogleAnalytics, trackGAPageView } from "@/lib/analytics/googleAnalytics";

/**
 * Wrap lazy import with automatic retry on chunk load failure.
 * If the chunk fails to load (stale cache), reload the page to get fresh chunks.
 * Prevents infinite reload loops with a 5-second cooldown.
 */
function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(() =>
    importFn().catch((error) => {
      // Check if it's a chunk load error
      if (error?.message?.includes('Failed to fetch dynamically imported module') ||
          error?.message?.includes('Loading chunk') ||
          error?.message?.includes('Loading CSS chunk')) {
        // Only reload if we haven't just reloaded
        const lastReload = sessionStorage.getItem('chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 5000) {
          sessionStorage.setItem('chunk_reload', now.toString());
          window.location.reload();
        }
      }
      throw error;
    })
  );
}

// Lazy load all pages for better 3G performance
const Index = lazy(() => import("./pages/Index"));

// Auth routes - Route-based architecture for persistent flow state
const AuthLayout = lazy(() => import("./auth/layout/AuthLayout").then(m => ({ default: m.AuthLayout })));
const LoginPage = lazy(() => import("./auth/routes/LoginPage"));
const SignupLayout = lazy(() => import("./auth/routes/signup/SignupLayout"));
const SignupStep1 = lazy(() => import("./auth/routes/signup/Step1"));
// SignupStep2 removed — profile fields moved to post-login OnboardingQuiz
const SignupStep3 = lazy(() => import("./auth/routes/signup/Step3"));
const SignupPaymentCallback = lazy(() => import("./auth/routes/signup/SignupPaymentCallback"));
const GoogleSetupPage = lazy(() => import("./pages/auth/GoogleSetupPage"));
const VerifyEmailPage = lazy(() => import("./auth/routes/VerifyEmailPage"));
const VerifyDevicePage = lazy(() => import("./auth/routes/VerifyDevicePage"));
const ForgotPasswordPage = lazy(() => import("./auth/routes/ForgotPasswordPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Lazy load non-critical pages for better performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Matieres = lazy(() => import("./pages/Matieres"));
const ExamPreparation = lazy(() => import("./pages/ExamPreparation"));
const ExamsHub = lazy(() => import("./pages/ExamsHub"));
const ExamsHubPage = lazy(() => import("./features/exams/pages/ExamsHubPage"));
const Resources = lazy(() => import("./pages/Resources"));
const Affiliations = lazy(() => import("./pages/Affiliations"));
const Settings = lazy(() => import("./pages/Settings"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Feed = lazy(() => import("./pages/Feed"));
const UserSearch = lazy(() => import("./pages/UserSearch"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FollowRequests = lazy(() => import("./pages/FollowRequests"));
const Community = lazy(() => import("./pages/Community"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookieSettings = lazy(() => import("./pages/CookieSettings"));
const Terms = lazy(() => import("./pages/Terms"));

const DynamicCoursePage = lazy(() => import("./pages/DynamicCoursePage"));
const DynamicLessonPage = lazy(() => import("./pages/DynamicLessonPage"));
// NotificationSettings removed — consolidated into Settings notifications tab

const CustomizeAI = lazy(() => import("./pages/CustomizeAI"));

// Demo page — public, no auth
const DemoLessonPage = lazy(() => import("./pages/DemoLessonPage"));

// Use lazyWithRetry for routes that have been experiencing chunk load failures
const PassionDiscovery = lazyWithRetry(() => import("./pages/PassionDiscovery"));
const ChessGame = lazy(() => import("./pages/ChessGame"));
const ChessMultiplayerLobby = lazy(() => import("./pages/ChessMultiplayerLobby"));
const ChessMultiplayerGame = lazy(() => import("./pages/ChessMultiplayerGame"));
const GamesHub = lazy(() => import("./pages/GamesHub"));
const QuizBattle = lazy(() => import("./pages/QuizBattle"));
const QuizBattleSolo = lazy(() => import("./pages/QuizBattleSolo"));
const QuizBattleLobby = lazy(() => import("./pages/QuizBattleLobby"));
const QuizBattleMultiplayer = lazy(() => import("./pages/QuizBattleMultiplayer"));
const QuizBattleLeaderboard = lazy(() => import("./pages/QuizBattleLeaderboard"));
const ControlCenter = lazy(() => import("./pages/ControlCenter"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ContentEditor = lazy(() => import("./pages/ContentEditor"));
const AIGenerationAnalytics = lazy(() => import("./pages/AIGenerationAnalytics"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const BaccExamsHub = lazy(() => import("./pages/BaccExamsHub"));
const Library = lazy(() => import("./pages/Library"));
const EbookReader = lazy(() => import("./pages/EbookReader"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Donate = lazy(() => import("./pages/Donate"));
const DonationSuccessCallback = lazy(() => import("./components/donate/DonationSuccessCallback"));
const GiftPayment = lazy(() => import("./pages/GiftPayment"));
const GiftPaymentSuccess = lazy(() => import("./pages/GiftPaymentSuccess"));
const GiftMonCashPayment = lazy(() => import("./pages/GiftMonCashPayment"));
const GiftMonCashCallback = lazy(() => import("./pages/GiftMonCashCallback"));
const StripeRenewalCallback = lazy(() => import("./pages/StripeRenewalCallback"));

// Templates (public, no auth)
const TemplatesHomePage = lazy(() => import("./pages/templates/TemplatesHomePage"));
const TemplatesCategoryPage = lazy(() => import("./pages/templates/TemplatesCategoryPage"));
const TemplateEditorPage = lazy(() => import("./pages/templates/TemplateEditorPage"));

// Translate (public, no auth)
const Translate = lazy(() => import("./pages/Translate"));
const Decouvrir = lazyWithRetry(() => import("./pages/Decouvrir"));

/**
 * AnalyticsInitializer — consent-gated initialization of GA4 and TikTok Pixel.
 * Must be rendered inside BrowserRouter (needs useLocation) and AppProviders.
 * Returns null — pure side-effect component.
 */
function AnalyticsInitializer() {
  const { isAllowed } = useCookieConsent();
  const location = useLocation();

  // Initialize analytics scripts once consent is granted
  useEffect(() => {
    if (isAllowed('analytics')) initGoogleAnalytics();
  }, [isAllowed]);

  useEffect(() => {
    if (isAllowed('marketing')) initTikTokPixel();
  }, [isAllowed]);

  // Track page views on route changes
  useEffect(() => {
    if (isAllowed('analytics')) trackGAPageView(location.pathname);
    if (isAllowed('marketing')) trackTikTokPageView();
  }, [location.pathname, isAllowed]);

  return null;
}

/**
 * Main App Component
 * 
 * Uses the rationalized AppProviders for optimal provider stacking.
 * All authenticated routes are wrapped in AppShell for persistent UI.
 */
const App = () => (
  <AppProviders>
    {/* Consent-gated analytics — no scripts load until cookie consent given */}
    <AnalyticsInitializer />
    {/* Global music sync - must be outside AppShell to survive logout navigation */}
    <AuthMusicSync />
    <VisitorMusicSync />
    
    <Routes>
                        {/* PUBLIC ROUTES - No shell */}
                        <Route path="/" element={
                          <Suspense fallback={<HeroSkeleton />}>
                            <Index />
                          </Suspense>
                        } />
                        <Route path="/blog" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <Blog />
                          </Suspense>
                        } />
                        <Route path="/blog/:slug" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <BlogPost />
                          </Suspense>
                        } />
                        <Route path="/privacy-policy" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <PrivacyPolicy />
                          </Suspense>
                        } />
                        <Route path="/cookie-settings" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <CookieSettings />
                          </Suspense>
                        } />
                        <Route path="/terms" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <Terms />
                          </Suspense>
                        } />
                        
                        {/* Donate - Public, no shell */}
                        <Route path="/donate" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <Donate />
                          </Suspense>
                        } />
                        <Route path="/donate/callback" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <DonationSuccessCallback />
                          </Suspense>
                        } />
                        
                        {/* Gift Payment - Public, no shell */}
                        <Route path="/gift/pay/:token" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <GiftPayment />
                          </Suspense>
                        } />
                        <Route path="/gift/success" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <GiftPaymentSuccess />
                          </Suspense>
                        } />
                        <Route path="/gift/moncash/callback" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <GiftMonCashCallback />
                          </Suspense>
                        } />
                        <Route path="/gift/moncash/:token" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <GiftMonCashPayment />
                          </Suspense>
                        } />
                        
                        {/* Templates - Public, no shell */}
                        <Route path="/templates" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <TemplatesHomePage />
                          </Suspense>
                        } />
                        <Route path="/templates/:category" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <TemplatesCategoryPage />
                          </Suspense>
                        } />
                        <Route path="/templates/edit/:slug" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <TemplateEditorPage />
                          </Suspense>
                        } />
                        
                        {/* Demo lesson — public visitor preview, no auth */}
                        <Route path="/demo/lesson" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <DemoLessonPage />
                          </Suspense>
                        } />

                        {/* Translate - Public, no auth */}
                        <Route path="/translate" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <Translate />
                          </Suspense>
                        } />

                        {/* Page promo publique — vidéo cinématique 75s */}
                        <Route path="/decouvrir" element={
                          <Suspense fallback={<GenericPageSkeleton />}>
                            <Decouvrir />
                          </Suspense>
                        } />
                        
                        {/* AUTH ROUTES - Auth shell */}
                        <Route path="/auth" element={
                          <Suspense fallback={<AuthSkeleton />}>
                            <AuthLayout />
                          </Suspense>
                        }>
                          <Route index element={<LoginPage />} />
                          <Route path="login" element={<LoginPage />} />
                          <Route path="signup" element={<SignupLayout />}>
                            <Route index element={<SignupStep1 />} />
                            <Route path="step-1" element={<SignupStep1 />} />
                            {/* Step 2 removed — redirect legacy URLs to step 3 */}
                            <Route path="step-2" element={<Navigate to="/auth/signup/step-3" replace />} />
                            <Route path="step-3" element={<SignupStep3 />} />
                          </Route>
                          <Route path="signup/payment-callback" element={<SignupPaymentCallback />} />
                          <Route path="google-setup" element={<GoogleSetupPage />} />
                          <Route path="verify-email" element={<VerifyEmailPage />} />
                          <Route path="verify-device" element={<VerifyDevicePage />} />
                          <Route path="forgot-password" element={<ForgotPasswordPage />} />
                        </Route>
                        <Route path="/reset-password" element={
                          <Suspense fallback={<AuthSkeleton />}>
                            <ResetPassword />
                          </Suspense>
                        } />
                        
                        {/* AUTHENTICATED ROUTES - AppShell */}
                        <Route element={<AppShell />}>
                          {/* Dashboard */}
                          <Route path="/dashboard" element={
                            <Suspense fallback={<DashboardFullSkeleton />}>
                              <Dashboard />
                            </Suspense>
                          } />
                          
                          {/* Learning */}
                          <Route path="/matieres" element={
                            <Suspense fallback={<MatieresSkeleton />}>
                              <Matieres />
                            </Suspense>
                          } />
                          <Route path="/course/:slug" element={
                            <Suspense fallback={<CourseSkeleton />}>
                              <DynamicCoursePage />
                            </Suspense>
                          } />
                          <Route path="/course/:slug/:lessonSlug" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <DynamicLessonPage />
                            </Suspense>
                          } />
                          <Route path="/resources" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <Resources />
                            </Suspense>
                          } />
                          <Route path="/lecture" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <Library />
                            </Suspense>
                          } />
                          <Route path="/lecture/:ebookId" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <EbookReader />
                            </Suspense>
                          } />
                          
                          {/* Social */}
                          <Route path="/feed" element={
                            <Suspense fallback={<FeedSkeleton />}>
                              <Feed />
                            </Suspense>
                          } />
                          <Route path="/community" element={
                            <Suspense fallback={<CommunitySkeleton />}>
                              <Community />
                            </Suspense>
                          } />
                          <Route path="/profile/:userId" element={
                            <Suspense fallback={<ProfileSkeleton />}>
                              <Profile />
                            </Suspense>
                          } />
                          <Route path="/notifications" element={
                            <Suspense fallback={<NotificationsSkeleton />}>
                              <Notifications />
                            </Suspense>
                          } />
                          <Route path="/user-search" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <UserSearch />
                            </Suspense>
                          } />
                          <Route path="/follow-requests" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <FollowRequests />
                            </Suspense>
                          } />
                          
                          {/* Games */}
                          <Route path="/games" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <GamesHub />
                            </Suspense>
                          } />
                          <Route path="/chess-game" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ChessGame />
                            </Suspense>
                          } />
                          <Route path="/chess-multiplayer" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ChessMultiplayerLobby />
                            </Suspense>
                          } />
                          <Route path="/chess-multiplayer/game/:matchId" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ChessMultiplayerGame />
                            </Suspense>
                          } />
                          <Route path="/quiz-battle" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <QuizBattle />
                            </Suspense>
                          } />
                          <Route path="/quiz-battle/solo" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <QuizBattleSolo />
                            </Suspense>
                          } />
                          <Route path="/quiz-battle/lobby" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <QuizBattleLobby />
                            </Suspense>
                          } />
                          <Route path="/quiz-battle/multiplayer/:battleId" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <QuizBattleMultiplayer />
                            </Suspense>
                          } />
                          <Route path="/quiz-battle/leaderboard" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <QuizBattleLeaderboard />
                            </Suspense>
                          } />
                          
                          {/* Profile & Settings */}
                          <Route path="/leaderboard" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <Leaderboard />
                            </Suspense>
                          } />
                          <Route path="/affiliations" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <Affiliations />
                            </Suspense>
                          } />
                          <Route path="/settings" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <Settings />
                            </Suspense>
                          } />
                          {/* /notification-settings redirects to Settings notifications tab */}
                          <Route path="/notification-settings" element={<Navigate to="/settings?tab=notifications" replace />} />
                          <Route path="/customize-ai" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <CustomizeAI />
                            </Suspense>
                          } />
                          <Route path="/passion-discovery" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <PassionDiscovery />
                            </Suspense>
                          } />
                          
                          {/* Exams - Unified Hub */}
                          <Route path="/exams" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ExamsHubPage />
                            </Suspense>
                          } />
                          <Route path="/exams/:track" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ExamsHubPage />
                            </Suspense>
                          } />
                          <Route path="/exams/:track/:series" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ExamsHubPage />
                            </Suspense>
                          } />
                          <Route path="/exams/:track/:series/:subject" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ExamsHubPage />
                            </Suspense>
                          } />
                          <Route path="/exams/practice/:examId" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ExamPreparation />
                            </Suspense>
                          } />
                          
                          {/* Legacy Exam Routes - Redirect to unified hub */}
                          <Route path="/examens-officiels" element={<LegacyRedirect to="/exams/9AF" />} />
                          <Route path="/exam-preparation/:examId" element={<LegacyRedirect to="/exams/practice/:examId" preserveParams />} />
                          <Route path="/baccalaureat" element={<LegacyRedirect to="/exams/NS4" />} />
                          <Route path="/baccalaureat/:series" element={<LegacyRedirect to="/exams/NS4/:series" preserveParams />} />
                          <Route path="/baccalaureat/:series/:subject" element={<LegacyRedirect to="/exams/NS4/:series/:subject" preserveParams />} />
                          
                          {/* Admin */}
                          <Route path="/control-center" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ControlCenter />
                            </Suspense>
                          } />
                          <Route path="/analytics" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <AnalyticsPage />
                            </Suspense>
                          } />
                          <Route path="/content-editor" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <ContentEditor />
                            </Suspense>
                          } />
                          <Route path="/ai-analytics" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <AIGenerationAnalytics />
                            </Suspense>
                          } />
                          {/* Dev & Demo */}
                          <Route path="/onboarding" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <Onboarding />
                            </Suspense>
                          } />
                          <Route path="/payment/callback" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <PaymentCallback />
                            </Suspense>
                          } />
                          <Route path="/payment/stripe-renewal-callback" element={
                            <Suspense fallback={<GenericPageSkeleton />}>
                              <StripeRenewalCallback />
                            </Suspense>
                          } />
                        </Route>
                        
      {/* Legacy route redirects */}
      <Route path="/math-course" element={<LegacyRedirect to="/course/mathematiques" />} />
      <Route path="/math-lesson/:topicId" element={<LegacyRedirect to="/course/mathematiques/:topicId" preserveParams />} />
      <Route path="/math-af8-course" element={<LegacyRedirect to="/course/matematik-8af" />} />
      <Route path="/math-af8-lesson/:topicId" element={<LegacyRedirect to="/course/matematik-8af/:topicId" preserveParams />} />
      <Route path="/mathematiques-af9" element={<LegacyRedirect to="/course/mathematiques-af9" />} />
      <Route path="/mathematiques-af9/:lessonSlug" element={<LegacyRedirect to="/course/mathematiques-af9/:lessonSlug" preserveParams />} />
      <Route path="/sciences-experimentales-af9" element={<LegacyRedirect to="/course/sciences-experimentales" />} />
      <Route path="/sciences-experimentales-af9/:lessonSlug" element={<LegacyRedirect to="/course/sciences-experimentales/:lessonSlug" preserveParams />} />
      <Route path="/sciences-experimentales-7af" element={<LegacyRedirect to="/course/sciences-experimentales-7af" />} />
      <Route path="/sciences-experimentales-7af/:lessonSlug" element={<LegacyRedirect to="/course/sciences-experimentales-7af/:lessonSlug" preserveParams />} />
      <Route path="/anglais-af9" element={<LegacyRedirect to="/course/anglais-af9" />} />
      <Route path="/anglais-af9/:lessonSlug" element={<LegacyRedirect to="/course/anglais-af9/:lessonSlug" preserveParams />} />
      <Route path="/sciences-course" element={<LegacyRedirect to="/course/sciences-experimentales-7af" />} />
      <Route path="/sciences-lesson/:topicId" element={<LegacyRedirect to="/course/sciences-experimentales-7af/:topicId" preserveParams />} />
      <Route path="/sciences-af8-course" element={<LegacyRedirect to="/course/sciences-experimentales-8af" />} />
      <Route path="/sciences-af8-lesson/:topicId" element={<LegacyRedirect to="/course/sciences-experimentales-8af/:topicId" preserveParams />} />
      <Route path="/anglais-course" element={<LegacyRedirect to="/course/anglais" />} />
      <Route path="/anglais-lesson/:topicId" element={<LegacyRedirect to="/course/anglais/:topicId" preserveParams />} />
      <Route path="/anglais-af8-course" element={<LegacyRedirect to="/course/anglais-8af" />} />
      <Route path="/anglais-af8-lesson/:topicId" element={<LegacyRedirect to="/course/anglais-8af/:topicId" preserveParams />} />
      <Route path="/espagnol-course" element={<LegacyRedirect to="/course/espagnol" />} />
      <Route path="/espagnol-lesson/:topicId" element={<LegacyRedirect to="/course/espagnol/:topicId" preserveParams />} />
      <Route path="/espagnol-af8-course" element={<LegacyRedirect to="/course/espagnol-8af" />} />
      <Route path="/espagnol-af8-lesson/:topicId" element={<LegacyRedirect to="/course/espagnol-8af/:topicId" preserveParams />} />
      <Route path="/espagnol-af9" element={<LegacyRedirect to="/course/espagnol-af9" />} />
      <Route path="/espagnol-af9/:lessonSlug" element={<LegacyRedirect to="/course/espagnol-af9/:lessonSlug" preserveParams />} />
      <Route path="/francais-course" element={<LegacyRedirect to="/course/francais" />} />
      <Route path="/francais-lesson/:topicId" element={<LegacyRedirect to="/course/francais/:topicId" preserveParams />} />
      <Route path="/francais-af9" element={<LegacyRedirect to="/course/français-9af" />} />
      <Route path="/francais-af9/:lessonSlug" element={<LegacyRedirect to="/course/français-9af/:lessonSlug" preserveParams />} />
      <Route path="/sciences-sociales-course" element={<LegacyRedirect to="/course/sciences-sociales" />} />
      <Route path="/sciences-sociales-lesson/:topicId" element={<LegacyRedirect to="/course/sciences-sociales/:topicId" preserveParams />} />
      <Route path="/sciences-sociales-af8-course" element={<LegacyRedirect to="/course/sciences-sociales-8af" />} />
      <Route path="/sciences-sociales-af8-lesson/:topicId" element={<LegacyRedirect to="/course/sciences-sociales-8af/:topicId" preserveParams />} />
      <Route path="/histoire-geographie-7af-course" element={<LegacyRedirect to="/course/histoire-geographie-7af" />} />
      <Route path="/creole-course" element={<LegacyRedirect to="/course/creole" />} />
      <Route path="/creole-lesson/:topicId" element={<LegacyRedirect to="/course/creole/:topicId" preserveParams />} />
      <Route path="/creole-af8-course" element={<LegacyRedirect to="/course/creole-8af" />} />
      <Route path="/creole-af8-lesson/:topicId" element={<LegacyRedirect to="/course/creole-8af/:topicId" preserveParams />} />
      <Route path="/arts-course" element={<LegacyRedirect to="/course/arts" />} />
      <Route path="/arts-lesson/:topicId" element={<LegacyRedirect to="/course/arts/:topicId" preserveParams />} />
      <Route path="/education-physique-course" element={<LegacyRedirect to="/course/education-physique" />} />
      <Route path="/education-physique-lesson/:topicId" element={<LegacyRedirect to="/course/education-physique/:topicId" preserveParams />} />
      
      {/* 404 */}
      <Route path="*" element={
        <Suspense fallback={<GenericPageSkeleton />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  </AppProviders>
);

export default App;
