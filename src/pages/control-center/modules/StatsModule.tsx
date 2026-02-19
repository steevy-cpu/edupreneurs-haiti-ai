import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, FileText, TrendingUp, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
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

  // useCallback ensures a stable reference for the refresh button and useEffect dep array
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // All 7 COUNT queries fire simultaneously — reduces load time from
      // sum(all RTTs) to max(single RTT), ~7x faster on 3G
      const [
        { count: totalUsers },
        { count: newUsersThisWeek },
        { count: totalPosts },
        { count: pendingReports },
        { count: reviewingReports },
        { count: resolvedReports },
        { count: dismissedReports },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString()),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "reviewing"),
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "resolved"),
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "dismissed"),
      ]);

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
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
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
      {/* Header with manual refresh — data only loads once on mount otherwise */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Statistiques générales</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

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
