import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { VisitorProvider } from "@/contexts/VisitorContext";
import { FirstTimeUserProvider } from "@/contexts/FirstTimeUserContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { SessionAuthProvider } from "@/contexts/SessionAuthContext";
import { PresenceProvider } from "@/contexts/PresenceContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";
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

// CRITICAL: Lazy load non-critical UI components to reduce initial bundle (~100-150KB deferred)
// These components are not needed for first paint and can load after hydration
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const GlobalMusicPlayer = lazy(() => import("@/components/GlobalMusicPlayer").then(m => ({ default: m.GlobalMusicPlayer })));
const JudeChatbot = lazy(() => import("@/components/JudeChatbot").then(m => ({ default: m.JudeChatbot })));
const VisitorBanner = lazy(() => import("@/components/visitor").then(m => ({ default: m.VisitorBanner })));
const VisitorMusicSync = lazy(() => import("@/components/visitor/VisitorMusicSync").then(m => ({ default: m.VisitorMusicSync })));
const VisitorTour = lazy(() => import("@/components/visitor/VisitorTour").then(m => ({ default: m.VisitorTour })));

// Lazy load first-time user components for better 3G performance (~100KB deferred)
const FirstTimeUserWelcome = lazy(() => import("@/components/firsttime/FirstTimeUserWelcome"));
const FirstTimeUserTour = lazy(() => import("@/components/firsttime/FirstTimeUserTour"));
const AvatarGenerationStep = lazy(() => import("@/components/firsttime/AvatarGenerationStep"));

// Lazy load all pages for better 3G performance
const Index = lazy(() => import("./pages/Index"));

