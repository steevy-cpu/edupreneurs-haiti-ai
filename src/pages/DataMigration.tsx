import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Database, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { migrateContentToDatabase, checkMigrationStatus } from "@/utils/contentMigration";

const DataMigration = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isMigrated, setIsMigrated] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkIfMigrated();
  }, []);

  const checkIfMigrated = async () => {
    setIsChecking(true);
    try {
      const migrated = await checkMigrationStatus();
      setIsMigrated(migrated);
    } catch (error) {
      console.error('Error checking migration status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await migrateContentToDatabase();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setMigrationResult(result);
      
      if (result.success) {
        toast.success(`Migration réussie! ${result.lessonsCreated} leçons créées`);
        setIsMigrated(true);
      } else {
        toast.error("Erreurs lors de la migration");
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error("Erreur lors de la migration");
    } finally {
      setIsMigrating(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Vérification du statut...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/content-editor")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'éditeur
        </Button>

        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none mb-6">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
              <Database className="text-primary" />
              Migration des Données
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Migrez le contenu des leçons existantes vers la base de données
            </p>
          </CardHeader>
        </Card>

        {isMigrated ? (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              <strong>Migration déjà effectuée!</strong> Le contenu a déjà été migré vers la base de données.
              Vous pouvez relancer la migration pour mettre à jour le contenu.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cette opération va copier tout le contenu des fichiers TypeScript statiques
              vers la base de données. Les fichiers originaux seront conservés en backup.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Que va faire cette migration?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Créer les matières</p>
                  <p className="text-sm text-muted-foreground">
                    Mathématiques et Sciences seront ajoutées comme sujets
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Migrer toutes les leçons</p>
                  <p className="text-sm text-muted-foreground">
                    Toutes les leçons de mathématiques et sciences (AF7) seront copiées
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Conserver les fichiers originaux</p>
                  <p className="text-sm text-muted-foreground">
                    Les fichiers TypeScript restent en backup
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Publier automatiquement</p>
                  <p className="text-sm text-muted-foreground">
                    Toutes les leçons seront marquées comme publiées
                  </p>
                </div>
              </div>
            </div>

            {isMigrating && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Migration en cours... {progress}%
                </p>
              </div>
            )}

            {migrationResult && (
              <Alert className={migrationResult.success ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20"}>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {migrationResult.success ? "✅ Migration réussie!" : "❌ Migration avec erreurs"}
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>Matières créées: {migrationResult.subjectsCreated}</li>
                      <li>Leçons créées: {migrationResult.lessonsCreated}</li>
                      {migrationResult.errors.length > 0 && (
                        <li className="text-red-600">
                          Erreurs: {migrationResult.errors.length}
                        </li>
                      )}
                    </ul>
                    {migrationResult.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold">
                          Voir les erreurs
                        </summary>
                        <ul className="mt-2 text-xs space-y-1">
                          {migrationResult.errors.map((err: string, idx: number) => (
                            <li key={idx} className="text-red-600">• {err}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="flex-1"
                size="lg"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migration en cours...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    {isMigrated ? "Relancer la migration" : "Lancer la migration"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataMigration;
