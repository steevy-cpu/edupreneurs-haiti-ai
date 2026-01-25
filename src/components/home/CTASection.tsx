import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Final CTA section with gradient background.
 * Static content - no state.
 */
export const CTASection = memo(function CTASection() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-center overflow-hidden">
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==")`
        }}
      />
      
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-black mb-6 animate-fade-in">
          Rejoignez la révolution de l'éducation haïtienne
        </h2>
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto font-medium leading-relaxed">
          Transformez votre façon d'apprendre avec la technologie. Apprentissage personnalisé, assistant IA, et récompenses réelles vous attendent.
        </p>
        <Link to="/auth/signup/step-1">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 shadow-xl font-bold text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 hover:scale-[1.02] transition-all duration-300 ease-out"
          >
            <span className="hidden sm:inline">Créer un compte gratuitement</span>
            <span className="sm:hidden">Créer un compte</span>
          </Button>
        </Link>
      </div>
    </section>
  );
});

export default CTASection;
