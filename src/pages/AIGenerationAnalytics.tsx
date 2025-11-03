import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { format } from "date-fns";

export default function AIGenerationAnalytics() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    successRate: 0,
    avgGenerationTime: 0,
    avgQualityScore: 0,
    totalWords: 0,
  });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      const { data: editorRole } = await supabase
        .from('content_editor_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!editorRole || !['admin', 'editor', 'viewer'].includes(editorRole.role)) {
        toast.error("Accès refusé");
        navigate("/dashboard");
        return;
      }

      await fetchAnalytics();
    } catch (error) {
      console.error('Access check error:', error);
      toast.error("Erreur lors de la vérification des permissions");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from('ai_generation_logs')
        .select(`
          *,
          lessons(title, grade_level),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      setLogs(logsData || []);

      // Calculate stats
      if (logsData && logsData.length > 0) {
        const successful = logsData.filter(l => l.success);
        const totalTime = logsData.reduce((sum, l) => sum + (l.generation_time_ms || 0), 0);
        const totalQuality = successful.reduce((sum, l) => sum + (l.quality_score || 0), 0);
        const totalWords = logsData.reduce((sum, l) => sum + (l.word_count || 0), 0);

        setStats({
          totalGenerations: logsData.length,
          successRate: (successful.length / logsData.length) * 100,
          avgGenerationTime: totalTime / logsData.length,
          avgQualityScore: successful.length > 0 ? totalQuality / successful.length : 0,
          totalWords,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Erreur lors du chargement des analytics");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sectionCounts = logs.reduce((acc, log) => {
    acc[log.section_name] = (acc[log.section_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const errorLogs = logs.filter(l => !l.success);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/content-editor")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
                <BarChart3 className="text-primary h-8 w-8" />
                Analytics de Génération IA
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Statistiques et métriques de génération de contenu
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de générations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Taux de réussite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Temps moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.avgGenerationTime / 1000).toFixed(1)}s</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Qualité moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgQualityScore.toFixed(0)}/100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mots générés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sections Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Générations par section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(sectionCounts).map(([section, count]) => {
                const countNum = Number(count);
                return (
                  <div key={section} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{section}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(countNum / stats.totalGenerations) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{countNum}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Errors */}
        {errorLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Erreurs récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-3 border border-destructive/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.lessons?.title || 'Leçon inconnue'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{log.section_name}</p>
                        <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Générations récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.slice(0, 50).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium truncate">{log.lessons?.title || 'Leçon inconnue'}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {log.section_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.lessons?.grade_level}</span>
                      {log.quality_score && (
                        <Badge variant={log.quality_score >= 80 ? "default" : "outline"} className="text-xs">
                          Qualité: {log.quality_score}/100
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                    <span>{(log.generation_time_ms / 1000).toFixed(1)}s</span>
                    <span>{format(new Date(log.created_at), 'dd/MM HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}