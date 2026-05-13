import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { courses, getIcon } from "@/data/homePageData";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { motion, useInView } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/** Fade-up for section heading */
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

/** Scale-up entrance for each course card */
const courseVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" }
  })
};

/** Fade-up for Jude CTA card */
const ctaVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

/**
 * Courses grid section with Jude CTA card.
 * Desktop: scale-up card entrance on scroll.
 * Mobile/tablet: static layout with CSS hover effects only.
 */
export const CoursesSection = memo(function CoursesSection() {
  const { shouldShowAnimations } = useNetworkAwareLoading();
  const { shouldAnimate } = useAnimationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const MotionDiv = shouldAnimate ? motion.div : "div" as any;

  return (
    <section id="courses" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
      <div className="container mx-auto" ref={ref}>
        {/* Section heading */}
        <MotionDiv
          {...(shouldAnimate ? { initial: "hidden", animate: isInView ? "visible" : "hidden", variants: headingVariants } : {})}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-primary mb-3 sm:mb-4">
            Nos cours disponibles
          </h2>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            Programme complet du MENFP de la 7AF à NS4 (Terminale)
          </p>
        </MotionDiv>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {courses.map((course, idx) => (
            <MotionDiv
              key={idx}
              {...(shouldAnimate ? { custom: idx, initial: "hidden", animate: isInView ? "visible" : "hidden", variants: courseVariants } : {})}
            >
              <Card
                className={`group transition-all duration-300 ease-out border-primary/20 hover:border-primary/40 h-full ${
                  shouldShowAnimations ? 'hover:scale-[1.02] hover:shadow-xl' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className={`mb-4 ${shouldShowAnimations ? 'group-hover:scale-105 transition-transform duration-300 ease-out' : ''}`}>
                    {getIcon(course.iconName, "w-12 h-12 text-primary")}
                  </div>
                  <CardTitle className="font-bold text-primary">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {course.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.levels.map((level, lidx) => (
                      <span
                        key={lidx}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>

        {/* Jude CTA Card — fade-up on scroll */}
        <MotionDiv
          {...(shouldAnimate ? { initial: "hidden", animate: isInView ? "visible" : "hidden", variants: ctaVariants } : {})}
        >
          <Card className="relative mt-16 max-w-4xl mx-auto bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 overflow-hidden group hover:shadow-xl transition-all duration-300 ease-out">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Apprentissage personnalisé avec Jude
              </CardTitle>
              <CardDescription className="text-base font-medium">
                Votre assistant IA vous guide dans chaque matière, explique en créole ou français, et s'adapte à votre rythme.
                Gagnez des Gold en réussissant les quiz et débloquez des fonctions premium !
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 relative z-10 px-3 xs:px-4 sm:px-6">
              <Link to="/auth/signup/step-1">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl font-bold transition-all duration-300 ease-out hover:scale-[1.02] text-xs sm:text-sm px-4 sm:px-6 md:px-8"
                >
                  <span className="hidden sm:inline">Commencer l'apprentissage</span>
                  <span className="sm:hidden">Commencer</span>
                </Button>
              </Link>
              <div className="pt-4">
                <div className="w-64 h-64 mx-auto flex items-center justify-center">
                  <img
                    src="/images/jude-passion-discovery-300w.webp"
                    srcSet="/images/jude-passion-discovery-300w.webp 300w, /images/jude-passion-discovery-500w.webp 500w"
                    sizes="256px"
                    alt="Jude - Assistant IA personnalisé"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </section>
  );
});

export default CoursesSection;
