import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Calendar, Share2, Clock, MessageCircle, Link as LinkIcon, BadgeCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ThemeToggle } from "@/components/ThemeToggle";

// Social media icons
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

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

  const getShareUrl = () => window.location.href;
  const getShareTitle = () => post?.title || "Article EDUPRENEURS";

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(
      `📚 Découvrez cet article sur EDUPRENEURS: "${getShareTitle()}" ${getShareUrl()}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast({
      title: "Lien copié!",
      description: "Colle-le dans ta story ou message Instagram.",
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    toast({
      title: "Lien copié",
      description: "Le lien de l'article a été copié dans le presse-papiers.",
    });
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
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:scale-[1.02] transition-transform duration-300 ease-out"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
                    <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
                    <FacebookIcon />
                    <span className="ml-2">Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareToInstagram} className="cursor-pointer">
                    <InstagramIcon />
                    <span className="ml-2">Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copier le lien
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="container max-w-screen-lg mx-auto px-4 py-8">
          {/* Cover Image */}
          {post.cover_image_url && (
            <figure className="mb-8">
              <div className="mx-auto w-full max-w-3xl rounded-xl bg-muted/30 p-2">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-auto max-h-[220px] md:max-h-[300px] object-contain rounded-lg"
                />
              </div>
            </figure>
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
                <div className="font-medium text-foreground flex items-center gap-1">
                  {authorName}
                  {isFounder(post.author?.user_id) && (
                    <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                  )}
                </div>
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
                  <div className="font-bold text-lg flex items-center gap-1.5">
                    {authorName}
                    {isFounder(post.author.user_id) && (
                      <BadgeCheck className="h-5 w-5 text-primary fill-primary/20" />
                    )}
                  </div>
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
