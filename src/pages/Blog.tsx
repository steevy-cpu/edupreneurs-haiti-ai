import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, BookOpen, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/BlogCard";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";

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
        <link rel="canonical" href="https://edupreneurs-haiti-ai.lovable.app/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-xl items-center px-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="mr-3">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-amber-500">
                <Rss className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                Blog EDUPRENEURS
              </h1>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-muted/50 to-background">
          <div className="container max-w-screen-xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
              Notre Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conseils d'apprentissage, guides pratiques et actualités sur
              l'éducation en Haïti. Découvrez comment tirer le meilleur parti
              d'EDUPRENEURS.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <main className="container max-w-screen-xl mx-auto px-4 py-8 md:py-12">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
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
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                Une erreur s'est produite lors du chargement des articles.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  featured={index === 0 && posts.length > 2}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Bientôt disponible</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Notre blog est en cours de préparation. Revenez bientôt pour
                découvrir nos articles sur l'éducation et des conseils
                d'apprentissage.
              </p>
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          )}
        </main>

        {/* Footer CTA */}
        {posts && posts.length > 0 && (
          <section className="py-12 px-4 bg-muted/30 border-t">
            <div className="container max-w-screen-xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">
                Prêt à commencer votre voyage éducatif ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Rejoignez des milliers d'étudiants haïtiens qui utilisent
                EDUPRENEURS pour réussir leurs études.
              </p>
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Créer un compte gratuit
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
