import { useEffect } from "react";
import { Link } from "react-router-dom";

// Page promo publique — héberge la vidéo MP4 cinématique rendue via Remotion.
// Dark mode forcé localement, hors AppShell, aucune requête réseau.
export default function Decouvrir() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Découvrir Édupreneurs · Propulse tes études, cultive tes passions";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? "";
    meta?.setAttribute(
      "content",
      "Découvre Édupreneurs en vidéo : soutien scolaire, développement de passions et outils de croissance personnelle pour les étudiants haïtiens."
    );
    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A0B0D",
        color: "#F5F5F7",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header minimal */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
        <Link to="/" className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #087E7E, #FF9F00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
            }}
          >
            É
          </div>
          <span className="text-lg font-bold tracking-tight">Édupreneurs</span>
        </Link>
        <Link
          to="/auth/signup/step-1"
          className="rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ background: "#FF9F00", color: "#0A0B0D" }}
        >
          Commencer
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-10 text-center md:pt-20 md:pb-14">
        <div
          className="mb-6 text-xs font-semibold uppercase md:text-sm"
          style={{ color: "#FF9F00", letterSpacing: "0.32em" }}
        >
          Découvrir · Édition 2026
        </div>
        <h1
          className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.05] md:text-7xl"
          style={{ letterSpacing: "-0.04em" }}
        >
          Propulse tes études.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #FF9F00, #0FB5B5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cultive tes passions.
          </span>
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl text-base md:text-xl"
          style={{ color: "rgba(245,245,247,0.62)" }}
        >
          Un espace pensé pour grandir, apprendre et s'épanouir au quotidien — du soutien scolaire au développement personnel.
        </p>
      </section>

      {/* Lecteur vidéo plein cadre */}
      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <div
          style={{
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
            background: "#000",
          }}
        >
          <video
            controls
            playsInline
            preload="metadata"
            poster="/edupreneurs-promo-poster.jpg"
            style={{ width: "100%", display: "block", aspectRatio: "16/9" }}
          >
            <source src="/edupreneurs-promo.mp4" type="video/mp4" />
            Ton navigateur ne supporte pas la lecture vidéo HTML5.
          </video>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="text-sm" style={{ color: "rgba(245,245,247,0.5)" }}>
            75 secondes · 1920×1080 HD · sans son
          </p>
          <a
            href="/edupreneurs-promo.mp4"
            download="edupreneurs-promo.mp4"
            className="rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-90"
            style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#F5F5F7" }}
          >
            Télécharger en HD
          </a>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <h2
          className="text-3xl font-extrabold md:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          Prêt à grandir avec nous ?
        </h2>
        <p className="mt-4 text-base md:text-lg" style={{ color: "rgba(245,245,247,0.62)" }}>
          Crée ton compte gratuitement et commence dès aujourd'hui.
        </p>
        <Link
          to="/auth/signup/step-1"
          className="mt-8 inline-block rounded-full px-8 py-4 text-base font-semibold transition hover:opacity-90"
          style={{ background: "#FF9F00", color: "#0A0B0D" }}
        >
          Commencer gratuitement
        </Link>
      </section>

      <footer className="border-t px-6 py-8 text-center text-xs" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(245,245,247,0.38)" }}>
        © 2026 Édupreneurs · mon-edupreneur.com
      </footer>
    </main>
  );
}
