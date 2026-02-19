import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { History, RotateCcw, Clock, User, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useVersionControl } from "@/hooks/useVersionControl";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useState } from "react";

interface VersionHistoryProps {
  selectedLesson: any;
  onRestore: () => void;
}

export const VersionHistory = ({ selectedLesson, onRestore }: VersionHistoryProps) => {
  const { versions, isLoading, restoreVersion, compareVersions } = useVersionControl(
    selectedLesson?.id
  );
  // In-memory user from SessionAuthContext — avoids a redundant auth.getUser() call on restore
  const { user } = useSessionAuth();
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    // Pass user directly; restoreVersion signature accepts { id: string } | null
    const success = await restoreVersion(versionId, user);
    if (success) {
      onRestore();
    }
  };

  if (!selectedLesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour voir l'historique des versions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des Versions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Consultez et restaurez les versions précédentes
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="text-center p-4">Chargement...</div>
          ) : versions.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucune version enregistrée pour cette leçon
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <Card
                  key={version.id}
                  className={`border-l-4 ${
                    version.is_current ? "border-l-primary" : "border-l-muted"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={version.is_current ? "default" : "secondary"}>
                          Version {version.version_number}
                        </Badge>
                        {version.is_current && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Actuelle
                          </Badge>
                        )}
                      </div>
                    {!version.is_current && (
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(version.id)}
                          >
                            <RotateCcw className="mr-2 h-3 w-3" />
                            Restaurer
                          </Button>
                          {/* Partial-restore disclosure — snapshot only covers core text fields */}
                          <p className="text-xs text-muted-foreground leading-snug">
                            La restauration remet en place le titre, l'objectif, l'introduction, le contenu et les exemples. Le quiz, les activités, et le statut de publication ne sont pas affectés.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(version.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3 w-3" />
                        {version.profiles?.full_name || version.profiles?.nickname || 'Inconnu'}
                      </div>
                    </div>

                    {/* Guard: only show for versions that have a newer version above them to compare against */}
                    {index > 0 && (
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            setExpandedVersion(
                              expandedVersion === version.id ? null : version.id
                            )
                          }
                        >
                          {expandedVersion === version.id
                            ? "Masquer les changements"
                            : "Voir les changements"}
                        </Button>
                        {expandedVersion === version.id && (
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium mb-2">
                              Différences avec la version {version.version_number + 1}:
                            </p>
                            <div className="space-y-1 text-xs">
                              {compareVersions(version, versions[index - 1]).map((change) => (
                                <div key={change} className="flex items-center gap-2">
                                  <span className="text-orange-500">•</span>
                                  <span>{change}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
