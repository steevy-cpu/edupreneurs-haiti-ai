import { lazy } from "react";
import { Users, AlertTriangle, BarChart3, CreditCard, Heart, Megaphone, BookOpen, Newspaper, MessageSquare, MessageCircle, Gift, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ControlCenterModule } from "./types";

export const CONTROL_CENTER_MODULES: ControlCenterModule[] = [
  {
    id: "users",
    label: "Tous les utilisateurs",
    shortLabel: "Users",
    icon: Users,
    component: lazy(() => import("./modules/UsersModule")),
  },
  {
    id: "reports",
    label: "Signalements",
    shortLabel: "Reports",
    icon: AlertTriangle,
    component: lazy(() => import("./modules/ReportsModule")),
    badge: async () => {
      const { count } = await supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
  },
  {
    id: "payments",
    label: "Paiements",
    shortLabel: "Payments",
    icon: CreditCard,
    component: lazy(() => import("./modules/PaymentsModule")),
    badge: async () => {
      const { count } = await supabase
        .from("payment_transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_verification")
        .eq("admin_verified", false);
      return count || 0;
    },
  },
  {
    id: "donations",
    label: "Dons",
    shortLabel: "Dons",
    icon: Heart,
    component: lazy(() => import("./modules/DonationsModule")),
    badge: async () => {
      const { count } = await supabase
        .from("donations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
  },
  {
    id: "announcements",
    label: "Annonces",
    shortLabel: "Annonces",
    icon: Megaphone,
    component: lazy(() => import("./modules/AnnouncementsModule")),
    badge: async () => {
      const { count } = await supabase
        .from("announcements")
        .select("id", { count: "exact", head: true })
        .in("status", ["scheduled", "sending"]);
      return count || 0;
    },
  },
  {
    id: "stats",
    label: "Statistiques",
    shortLabel: "Stats",
    icon: BarChart3,
    component: lazy(() => import("./modules/StatsModule")),
  },
  {
    id: "words",
    label: "Mots du Jour",
    shortLabel: "Mots",
    icon: BookOpen,
    component: lazy(() => import("./modules/WordsModule")),
    badge: async () => {
      const { count } = await supabase
        .from("daily_words")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .is("audio_url", null);
      return count || 0;
    },
  },
  {
    id: "blog",
    label: "Blog",
    shortLabel: "Blog",
    icon: Newspaper,
    component: lazy(() => import("./modules/BlogModule")),
    badge: async () => {
      const { count } = await supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft");
      return count || 0;
    },
  },
  {
    id: "contact",
    label: "Messages de contact",
    shortLabel: "Contact",
    icon: MessageSquare,
    component: lazy(() => import("./modules/ContactModule")),
    badge: async () => {
      const { count } = await supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      return count || 0;
    },
  },
  {
    id: "feedback",
    label: "Feedback Leçons",
    shortLabel: "Feedback",
    icon: MessageCircle,
    component: lazy(() => import("./modules/FeedbackModule")),
    badge: async () => {
      const { data, error } = await supabase.rpc("count_lesson_feedback_for_admin", {
        p_rating_filter: "down",
      });
      if (error) return 0;
      return typeof data === "number" ? data : 0;
    },
  },
  {
    id: "promo",
    label: "Partenaires & Codes",
    shortLabel: "Promo",
    icon: Gift,
    component: lazy(() => import("./modules/PromoCodesModule")),
    badge: async () => {
      // Show count of partners as module badge
      const { count } = await supabase
        .from("promo_partners")
        .select("id", { count: "exact", head: true });
      return count || 0;
    },
  },
];
