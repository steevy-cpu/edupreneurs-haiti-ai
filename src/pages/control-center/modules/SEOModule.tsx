import { useState } from "react";
import { Search, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * SEO Module — Outils d'indexation et de référencement.
 * Actuellement : soumission manuelle IndexNow à Bing.
 */
export default function SEOModule() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soumet toutes les URLs publiques à Bing IndexNow via l'edge function
  const handleSubmitToBing = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("indexnow-submit", {
        body: {},
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "URLs soumises à Bing",
          description: `${data.submitted} URLs soumises avec succès (status ${data.bingStatus}).`,
        });
      } else {
        throw new Error(data?.error || "Erreur inconnue");
      }
    } catch (error: any) {
      console.error("IndexNow submit error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre les URLs à Bing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">SEO & Indexation</h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">IndexNow — Bing</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Soumet les URLs publiques du site à Bing pour une indexation instantanée.
            Inclut la page d'accueil, le blog et les templates.
          </p>
          <Button onClick={handleSubmitToBing} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Soumission en cours..." : "🔍 Soumettre toutes les URLs à Bing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
