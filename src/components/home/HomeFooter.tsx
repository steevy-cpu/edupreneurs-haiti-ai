import { memo } from "react";
import { Link } from "react-router-dom";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { footerLinks } from "@/data/homePageData";

/**
 * Homepage footer with links grid.
 * Static content - memoized.
 */
export const HomeFooter = memo(function HomeFooter() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="container mx-auto relative z-10">
        {/* Logo and Tagline */}
        <div className="text-center mb-12">
          <img 
            src={edupreneursLogo} 
            alt="Edupreneurs" 
            width={45} 
            height={56} 
            className="h-14 mx-auto mb-4 brightness-110" 
          />
          <p className="text-slate-300 max-w-md mx-auto text-sm font-medium">
            Révolutionner l'éducation haïtienne avec l'intelligence artificielle
          </p>
        </div>
        
        {/* Links Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Navigation */}
          <FooterLinkSection title="NAVIGATION" links={footerLinks.navigation} />
          
          {/* À Propos */}
          <FooterLinkSection title="À PROPOS" links={footerLinks.about} />
          
          {/* Support */}
          <FooterLinkSection title="SUPPORT" links={footerLinks.support} />
          
          {/* Legal */}
          <FooterLinkSection title="LÉGAL" links={footerLinks.legal} />
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm font-medium">
            © 2025 EDUPRENEURS. Éducation de qualité pour Haïti 🇭🇹
          </p>
          <p className="text-slate-500 text-xs">
            Fait avec ❤️ en Haïti
          </p>
        </div>
      </div>
    </footer>
  );
});

// Footer link section component
function FooterLinkSection({ 
  title, 
  links 
}: { 
  title: string; 
  links: ReadonlyArray<{ href?: string; to?: string; label: string }>; 
}) {
  return (
    <div className="text-center md:text-left">
      <h4 className="font-black text-white mb-4 text-lg tracking-wide">{title}</h4>
      <ul className="space-y-3">
        {links.map((link, idx) => (
          <li key={idx}>
            {link.to ? (
              <Link 
                to={link.to} 
                className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                {link.label}
              </Link>
            ) : (
              <a 
                href={link.href} 
                className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomeFooter;
