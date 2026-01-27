/**
 * Template Editor Page
 * 
 * Full-featured template editor with live preview and export.
 * SEO-optimized with template-specific meta tags.
 */

import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useTemplate } from '@/hooks/useTemplates';
import { useTemplateEditor } from '@/hooks/useTemplateEditor';
import { useTemplateExport } from '@/hooks/useTemplateExport';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, RotateCcw, Loader2 } from 'lucide-react';

// Lazy load heavy editor components
const TemplateCanvas = lazy(() => import('@/components/templates/TemplateCanvas'));
const EditorSidebar = lazy(() => import('@/components/templates/EditorSidebar'));

function EditorSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      <div className="flex-1 bg-muted animate-pulse rounded-xl" />
      <div className="w-full lg:w-80 bg-muted animate-pulse rounded-xl" />
    </div>
  );
}

function TemplateEditorContent({ slug }: { slug: string }) {
  const { data: template, isLoading, error } = useTemplate(slug);

  // Template not found
  if (!isLoading && !template) {
    return <Navigate to="/templates" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EditorSkeleton />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Erreur lors du chargement du template.</p>
        <Link to="/templates">
          <Button className="mt-4">Retour aux templates</Button>
        </Link>
      </div>
    );
  }

  return <TemplateEditorInner template={template} />;
}

function TemplateEditorInner({ template }: { template: NonNullable<ReturnType<typeof useTemplate>['data']> }) {
  const { state, updateField, updateTableCell, selectElement, reset } = useTemplateEditor(template);
  const { isExporting, exportPDF, exportPNG } = useTemplateExport();

  const handleExportPDF = () => {
    exportPDF(template.id, state.values, template.slug);
  };

  const handleExportPNG = () => {
    exportPNG(template.id, state.values, template.slug);
  };

  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": template.title,
    "description": template.description,
    "step": [
      { "@type": "HowToStep", "text": "Personnalisez les champs du template" },
      { "@type": "HowToStep", "text": "Prévisualisez vos modifications en temps réel" },
      { "@type": "HowToStep", "text": "Téléchargez en PDF ou PNG gratuitement" },
    ],
    "tool": { "@type": "SoftwareApplication", "name": "EDUPRENEURS Templates" },
  };

  return (
    <>
      <Helmet>
        <title>{template.seo_title || template.title} | Templates EDUPRENEURS</title>
        <meta 
          name="description" 
          content={template.seo_description || template.description} 
        />
        <link rel="canonical" href={`https://edupreneurs-haiti-ai.lovable.app/templates/${template.slug}`} />
        <meta property="og:title" content={`${template.title} | Templates EDUPRENEURS`} />
        <meta property="og:description" content={template.description} />
        <meta property="og:image" content={template.og_image_url || template.thumbnail_url || ''} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Link 
              to={`/templates/${template.category}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="text-2xl font-bold">{template.title}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={!state.isDirty || isExporting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPNG}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PNG
            </Button>
            <Button
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Canvas Preview */}
          <div className="flex-1 bg-muted/30 rounded-xl p-4 flex items-center justify-center overflow-auto">
            <Suspense fallback={
              <div className="w-full max-w-[595px] aspect-[1/1.414] bg-muted animate-pulse rounded-lg" />
            }>
              <TemplateCanvas
                schema={template.schema}
                values={state.values}
                selectedElementId={state.selectedElementId}
                onElementSelect={selectElement}
              />
            </Suspense>
          </div>

          {/* Editor Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <Suspense fallback={
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
            }>
              <EditorSidebar
                schema={template.schema}
                values={state.values}
                selectedElementId={state.selectedElementId}
                onFieldChange={updateField}
                onTableCellChange={updateTableCell}
                onElementSelect={selectElement}
              />
            </Suspense>
          </div>
        </div>

        {/* How to Use Section (SEO) */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Comment utiliser ce template</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Modifiez les champs dans le panneau de droite</li>
            <li>Visualisez vos modifications en temps réel sur l'aperçu</li>
            <li>Cliquez sur "PDF" ou "PNG" pour télécharger votre document</li>
          </ol>
          <p className="mt-4 text-muted-foreground">
            Vos modifications sont automatiquement sauvegardées dans votre navigateur. 
            Vous pouvez revenir plus tard pour continuer l'édition.
          </p>
        </section>
      </div>
    </>
  );
}

export default function TemplateEditorPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/templates" replace />;
  }

  return (
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

      <TemplateEditorContent slug={slug} />

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EDUPRENEURS. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link to="/templates" className="text-sm text-muted-foreground hover:text-foreground">
              Tous les templates
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
