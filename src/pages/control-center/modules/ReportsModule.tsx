import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, RefreshCw, Save, Trash2, UserX, AlertTriangle, XCircle } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { REPORT_REASONS, REPORT_STATUS, UserReport } from "../types";
import { FOUNDER_USER_IDS } from "@/lib/founderConstants";
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';

// Protected accounts that cannot be deleted
const PROTECTED_USER_IDS = [
  '68f2f959-e14a-47f9-8277-07df3a6fcd79', // Jude AI
  ...FOUNDER_USER_IDS,
];

export default function ReportsModule() {
  const navigate = useNavigate();
  // Use in-memory session user — eliminates 3 redundant auth.getUser() network calls
  const { user } = useSessionAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isDismissing, setIsDismissing] = useState(false);

  // Computed flag to disable all actions while one is in progress
  const isActionInProgress = isDeletingPost || isDeletingUser || isDismissing || isSavingNotes || isUpdating;

  // Wrapped in useCallback — declared before useEffects that reference it.
  // Deps: filter + page so realtime callback always uses the latest query params
  // without needing to re-subscribe to the channel on every filter or page change.
  const fetchReports = useCallback(async () => {
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
  }, [statusFilter, currentPage]);

  // Data fetch — re-runs when filters or page change (fetchReports dep changes accordingly)
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Poll every 30s instead of realtime — only 1-2 admins use this module,
  // so a dedicated WebSocket channel is unnecessary overhead
  useEffect(() => {
    const pollInterval = setInterval(() => fetchReports(), 30_000);
    return () => clearInterval(pollInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selectedStatus when a report is selected
  useEffect(() => {
    if (selectedReport) {
      setSelectedStatus(selectedReport.status);
    }
  }, [selectedReport]);

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      // user is hoisted from useSessionAuth — no extra network call needed
      
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

  const saveAdminNotes = async () => {
    if (!selectedReport) return;
    setIsSavingNotes(true);
    try {
      // user is hoisted from useSessionAuth — no extra network call needed
      
      const { error } = await supabase
        .from("user_reports")
        .update({
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id);

      if (error) throw error;
      toast.success("Notes sauvegardées");
      fetchReports();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setIsDeletingPost(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-post`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            postId,
            reason: adminNotes || 'Supprimé suite à un signalement',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      toast.success("Post supprimé avec succès");
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression du post");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Check if user is protected
    if (PROTECTED_USER_IDS.includes(userId)) {
      toast.error("Ce compte est protégé et ne peut pas être supprimé");
      return;
    }

    setIsDeletingUser(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            targetUserId: userId,
            reason: adminNotes || 'Supprimé suite à un signalement',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      toast.success("Compte utilisateur supprimé avec succès");
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression du compte");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleDismissReport = async () => {
    if (!selectedReport) return;
    setIsDismissing(true);
    try {
      // user is hoisted from useSessionAuth — no extra network call needed
      
      const { error } = await supabase
        .from("user_reports")
        .update({
          status: 'dismissed',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || 'Aucune action requise',
        })
        .eq("id", selectedReport.id);

      if (error) throw error;
      toast.success("Signalement classé sans suite");
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error("Error dismissing report:", error);
      toast.error("Erreur lors du classement");
    } finally {
      setIsDismissing(false);
    }
  };

  const isProtectedUser = (userId: string) => PROTECTED_USER_IDS.includes(userId);

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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                  onClick={() => navigate(`/profile/${selectedReport.reporter?.nickname || selectedReport.reporter_id}`)}
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
                  onClick={() => navigate(`/profile/${selectedReport.reported_user?.nickname || selectedReport.reported_user_id}`)}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveAdminNotes}
                  disabled={isSavingNotes || adminNotes === (selectedReport?.admin_notes || '')}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingNotes ? "Sauvegarde..." : "Sauvegarder les notes"}
                </Button>
              </div>

              {/* Moderation Actions */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Actions de modération
                </p>
                
                <div className="flex flex-col gap-2">
                  {/* Dismiss Report - No Action Needed */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        disabled={isActionInProgress}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {isDismissing ? "Traitement..." : "Aucune action requise"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Classer sans suite ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ce signalement sera marqué comme traité sans qu'aucune action ne soit prise 
                          contre l'utilisateur ou le contenu signalé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDismissReport} 
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Confirmer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Delete Post Button */}
                  {selectedReport.post_id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          disabled={isActionInProgress}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeletingPost ? "Suppression..." : "Supprimer le post"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le post sera définitivement supprimé 
                            et tous les signalements associés seront marqués comme résolus.
                            Un email de notification sera envoyé au propriétaire du post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePost(selectedReport.post_id!)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer le post
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Delete User Account Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        disabled={isActionInProgress || isProtectedUser(selectedReport.reported_user_id)}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        {isDeletingUser 
                          ? "Suppression..." 
                          : isProtectedUser(selectedReport.reported_user_id)
                            ? "Compte protégé"
                            : "Supprimer le compte utilisateur"
                        }
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">
                          ⚠️ Supprimer ce compte utilisateur ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            <strong>Cette action est irréversible.</strong> Le compte de{" "}
                            <span className="font-semibold">
                              {selectedReport.reported_user?.full_name || "cet utilisateur"}
                            </span>{" "}
                            sera définitivement supprimé.
                          </p>
                          <p>Toutes les données associées (posts, messages, etc.) seront également supprimées.</p>
                          <p>Un email de notification sera envoyé à l'utilisateur.</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(selectedReport.reported_user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Oui, supprimer le compte
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Status Update Actions */}
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
                <Select
                  value={selectedStatus}
                  onValueChange={(status) => {
                    setSelectedStatus(status);
                    updateReportStatus(selectedReport.id, status);
                  }}
                  disabled={isActionInProgress}
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
