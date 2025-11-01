import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { CookieConsent } from "@/components/CookieConsent";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { GlobalMusicPlayer } from "@/components/GlobalMusicPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

// Lazy load non-critical pages for better performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MathCourse = lazy(() => import("./pages/MathCourse"));
const MathLesson = lazy(() => import("./pages/MathLesson"));
const MathCourseAF8 = lazy(() => import("./pages/MathCourseAF8"));
const MathLessonAF8 = lazy(() => import("./pages/MathLessonAF8"));
const SciencesCourseAF8 = lazy(() => import("./pages/SciencesCourseAF8"));
const SciencesLessonAF8 = lazy(() => import("./pages/SciencesLessonAF8"));
const SciencesCourse = lazy(() => import("./pages/SciencesCourse"));
const SciencesLesson = lazy(() => import("./pages/SciencesLesson"));
const AnglaisCourse = lazy(() => import("./pages/AnglaisCourse"));
const AnglaisLesson = lazy(() => import("./pages/AnglaisLesson"));
const AnglaisCourseAF8 = lazy(() => import("./pages/AnglaisCourseAF8"));
const AnglaisLessonAF8 = lazy(() => import("./pages/AnglaisLessonAF8"));
const EspagnolCourse = lazy(() => import("./pages/EspagnolCourse"));
const EspagnolLesson = lazy(() => import("./pages/EspagnolLesson"));
const EspagnolCourseAF8 = lazy(() => import("./pages/EspagnolCourseAF8"));
const EspagnolLessonAF8 = lazy(() => import("./pages/EspagnolLessonAF8"));
const FrancaisCourse = lazy(() => import("./pages/FrancaisCourse"));
const FrancaisLesson = lazy(() => import("./pages/FrancaisLesson"));
const SciencesSocialesCourse = lazy(() => import("./pages/SciencesSocialesCourse"));
const SciencesSocialesLesson = lazy(() => import("./pages/SciencesSocialesLesson"));
const CreoleCourse = lazy(() => import("./pages/CreoleCourse"));
const CreoleLesson = lazy(() => import("./pages/CreoleLesson"));
const Matieres = lazy(() => import("./pages/Matieres"));
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
const DevPush = lazy(() => import("./pages/DevPush"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const EmailTest = lazy(() => import("./pages/EmailTest"));
const TestEmail = lazy(() => import("./pages/TestEmail"));
const EmailJSTest = lazy(() => import("./pages/EmailJSTest"));
const UploadEmailAssets = lazy(() => import("./pages/UploadEmailAssets"));
const CustomizeAI = lazy(() => import("./pages/CustomizeAI"));
const PassionDiscovery = lazy(() => import("./pages/PassionDiscovery"));
const PassionDiscoveryTest = lazy(() => import("./pages/PassionDiscoveryTest"));
const ContentEditor = lazy(() => import("./pages/ContentEditor"));
const DataMigration = lazy(() => import("./pages/DataMigration"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MusicPlayerProvider>
          <BrowserRouter>
            <ScrollToTop />
            <CookieConsent />
            <GlobalMusicPlayer />
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
              <Route path="/math-course" element={<MathCourse />} />
              <Route path="/math-lesson/:topicId" element={<Layout><MathLesson /></Layout>} />
              <Route path="/math-af8-course" element={<MathCourseAF8 />} />
              <Route path="/math-af8-lesson/:topicId" element={<Layout><MathLessonAF8 /></Layout>} />
              <Route path="/sciences-course" element={<SciencesCourse />} />
              <Route path="/sciences-lesson/:topicId" element={<Layout><SciencesLesson /></Layout>} />
              <Route path="/sciences-af8-course" element={<SciencesCourseAF8 />} />
              <Route path="/sciences-af8-lesson/:topicId" element={<Layout><SciencesLessonAF8 /></Layout>} />
              <Route path="/anglais-course" element={<AnglaisCourse />} />
              <Route path="/anglais-lesson/:topicId" element={<Layout><AnglaisLesson /></Layout>} />
              <Route path="/anglais-af8-course" element={<AnglaisCourseAF8 />} />
              <Route path="/anglais-af8-lesson/:topicId" element={<Layout><AnglaisLessonAF8 /></Layout>} />
              <Route path="/espagnol-course" element={<EspagnolCourse />} />
              <Route path="/espagnol-lesson/:topicId" element={<Layout><EspagnolLesson /></Layout>} />
              <Route path="/espagnol-af8-course" element={<EspagnolCourseAF8 />} />
              <Route path="/espagnol-af8-lesson/:topicId" element={<Layout><EspagnolLessonAF8 /></Layout>} />
              <Route path="/francais-course" element={<FrancaisCourse />} />
              <Route path="/francais-lesson/:topicId" element={<Layout><FrancaisLesson /></Layout>} />
              <Route path="/sciences-sociales-course" element={<SciencesSocialesCourse />} />
              <Route path="/sciences-sociales-lesson/:topicId" element={<Layout><SciencesSocialesLesson /></Layout>} />
              <Route path="/creole-course" element={<CreoleCourse />} />
              <Route path="/creole-lesson/:topicId" element={<Layout><CreoleLesson /></Layout>} />
              <Route path="/affiliations" element={<Layout><Affiliations /></Layout>} />
              <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/resources" element={<Layout><Resources /></Layout>} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/test-email" element={<TestEmail />} />
              <Route path="/email-test" element={<EmailTest />} />
              <Route path="/emailjs-test" element={<EmailJSTest />} />
              <Route path="/upload-email-assets" element={<UploadEmailAssets />} />
          <Route path="/dev/push" element={<DevPush />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/passion-discovery" element={<PassionDiscovery />} />
          <Route path="/passion-test" element={<PassionDiscoveryTest />} />
          <Route path="/content-editor" element={<Layout><ContentEditor /></Layout>} />
          <Route path="/data-migration" element={<Layout><DataMigration /></Layout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MusicPlayerProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
