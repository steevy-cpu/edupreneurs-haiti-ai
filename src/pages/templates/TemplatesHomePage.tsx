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
import { Search, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { 
  Calendar, ClipboardList, Wallet, Award, FileText as FileTextIcon, Receipt,
  LucideIcon 
} from 'lucide-react';
import { useState } from 'react';

// Lazy load heavy components
const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));

// Icon map for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'calendar': Calendar,
  'clipboard-list': ClipboardList,
  'wallet': Wallet,
  'award': Award,
  'file-text': FileTextIcon,
  'receipt': Receipt,
};

// Get icon component by name
function getIcon(iconName: string): LucideIcon {
  return CATEGORY_ICONS[iconName] || FileTextIcon;
}

export default function TemplatesHomePage() {
  const { data: categories = [], isLoading: categoriesLoading } = useTemplateCategories();
  const { data: featured = [], isLoading: featuredLoading } = useFeaturedTemplates();
  const { data: counts = {} } = useTemplateCounts();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Helmet>
        <title>Templates Gratuits | EDUPRENEURS - Emploi du temps, Planificateurs, CV</title>
        <meta 
          name="description" 
          content="Téléchargez gratuitement des templates PDF personnalisables: emplois du temps scolaires, planificateurs d'études, fiches de budget, certificats. Exportez sans inscription." 
        />
        <meta name="keywords" content="templates gratuits, emploi du temps, planificateur, budget étudiant, certificat, Haiti, MENFP" />
        <link rel="canonical" href="https://edupreneurs-haiti-ai.lovable.app/templates" />
        <meta property="og:title" content="Templates Gratuits | EDUPRENEURS" />
        <meta property="og:description" content="Templates PDF gratuits pour étudiants haïtiens. Personnalisez et exportez sans inscription." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_HT" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <FileText className="h-6 w-6 text-primary" />
              <span>EDUPRENEURS</span>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">100% Gratuit • Sans inscription</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Templates PDF Gratuits
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Personnalisez et téléchargez des emplois du temps, planificateurs, fiches de budget 
              et plus encore. Adapté au système éducatif haïtien.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un template..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Catégories</h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = getIcon(category.icon);
                const count = counts[category.id] || 0;
                
                return (
                  <Link
                    key={category.id}
                    to={`/templates/${category.id}`}
                    className="group relative flex flex-col items-center justify-center p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-center text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
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
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Templates Populaires</h2>
                <Link to="/templates/schedule" className="text-primary hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {featuredLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense fallback={
                    <div className="h-64 rounded-xl bg-muted animate-pulse" />
                  }>
                    {featured.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </Suspense>
                </div>
              )}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Comment ça marche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Choisissez', desc: 'Sélectionnez un template adapté à vos besoins' },
              { step: '2', title: 'Personnalisez', desc: 'Modifiez les textes, dates et informations' },
              { step: '3', title: 'Téléchargez', desc: 'Exportez en PDF ou PNG gratuitement' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Footer Text */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Templates Gratuits pour Étudiants Haïtiens</h2>
            <p className="text-muted-foreground mb-4">
              EDUPRENEURS propose une collection de templates PDF gratuits spécialement conçus pour les étudiants 
              haïtiens. Nos emplois du temps sont adaptés au programme du MENFP, de la 7ème Année Fondamentale 
              jusqu'à la Terminale (NS4).
            </p>
            <p className="text-muted-foreground">
              Tous nos templates sont personnalisables directement dans votre navigateur. Aucune inscription 
              n'est requise. Téléchargez en PDF pour l'impression ou en PNG pour le partage numérique.
            </p>
          </div>
        </section>

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
