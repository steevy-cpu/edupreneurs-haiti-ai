import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { migrateAllExamPDFs } from "@/utils/uploadExamPDFs";
import { ArrowLeft, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MigratePDFs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const migrationResults = await migrateAllExamPDFs();
      setResults(migrationResults);

      if (migrationResults.failed === 0) {
        toast({
          title: "Migration réussie",
          description: `${migrationResults.successful} PDF(s) migrés avec succès vers Supabase Storage`,
        });
      } else {
        toast({
          title: "Migration partiellement réussie",
          description: `${migrationResults.successful} réussis, ${migrationResults.failed} échoués`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Erreur de migration",
        description: "Une erreur est survenue lors de la migration des PDFs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/examens-officiels')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Migration des PDFs d'examens</h1>
            <p className="text-muted-foreground">
              Migrez les PDFs d'examens depuis le dossier public vers Supabase Storage pour une meilleure compatibilité avec les navigateurs.
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Upload className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Qu'est-ce que cette migration fait ?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Transfère les PDFs vers le bucket Supabase Storage "exam-documents"</li>
                    <li>• Met à jour les URLs dans la base de données</li>
                    <li>• Améliore la compatibilité d'affichage des PDFs dans tous les navigateurs</li>
                    <li>• Ajoute un fallback avec Google PDF Viewer si nécessaire</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleMigration}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migration en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Lancer la migration
                  </>
                )}
              </Button>
            </div>
          </Card>

          {results && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Résultats de la migration</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">{results.successful} réussis</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">{results.failed} échoués</span>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-3 rounded-lg ${
                      result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm flex-1">{result.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
