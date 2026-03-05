import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { howItWorksSteps, getIcon } from "@/data/homePageData";
import ericStudentDesk from "@/assets/eric-student-desk.png";
import { motion, useInView } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/** Fade-up for section heading */
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

/** Sequential slide-from-left for each step card */
const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: "easeOut" }
  })
};

/**
 * How It Works step-by-step section.
 * Desktop: sequential card reveals sliding from left.
 * Mobile/tablet: static layout unchanged.
 */
export const HowItWorksSection = memo(function HowItWorksSection() {
  const { shouldAnimate } = useAnimationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const MotionDiv = shouldAnimate ? motion.div : "div" as any;

  return (
    <section id="comment-ca-marche" className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto" ref={ref}>
        {/* Section heading */}
        <MotionDiv
          className="text-center mb-8 sm:mb-12"
          {...(shouldAnimate ? { initial: "hidden", animate: isInView ? "visible" : "hidden", variants: headingVariants } : {})}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Commencez votre parcours d'apprentissage en 4 étapes simples
          </p>
        </MotionDiv>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {howItWorksSteps.map((item, idx) => (
            <MotionDiv
              key={idx}
              className="relative group"
              {...(shouldAnimate ? { custom: idx, initial: "hidden", animate: isInView ? "visible" : "hidden", variants: stepVariants } : {})}
            >
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
            </MotionDiv>
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
