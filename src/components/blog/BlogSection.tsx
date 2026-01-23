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
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Bientôt disponible</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Notre blog est en cours de préparation. Revenez bientôt pour découvrir nos articles sur l'éducation et la technologie.
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
            <Button variant="outline" size="lg" className="gap-2">
              Voir tous les articles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
