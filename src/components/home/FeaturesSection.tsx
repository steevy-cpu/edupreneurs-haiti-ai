import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { features, getIcon } from "@/data/homePageData";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { motion, useInView } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/** Fade-up for section heading */
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

/** Staggered fade-up for each feature card */
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" }
  })
};

/**
 * Features grid section with scroll-triggered staggered cards on desktop.
 * Mobile/tablet: static render with CSS-only hover effects.
 */
export const FeaturesSection = memo(function FeaturesSection() {
  const { shouldShowAnimations } = useNetworkAwareLoading();
  const { shouldAnimate } = useAnimationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const MotionDiv = shouldAnimate ? motion.div : "div" as any;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto" ref={ref}>
        {/* Section heading — fade up on scroll */}
        <MotionDiv
          className="text-center mb-8 sm:mb-12"
          {...(shouldAnimate ? { initial: "hidden", animate: isInView ? "visible" : "hidden", variants: headingVariants } : {})}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            Pourquoi choisir EDUPRENEURS ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Une plateforme révolutionnaire conçue spécialement pour les élèves haïtiens
          </p>
        </MotionDiv>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <MotionDiv
              key={idx}
              {...(shouldAnimate ? { custom: idx, initial: "hidden", animate: isInView ? "visible" : "hidden", variants: cardVariants } : {})}
            >
              <Card
                className={`group transition-all duration-300 ease-out border-primary/20 hover:border-primary/40 text-center h-full ${
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
            </MotionDiv>
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
