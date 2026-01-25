import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { howItWorksSteps, getIcon } from "@/data/homePageData";
import ericStudentDesk from "@/assets/eric-student-desk.png";

/**
 * How It Works step-by-step section.
 * Static content with lazy-loaded images.
 */
export const HowItWorksSection = memo(function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Commencez votre parcours d'apprentissage en 4 étapes simples
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {howItWorksSteps.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Connector line */}
              {idx < 3 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}
              <Card className="relative z-10 h-full hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-xl border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`} />
                <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 ease-out relative">
                    {'iconName' in item && (
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} opacity-20`} />
                    )}
                    {'useImage' in item && item.useImage ? (
                      <img 
                        src={ericStudentDesk} 
                        alt={item.title} 
                        className="w-full h-full object-contain relative z-10"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : 'iconName' in item ? (
                      <div className="relative z-10">
                        {getIcon(item.iconName, "w-10 h-10 text-primary")}
                      </div>
                    ) : null}
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                    {item.step}
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 px-2">
          <Link to="/auth/signup/step-1">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl font-bold transition-all duration-300 ease-out hover:scale-[1.02] text-xs sm:text-sm px-4 sm:px-6 md:px-8"
            >
              <span className="hidden sm:inline">Créer un compte - C'est gratuit</span>
              <span className="sm:hidden">Créer un compte</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

export default HowItWorksSection;
