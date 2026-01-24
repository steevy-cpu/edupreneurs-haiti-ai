import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Calendar, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { createSanitizedMarkup } from "@/lib/sanitize";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { isFounder } from "@/lib/founderConstants";
import { Footer } from "@/components/Footer";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";

// Estimate reading time (words per minute)
function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ""); // Strip HTML tags
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { data: post, isLoading, error } = useBlogPost(slug || "");

  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || "Article EDUPRENEURS";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié",
        description: "Le lien de l'article a été copié dans le presse-papiers.",
      });
    }
  };

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-xl items-center px-4">
            <Link to="/blog">
              <Button variant="ghost" size="icon" className="mr-3">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="container max-w-screen-lg mx-auto px-4 py-8">
          <Skeleton className="aspect-video w-full rounded-xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const authorName = post.author?.display_name || "Équipe EDUPRENEURS";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const publishedDate = post.published_at
    ? format(new Date(post.published_at), "d MMMM yyyy", { locale: fr })
    : format(new Date(post.created_at), "d MMMM yyyy", { locale: fr });

  const readingTime = estimateReadingTime(post.content);

  return (
    <>
      <Helmet>
        <title>{post.title} | Blog EDUPRENEURS Haiti</title>
        <meta
          name="description"
          content={post.excerpt || post.title}
        />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        {post.cover_image_url && (
          <meta property="og:image" content={post.cover_image_url} />
        )}
        <meta property="og:type" content="article" />
        <link
          rel="canonical"
          href={`https://edupreneurs-haiti-ai.lovable.app/blog/${post.slug}`}
        />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        {post.author?.display_name && (
          <meta property="article:author" content={post.author.display_name} />
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center">
              <Link to="/blog">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-3 hover:scale-[1.02] transition-transform duration-300 ease-out"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-300 ease-out">
                <img 
                  src={edupreneursLogo} 
                  alt="EDUPRENEURS" 
                  className="h-7 w-auto"
                />
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                  Blog
                </span>
              </Link>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              className="hover:scale-[1.02] transition-transform duration-300 ease-out"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <article className="container max-w-screen-lg mx-auto px-4 py-8">
          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="aspect-[4/3] md:aspect-[16/10] w-full rounded-xl overflow-hidden mb-8">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={post.author?.avatar_url || undefined}
                  alt={authorName}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-foreground">{authorName}</div>
                {post.author?.role && (
                  <div className="text-xs">{post.author.role}</div>
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{publishedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min de lecture</span>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed border-l-4 border-primary pl-4 italic">
              {post.excerpt}
            </p>
          )}

          <Separator className="mb-8" />

          {/* Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg prose-img:mx-auto"
            dangerouslySetInnerHTML={createSanitizedMarkup(post.content)}
          />

          {/* Author Bio */}
          {post.author && (
            <>
              <Separator className="my-12" />
              <div className="flex items-start gap-4 p-6 rounded-xl bg-muted/50">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={post.author.avatar_url || undefined}
                    alt={authorName}
                  />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg">{authorName}</div>
                  {post.author.role && (
                    <Badge className="mb-2 bg-primary/90 hover:bg-primary text-primary-foreground">
                      {post.author.role}
                    </Badge>
                  )}
                  {/* Hide bio for founders - only show role badge */}
                  {post.author.bio && !isFounder(post.author.user_id) && (
                    <p className="text-muted-foreground">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </article>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
