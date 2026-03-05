import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/** Fade-up for inner CTA content */
const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

/**
 * Effect 8: CSS keyframe for infinite grid pattern scroll.
 * Injected once via <style> tag — only active when shouldAnimate is true.
 */
const gridScrollStyle = `
@keyframes grid-scroll {
  from { background-position: 0px 0px; }
  to { background-position: 40px 40px; }
}
`;

/**
 * Final CTA section with animated gradient background on desktop.
 * Effect 8: Grid pattern slowly scrolls on desktop.
 * Mobile/tablet: static gradient, no motion wrappers.
 */
export const CTASection = memo(function CTASection() {
  const { shouldAnimate } = useAnimationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  /* Grid pattern overlay shared between both paths */
  const gridPattern = `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==")`;

  const sectionClasses = "relative py-20 px-4 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-center overflow-hidden";

  /* Desktop: animated gradient background + scrolling grid */
  if (shouldAnimate) {
    return (
      <>
        {/* Inject grid-scroll keyframe once */}
        <style>{gridScrollStyle}</style>
        <motion.section
          ref={ref}
          className={sectionClasses}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          {/* Effect 8: Grid pattern with infinite CSS scroll animation */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: gridPattern,
              animation: "grid-scroll 4s linear infinite"
            }}
          />
          <motion.div
            className="container mx-auto relative z-10"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={contentVariants}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6">
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
          </motion.div>
        </motion.section>
      </>
    );
  }

  /* Mobile/tablet: static render, no motion wrappers */
  return (
    <section ref={ref} className={sectionClasses}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: gridPattern }} />
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
