import { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { platformFeatures, iconMap } from "@/data/homePageData";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

interface PlatformFeaturesSectionProps {
  examsCount: number;
}

/**
 * Platform features grid with dynamic exam count.
 * Static content with links that prefetch on hover.
 * Animations disabled on 3G connections.
 */
export const PlatformFeaturesSection = memo(function PlatformFeaturesSection({
  examsCount
}: PlatformFeaturesSectionProps) {
  const { shouldShowAnimations } = useNetworkAwareLoading();
  
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            Fonctionnalités de la Plateforme
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Découvrez toutes les fonctionnalités qui font d'EDUPRENEURS la plateforme éducative la plus complète d'Haïti
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {platformFeatures.map((feature, idx) => {
            const IconComponent = iconMap[feature.iconName];
            const highlight = feature.highlightTemplate.replace('{exams}', String(examsCount));
            
            return (
              <Link key={idx} to={feature.link} className="group">
                <Card className={`h-full transition-all duration-300 ease-out border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ${
                  shouldShowAnimations ? 'hover:scale-[1.02] hover:shadow-xl' : 'hover:shadow-lg'
                }`}>
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`} />
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg ${
                      shouldShowAnimations ? 'group-hover:scale-105 transition-transform duration-300 ease-out' : ''
                    }`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-primary group-hover:text-accent transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${feature.color} text-white shadow-md`}>
                      {highlight}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default PlatformFeaturesSection;
