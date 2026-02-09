import { Link } from "react-router-dom";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { footerLinks } from "@/data/homePageData";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <img src={edupreneursLogo} alt="Edupreneurs" width={36} height={45} className="h-10 mx-auto mb-2 brightness-110" />
          <p className="text-slate-400 max-w-md mx-auto text-xs">
            Révolutionner l'éducation haïtienne avec l'intelligence artificielle
          </p>
        </div>
        
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs">
          <FooterSection title="Navigation" links={footerLinks.navigation} />
          <FooterSection title="À Propos" links={footerLinks.about} />
          <FooterSection title="Support" links={footerLinks.support} />
          <FooterSection title="Légal" links={footerLinks.legal} />
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-700/50">
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
}

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href?: string; to?: string; label: string }>;
}) {
  return (
    <div className="text-center md:text-left">
      <h4 className="font-bold text-white mb-2 text-xs tracking-wide uppercase">{title}</h4>
      <ul className="space-y-1">
        {links.map((link, idx) => (
          <li key={idx}>
            {link.to ? (
              <Link to={link.to} className="text-slate-400 hover:text-primary transition-colors">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className="text-slate-400 hover:text-primary transition-colors">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
