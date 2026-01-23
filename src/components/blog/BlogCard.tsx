import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { BlogPost } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  // Format date as "23 janvier 2026"
  const formattedDate = post.published_at
    ? format(new Date(post.published_at), "d MMMM yyyy", { locale: fr })
    : format(new Date(post.created_at), "d MMMM yyyy", { locale: fr });

  // Estimate reading time (2-5 min based on excerpt length, or default 3)
  const readingTime = post.excerpt 
    ? Math.max(2, Math.min(5, Math.ceil(post.excerpt.length / 150))) 
    : 3;

  // Fallback gradient for posts without cover image
  const hasCoverImage = !!post.cover_image_url;

  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article 
        className={`relative overflow-hidden rounded-2xl ${
          featured ? "aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
        {/* Background Image or Gradient Fallback */}
        {hasCoverImage ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60" />
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between">
          {/* Top: Meta Info */}
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
              Blog
            </span>
            <span>{formattedDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min
            </span>
          </div>

          {/* Bottom: Title + CTA */}
          <div className="space-y-4">
            <h3 className={`font-bold text-white line-clamp-3 leading-tight ${
              featured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            }`}>
              {post.title}
            </h3>
            
            <div 
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-foreground font-medium rounded-full text-sm transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            >
              Lire l'article
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
