import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Trash2, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CONTACT_STATUS } from '../types';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'spam';
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

const ITEMS_PER_PAGE = 15;

export default function ContactModule() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  // Wrapped in useCallback so the realtime subscription never needs to re-register
  // when filters or page change — the closure always calls the latest version
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Cast status to the correct type since DB returns string
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as ContactSubmission['status']
      }));
      setSubmissions(typedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  // Data fetch — re-runs when filter or page change
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Poll every 30s instead of realtime — contact_submissions was never in the
  // supabase_realtime publication so the channel was dead. Polling is correct here.
  useEffect(() => {
    const pollInterval = setInterval(() => fetchSubmissions(), 30_000);
    return () => clearInterval(pollInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du message a été modifié.',
      });

      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteSubmission = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      toast({
        title: 'Message supprimé',
        description: 'Le message a été supprimé.',
      });

      setDeleteTarget(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le message.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = CONTACT_STATUS.find((s) => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-muted'} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const openMailClient = (email: string, name: string) => {
    const subject = encodeURIComponent(`Re: Votre message sur Edupreneurs Haiti`);
    const body = encodeURIComponent(`Bonjour ${name},\n\nMerci pour votre message.\n\n`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages de contact ({totalCount})
        </h2>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {CONTACT_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun message de contact pour le moment.
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setAdminNotes(submission.admin_notes || '');
                    }}
                  >
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {submission.message}
                    </TableCell>
                    <TableCell>
                      {format(new Date(submission.created_at), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMailClient(submission.email, submission.name);
                          }}
                          title="Répondre par email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(submission);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {(() => {
                  // 5-page sliding window centered on currentPage — pages 6+ are always reachable
                  const windowSize = 5;
                  const halfWindow = Math.floor(windowSize / 2);
                  let startPage = Math.max(1, currentPage - halfWindow);
                  let endPage = Math.min(totalPages, startPage + windowSize - 1);
                  if (endPage - startPage < windowSize - 1) {
                    startPage = Math.max(1, endPage - windowSize + 1);
                  }
                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
                })().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message de {selectedSubmission?.name}</DialogTitle>
            <DialogDescription>{selectedSubmission?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Reçu le{' '}
                {selectedSubmission &&
                  format(new Date(selectedSubmission.created_at), "dd MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedSubmission?.message}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={selectedSubmission?.status}
                onValueChange={(value) => {
                  if (selectedSubmission) {
                    updateStatus(selectedSubmission.id, value);
                  }
                }}
                disabled={updatingStatus}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes admin</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes internes..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedSubmission) {
                  openMailClient(selectedSubmission.email, selectedSubmission.name);
                }
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Répondre par email
            </Button>
            <Button
              onClick={() => {
                if (selectedSubmission) {
                  updateStatus(selectedSubmission.id, selectedSubmission.status);
                }
              }}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le message de {deleteTarget?.name} sera définitivement
              supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSubmission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
