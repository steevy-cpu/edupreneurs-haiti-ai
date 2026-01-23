import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogAuthor {
  id: string;
  user_id: string;
  display_name: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: BlogAuthor;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  status?: "draft" | "published" | "archived";
  author_id?: string;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
  published_at?: string | null;
}

// Fetch all published posts (for public pages)
export function usePublishedBlogPosts(limit?: number) {
  return useQuery({
    queryKey: ["blog-posts", "published", limit],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          author:blog_authors(*)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

// Fetch all posts (for admin)
export function useAllBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          author:blog_authors(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

// Fetch single post by slug
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          author:blog_authors(*)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}

// Fetch all blog authors
export function useBlogAuthors() {
  return useQuery({
    queryKey: ["blog-authors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_authors")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as BlogAuthor[];
    },
  });
}

// Create blog post
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreateBlogPostData) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          ...postData,
          published_at: postData.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

// Update blog post
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateBlogPostData) => {
      // If publishing for the first time, set published_at
      if (updateData.status === "published" && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", data.slug] });
    },
  });
}

// Delete blog post
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

// Generate unique slug
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check if slug exists
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (!data || data.length === 0) {
    return baseSlug;
  }

  // Find the next available number
  const existingSlugs = data.map((p) => p.slug);
  let counter = 1;
  let newSlug = baseSlug;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}
