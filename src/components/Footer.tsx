import { memo } from "react";
import { Link } from "react-router-dom";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { footerLinks } from "@/data/homePageData";

const sections = [
  { title: "Navigation", links: footerLinks.navigation },
  { title: "À Propos", links: footerLinks.about },
  { title: "Support", links: footerLinks.support },
  { title: "Légal", links: footerLinks.legal },
] as const;

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-10 px-4 overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="container mx-auto relative z-10">
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <img
          loading="lazy"
          decoding="async"
            src={edupreneursLogo}
            alt="Edupreneurs"
            width={36}
            height={45}
            className="h-10 mx-auto mb-3 brightness-110"
          />
          <p className="text-slate-400 max-w-md mx-auto text-xs">
            Révolutionner l'éducation haïtienne avec l'intelligence artificielle
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {sections.map((section) => (
            <FooterSection key={section.title} title={section.title} links={section.links} />
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <p className="text-slate-500 text-center md:text-left">
              © {currentYear} EDUPRENEURS Haiti. Tous droits réservés.
            </p>
            <p className="text-slate-600 text-center md:text-right">
              Fait avec ❤️ pour les étudiants haïtiens
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href?: string; to?: string; label: string }>;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((link, idx) => (
          <li key={idx}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-sm text-slate-400 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-sm text-slate-400 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
