/**
 * Analytics Dashboard — founder-only page with 5 tabs of charts/KPIs.
 * Uses recharts (already installed) and Supabase client for data queries.
 * Each tab lazily fetches its own data on first mount to avoid large initial loads.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { BarChart3, Users, BookOpen, DollarSign, Handshake, TrendingUp, Activity, Gamepad2, FileText } from "lucide-react";
import { useFounderCheck } from "@/pages/control-center/hooks/useFounderCheck";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartErrorBoundary } from "@/components/dashboard/ChartErrorBoundary";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import { format, subDays, startOfDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Color palette for charts ───────────────────────────────────────
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 71% 45%)",   // green
  "hsl(48 96% 53%)",    // yellow
  "hsl(0 84% 60%)",     // red
  "hsl(262 83% 58%)",   // purple
  "hsl(199 89% 48%)",   // blue
  "hsl(25 95% 53%)",    // orange
];

// Subscription status display config
const SUBSCRIPTION_COLORS: Record<string, string> = {
  active: "hsl(142 71% 45%)",
  timed_free: "hsl(199 89% 48%)",
  expired: "hsl(0 84% 60%)",
  none: "hsl(var(--muted-foreground))",
  pending_gift: "hsl(48 96% 53%)",
};

const SUBSCRIPTION_LABELS: Record<string, string> = {
  active: "Actif",
  timed_free: "Essai gratuit",
  expired: "Expiré",
  none: "Aucun",
  pending_gift: "Cadeau en attente",
};

// ─── Helper: group rows by date ─────────────────────────────────────
function groupByDate(rows: { created_at: string }[], days: number) {
  const now = new Date();
  // Initialize all days with 0 count
  const dateMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(now, i), "yyyy-MM-dd");
    dateMap.set(key, 0);
  }
  // Count rows per day
  rows.forEach(r => {
    const key = r.created_at?.substring(0, 10);
    if (key && dateMap.has(key)) {
      dateMap.set(key, (dateMap.get(key) || 0) + 1);
    }
  });
  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date: format(parseISO(date), "dd MMM", { locale: fr }),
    count,
  }));
}

// ─── Helper: group revenue by date ──────────────────────────────────
function groupRevenueByDate(rows: { created_at: string; amount: number }[], days: number) {
  const now = new Date();
  const dateMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(now, i), "yyyy-MM-dd");
    dateMap.set(key, 0);
  }
  rows.forEach(r => {
    const key = r.created_at?.substring(0, 10);
    if (key && dateMap.has(key)) {
      dateMap.set(key, (dateMap.get(key) || 0) + r.amount);
    }
  });
  return Array.from(dateMap.entries()).map(([date, amount]) => ({
    date: format(parseISO(date), "dd MMM", { locale: fr }),
    amount,
  }));
}

// ─── KPI Card Component ─────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon: Icon, color, loading }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart skeleton ─────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
      <CardContent><Skeleton className="h-[280px] w-full" /></CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 1 — Vue Générale
// ═══════════════════════════════════════════════════════════════════════
function OverviewTab() {
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const now = new Date();
        const weekAgo = subDays(now, 7).toISOString();
        const monthAgo = subDays(now, 30).toISOString();

        // Parallel queries — all use head:true for count-only where possible
        const [
          totalUsers,
          weekUsers,
          monthUsers,
          activeUsers,
          lessonsCount,
          examsCount,
          battlesCount,
          revenueResult,
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthAgo),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_seen", weekAgo),
          supabase.from("lesson_completions").select("*", { count: "exact", head: true }),
          supabase.from("exam_practice_sessions").select("*", { count: "exact", head: true }),
          supabase.from("quiz_battle_players").select("battle_id", { count: "exact", head: true }),
          supabase.from("payment_transactions").select("amount").eq("status", "completed"),
        ]);

        // Sum revenue client-side (amount is already in the rows)
        const totalRevenue = (revenueResult.data || []).reduce((sum, r: any) => sum + (r.amount || 0), 0);

        setData({
          totalUsers: totalUsers.count || 0,
          weekUsers: weekUsers.count || 0,
          monthUsers: monthUsers.count || 0,
          activeUsers: activeUsers.count || 0,
          lessons: lessonsCount.count || 0,
          exams: examsCount.count || 0,
          battles: battlesCount.count || 0,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error("[Analytics] Overview fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Total utilisateurs" value={data.totalUsers ?? 0} icon={Users} color="hsl(199, 89%, 48%)" loading={loading} />
      <KpiCard title="Nouveaux cette semaine" value={data.weekUsers ?? 0} icon={TrendingUp} color="hsl(142, 71%, 45%)" loading={loading} />
      <KpiCard title="Nouveaux ce mois" value={data.monthUsers ?? 0} icon={TrendingUp} color="hsl(262, 83%, 58%)" loading={loading} />
      <KpiCard title="Utilisateurs actifs (7j)" value={data.activeUsers ?? 0} subtitle="Vus dans les 7 derniers jours" icon={Activity} color="hsl(48, 96%, 53%)" loading={loading} />
      <KpiCard title="Leçons complétées" value={data.lessons ?? 0} icon={BookOpen} color="hsl(var(--primary))" loading={loading} />
      <KpiCard title="Sessions d'examens" value={data.exams ?? 0} icon={FileText} color="hsl(25, 95%, 53%)" loading={loading} />
      <KpiCard title="Batailles quiz" value={data.battles ?? 0} icon={Gamepad2} color="hsl(0, 84%, 60%)" loading={loading} />
      <KpiCard title="Revenus total (HTG)" value={`${(data.revenue ?? 0).toLocaleString("fr-FR")} HTG`} icon={DollarSign} color="hsl(142, 71%, 45%)" loading={loading} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 2 — Utilisateurs
// ═══════════════════════════════════════════════════════════════════════
function UsersTab() {
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<{ date: string; count: number }[]>([]);
  const [grades, setGrades] = useState<{ name: string; value: number }[]>([]);
  const [subscriptions, setSubscriptions] = useState<{ name: string; value: number; color: string }[]>([]);
  const [retention, setRetention] = useState<{ bucket: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const [signupsRes, profilesRes] = await Promise.all([
          // Recent signups for chart
          supabase.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo),
          // All profiles for grade/subscription/retention analysis
          supabase.from("profiles").select("academic_grade, subscription_status, last_seen"),
        ]);

        // Chart 1 — Signups per day
        setSignups(groupByDate((signupsRes.data || []) as any, 30));

        // Chart 2 — Grade distribution
        const gradeMap = new Map<string, number>();
        (profilesRes.data || []).forEach((p: any) => {
          const grade = p.academic_grade || "Non défini";
          gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
        });
        setGrades(Array.from(gradeMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

        // Chart 3 — Subscription status
        const subMap = new Map<string, number>();
        (profilesRes.data || []).forEach((p: any) => {
          const status = p.subscription_status || "none";
          subMap.set(status, (subMap.get(status) || 0) + 1);
        });
        setSubscriptions(Array.from(subMap.entries()).map(([name, value]) => ({
          name: SUBSCRIPTION_LABELS[name] || name,
          value,
          color: SUBSCRIPTION_COLORS[name] || COLORS[0],
        })));

        // Chart 4 — Retention buckets based on last_seen
        const now = new Date();
        const buckets = { "Aujourd'hui": 0, "Cette semaine": 0, "Ce mois": 0, "Plus ancien": 0, "Jamais": 0 };
        (profilesRes.data || []).forEach((p: any) => {
          if (!p.last_seen) { buckets["Jamais"]++; return; }
          const diff = (now.getTime() - new Date(p.last_seen).getTime()) / (1000 * 60 * 60 * 24);
          if (diff < 1) buckets["Aujourd'hui"]++;
          else if (diff < 7) buckets["Cette semaine"]++;
          else if (diff < 30) buckets["Ce mois"]++;
          else buckets["Plus ancien"]++;
        });
        setRetention(Object.entries(buckets).map(([bucket, count]) => ({ bucket, count })));
      } catch (err) {
        console.error("[Analytics] Users fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <ChartSkeleton key={i} />)}</div>;

  const signupConfig: ChartConfig = { count: { label: "Inscriptions", color: "hsl(var(--primary))" } };
  const retentionConfig: ChartConfig = { count: { label: "Utilisateurs", color: "hsl(var(--primary))" } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Inscriptions per day */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Inscriptions par jour (30j)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={signupConfig} className="h-[280px]">
              <AreaChart data={signups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Grade distribution */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Répartition par niveau</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={grades} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {grades.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Subscription status */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Statuts d'abonnement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={subscriptions} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {subscriptions.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Retention */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Rétention (dernière connexion)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={retentionConfig} className="h-[280px]">
              <BarChart data={retention} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="bucket" fontSize={11} tickLine={false} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 3 — Contenu
// ═══════════════════════════════════════════════════════════════════════
function ContentTab() {
  const [loading, setLoading] = useState(true);
  const [topLessons, setTopLessons] = useState<{ name: string; count: number }[]>([]);
  const [subjects, setSubjects] = useState<{ name: string; value: number }[]>([]);
  const [scoreDist, setScoreDist] = useState<{ bucket: string; count: number }[]>([]);
  const [quizActivity, setQuizActivity] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchContent() {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const [completionsRes, quizRes] = await Promise.all([
          supabase.from("lesson_completions").select("lesson_slug, subject, score"),
          supabase.from("quiz_battle_players").select("created_at").gte("created_at", thirtyDaysAgo),
        ]);

        const completions = completionsRes.data || [];

        // Chart 1 — Top 10 lessons
        const lessonMap = new Map<string, number>();
        completions.forEach((c: any) => {
          const slug = c.lesson_slug || "Inconnu";
          lessonMap.set(slug, (lessonMap.get(slug) || 0) + 1);
        });
        setTopLessons(
          Array.from(lessonMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }))
        );

        // Chart 2 — Subject popularity
        const subjectMap = new Map<string, number>();
        completions.forEach((c: any) => {
          const s = c.subject || "Autre";
          subjectMap.set(s, (subjectMap.get(s) || 0) + 1);
        });
        setSubjects(Array.from(subjectMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

        // Chart 3 — Score distribution
        const buckets = { "0-50": 0, "51-70": 0, "71-85": 0, "86-100": 0 };
        completions.forEach((c: any) => {
          const score = c.score;
          if (score == null) return;
          if (score <= 50) buckets["0-50"]++;
          else if (score <= 70) buckets["51-70"]++;
          else if (score <= 85) buckets["71-85"]++;
          else buckets["86-100"]++;
        });
        setScoreDist(Object.entries(buckets).map(([bucket, count]) => ({ bucket, count })));

        // Chart 4 — Quiz battle activity
        setQuizActivity(groupByDate((quizRes.data || []) as any, 30));
      } catch (err) {
        console.error("[Analytics] Content fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <ChartSkeleton key={i} />)}</div>;

  const barConfig: ChartConfig = { count: { label: "Complétions", color: "hsl(var(--primary))" } };
  const quizConfig: ChartConfig = { count: { label: "Batailles", color: "hsl(262 83% 58%)" } };
  const scoreConfig: ChartConfig = { count: { label: "Étudiants", color: "hsl(142 71% 45%)" } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top 10 lessons */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Top 10 leçons complétées</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[320px]">
              <BarChart data={topLessons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Subject popularity */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Popularité par matière</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={subjects} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {subjects.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Score distribution */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Distribution des scores</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={scoreConfig} className="h-[280px]">
              <BarChart data={scoreDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Quiz battle activity */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Activité Quiz Battle (30j)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={quizConfig} className="h-[280px]">
              <AreaChart data={quizActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" fill="hsl(262 83% 58%)" fillOpacity={0.2} stroke="hsl(262 83% 58%)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 4 — Revenus
// ═══════════════════════════════════════════════════════════════════════
function RevenueTab() {
  const [loading, setLoading] = useState(true);
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; amount: number }[]>([]);
  const [byProvider, setByProvider] = useState<{ name: string; value: number }[]>([]);
  const [byStatus, setByStatus] = useState<{ name: string; value: number }[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const [recentRes, allCompletedRes, allRes, lastTenRes] = await Promise.all([
          // Last 30 days completed — for daily revenue chart
          supabase.from("payment_transactions").select("created_at, amount").eq("status", "completed").gte("created_at", thirtyDaysAgo),
          // All completed — for provider breakdown
          supabase.from("payment_transactions").select("provider, amount").eq("status", "completed"),
          // All — for status breakdown
          supabase.from("payment_transactions").select("status"),
          // Last 10 transactions — for table
          supabase.from("payment_transactions").select("created_at, user_id, amount, provider, status, currency").order("created_at", { ascending: false }).limit(10),
        ]);

        // Chart 1 — Daily revenue
        setDailyRevenue(groupRevenueByDate((recentRes.data || []) as any, 30));

        // Chart 2 — By provider
        const providerMap = new Map<string, number>();
        (allCompletedRes.data || []).forEach((t: any) => {
          const p = t.provider || "Inconnu";
          providerMap.set(p, (providerMap.get(p) || 0) + (t.amount || 0));
        });
        setByProvider(Array.from(providerMap.entries()).map(([name, value]) => ({ name, value })));

        // Chart 3 — By status
        const statusMap = new Map<string, number>();
        (allRes.data || []).forEach((t: any) => {
          const s = t.status || "unknown";
          statusMap.set(s, (statusMap.get(s) || 0) + 1);
        });
        setByStatus(Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })));

        setRecentTx(lastTenRes.data || []);
      } catch (err) {
        console.error("[Analytics] Revenue fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <ChartSkeleton key={i} />)}</div>;

  const revenueConfig: ChartConfig = { amount: { label: "Montant (HTG)", color: "hsl(142 71% 45%)" } };

  const STATUS_LABELS: Record<string, string> = { completed: "Réussi", pending: "En attente", failed: "Échoué" };
  const STATUS_COLORS: Record<string, string> = { completed: "hsl(142 71% 45%)", pending: "hsl(48 96% 53%)", failed: "hsl(0 84% 60%)" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Daily revenue */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenus par jour (30j)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[280px]">
              <AreaChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="amount" fill="hsl(142 71% 45%)" fillOpacity={0.2} stroke="hsl(142 71% 45%)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* By provider */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenus par provider</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byProvider} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {byProvider.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => `${val.toLocaleString("fr-FR")} HTG`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Payment status breakdown */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Taux de succès des paiements</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${STATUS_LABELS[name] || name} (${(percent * 100).toFixed(0)}%)`}>
                  {byStatus.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Recent transactions table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Dernières transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTx.map((tx: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{tx.created_at ? format(parseISO(tx.created_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell className="text-xs font-medium">{tx.amount?.toLocaleString("fr-FR")} {tx.currency || "HTG"}</TableCell>
                  <TableCell className="text-xs">{tx.provider || "—"}</TableCell>
                  <TableCell className="text-xs">{STATUS_LABELS[tx.status] || tx.status}</TableCell>
                </TableRow>
              ))}
              {recentTx.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Aucune transaction</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 5 — Partenaires
// ═══════════════════════════════════════════════════════════════════════
function PartnersTab() {
  const [loading, setLoading] = useState(true);
  const [topCodes, setTopCodes] = useState<{ name: string; count: number }[]>([]);
  const [dailyRedemptions, setDailyRedemptions] = useState<{ date: string; count: number }[]>([]);
  const [partnerPerf, setPartnerPerf] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const [redemptionsRes, recentRes, partnersRes] = await Promise.all([
          supabase.from("user_promo_redemptions").select("code, gold_awarded, redeemed_at"),
          supabase.from("user_promo_redemptions").select("created_at: redeemed_at").gte("redeemed_at", thirtyDaysAgo),
          // Partner performance — join promo_partners with redemption counts
          supabase.from("promo_partners").select("name, promo_code_id, promo_codes(code)"),
        ]);

        const redemptions = redemptionsRes.data || [];

        // Chart 1 — Top promo codes
        const codeMap = new Map<string, number>();
        redemptions.forEach((r: any) => {
          const code = r.code || "Inconnu";
          codeMap.set(code, (codeMap.get(code) || 0) + 1);
        });
        setTopCodes(
          Array.from(codeMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }))
        );

        // Chart 2 — Daily redemptions
        // Rename redeemed_at to created_at for groupByDate helper
        const mapped = (recentRes.data || []).map((r: any) => ({ created_at: r.created_at }));
        setDailyRedemptions(groupByDate(mapped, 30));

        // Table — Partner performance
        const partners = (partnersRes.data || []).map((p: any) => {
          const code = p.promo_codes?.code;
          const matchingRedemptions = code ? redemptions.filter((r: any) => r.code === code) : [];
          const totalGold = matchingRedemptions.reduce((sum: number, r: any) => sum + (r.gold_awarded || 0), 0);
          const lastUsed = matchingRedemptions.length > 0
            ? matchingRedemptions.sort((a: any, b: any) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime())[0]?.redeemed_at
            : null;
          return {
            partner: p.name,
            code: code || "—",
            redemptions: matchingRedemptions.length,
            goldDistributed: totalGold,
            lastUsed,
          };
        });
        setPartnerPerf(partners);
      } catch (err) {
        console.error("[Analytics] Partners fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3].map(i => <ChartSkeleton key={i} />)}</div>;

  const codeConfig: ChartConfig = { count: { label: "Rédemptions", color: "hsl(25 95% 53%)" } };
  const redemptionConfig: ChartConfig = { count: { label: "Rédemptions", color: "hsl(var(--primary))" } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top promo codes */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Codes promo les plus utilisés</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={codeConfig} className="h-[320px]">
              <BarChart data={topCodes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(25 95% 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Daily redemptions */}
      <ChartErrorBoundary>
        <Card>
          <CardHeader><CardTitle className="text-base">Rédemptions par jour (30j)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={redemptionConfig} className="h-[280px]">
              <AreaChart data={dailyRedemptions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </ChartErrorBoundary>

      {/* Partner performance table */}
      <Card className="md:col-span-2">
        <CardHeader><CardTitle className="text-base">Performance par partenaire</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partenaire</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Rédemptions</TableHead>
                <TableHead>Or distribué</TableHead>
                <TableHead>Dernier usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerPerf.map((p: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-medium">{p.partner}</TableCell>
                  <TableCell className="text-sm font-mono">{p.code}</TableCell>
                  <TableCell className="text-sm">{p.redemptions}</TableCell>
                  <TableCell className="text-sm">{p.goldDistributed.toLocaleString("fr-FR")} 🪙</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.lastUsed ? format(parseISO(p.lastUsed), "dd/MM/yy HH:mm") : "Jamais"}
                  </TableCell>
                </TableRow>
              ))}
              {partnerPerf.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun partenaire configuré</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const { isFounder, isLoading } = useFounderCheck();
  // Track which tabs have been mounted to avoid re-fetching
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set(["overview"]));
  const [activeTab, setActiveTab] = useState("overview");

  // Lazy-mount tabs: only render a tab's content once it's first selected
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setMountedTabs(prev => {
      if (prev.has(value)) return prev;
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  }, []);

  // Founder guard — redirect non-founders after loading
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!isFounder) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytiques</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de la plateforme</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="h-4 w-4" />Vue Générale</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5"><BookOpen className="h-4 w-4" />Contenu</TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1.5"><DollarSign className="h-4 w-4" />Revenus</TabsTrigger>
          <TabsTrigger value="partners" className="gap-1.5"><Handshake className="h-4 w-4" />Partenaires</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {mountedTabs.has("overview") && <OverviewTab />}
        </TabsContent>
        <TabsContent value="users">
          {mountedTabs.has("users") && <UsersTab />}
        </TabsContent>
        <TabsContent value="content">
          {mountedTabs.has("content") && <ContentTab />}
        </TabsContent>
        <TabsContent value="revenue">
          {mountedTabs.has("revenue") && <RevenueTab />}
        </TabsContent>
        <TabsContent value="partners">
          {mountedTabs.has("partners") && <PartnersTab />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
