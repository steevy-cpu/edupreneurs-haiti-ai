import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">Politique de Confidentialité</h1>
          <p className="text-sm text-muted-foreground mb-6">Dernière mise à jour : Mars 2026</p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Collecte des Données Personnelles</h2>
              <p className="font-medium text-foreground">1.1 Données fournies par l'utilisateur :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Nom complet et pseudonyme</li>
                <li>Adresse e-mail</li>
                <li>Numéro de téléphone</li>
                <li>Niveau académique et série</li>
                <li>Nom de l'école</li>
                <li>Genre</li>
                <li>Date de naissance (optionnelle)</li>
              </ul>
              <p className="font-medium text-foreground mt-4">1.2 Données collectées automatiquement :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Données d'utilisation : pages visitées, leçons consultées, temps passé sur la plateforme</li>
                <li>Données de progression : résultats d'examens, badges obtenus, points Gold accumulés</li>
                <li>Données techniques : adresse IP, type de navigateur, système d'exploitation, identifiant d'appareil</li>
                <li>Données de communication : messages échangés dans la communauté, interactions avec l'assistant Jude</li>
              </ul>
              <p className="font-medium text-foreground mt-4">1.3 Données de paiement :</p>
              <p className="mt-2">
                Edupreneurs ne stocke pas directement vos données de paiement. Les transactions sont traitées de manière sécurisée par nos partenaires (MonCash, Stripe). Seule la confirmation de paiement et l'historique des transactions sont conservés dans notre système.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Utilisation des Données</h2>
              <p>Vos données personnelles sont utilisées exclusivement pour :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Créer, gérer et sécuriser votre compte utilisateur.</li>
                <li>Personnaliser votre expérience d'apprentissage et adapter le contenu à votre niveau.</li>
                <li>Permettre à l'assistant Jude de vous fournir une aide éducative pertinente.</li>
                <li>Vous envoyer des notifications importantes concernant votre compte et votre progression.</li>
                <li>Améliorer continuellement nos services éducatifs et le contenu de la plateforme.</li>
                <li>Gérer le programme de parrainage et les récompenses Gold.</li>
                <li>Assurer la sécurité de la plateforme et prévenir les abus.</li>
                <li>Respecter nos obligations légales.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Protection des Données des Mineurs</h2>
              <p>
                Edupreneurs est une plateforme destinée principalement aux élèves haïtiens, dont une majorité sont des mineurs. Nous appliquons des protections renforcées :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Les données des utilisateurs de moins de 18 ans ne sont jamais utilisées à des fins publicitaires ou marketing.</li>
                <li>Le consentement parental est requis pour les utilisateurs de moins de 13 ans.</li>
                <li>Les parents et tuteurs légaux peuvent à tout moment demander l'accès, la correction ou la suppression des données de leur enfant en contactant contact@edupreneurs.com.</li>
                <li>Les communications de l'assistant Jude avec les mineurs sont encadrées par des filtres de contenu stricts.</li>
                <li>Aucune donnée de mineur n'est partagée avec des tiers à des fins commerciales.</li>
              </ul>
              <div className="mt-3 p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Note :</strong> Si vous êtes parent ou tuteur légal et souhaitez exercer vos droits concernant les données de votre enfant, contactez-nous à contact@edupreneurs.com. Nous répondons dans les 24 heures ouvrables.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Fournisseurs Tiers et Intelligence Artificielle</h2>
              <p>
                Pour vous offrir nos services, Edupreneurs fait appel aux fournisseurs tiers suivants. Vos données peuvent leur être transmises dans le strict cadre de la prestation de service :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Supabase</strong> — Base de données et authentification — Toutes les données du compte</li>
                <li><strong>Google Gemini (IA)</strong> — Assistant Jude et génération de contenu — Messages et contexte éducatif</li>
                <li><strong>ElevenLabs</strong> — Synthèse vocale (voix de Jude) — Texte des messages Jude uniquement</li>
                <li><strong>Stripe</strong> — Paiements internationaux — Données de transaction (pas de carte)</li>
                <li><strong>MonCash</strong> — Paiements locaux Haïti — Numéro de téléphone, montant</li>
                <li><strong>Google Analytics (GA4)</strong> — Analyse d'audience anonymisée — Données de navigation anonymes</li>
                <li><strong>TikTok Pixel</strong> — Mesure de performance publicitaire — Données de navigation anonymes</li>
              </ul>
              <div className="mt-3 p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Note :</strong> Vos données transmises à l'assistant IA (Jude / Google Gemini) sont utilisées uniquement pour générer la réponse éducative. Elles ne sont pas utilisées pour entraîner les modèles d'IA de nos partenaires sans votre consentement explicite.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Cookies et Technologies de Suivi</h2>
              <p>Edupreneurs utilise les types de cookies suivants :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Cookies essentiels :</strong> Indispensables au fonctionnement du site (authentification, sécurité, session). Ne peuvent pas être désactivés.</li>
                <li><strong>Cookies analytiques :</strong> Permettent de comprendre comment vous utilisez la plateforme. Activables/désactivables dans vos paramètres.</li>
                <li><strong>Cookies de personnalisation :</strong> Permettent d'adapter le contenu à votre profil. Activables/désactivables dans vos paramètres.</li>
              </ul>
              <p className="mt-2">
                Vous pouvez gérer vos préférences via la page <Link to="/cookie-settings" className="underline hover:text-primary">Paramètres des Cookies</Link> accessible depuis le footer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Protection et Sécurité des Données</h2>
              <p>Edupreneurs met en œuvre les mesures de sécurité suivantes :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Chiffrement des données en transit (HTTPS/TLS) et au repos.</li>
                <li>Authentification sécurisée gérée par Supabase Auth.</li>
                <li>Accès aux données limité au personnel autorisé uniquement.</li>
                <li>Surveillance continue des accès et des anomalies de sécurité.</li>
                <li>Pas de stockage de mots de passe en clair — hachage sécurisé uniquement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Conservation des Données</h2>
              <p>Edupreneurs conserve vos données selon les durées suivantes :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Données de compte actif : conservées tant que votre compte est actif.</li>
                <li>Données de compte supprimé : supprimées dans les 30 jours suivant la suppression.</li>
                <li>Données de transaction et de paiement : conservées 5 ans (obligations comptables).</li>
                <li>Journaux de sécurité : conservés 90 jours.</li>
                <li>Messages et publications : supprimés avec le compte, sauf signalement légal en cours.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Vos Droits</h2>
              <p>Vous disposez des droits suivants concernant vos données :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Droit d'accès :</strong> consulter les données que nous détenons sur vous.</li>
                <li><strong>Droit de rectification :</strong> corriger des informations inexactes.</li>
                <li><strong>Droit à la suppression :</strong> demander la suppression de votre compte et vos données.</li>
                <li><strong>Droit au retrait du consentement :</strong> retirer votre consentement à tout moment.</li>
                <li><strong>Droit à la portabilité :</strong> exporter vos données dans un format lisible.</li>
                <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements de vos données.</li>
              </ul>
              <p className="mt-2">
                Pour exercer ces droits : contact@edupreneurs.com. Réponse sous 24 heures ouvrables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">9. Notifications Push</h2>
              <p>Avec votre consentement, nous pouvons vous envoyer des notifications push pour :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Nouveaux messages et activités dans vos conversations et groupes.</li>
                <li>Interactions sociales (réponses, réactions à vos publications).</li>
                <li>Mises à jour importantes sur votre progression académique.</li>
                <li>Messages de motivation de l'assistant Jude.</li>
              </ul>
              <p className="mt-2">
                Vous pouvez désactiver les notifications push à tout moment dans les Paramètres de votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">10. Modifications de la Politique</h2>
              <p>
                Edupreneurs se réserve le droit de modifier cette politique à tout moment. Les modifications importantes vous seront notifiées dans l'application au moins 7 jours avant leur entrée en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">11. Contact</h2>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Email : contact@edupreneurs.com</li>
                <li>Site web : <a href="https://mon-edupreneur.com" className="underline hover:text-primary">mon-edupreneur.com</a></li>
                <li>Via le formulaire de contact sur la plateforme</li>
              </ul>
              <p className="mt-4">
                Consultez également nos <Link to="/terms" className="underline hover:text-primary">Conditions d'Utilisation</Link> et nos <Link to="/cookie-settings" className="underline hover:text-primary">Paramètres des Cookies</Link>.
              </p>
            </section>

            <p className="text-sm mt-8 pt-6 border-t border-border">Dernière mise à jour : Mars 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
