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
import { ArrowLeft, FileText, Calendar, ClipboardList, Wallet, Award, Receipt, LucideIcon, Sparkles } from 'lucide-react';

const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  schedule: Calendar,
  planner: ClipboardList,
  budget: Wallet,
  certificate: Award,
  resume: FileText,
  invoice: Receipt,
};

const CATEGORY_COLORS: Record<string, { gradient: string; iconBg: string }> = {
  schedule: { gradient: 'from-blue-500/10 to-cyan-500/5', iconBg: 'bg-blue-500' },
  planner: { gradient: 'from-purple-500/10 to-pink-500/5', iconBg: 'bg-purple-500' },
  budget: { gradient: 'from-green-500/10 to-emerald-500/5', iconBg: 'bg-green-500' },
  certificate: { gradient: 'from-amber-500/10 to-yellow-500/5', iconBg: 'bg-amber-500' },
  resume: { gradient: 'from-slate-500/10 to-gray-500/5', iconBg: 'bg-slate-500' },
  invoice: { gradient: 'from-indigo-500/10 to-violet-500/5', iconBg: 'bg-indigo-500' },
};

export default function TemplatesCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { data: templates = [], isLoading } = useTemplates(category);
  const { data: categories = [] } = useTemplateCategories();

  const currentCategory = categories.find(c => c.id === category);

  if (!isLoading && categories.length > 0 && !currentCategory) {
    return <Navigate to="/templates" replace />;
  }

  const categoryName = currentCategory?.name || 'Templates';
  const categoryDescription = currentCategory?.description || '';
  const CategoryIcon = CATEGORY_ICONS[category || ''] || FileText;
  const colors = CATEGORY_COLORS[category || ''] || CATEGORY_COLORS.schedule;

  // Generate breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://mon-edupreneur.com" },
      { "@type": "ListItem", "position": 2, "name": "Templates", "item": "https://mon-edupreneur.com/templates" },
      { "@type": "ListItem", "position": 3, "name": categoryName, "item": `https://mon-edupreneur.com/templates/${category}` }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{categoryName} - Templates Gratuits | EDUPRENEURS</title>
        <meta 
          name="description" 
          content={`${categoryDescription} Téléchargez gratuitement des templates ${categoryName.toLowerCase()} personnalisables en PDF.`}
        />
        <link rel="canonical" href={`https://mon-edupreneur.com/templates/${category}`} />
        <link rel="alternate" hrefLang="fr-HT" href={`https://mon-edupreneur.com/templates/${category}`} />
        <link rel="alternate" hrefLang="fr" href={`https://mon-edupreneur.com/templates/${category}`} />
        <meta property="og:title" content={`${categoryName} - Templates EDUPRENEURS`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mon-edupreneur.com/templates/${category}`} />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/templates" className="flex items-center gap-2.5 font-bold text-xl group">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span>EDUPRENEURS</span>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="sm" className="shadow-sm">Se connecter</Button>
            </Link>
          </div>
        </header>

        {/* Category Header */}
        <section className={`relative py-12 md:py-16 bg-gradient-to-br ${colors.gradient}`}>
          <div className="container mx-auto px-4">
            <Link 
              to="/templates" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux templates
            </Link>

            <div className="flex items-start gap-5">
              <div className={`p-4 rounded-2xl ${colors.iconBg} text-white shadow-lg`}>
                <CategoryIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryName}</h1>
                {categoryDescription && (
                  <p className="text-muted-foreground max-w-2xl text-lg">{categoryDescription}</p>
                )}
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{templates.length} template{templates.length !== 1 ? 's' : ''} disponible{templates.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20">
              <div className={`w-20 h-20 rounded-2xl ${colors.iconBg}/10 flex items-center justify-center mx-auto mb-6`}>
                <CategoryIcon className={`h-10 w-10 ${colors.iconBg.replace('bg-', 'text-')}`} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Aucun template disponible</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Les templates de cette catégorie arrivent bientôt. Revenez nous voir!
              </p>
              <Link to="/templates">
                <Button size="lg" className="shadow-lg">Explorer les autres catégories</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={
                <div className="h-72 rounded-2xl bg-muted animate-pulse" />
              }>
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </Suspense>
            </div>
          )}
        </section>

        {/* SEO Content */}
        {currentCategory && templates.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-xl font-semibold mb-4">
                Templates {categoryName} pour Étudiants
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Découvrez notre collection de templates {categoryName.toLowerCase()} gratuits, 
                spécialement conçus pour les étudiants haïtiens. Personnalisez-les selon vos besoins 
                et téléchargez-les en PDF ou PNG sans inscription.
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t py-10 bg-muted/30">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EDUPRENEURS. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
