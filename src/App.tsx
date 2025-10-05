import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CustomizeAI from "./pages/CustomizeAI";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Matieres from "./pages/Matieres";
import Community from "./pages/Community";
import Feed from "./pages/Feed";
import UserSearch from "./pages/UserSearch";
import Profile from "./pages/Profile";
import FollowRequests from "./pages/FollowRequests";
import MathCourse from "./pages/MathCourse";
import MathLesson from "./pages/MathLesson";
import Affiliations from "./pages/Affiliations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/customize-ai" element={<CustomizeAI />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/matieres" element={<Layout><Matieres /></Layout>} />
            <Route path="/community" element={<Layout><Community /></Layout>} />
            <Route path="/feed" element={<Layout><Feed /></Layout>} />
            <Route path="/user-search" element={<Layout><UserSearch /></Layout>} />
            <Route path="/profile/:userId" element={<Layout><Profile /></Layout>} />
            <Route path="/follow-requests" element={<Layout><FollowRequests /></Layout>} />
            <Route path="/math-course" element={<Layout><MathCourse /></Layout>} />
            <Route path="/math-lesson/:topicId" element={<Layout><MathLesson /></Layout>} />
            <Route path="/affiliations" element={<Layout><Affiliations /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
