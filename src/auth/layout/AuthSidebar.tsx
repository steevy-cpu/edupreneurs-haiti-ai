/**
 * AuthSidebar - Static sidebar with TypewriterText animation
 * 
 * Effect 4: Eric image bounce entrance + idle bob (desktop only)
 * Effect 5: Badges staggered spring pop-in (desktop only)
 * All gated by shouldAnimate from useAnimationConfig
 */

import { motion } from "framer-motion";
const authImage = '/images/auth00-200w.webp';
import TypewriterText from "@/components/TypewriterText";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

// Effect 4 — Eric image spring entrance from scaled-down state
const ericVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 12,
      delay: 0.1
    }
  }
};

// Effect 5 — Badge spring pop with staggered delay per index
const badgeVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 15,
      delay: 0.6 + i * 0.15
    }
  })
};

export default function AuthSidebar() {
  const { shouldAnimate } = useAnimationConfig();

  // Conditional tags — motion elements on desktop, plain elements otherwise
  const BadgeSpan = shouldAnimate ? motion.span : "span";

  return (
    <aside className="auth-panel auth-info flex flex-col items-center justify-center text-center p-6 md:p-8 gap-4 md:gap-5 order-2 md:order-1">
      {/* Eric Image — Effect 4: bounce entrance + idle bob */}
      {shouldAnimate ? (
        <motion.img
          src={authImage}
          srcSet="/images/auth00-200w.webp 200w, /images/auth00-400w.webp 400w"
          sizes="(max-width: 768px) 112px, 144px"
          alt="Eric - Assistant EDUPRENEURS"
          className="w-28 md:w-36 h-auto drop-shadow-lg"
          loading="lazy"
          decoding="async"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.5, y: 20 },
            visible: {
              opacity: 1, scale: 1, y: [0, -8, 0],
              transition: {
                type: "spring" as const,
                stiffness: 200,
                damping: 12,
                delay: 0.1,
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" as const, delay: 1 }
              }
            }
          }}
        />
      ) : (
        <img
          src={authImage}
          srcSet="/images/auth00-200w.webp 200w, /images/auth00-400w.webp 400w"
          sizes="(max-width: 768px) 112px, 144px"
          alt="Eric - Assistant EDUPRENEURS"
          className="w-28 md:w-36 h-auto drop-shadow-lg"
          loading="lazy"
          decoding="async"
        />
      )}
      
      {/* Animated Encouraging Text — TypewriterText PRESERVED per user request */}
      <div className="space-y-3 md:space-y-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground min-h-[2.5rem] md:min-h-[3rem]">
          <TypewriterText 
            phrases={[
              "7 jours gratuits, sans carte bancaire",
              "Accès complet dès l'inscription",
              "Prêt à apprendre?",
              "Apprends à ton rythme",
              "Prépare tes examens officiels",
              "Programme MENFP complet",
              "Jude, ton tuteur IA"
            ]}
            typingSpeed={80}
            deletingSpeed={40}
            pauseDuration={2500}
          />
        </h1>
        
        <p className="text-sm md:text-base text-muted-foreground animate-fade-in font-medium" 
           style={{ animationDelay: '0.2s' }}>
          Créez votre compte gratuitement et accédez à tout le contenu pendant 7 jours — aucune carte bancaire requise.
        </p>
        
        {/* Effect 5 — Badges with staggered spring pop-in */}
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in" 
             style={{ animationDelay: '0.4s' }}>
          {/* Badge 1 — trial offer */}
          <BadgeSpan
            className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-semibold"
            {...(shouldAnimate ? {
              variants: badgeVariants,
              initial: "hidden",
              animate: "visible",
              custom: 0,
            } : {})}
          >
            🎉 7 jours gratuits
          </BadgeSpan>
          {/* Badge 2 — no credit card required */}
          <BadgeSpan
            className="px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs md:text-sm font-medium"
            {...(shouldAnimate ? {
              variants: badgeVariants,
              initial: "hidden",
              animate: "visible",
              custom: 1,
            } : {})}
          >
            ✓ Sans carte bancaire
          </BadgeSpan>
          {/* Badge 3 — AI personalization */}
          <BadgeSpan
            className="px-3 py-1.5 bg-accent/20 text-foreground rounded-full text-xs md:text-sm font-medium"
            {...(shouldAnimate ? {
              variants: badgeVariants,
              initial: "hidden",
              animate: "visible",
              custom: 2,
            } : {})}
          >
            IA personnalisée
          </BadgeSpan>
        </div>
      </div>
    </aside>
  );
}
