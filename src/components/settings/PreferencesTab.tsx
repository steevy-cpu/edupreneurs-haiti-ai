/**
 * @file PreferencesTab.tsx
 * @description Preferences tab content for the Settings page — static
 *   language/locale information. Expandable as i18n is implemented.
 * @module components/settings
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe } from "lucide-react";

export function PreferencesTab() {
  return (
    <Card className="border-none rounded-[20px] shadow-md">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Globe className="text-primary shrink-0" size={20} />
          Préférences de l'application
        </CardTitle>
        <CardDescription className="text-sm">
          Personnalisez votre expérience d'apprentissage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {/* Static language info — no i18n system exists yet */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            La plateforme est disponible en Français. Le support du Kreyòl est en cours de développement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
