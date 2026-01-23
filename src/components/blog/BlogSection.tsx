import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "./BlogCard";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";

interface BlogSectionProps {
  limit?: number;
}

export function BlogSection({ limit = 3 }: BlogSectionProps) {
  const { data: posts, isLoading, error } = usePublishedBlogPosts(limit);

  if (error) {
    return null; // Silently fail on home page
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(Math.min(limit, 4))].map((_, i) => (
          <div key={i} className="relative aspect-[4/3] rounded-2xl bg-muted animate-pulse overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              <Skeleton className="h-4 w-24 bg-white/20" />
              <Skeleton className="h-8 w-3/4 bg-white/20" />
              <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 mb-4">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-2 text-foreground">Bientôt disponible</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Notre blog est en cours de préparation. Revenez bientôt pour découvrir nos articles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} featured={index === 0} />
        ))}
      </div>

      {posts.length >= limit && (
        <div className="text-center">
          <Link to="/blog">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 hover:scale-[1.02] transition-transform duration-300 ease-out"
            >
              Voir tous les articles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
