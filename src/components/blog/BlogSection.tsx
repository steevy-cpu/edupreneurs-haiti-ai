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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-24" />
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} featured={index === 0 && posts.length > 1} />
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
