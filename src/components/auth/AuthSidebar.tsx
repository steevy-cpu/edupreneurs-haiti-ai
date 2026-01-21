import authImage from "@/assets/auth00.png";
import TypewriterText from "@/components/TypewriterText";

export default function AuthSidebar() {
  return (
    <aside className="auth-panel auth-info flex flex-col items-center justify-center text-center p-6 md:p-8 gap-4 md:gap-5 order-2 md:order-1">
      {/* Eric Image */}
      <img 
        src={authImage} 
        alt="Eric - Assistant EDUPRENEURS" 
        className="w-28 md:w-36 h-auto drop-shadow-lg" 
        loading="eager"
        decoding="async"
      />
      
      {/* Animated Encouraging Text */}
      <div className="space-y-3 md:space-y-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground min-h-[2.5rem] md:min-h-[3rem]">
          <TypewriterText 
            phrases={[
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
          Connectez-vous ou créez un compte pour commencer votre aventure éducative.
        </p>
        
        {/* Simple Badges */}
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in" 
             style={{ animationDelay: '0.4s' }}>
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">
            7 jours gratuits
          </span>
          <span className="px-3 py-1.5 bg-accent/20 text-foreground rounded-full text-xs md:text-sm font-medium">
            IA personnalisée
          </span>
        </div>
      </div>
    </aside>
  );
}
