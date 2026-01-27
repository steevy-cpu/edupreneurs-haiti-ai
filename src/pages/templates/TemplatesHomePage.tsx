/**
 * Templates Home Page
 * 
 * Public landing page for the templates directory.
 * SEO-optimized with categories grid and featured templates.
 */

import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useTemplateCategories, useFeaturedTemplates, useTemplateCounts } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, FileText, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { 
  Calendar, ClipboardList, Wallet, Award, FileText as FileTextIcon, Receipt,
  LucideIcon 
} from 'lucide-react';
import { useState } from 'react';

const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'calendar': Calendar,
  'clipboard-list': ClipboardList,
  'wallet': Wallet,
  'award': Award,
  'file-text': FileTextIcon,
  'receipt': Receipt,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; hover: string }> = {
  'schedule': { bg: 'bg-blue-500/10', text: 'text-blue-600', hover: 'group-hover:bg-blue-500' },
  'planner': { bg: 'bg-purple-500/10', text: 'text-purple-600', hover: 'group-hover:bg-purple-500' },
  'budget': { bg: 'bg-green-500/10', text: 'text-green-600', hover: 'group-hover:bg-green-500' },
  'certificate': { bg: 'bg-amber-500/10', text: 'text-amber-600', hover: 'group-hover:bg-amber-500' },
  'resume': { bg: 'bg-slate-500/10', text: 'text-slate-600', hover: 'group-hover:bg-slate-500' },
  'invoice': { bg: 'bg-indigo-500/10', text: 'text-indigo-600', hover: 'group-hover:bg-indigo-500' },
};

function getIcon(iconName: string): LucideIcon {
  return CATEGORY_ICONS[iconName] || FileTextIcon;
}

function getCategoryColors(categoryId: string) {
  return CATEGORY_COLORS[categoryId] || CATEGORY_COLORS['schedule'];
}

export default function TemplatesHomePage() {
  const { data: categories = [], isLoading: categoriesLoading } = useTemplateCategories();
  const { data: featured = [], isLoading: featuredLoading } = useFeaturedTemplates();
  const { data: counts = {} } = useTemplateCounts();
  const [searchQuery, setSearchQuery] = useState('');

  // Generate JSON-LD for categories
  const categoriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Templates Gratuits - EDUPRENEURS",
    "description": "Collection de templates PDF gratuits pour étudiants haïtiens",
    "url": "https://mon-edupreneur.com/templates",
    "isPartOf": {
      "@type": "WebSite",
      "name": "EDUPRENEURS",
      "url": "https://mon-edupreneur.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": categories.map((cat, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": cat.name,
        "url": `https://mon-edupreneur.com/templates/${cat.id}`
      }))
    }
  };

  return (
    <>
      <Helmet>
        <title>Templates Gratuits | EDUPRENEURS - Emploi du temps, Planificateurs, CV</title>
        <meta 
          name="description" 
          content="Téléchargez gratuitement des templates PDF personnalisables: emplois du temps scolaires, planificateurs d'études, fiches de budget, certificats. Exportez sans inscription." 
        />
        <meta name="keywords" content="templates gratuits, emploi du temps, planificateur, budget étudiant, certificat, Haiti, MENFP" />
        <link rel="canonical" href="https://mon-edupreneur.com/templates" />
        <link rel="alternate" hrefLang="fr-HT" href="https://mon-edupreneur.com/templates" />
        <link rel="alternate" hrefLang="fr" href="https://mon-edupreneur.com/templates" />
        <meta property="og:title" content="Templates Gratuits | EDUPRENEURS" />
        <meta property="og:description" content="Templates PDF gratuits pour étudiants haïtiens. Personnalisez et exportez sans inscription." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_HT" />
        <meta property="og:url" content="https://mon-edupreneur.com/templates" />
        <script type="application/ld+json">
          {JSON.stringify(categoriesJsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl group">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">EDUPRENEURS</span>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="sm" className="shadow-sm">Se connecter</Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">100% Gratuit • Sans inscription</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
              Templates PDF
              <span className="block text-primary mt-2">Personnalisables</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Emplois du temps, planificateurs, fiches de budget et plus encore. 
              <span className="text-foreground font-medium"> Adapté au système éducatif haïtien.</span>
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un template..."
                className="pl-12 h-14 text-base rounded-xl shadow-lg border-muted-foreground/20 focus:border-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Catégories</h2>
            <span className="text-sm text-muted-foreground">{categories.length} catégories</span>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = getIcon(category.icon);
                const count = counts[category.id] || 0;
                const colors = getCategoryColors(category.id);
                
                return (
                  <Link
                    key={category.id}
                    to={`/templates/${category.id}`}
                    className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className={`p-4 rounded-xl ${colors.bg} ${colors.text} mb-4 transition-all duration-300 ${colors.hover} group-hover:text-white group-hover:shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-center text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {count} template{count !== 1 ? 's' : ''}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Featured Templates */}
        {featured.length > 0 && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
            <div className="container mx-auto px-4 relative">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Templates Populaires</h2>
                  <p className="text-muted-foreground">Les plus téléchargés par la communauté</p>
                </div>
                <Link 
                  to="/templates/schedule" 
                  className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {featuredLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense fallback={
                    <div className="h-72 rounded-2xl bg-muted animate-pulse" />
                  }>
                    {featured.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </Suspense>
                </div>
              )}

              <Link 
                to="/templates/schedule" 
                className="md:hidden flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium mt-6"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Comment ça marche</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Trois étapes simples pour obtenir votre template personnalisé
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            {[
              { step: '1', title: 'Choisissez', desc: 'Sélectionnez un template adapté à vos besoins', icon: Search },
              { step: '2', title: 'Personnalisez', desc: 'Modifiez les textes, dates et informations', icon: FileText },
              { step: '3', title: 'Téléchargez', desc: 'Exportez en PDF ou PNG gratuitement', icon: Download },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 relative z-10">
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle2, title: '100% Gratuit', desc: 'Aucun frais caché' },
                { icon: Sparkles, title: 'Sans inscription', desc: 'Téléchargez immédiatement' },
                { icon: Download, title: 'PDF & PNG', desc: 'Formats professionnels' },
              ].map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="flex items-center gap-4 p-6 rounded-xl bg-background shadow-sm">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SEO Footer Text */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Templates Gratuits pour Étudiants Haïtiens</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              EDUPRENEURS propose une collection de templates PDF gratuits spécialement conçus pour les étudiants 
              haïtiens. Nos emplois du temps sont adaptés au programme du MENFP, de la 7ème Année Fondamentale 
              jusqu'à la Terminale (NS4).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Tous nos templates sont personnalisables directement dans votre navigateur. Aucune inscription 
              n'est requise. Téléchargez en PDF pour l'impression ou en PNG pour le partage numérique.
            </p>
          </div>
        </section>

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
