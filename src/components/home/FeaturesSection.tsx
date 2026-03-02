import { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { features, getIcon } from "@/data/homePageData";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

/**
 * Features grid section.
 * Static content with CSS-only hover effects.
 * Animations disabled on 3G connections.
 */
export const FeaturesSection = memo(function FeaturesSection() {
  const { shouldShowAnimations } = useNetworkAwareLoading();
  
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            Pourquoi choisir EDUPRENEURS ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Une plateforme révolutionnaire conçue spécialement pour les élèves haïtiens
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className={`group transition-all duration-300 ease-out border-primary/20 hover:border-primary/40 text-center ${
                shouldShowAnimations ? 'hover:scale-[1.02] hover:shadow-xl' : 'hover:shadow-lg'
              }`}
            >
              <CardHeader>
                <div className={`mx-auto mb-4 ${shouldShowAnimations ? 'group-hover:scale-105 transition-transform duration-300 ease-out' : ''}`}>
                  {getIcon(feature.iconName, "w-10 h-10 text-primary")}
                </div>
                <CardTitle className="text-lg font-bold text-primary">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Signup CTA after features grid */}
        <div className="text-center mt-10">
          <Link to="/auth/signup/step-1" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105">
            Créer un compte gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
});

export default FeaturesSection;
