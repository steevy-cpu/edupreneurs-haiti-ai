import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, RefreshCw } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { REPORT_REASONS, REPORT_STATUS, UserReport } from "../types";

const PAGE_SIZE = 15;

export default function ReportsModule() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("reports-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_reports" },
        () => fetchReports()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, currentPage]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("user_reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      // Fetch profiles for reporters and reported users
      if (data && data.length > 0) {
        const userIds = [...new Set([...data.map(r => r.reporter_id), ...data.map(r => r.reported_user_id)])];
        const postIds = data.filter(r => r.post_id).map(r => r.post_id);

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, nickname, avatar_url")
          .in("user_id", userIds);

        const { data: posts } = postIds.length > 0
          ? await supabase.from("posts").select("id, content, image_url").in("id", postIds)
          : { data: [] };

        const enrichedReports = data.map(report => ({
          ...report,
          reporter: profiles?.find(p => p.user_id === report.reporter_id),
          reported_user: profiles?.find(p => p.user_id === report.reported_user_id),
          post: posts?.find(p => p.id === report.post_id),
        })) as UserReport[];

        setReports(enrichedReports);
      } else {
        setReports([]);
      }

      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Erreur lors du chargement des signalements");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("user_reports")
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Signalement mis à jour");
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  };

  const getReasonLabel = (reason: string) => {
    return REPORT_REASONS.find(r => r.value === reason)?.label || reason;
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = REPORT_STATUS.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color} text-white border-0`}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(0); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {REPORT_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" onClick={fetchReports}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{totalCount} signalement{totalCount !== 1 ? 's' : ''}</span>
        <span>Page {currentPage + 1} sur {totalPages || 1}</span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Signaleur</TableHead>
              <TableHead>Utilisateur signalé</TableHead>
              <TableHead className="hidden md:table-cell">Raison</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun signalement trouvé
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={getAvatarUrl(report.reporter?.avatar_url)} />
                        <AvatarFallback className="text-xs">{report.reporter?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[100px]">{report.reporter?.nickname || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={getAvatarUrl(report.reported_user?.avatar_url)} />
                        <AvatarFallback className="text-xs">{report.reported_user?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[100px]">{report.reported_user?.nickname || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {getReasonLabel(report.reason)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(report.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNotes(report.admin_notes || "");
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du signalement</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              {/* Reporter */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl(selectedReport.reporter?.avatar_url)} />
                  <AvatarFallback>{selectedReport.reporter?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedReport.reporter?.full_name}</p>
                  <p className="text-xs text-muted-foreground">a signalé</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/profile/${selectedReport.reporter_id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Reported User */}
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl(selectedReport.reported_user?.avatar_url)} />
                  <AvatarFallback>{selectedReport.reported_user?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedReport.reported_user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">utilisateur signalé</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/profile/${selectedReport.reported_user_id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Raison:</span>
                  <span className="text-sm font-medium">{getReasonLabel(selectedReport.reason)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Statut:</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm">{formatDate(selectedReport.created_at)}</span>
                </div>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="text-sm p-2 bg-muted/30 rounded">{selectedReport.description}</p>
                </div>
              )}

              {/* Post content */}
              {selectedReport.post && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Contenu du post:</span>
                  <p className="text-sm p-2 bg-muted/30 rounded line-clamp-3">{selectedReport.post.content}</p>
                </div>
              )}

              {/* Admin notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes admin:</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajouter des notes..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Select
                  defaultValue={selectedReport.status}
                  onValueChange={(status) => updateReportStatus(selectedReport.id, status)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Changer statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
