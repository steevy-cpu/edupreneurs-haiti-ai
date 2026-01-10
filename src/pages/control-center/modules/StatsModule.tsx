import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, FileText, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalPosts: number;
  pendingReports: number;
  reviewingReports: number;
  resolvedReports: number;
  dismissedReports: number;
}

export default function StatsModule() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // Get new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: newUsersThisWeek } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      // Get total posts
      const { count: totalPosts } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true });

      // Get reports by status
      const { count: pendingReports } = await supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: reviewingReports } = await supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "reviewing");

      const { count: resolvedReports } = await supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "resolved");

      const { count: dismissedReports } = await supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "dismissed");

      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        totalPosts: totalPosts || 0,
        pendingReports: pendingReports || 0,
        reviewingReports: reviewingReports || 0,
        resolvedReports: resolvedReports || 0,
        dismissedReports: dismissedReports || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Utilisateurs totaux",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Nouveaux (7 jours)",
      value: stats.newUsersThisWeek,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Publications",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Signalements en attente",
      value: stats.pendingReports,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "En cours de revue",
      value: stats.reviewingReports,
      icon: AlertTriangle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Signalements résolus",
      value: stats.resolvedReports,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Signalements rejetés",
      value: stats.dismissedReports,
      icon: XCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résumé des signalements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total des signalements</span>
                <span className="font-semibold">
                  {stats.pendingReports + stats.reviewingReports + stats.resolvedReports + stats.dismissedReports}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nécessitant une action</span>
                <span className="font-semibold text-amber-500">
                  {stats.pendingReports + stats.reviewingReports}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Traités</span>
                <span className="font-semibold text-green-500">
                  {stats.resolvedReports + stats.dismissedReports}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Croissance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Utilisateurs cette semaine</span>
                <span className="font-semibold text-green-500">+{stats.newUsersThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taux de croissance</span>
                <span className="font-semibold">
                  {stats.totalUsers > 0 
                    ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Posts par utilisateur</span>
                <span className="font-semibold">
                  {stats.totalUsers > 0 
                    ? (stats.totalPosts / stats.totalUsers).toFixed(1) 
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
