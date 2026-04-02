import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { History, User, Clock, Wifi } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface ChangeLogProps {
  selectedLesson: any;
}

export const ChangeLog = ({ selectedLesson }: ChangeLogProps) => {
  const [changes, setChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);

  // Subscribe to realtime changes
  useRealtimeSubscription({
    table: 'content_change_log',
    event: 'INSERT',
    filter: selectedLesson ? `lesson_id=eq.${selectedLesson.id}` : undefined,
    enabled: !!selectedLesson,
    callback: (payload) => {
      setIsRealtime(true);
      
      // Add the new change to the list
      setChanges((prev) => [payload.new, ...prev]);
      
      // Reset realtime indicator after animation
      setTimeout(() => setIsRealtime(false), 2000);
    },
  });

  useEffect(() => {
    if (selectedLesson) {
      fetchChanges();
    }
  }, [selectedLesson]);

  const fetchChanges = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_change_log')
        .select(`
          *,
          profiles:changed_by(full_name, nickname)
        `)
        .eq('lesson_id', selectedLesson.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setChanges(data || []);
    } catch (error) {
      console.error('Error fetching changes:', error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'publish':
        return 'default';
      case 'unpublish':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'create':
        return 'Création';
      case 'update':
        return 'Modification';
      case 'delete':
        return 'Suppression';
      case 'publish':
        return 'Publication';
      case 'unpublish':
        return 'Dépublication';
      default:
        return type;
    }
  };

  if (!selectedLesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour voir son historique</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des modifications
          {isRealtime && (
            <Badge variant="secondary" className="ml-auto animate-pulse">
              <Wifi className="mr-1 h-3 w-3" />
              Mise à jour en temps réel
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Toutes les modifications apportées à cette leçon
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="text-center text-muted-foreground p-4">
              Chargement...
            </div>
          ) : changes.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Aucune modification enregistrée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((change) => (
                <Card key={change.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getChangeTypeColor(change.change_type)}>
                        {getChangeTypeLabel(change.change_type)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(change.timestamp), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {change.profiles?.full_name || change.profiles?.nickname || 'Utilisateur inconnu'}
                      </span>
                    </div>
                    {change.new_content && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Modifications:</p>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(change.new_content, null, 2).slice(0, 200)}...
                        </pre>
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
