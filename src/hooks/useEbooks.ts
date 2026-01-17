import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Ebook {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  language: 'fr' | 'en';
  category: string | null;
  cover_url: string | null;
  file_url: string;
  page_count: number | null;
  is_published: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EbookComment {
  id: string;
  ebook_id: string;
  user_id: string;
  comment: string;
  rating: number | null;
  created_at: string;
  profile?: {
    nickname: string;
    avatar_url: string | null;
  };
}

export interface EbookFilters {
  language?: 'fr' | 'en' | 'all';
  category?: string;
  search?: string;
  includeUnpublished?: boolean;
}

// Fetch all published ebooks with optional filters
export function useEbooks(filters?: EbookFilters) {
  return useQuery({
    queryKey: ['ebooks', filters],
    queryFn: async () => {
      let query = supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });

      // By default, only show published ebooks
      if (!filters?.includeUnpublished) {
        query = query.eq('is_published', true);
      }

      if (filters?.language && filters.language !== 'all') {
        query = query.eq('language', filters.language);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ebook[];
    },
  });
}

// Fetch single ebook by ID
export function useEbook(id: string | undefined) {
  return useQuery({
    queryKey: ['ebook', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Ebook;
    },
    enabled: !!id,
  });
}

// Fetch comments for an ebook with user profiles
export function useEbookComments(ebookId: string | undefined) {
  return useQuery({
    queryKey: ['ebook-comments', ebookId],
    queryFn: async () => {
      if (!ebookId) return [];
      
      // Fetch comments
      const { data: comments, error: commentsError } = await supabase
        .from('ebook_comments')
        .select('*')
        .eq('ebook_id', ebookId)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      if (!comments || comments.length === 0) return [];

      // Fetch profiles for comment authors - with error handling for unauthenticated access
      const userIds = [...new Set(comments.map(c => c.user_id))];
      let profileMap = new Map<string, { nickname: string; avatar_url: string | null }>();

      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, nickname, avatar_url')
          .in('user_id', userIds);
        
        profileMap = new Map(
          profiles?.map(p => [p.user_id, { nickname: p.nickname, avatar_url: p.avatar_url }]) || []
        );
      } catch (e) {
        // If profile fetch fails (e.g., unauthenticated), continue with empty profiles
        console.log('Could not fetch profiles, using fallback');
      }

      // Combine comments with profiles
      return comments.map(comment => ({
        ...comment,
        profile: profileMap.get(comment.user_id) || undefined,
      })) as EbookComment[];
    },
    enabled: !!ebookId,
  });
}

// Create ebook mutation
export function useCreateEbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ebook: Omit<Ebook, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ebooks')
        .insert(ebook)
        .select()
        .single();
      if (error) throw error;
      return data as Ebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      toast.success('Livre ajouté avec succès');
    },
    onError: (error) => {
      console.error('Error creating ebook:', error);
      toast.error('Erreur lors de l\'ajout du livre');
    },
  });
}

// Update ebook mutation
export function useUpdateEbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ebook> & { id: string }) => {
      const { data, error } = await supabase
        .from('ebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Ebook;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      queryClient.invalidateQueries({ queryKey: ['ebook', data.id] });
      toast.success('Livre mis à jour');
    },
    onError: (error) => {
      console.error('Error updating ebook:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

// Delete ebook mutation
export function useDeleteEbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      toast.success('Livre supprimé');
    },
    onError: (error) => {
      console.error('Error deleting ebook:', error);
      toast.error('Erreur lors de la suppression');
    },
  });
}

// Create comment mutation
export function useCreateEbookComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ebookId, comment, rating }: { 
      ebookId: string; 
      comment: string; 
      rating?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ebook_comments')
        .insert({
          ebook_id: ebookId,
          user_id: user.id,
          comment,
          rating: rating || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ebook-comments', variables.ebookId] });
      toast.success('Commentaire ajouté');
    },
    onError: (error: any) => {
      console.error('Error creating comment:', error);
      if (error?.message?.includes('row-level security') || error?.code === '42501') {
        toast.error('Vous devez être connecté pour commenter');
      } else if (error?.message === 'Not authenticated') {
        toast.error('Veuillez vous connecter pour commenter');
      } else {
        toast.error('Erreur lors de l\'ajout du commentaire');
      }
    },
  });
}

// Delete comment mutation
export function useDeleteEbookComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, ebookId }: { commentId: string; ebookId: string }) => {
      const { error } = await supabase
        .from('ebook_comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
      return ebookId;
    },
    onSuccess: (ebookId) => {
      queryClient.invalidateQueries({ queryKey: ['ebook-comments', ebookId] });
      toast.success('Commentaire supprimé');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression');
    },
  });
}
