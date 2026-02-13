import { Helmet } from "react-helmet";
import { HeaderNav } from "@/components/home/HeaderNav";
import { Footer } from "@/components/Footer";
import { DonateHero } from "@/components/donate/DonateHero";
import { DonationCard } from "@/components/donate/DonationCard";
import { ImpactSection } from "@/components/donate/ImpactSection";
import { HomeChatbot } from "@/components/HomeChatbot";
import { FloatingFeatureBubbles } from "@/components/donate/FloatingFeatureBubbles";

export default function Donate() {
  return (
    <>
      <Helmet>
        <title>Faire un don | Edupreneurs Haiti</title>
        <meta
          name="description"
          content="Chaque don nous aide à améliorer l'expérience de l'élève avec l'intelligence artificielle."
        />
        <meta property="og:title" content="Faire un don | Edupreneurs Haiti" />
        <meta
          property="og:description"
          content="Soutenez l'éducation en Haïti avec un don. Chaque gourde compte."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col relative">
        <FloatingFeatureBubbles />
        <div className="relative z-10">
          <HeaderNav />
          <main className="flex-1">
            <DonateHero />
            <DonationCard />
            <ImpactSection />

            {/* Jude transparency note */}
            <section className="py-10 px-4 text-center max-w-xl mx-auto bg-background">
              <p className="text-muted-foreground text-sm italic">
                "Chak goud ou bay ede yon elèv aprann plis. Mèsi pou konfyans ou!" — Jude 💙
              </p>
            </section>
          </main>
          <Footer />
        </div>
      </div>
      <HomeChatbot />
    </>
  );
}
