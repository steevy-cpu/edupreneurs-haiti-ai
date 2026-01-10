import { lazy } from "react";
import { Users, AlertTriangle, BarChart3 } from "lucide-react";
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
    id: "stats",
    label: "Statistiques",
    shortLabel: "Stats",
    icon: BarChart3,
    component: lazy(() => import("./modules/StatsModule")),
  },
  // 🔥 ADD NEW MODULES HERE - Just add to this array!
];
