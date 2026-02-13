import edupreneursLogo from "@/assets/edupreneurs-logo.png";

export function DonateHero() {
  return (
    <section className="text-center py-12 sm:py-16 px-4 bg-background relative z-10">
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <img
          src={edupreneursLogo}
          alt="Edupreneurs Haiti"
          className="w-24 h-24 sm:w-32 sm:h-32 shadow-lg"
          loading="eager"
          width={128}
          height={128}
        />
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground leading-tight">
          Ede nou transfòme edikasyon an nan Ayiti! 🇭🇹
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
          Chaque don nous aide à améliorer l'expérience de l'élève avec l'intelligence artificielle.
        </p>
      </div>
    </section>
  );
}
