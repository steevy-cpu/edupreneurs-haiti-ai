/**
 * TranslateCTA Component
 * 
 * CTA section encouraging account creation for unauthenticated users.
 * Follows anti-vibe rules: no sparkles, subtle styling.
 */

import { Link } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionAuth } from "@/contexts/SessionAuthContext";

export function TranslateCTA() {
  const { isAuthenticated, isLoading } = useSessionAuth();
  
  // Don't show if user is authenticated or still loading
  if (isAuthenticated || isLoading) return null;
  
  return (
    <Card className="mt-6 border-dashed bg-muted/30">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Débloquez plus de fonctionnalités
            </h3>
            <p className="text-sm text-muted-foreground">
              Accédez à Jude AI, cours MENFP, et outils personnalisés.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
              <Link to="/auth/login">Se connecter</Link>
            </Button>
            <Button 
              size="sm" 
              asChild 
              className="flex-1 sm:flex-none hover:scale-[1.02] transition-transform ease-out"
            >
              <Link to="/auth/signup/step-1">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
