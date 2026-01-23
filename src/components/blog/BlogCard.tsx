import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlogPost } from "@/hooks/useBlogPosts";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const authorName = post.author?.display_name || "Équipe EDUPRENEURS";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: fr })
    : formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr });

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <Card className={`h-full overflow-hidden border-border/60 hover:border-border hover:shadow-md transition-all duration-300 ease-out hover:scale-[1.01] ${featured ? "md:flex" : ""}`}>
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className={`relative overflow-hidden ${featured ? "md:w-2/5 md:flex-shrink-0" : "aspect-video"}`}>
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}

        <div className={`flex flex-col ${featured ? "md:w-3/5" : ""}`}>
          <CardContent className="flex-1 p-4 md:p-5">
            {/* Meta Info */}
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>

            {/* Title */}
            <h3 className={`font-semibold text-foreground group-hover:text-primary transition-colors duration-300 ease-out line-clamp-2 ${featured ? "text-xl mb-3" : "text-base mb-2"}`}>
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className={`text-muted-foreground line-clamp-2 leading-relaxed ${featured ? "text-sm" : "text-sm"}`}>
                {post.excerpt}
              </p>
            )}
          </CardContent>

          <CardFooter className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
            <div className="flex items-center justify-between w-full">
              {/* Author */}
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={post.author?.avatar_url || undefined} alt={authorName} />
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{authorName}</span>
              </div>

              {/* Read More */}
              <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                <span>Lire</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
