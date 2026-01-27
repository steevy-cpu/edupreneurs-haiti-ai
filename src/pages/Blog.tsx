import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/BlogCard";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";

export default function Blog() {
  const { data: posts, isLoading, error } = usePublishedBlogPosts();

  return (
    <>
      <Helmet>
        <title>Blog | EDUPRENEURS Haiti - Actualités & Conseils Éducatifs</title>
        <meta
          name="description"
          content="Découvrez nos articles sur l'éducation en Haïti, des conseils d'apprentissage, des guides d'utilisation de la plateforme et les dernières actualités d'EDUPRENEURS."
        />
        <meta
          name="keywords"
          content="blog éducation, Haïti, apprentissage, conseils études, EDUPRENEURS"
        />
        <link rel="canonical" href="https://mon-edupreneur.com/blog" />
        <link rel="alternate" hrefLang="fr-HT" href="https://mon-edupreneur.com/blog" />
        <link rel="alternate" hrefLang="fr" href="https://mon-edupreneur.com/blog" />
        <meta property="og:url" content="https://mon-edupreneur.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header - Clean, professional design */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center">
              <Link to="/">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-3 hover:scale-[1.02] transition-transform duration-300 ease-out"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity duration-300 ease-out">
                <img 
                  src={edupreneursLogo} 
                  alt="EDUPRENEURS" 
                  className="h-8 w-auto"
                />
                <span className="text-lg font-bold text-foreground">
                  Blog
                </span>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero - Clean gradient, no excessive effects */}
        <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
          <div className="container max-w-screen-xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Notre Blog
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Conseils d'apprentissage, guides pratiques et actualités sur
              l'éducation en Haïti.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <main className="container max-w-screen-xl mx-auto px-4 py-8 md:py-12">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
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
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive font-medium">
                Une erreur s'est produite lors du chargement des articles.
              </p>
              <Button
                variant="outline"
                className="mt-4 hover:scale-[1.02] transition-transform duration-300 ease-out"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  featured={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                Bientôt disponible
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
                Notre blog est en cours de préparation. Revenez bientôt pour
                découvrir nos articles sur l'éducation.
              </p>
              <Link to="/">
                <Button 
                  variant="outline"
                  className="hover:scale-[1.02] transition-transform duration-300 ease-out"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