// Auth routes - Route-based architecture for persistent flow state
const AuthLayout = lazy(() => import("./auth/layout/AuthLayout").then(m => ({ default: m.AuthLayout })));
const LoginPage = lazy(() => import("./auth/routes/LoginPage"));
const SignupLayout = lazy(() => import("./auth/routes/signup/SignupLayout"));
const SignupStep1 = lazy(() => import("./auth/routes/signup/Step1"));
const SignupStep2 = lazy(() => import("./auth/routes/signup/Step2"));
const SignupStep3 = lazy(() => import("./auth/routes/signup/Step3"));
const VerifyEmailPage = lazy(() => import("./auth/routes/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./auth/routes/ForgotPasswordPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Lazy load non-critical pages for better performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Matieres = lazy(() => import("./pages/Matieres"));
const ExamPreparation = lazy(() => import("./pages/ExamPreparation"));
const ExamsHub = lazy(() => import("./pages/ExamsHub"));
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
const DevPush = lazy(() => import("./pages/DevPush"));
const DynamicCoursePage = lazy(() => import("./pages/DynamicCoursePage"));
const DynamicLessonPage = lazy(() => import("./pages/DynamicLessonPage"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const EmailTest = lazy(() => import("./pages/EmailTest"));
const UploadEmailAssets = lazy(() => import("./pages/UploadEmailAssets"));
const CustomizeAI = lazy(() => import("./pages/CustomizeAI"));
const PassionDiscovery = lazy(() => import("./pages/PassionDiscovery"));
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
const ContentEditor = lazy(() => import("./pages/ContentEditor"));
const DataMigration = lazy(() => import("./pages/DataMigration"));
const AIGenerationAnalytics = lazy(() => import("./pages/AIGenerationAnalytics"));
const MigratePDFs = lazy(() => import("./pages/MigratePDFs"));
const PaymentDemo = lazy(() => import("./pages/PaymentDemo"));
const NatCashDemo = lazy(() => import("./pages/NatCashDemo"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminPaymentsDemo = lazy(() => import("./pages/AdminPaymentsDemo"));
const BaccExamsHub = lazy(() => import("./pages/BaccExamsHub"));
const Library = lazy(() => import("./pages/Library"));
const EbookReader = lazy(() => import("./pages/EbookReader"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// Eric Chatbot wrapper with route-based visibility - LAZY LOADED
const EricChatbotWrapper = () => {
  const location = useLocation();
  
  // Pages where Eric should be hidden
  const hiddenRoutes = [
    '/',
    '/auth',
    '/auth/login',
    '/auth/signup',
    '/auth/signup/step-1',
    '/auth/signup/step-2',
    '/auth/signup/step-3',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/reset-password',
    '/onboarding',
    '/community',
    '/feed',
    '/chess-game',
    '/chess-multiplayer',
    '/privacy-policy',
    '/passion-discovery',
    '/quiz-battle/lobby',
    '/quiz-battle/solo',
    '/blog',
  ];
  
  // Also hide on quiz battle multiplayer game pages, blog posts, and chess multiplayer
  const isQuizBattleGame = location.pathname.startsWith('/quiz-battle/multiplayer/');
  const isChessMultiplayerGame = location.pathname.startsWith('/chess-multiplayer/game/');
  const isBlogPost = location.pathname.startsWith('/blog/');
  
  const isLessonPage = location.pathname.startsWith('/course/') && location.pathname.split('/').length > 2;
  const isLecturePage = location.pathname.startsWith('/lecture/');
  const isHidden = hiddenRoutes.includes(location.pathname) || isLessonPage || isLecturePage || isQuizBattleGame || isChessMultiplayerGame || isBlogPost;
  
  if (isHidden) return null;
  
  return (
    <div data-tour="jude-chatbot">
      <Suspense fallback={null}>
        <JudeChatbot />
      </Suspense>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
      retry: 1, // Only retry failed requests once
    },
  },
});

// Auth state change listener moved to SessionAuthContext for centralized management

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionAuthProvider>
      <PresenceProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme={undefined}>
          <NetworkProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <MusicPlayerProvider>
                <VisitorProvider>
                  <BrowserRouter>
                    <FirstTimeUserProvider>
                <ScrollToTop />
                
                {/* CRITICAL: Non-blocking UI components - lazy loaded with null fallback */}
                <Suspense fallback={null}>
                  <CookieConsent />
                </Suspense>
                <Suspense fallback={null}>
                  <GlobalMusicPlayer />
                </Suspense>
                <Suspense fallback={null}>
                  <VisitorMusicSync />
                </Suspense>
                <Suspense fallback={null}>
                  <VisitorTour />
                </Suspense>
                <Suspense fallback={null}>
                  <FirstTimeUserWelcome />
                  <AvatarGenerationStep />
                  <FirstTimeUserTour />
                </Suspense>
                
                <EricChatbotWrapper />
                
              {/* Route-specific Suspense boundaries with page-specific skeletons */}
              <Routes>
                {/* Critical routes - specialized skeletons for perceived performance */}
                <Route path="/" element={
                  <Suspense fallback={<HeroSkeleton />}>
                    <Index />
                  </Suspense>
                } />
                {/* Auth routes - Route-based architecture */}
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
                    <Route path="step-2" element={<SignupStep2 />} />
                    <Route path="step-3" element={<SignupStep3 />} />
                  </Route>
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                </Route>
                <Route path="/reset-password" element={
                  <Suspense fallback={<AuthSkeleton />}>
                    <ResetPassword />
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <Layout>
                    <Suspense fallback={<DashboardFullSkeleton />}>
                      <Dashboard />
                    </Suspense>
                  </Layout>
                } />
                
                {/* Social pages with feature-specific skeletons */}
                <Route path="/community" element={
                  <Layout>
                    <Suspense fallback={<CommunitySkeleton />}>
                      <Community />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/feed" element={
                  <Layout>
                    <Suspense fallback={<FeedSkeleton />}>
                      <Feed />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/profile/:userId" element={
                  <Layout>
                    <Suspense fallback={<ProfileSkeleton />}>
                      <Profile />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/notifications" element={
                  <Layout>
                    <Suspense fallback={<NotificationsSkeleton />}>
                      <Notifications />
                    </Suspense>
                  </Layout>
                } />
                
                {/* Learning pages with feature-specific skeletons */}
                <Route path="/matieres" element={
                  <Layout>
                    <Suspense fallback={<MatieresSkeleton />}>
                      <Matieres />
                    </Suspense>
                  </Layout>
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
                
                {/* Other auth-gated routes with generic skeleton */}
                <Route path="/customize-ai" element={<Suspense fallback={<GenericPageSkeleton />}><CustomizeAI /></Suspense>} />
                <Route path="/onboarding" element={<Suspense fallback={<GenericPageSkeleton />}><Onboarding /></Suspense>} />
                <Route path="/user-search" element={<Layout><Suspense fallback={<GenericPageSkeleton />}><UserSearch /></Suspense></Layout>} />
                <Route path="/follow-requests" element={<Layout><Suspense fallback={<GenericPageSkeleton />}><FollowRequests /></Suspense></Layout>} />
                
                {/* Legacy route redirects - keep old bookmarks working */}
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
                
                {/* Static pages */}
                <Route path="/affiliations" element={<Layout><Affiliations /></Layout>} />
                <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="/exam-preparation/:examId" element={<ExamPreparation />} />
                <Route path="/examens-officiels" element={<ExamsHub />} />
                <Route path="/resources" element={<Layout><Resources /></Layout>} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-settings" element={<CookieSettings />} />
                <Route path="/email-test" element={<EmailTest />} />
                <Route path="/upload-email-assets" element={<UploadEmailAssets />} />
                <Route path="/dev/push" element={<DevPush />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />
                <Route path="/passion-discovery" element={<PassionDiscovery />} />
                <Route path="/games" element={<GamesHub />} />
                <Route path="/chess-game" element={<Layout><ChessGame /></Layout>} />
                <Route path="/chess-multiplayer" element={<ChessMultiplayerLobby />} />
                <Route path="/chess-multiplayer/game/:matchId" element={<ChessMultiplayerGame />} />
                <Route path="/quiz-battle" element={<QuizBattle />} />
                <Route path="/quiz-battle/solo" element={<QuizBattleSolo />} />
                <Route path="/quiz-battle/lobby" element={<QuizBattleLobby />} />
                <Route path="/quiz-battle/multiplayer/:battleId" element={<QuizBattleMultiplayer />} />
                <Route path="/quiz-battle/leaderboard" element={<QuizBattleLeaderboard />} />
                <Route path="/control-center" element={<ControlCenter />} />
                <Route path="/content-editor" element={<Layout><ContentEditor /></Layout>} />
                <Route path="/ai-analytics" element={<Layout><AIGenerationAnalytics /></Layout>} />
                <Route path="/data-migration" element={<Layout><DataMigration /></Layout>} />
                <Route path="/migrate-pdfs" element={<MigratePDFs />} />
                <Route path="/payment-demo" element={<PaymentDemo />} />
                <Route path="/natcash-demo" element={<NatCashDemo />} />
                <Route path="/admin/payments" element={<Layout><AdminPayments /></Layout>} />
                <Route path="/admin/payments-demo" element={<AdminPaymentsDemo />} />
                <Route path="/baccalaureat" element={<BaccExamsHub />} />
                <Route path="/baccalaureat/:series" element={<BaccExamsHub />} />
                <Route path="/baccalaureat/:series/:subject" element={<BaccExamsHub />} />
                <Route path="/lecture" element={<Layout><Library /></Layout>} />
                <Route path="/lecture/:ebookId" element={<EbookReader />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Suspense fallback={<GenericPageSkeleton />}><NotFound /></Suspense>} />
              </Routes>
                </FirstTimeUserProvider>
              </BrowserRouter>
            </VisitorProvider>
          </MusicPlayerProvider>
          </TooltipProvider>
          </NetworkProvider>
        </ThemeProvider>
      </PresenceProvider>
    </SessionAuthProvider>
  </QueryClientProvider>
);

export default App;
