import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ThumbsUp, ThumbsDown, Loader2, Mail, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { FEEDBACK_RATING_OPTIONS, type LessonFeedbackAdmin } from '../types';
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';

export default function FeedbackModule() {
  const [feedbacks, setFeedbacks] = useState<LessonFeedbackAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState<LessonFeedbackAdmin | null>(null);
  const { toast } = useToast();

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const filterValue = ratingFilter === 'all' ? null : ratingFilter;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      const [dataResult, countResult] = await Promise.all([
        supabase.rpc('get_lesson_feedback_for_admin', {
          p_rating_filter: filterValue,
          p_limit: ITEMS_PER_PAGE,
          p_offset: offset,
        }),
        supabase.rpc('count_lesson_feedback_for_admin', {
          p_rating_filter: filterValue,
        }),
      ]);

      if (dataResult.error) throw dataResult.error;
      if (countResult.error) throw countResult.error;

      setFeedbacks((dataResult.data as LessonFeedbackAdmin[]) || []);
      setTotalCount(typeof countResult.data === 'number' ? countResult.data : 0);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les feedbacks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, currentPage, toast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter]);

  const getRatingBadge = (rating: string) => {
    if (rating === 'up') {
      return (
        <Badge className="bg-green-500 text-white gap-1">
          <ThumbsUp className="h-3 w-3" />
          Positif
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white gap-1">
        <ThumbsDown className="h-3 w-3" />
        Négatif
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const openMailClient = (email: string, name: string) => {
    const subject = encodeURIComponent('Re: Votre feedback sur Edupreneurs Haiti');
    const body = encodeURIComponent(`Bonjour ${name},\n\nMerci pour votre retour.\n\n`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Feedback Leçons ({totalCount})
        </h2>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {FEEDBACK_RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun feedback pour le moment.
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Leçon</TableHead>
                  <TableHead>Avis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow
                    key={feedback.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={feedback.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(feedback.full_name || feedback.nickname || '?')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm truncate max-w-[120px]">
                          {feedback.full_name || feedback.nickname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{feedback.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm truncate max-w-[180px]">
                      {feedback.lesson_title || '—'}
                    </TableCell>
                    <TableCell>{getRatingBadge(feedback.rating)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(feedback.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMailClient(feedback.email, feedback.full_name || feedback.nickname || '');
                        }}
                        title="Envoyer un email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
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
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Feedback de {selectedFeedback?.full_name || selectedFeedback?.nickname}
              {selectedFeedback && getRatingBadge(selectedFeedback.rating)}
            </DialogTitle>
            <DialogDescription>{selectedFeedback?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedFeedback?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(selectedFeedback?.full_name || selectedFeedback?.nickname || '?')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedFeedback?.full_name}</p>
                <p className="text-sm text-muted-foreground">@{selectedFeedback?.nickname}</p>
              </div>
            </div>

            {/* Lesson info */}
            {selectedFeedback?.lesson_title && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Leçon</p>
                <p className="text-sm">{selectedFeedback.lesson_title}</p>
              </div>
            )}

            {/* Comment — only for negative feedback */}
            {selectedFeedback?.rating === 'down' && selectedFeedback?.comment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Commentaire</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{selectedFeedback.comment}</p>
                </div>
              </div>
            )}

            {/* Date */}
            <p className="text-sm text-muted-foreground">
              Reçu le{' '}
              {selectedFeedback &&
                format(new Date(selectedFeedback.created_at), "dd MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedFeedback) {
                  openMailClient(
                    selectedFeedback.email,
                    selectedFeedback.full_name || selectedFeedback.nickname || ''
                  );
                }
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Répondre par email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
