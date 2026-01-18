import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { CookieConsent } from "@/components/CookieConsent";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { VisitorProvider } from "@/contexts/VisitorContext";
import { FirstTimeUserProvider } from "@/contexts/FirstTimeUserContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { GlobalMusicPlayer } from "@/components/GlobalMusicPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { lazy, Suspense, useEffect } from "react";
import { LegacyRedirect } from "@/components/LegacyRedirect";
import { JudeChatbot } from "@/components/JudeChatbot";
import { supabase } from "@/integrations/supabase/client";
import { clearAllPersistedCache } from "@/utils/queryPersistence";
import { VisitorBanner } from "@/components/visitor";
const VisitorTour = lazy(() => import("@/components/visitor/VisitorTour").then(m => ({ default: m.VisitorTour })));
import { VisitorMusicSync } from "@/components/visitor/VisitorMusicSync";

// Lazy load first-time user components for better 3G performance (~100KB deferred)
const FirstTimeUserWelcome = lazy(() => import("@/components/firsttime/FirstTimeUserWelcome"));
const FirstTimeUserTour = lazy(() => import("@/components/firsttime/FirstTimeUserTour"));
const AvatarGenerationStep = lazy(() => import("@/components/firsttime/AvatarGenerationStep"));

// Lazy load all pages for better 3G performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
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
const GamesHub = lazy(() => import("./pages/GamesHub"));
const QuizBattle = lazy(() => import("./pages/QuizBattle"));
const QuizBattleSolo = lazy(() => import("./pages/QuizBattleSolo"));
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

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Eric Chatbot wrapper with route-based visibility
const EricChatbotWrapper = () => {
  const location = useLocation();
  
  // Pages where Eric should be hidden
  const hiddenRoutes = [
    '/',
    '/auth',
    '/reset-password',
    '/onboarding',
    '/community',
    '/feed',
    '/chess-game',
    '/privacy-policy',
    '/passion-discovery',
  ];
  
  const isLessonPage = location.pathname.startsWith('/course/') && location.pathname.split('/').length > 2;
  const isLecturePage = location.pathname.startsWith('/lecture/');
  const isHidden = hiddenRoutes.includes(location.pathname) || isLessonPage || isLecturePage;
  
  if (isHidden) return null;
  
  return (
    <div data-tour="jude-chatbot">
      <JudeChatbot />
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

// Listen for auth changes to clear cache on logout
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    // Clear all persisted cache on logout for security
    clearAllPersistedCache();
    queryClient.clear();
    console.log('User signed out - cleared all caches');
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                <CookieConsent />
                <GlobalMusicPlayer />
                <VisitorMusicSync />
                <VisitorBanner />
                <Suspense fallback={null}>
                  <VisitorTour />
                </Suspense>
                <Suspense fallback={null}>
                  <FirstTimeUserWelcome />
                  <AvatarGenerationStep />
                  <FirstTimeUserTour />
                </Suspense>
                <EricChatbotWrapper />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/customize-ai" element={<CustomizeAI />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/matieres" element={<Layout><Matieres /></Layout>} />
                <Route path="/community" element={<Layout><Community /></Layout>} />
                <Route path="/feed" element={<Layout><Feed /></Layout>} />
                <Route path="/user-search" element={<Layout><UserSearch /></Layout>} />
                <Route path="/profile/:userId" element={<Layout><Profile /></Layout>} />
                <Route path="/follow-requests" element={<Layout><FollowRequests /></Layout>} />
                <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
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
            <Route path="/quiz-battle" element={<QuizBattle />} />
            <Route path="/quiz-battle/solo" element={<QuizBattleSolo />} />
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
                {/* Dynamic routes for content editor generated subjects - MUST be before catch-all */}
                <Route path="/course/:slug" element={<DynamicCoursePage />} />
                <Route path="/course/:slug/:lessonSlug" element={<DynamicLessonPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
                </FirstTimeUserProvider>
              </BrowserRouter>
            </VisitorProvider>
          </MusicPlayerProvider>
        </TooltipProvider>
      </NetworkProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
