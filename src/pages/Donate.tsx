import { Helmet } from "react-helmet";
import { HeaderNav } from "@/components/home/HeaderNav";
import { Footer } from "@/components/Footer";
import { DonateHero } from "@/components/donate/DonateHero";
import { DonationCard } from "@/components/donate/DonationCard";
import { ImpactSection } from "@/components/donate/ImpactSection";
import { getAvatarUrl } from "@/lib/avatarMap";
import { HomeChatbot } from "@/components/HomeChatbot";

export default function Donate() {
  const judeAvatar = getAvatarUrl("jude", 128);

  return (
    <>
      <Helmet>
        <title>Faire un don | Edupreneurs Haiti</title>
        <meta
          name="description"
          content="Aidez Jude à transformer l'éducation en Haïti. Chaque don soutient des élèves haïtiens grâce à l'IA éducative."
        />
        <meta property="og:title" content="Faire un don | Edupreneurs Haiti" />
        <meta
          property="og:description"
          content="Soutenez l'éducation en Haïti avec un don. Chaque gourde compte."
        />
        {judeAvatar && <meta property="og:image" content={judeAvatar} />}
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <HeaderNav />
        <main className="flex-1">
          <DonateHero />
          <DonationCard />
          <ImpactSection />

          {/* Jude transparency note */}
          <section className="py-10 px-4 text-center max-w-xl mx-auto">
            <p className="text-muted-foreground text-sm italic">
              "Chak goud ou bay ede yon elèv aprann plis. Mèsi pou konfyans ou!" — Jude 💙
            </p>
          </section>
        </main>
        <Footer />
      </div>
      <HomeChatbot />
    </>
  );
}
