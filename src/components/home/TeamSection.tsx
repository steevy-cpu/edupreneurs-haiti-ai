import { memo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teamMembers } from "@/data/homePageData";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { motion, useInView } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/** Fade-up for section heading */
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

/** Staggered fade-up for each team member card */
const memberVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: "easeOut" }
  })
};

/**
 * Team section with member cards.
 * Desktop: staggered fade-up on scroll.
 * Mobile/tablet: static layout with CSS hover effects.
 */
export const TeamSection = memo(function TeamSection() {
  const { shouldShowAnimations } = useNetworkAwareLoading();
  const { shouldAnimate } = useAnimationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const MotionDiv = shouldAnimate ? motion.div : "div" as any;

  return (
    <section id="team" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
      <div className="container mx-auto" ref={ref}>
        {/* Section heading */}
        <MotionDiv
          className="text-center mb-10 sm:mb-14"
          {...(shouldAnimate ? { initial: "hidden", animate: isInView ? "visible" : "hidden", variants: headingVariants } : {})}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            L'équipe EDUPRENEURS
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Des passionnés dédiés à transformer l'éducation haïtienne
          </p>
        </MotionDiv>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {teamMembers.map((member, idx) => (
            <MotionDiv
              key={idx}
              {...(shouldAnimate ? { custom: idx, initial: "hidden", animate: isInView ? "visible" : "hidden", variants: memberVariants } : {})}
            >
              <Card
                className={`group transition-all duration-300 ease-out border-0 bg-card text-center overflow-hidden h-full ${
                  shouldShowAnimations ? 'hover:scale-[1.02] hover:shadow-lg' : 'hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3 pt-8">
                  <div className={`w-20 h-20 mx-auto rounded-lg overflow-hidden mb-4 shadow-lg ${
                    shouldShowAnimations ? 'group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 ease-out' : ''
                  }`}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-base font-semibold text-accent mt-1">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TeamSection;
