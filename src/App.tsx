import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { CookieConsent } from "@/components/CookieConsent";
import { lazy, Suspense } from "react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

// Lazy load non-critical pages for better performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MathCourse = lazy(() => import("./pages/MathCourse"));
const MathLesson = lazy(() => import("./pages/MathLesson"));
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
        <BrowserRouter>
          <CookieConsent />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
