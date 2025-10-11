import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

const Resources = () => {
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 pt-14 sm:pt-16">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Construction size={24} className="sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Ressources</h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-base opacity-90 leading-relaxed">
            Documents, vidéos et supports pédagogiques
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-8 sm:pt-12">
        <Card className="border-none rounded-[20px] shadow-lg">
          <CardContent className="p-12 sm:p-16 text-center">
            <div className="mb-6">
              <Construction size={64} className="mx-auto text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">
              Bientôt disponible
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Nous travaillons activement sur cette section pour vous offrir les meilleures ressources éducatives. Revenez bientôt ! 📚
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
