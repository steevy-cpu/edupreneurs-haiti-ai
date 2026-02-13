import { getAvatarUrl } from "@/lib/avatarMap";

export function DonateHero() {
  const judeAvatar = getAvatarUrl('jude', 128);

  return (
    <section className="text-center py-12 sm:py-16 px-4 bg-background">
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <img
          src={judeAvatar}
          alt="Jude - Assistant IA Edupreneurs"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-primary/30 shadow-lg"
          loading="eager"
          width={112}
          height={112}
        />
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground leading-tight">
          Ede m transfòme edikasyon ann Ayiti! 🇭🇹
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
          Chaque don aide des milliers d'élèves haïtiens à accéder à une éducation
          de qualité grâce à l'intelligence artificielle. Ensemble, transformons l'avenir.
        </p>
      </div>
    </section>
  );
}
