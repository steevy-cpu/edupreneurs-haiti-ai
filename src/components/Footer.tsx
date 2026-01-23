import { Link } from "react-router-dom";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Logo and Tagline */}
        <div className="text-center mb-12">
          <img src={edupreneursLogo} alt="Edupreneurs" width={45} height={56} className="h-14 mx-auto mb-4 brightness-110" />
          <p className="text-slate-300 max-w-md mx-auto text-sm font-medium">
            Révolutionner l'éducation haïtienne avec l'intelligence artificielle
          </p>
        </div>
        
        {/* Links Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Navigation */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-white mb-4 text-lg tracking-wide">NAVIGATION</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Accueil</Link></li>
              <li><Link to="/#comment-ca-marche" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Comment ça marche</Link></li>
              <li><Link to="/#courses" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Nos Cours</Link></li>
              <li><Link to="/blog" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Blog</Link></li>
            </ul>
          </div>
          
          {/* À Propos */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-white mb-4 text-lg tracking-wide">À PROPOS</h4>
            <ul className="space-y-3">
              <li><Link to="/#about" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Notre Mission</Link></li>
              <li><Link to="/#team" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> L'Équipe</Link></li>
              <li><Link to="/#partners" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Nos Partenaires</Link></li>
              <li><Link to="/exams-hub" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Préparation au Bac</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-white mb-4 text-lg tracking-wide">SUPPORT</h4>
            <ul className="space-y-3">
              <li><a href="mailto:support@edupreneurs.com" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Contact</a></li>
              <li><span className="text-slate-500 font-medium">FAQ (Bientôt)</span></li>
              <li><span className="text-slate-500 font-medium">Guide d'utilisation</span></li>
            </ul>
          </div>
          
          {/* Légal */}
          <div className="text-center md:text-left">
            <h4 className="font-black text-white mb-4 text-lg tracking-wide">LÉGAL</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Conditions</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-primary transition-all duration-300 font-medium hover:translate-x-1 inline-flex items-center gap-2 group"><span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span> Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left font-medium">
              © {currentYear} EDUPRENEURS Haiti. Tous droits réservés.
            </p>
            <p className="text-slate-500 text-xs text-center md:text-right">
              Fait avec ❤️ pour les étudiants haïtiens
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}