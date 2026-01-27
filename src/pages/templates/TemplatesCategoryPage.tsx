/**
 * Templates Category Page
 * 
 * Lists all templates in a specific category.
 * SEO-optimized with category-specific meta tags.
 */

import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useTemplates, useTemplateCategories } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

// Lazy load heavy components
const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));

export default function TemplatesCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { data: templates = [], isLoading } = useTemplates(category);
  const { data: categories = [] } = useTemplateCategories();

  const currentCategory = categories.find(c => c.id === category);

  // Invalid category - redirect to main templates page
  if (!isLoading && categories.length > 0 && !currentCategory) {
    return <Navigate to="/templates" replace />;
  }

  const categoryName = currentCategory?.name || 'Templates';
  const categoryDescription = currentCategory?.description || '';

  return (
    <>
      <Helmet>
        <title>{categoryName} - Templates Gratuits | EDUPRENEURS</title>
        <meta 
          name="description" 
          content={`${categoryDescription} Téléchargez gratuitement des templates ${categoryName.toLowerCase()} personnalisables en PDF.`}
        />
        <link rel="canonical" href={`https://edupreneurs-haiti-ai.lovable.app/templates/${category}`} />
        <meta property="og:title" content={`${categoryName} - Templates EDUPRENEURS`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/templates" className="flex items-center gap-2 font-bold text-xl">
              <FileText className="h-6 w-6 text-primary" />
              <span>EDUPRENEURS</span>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </Link>
          </div>
        </header>

        {/* Breadcrumb & Title */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <Link 
              to="/templates" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux templates
            </Link>

            <h1 className="text-3xl font-bold">{categoryName}</h1>
            {categoryDescription && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{categoryDescription}</p>
            )}
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucun template disponible</h2>
              <p className="text-muted-foreground mb-6">
                Les templates de cette catégorie arrivent bientôt.
              </p>
              <Link to="/templates">
                <Button>Explorer les autres catégories</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={
                <div className="h-64 rounded-xl bg-muted animate-pulse" />
              }>
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </Suspense>
            </div>
          )}
        </section>

        {/* SEO Content */}
        {currentCategory && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-xl font-semibold mb-4">
                Templates {categoryName} pour Étudiants
              </h2>
              <p className="text-muted-foreground">
                Découvrez notre collection de templates {categoryName.toLowerCase()} gratuits, 
                spécialement conçus pour les étudiants haïtiens. Personnalisez-les selon vos besoins 
                et téléchargez-les en PDF ou PNG sans inscription.
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EDUPRENEURS. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                Politique de confidentialité
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                Accueil
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
