import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
          <h1 className="text-3xl font-bold mb-6 text-primary">Conditions d'Utilisation</h1>
          <p className="text-sm text-muted-foreground mb-6">Dernière mise à jour : Mars 2026</p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Acceptation des Conditions</h2>
              <p>
                En accédant et en utilisant la plateforme Edupreneurs, vous acceptez d'être lié par ces 
                conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser 
                notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Description du Service</h2>
              <p>
                Edupreneurs est une plateforme éducative en ligne destinée aux élèves haïtiens, qui offre :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Des cours alignés sur le programme du MENFP (7AF à NS4)</li>
                <li>Un assistant IA personnalisé (Jude) pour l'apprentissage</li>
                <li>Des examens officiels (9AF, NS4) et des ressources pédagogiques</li>
                <li>Une communauté d'apprenants et des fonctionnalités sociales</li>
                <li>Un système de récompenses Gold</li>
                <li>Des activités interactives et des jeux éducatifs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Création de Compte</h2>
              <p>Pour utiliser nos services, vous devez :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Avoir au moins 13 ans. Les utilisateurs de moins de 13 ans doivent obtenir le consentement écrit d'un parent ou tuteur légal avant de créer un compte.</li>
                <li>Fournir des informations exactes, complètes et à jour lors de l'inscription.</li>
                <li>Maintenir la confidentialité de votre mot de passe et de vos identifiants.</li>
                <li>Être responsable de toutes les activités effectuées sur votre compte.</li>
                <li>Nous notifier immédiatement en cas d'accès non autorisé à votre compte.</li>
              </ul>
              <div className="mt-3 p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Note :</strong> Les parents et tuteurs légaux sont responsables de l'utilisation de la plateforme par les mineurs placés sous leur autorité. Edupreneurs se réserve le droit de suspendre tout compte pour lequel le consentement parental n'a pas été obtenu conformément à ces conditions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Conduite de l'Utilisateur</h2>
              <p>En utilisant notre plateforme, vous vous engagez à ne pas :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Publier du contenu offensant, diffamatoire, haineux ou illégal.</li>
                <li>Harceler, intimider ou menacer d'autres utilisateurs, en particulier des mineurs.</li>
                <li>Utiliser la plateforme à des fins commerciales non autorisées.</li>
                <li>Tenter de pirater, compromettre ou contourner la sécurité du système.</li>
                <li>Partager votre compte avec d'autres personnes.</li>
                <li>Tricher ou manipuler le système de récompenses Gold.</li>
                <li>Usurper l'identité d'un autre utilisateur ou d'un membre de l'équipe Edupreneurs.</li>
                <li>Collecter les données personnelles d'autres utilisateurs sans leur consentement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Signalement de Contenu</h2>
              <p>
                Edupreneurs met à disposition un mécanisme de signalement pour tout contenu inapproprié, abusif ou illégal publié sur la plateforme. Tout utilisateur peut signaler un contenu via :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Le bouton de signalement disponible sur chaque publication et message.</li>
                <li>En contactant directement notre équipe à contact@edupreneurs.com.</li>
              </ul>
              <p className="mt-2">
                Edupreneurs s'engage à traiter chaque signalement dans un délai raisonnable et à prendre les mesures appropriées, incluant la suppression du contenu ou la suspension du compte en infraction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Contenu Généré par Intelligence Artificielle</h2>
              <p>
                La plateforme Edupreneurs utilise des technologies d'intelligence artificielle pour générer du contenu éducatif (leçons, quiz, explications) et pour alimenter l'assistant Jude. À ce titre :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Le contenu généré par IA est fourni à titre éducatif et peut contenir des inexactitudes. Edupreneurs ne garantit pas l'exactitude absolue du contenu généré par IA.</li>
                <li>Les réponses de l'assistant Jude ne constituent pas un avis professionnel (médical, juridique, financier ou autre).</li>
                <li>Edupreneurs ne peut être tenu responsable des erreurs contenues dans le contenu généré par ses systèmes d'IA.</li>
                <li>Nous améliorons continuellement nos modèles pour garantir la qualité et la pertinence du contenu éducatif.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Droits de Propriété Intellectuelle</h2>
              <p>
                Tout le contenu éducatif, les graphiques, les logos, le design et le code source de la plateforme Edupreneurs sont la propriété exclusive d'Edupreneurs. Vous ne pouvez pas reproduire, distribuer, modifier ou créer des œuvres dérivées sans notre autorisation écrite préalable.
              </p>
              <p className="mt-2">
                Le contenu que vous créez sur la plateforme (publications, commentaires, messages) reste votre propriété. En le publiant, vous accordez à Edupreneurs une licence non exclusive, mondiale et gratuite pour l'afficher, le distribuer et le promouvoir sur la plateforme dans le cadre normal de nos services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Conditions de Paiement</h2>
              <p>
                L'abonnement Edupreneurs est proposé à 200 gourdes haïtiennes (HTG) par mois, soit environ 2 USD, après une période d'essai gratuite de 7 jours. En vous abonnant, vous acceptez :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Le renouvellement automatique de votre abonnement chaque mois sauf annulation de votre part.</li>
                <li>Les paiements sont traités via MonCash ou Stripe selon votre choix.</li>
                <li>Edupreneurs se réserve le droit de modifier les tarifs avec un préavis raisonnable communiqué par notification.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8.1 : Politique de Remboursement</h2>
              <p>
                Edupreneurs accepte les demandes de remboursement dans les conditions suivantes :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>La demande doit être effectuée dans les 7 jours suivant la date de paiement.</li>
                <li>La demande doit être adressée par email à contact@edupreneurs.com en précisant votre nom, votre adresse email de compte et la date du paiement concerné.</li>
                <li>Notre équipe accusera réception et traitera votre demande dans un délai de 24 heures ouvrables.</li>
                <li>Les remboursements sont accordés en cas d'erreur de facturation, d'indisponibilité prolongée du service, ou de circonstances exceptionnelles jugées recevables par notre équipe.</li>
                <li>Passé le délai de 7 jours, les paiements ne sont plus remboursables sauf disposition légale contraire.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">9. Système Gold</h2>
              <p>
                Les points Gold sont des récompenses virtuelles non monétaires gagnées en utilisant activement la plateforme. Edupreneurs se réserve le droit de :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Modifier les règles d'attribution des points Gold à tout moment.</li>
                <li>Annuler les points Gold obtenus de manière frauduleuse ou en violation de ces conditions.</li>
                <li>Modifier, suspendre ou mettre fin au programme de récompenses Gold avec préavis raisonnable.</li>
              </ul>
              <p className="mt-2">
                Les points Gold n'ont aucune valeur monétaire et ne peuvent pas être échangés contre de l'argent ou des biens réels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">10. Résiliation de Compte</h2>
              <p>
                Edupreneurs peut suspendre ou résilier votre compte sans préavis en cas de violation grave de ces conditions. Vous pouvez supprimer votre compte à tout moment via la page Paramètres. En cas de résiliation :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Vous perdrez l'accès immédiat à votre contenu, votre progression et vos points Gold.</li>
                <li>Les obligations de paiement en cours restent dues.</li>
                <li>Certaines données pourront être conservées conformément à notre Politique de Confidentialité et aux obligations légales applicables.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">11. Limitation de Responsabilité</h2>
              <p>
                Edupreneurs fournit ses services "en l'état" sans garantie d'aucune sorte. Nous ne garantissons pas :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Que le service sera disponible de façon ininterrompue ou sans erreur.</li>
                <li>Que les résultats d'apprentissage spécifiques seront atteints.</li>
                <li>Que tout le contenu sera toujours exact, complet et à jour.</li>
              </ul>
              <p className="mt-2">
                Dans les limites autorisées par la loi applicable, la responsabilité totale d'Edupreneurs est limitée au montant que vous avez effectivement payé pour le service au cours des 30 derniers jours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">12. Modifications des Conditions</h2>
              <p>
                Edupreneurs se réserve le droit de modifier ces conditions à tout moment. Les modifications importantes vous seront communiquées par notification dans l'application au moins 7 jours avant leur entrée en vigueur. Votre utilisation continue du service après cette période constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">13. Contact</h2>
              <p>
                Pour toute question concernant ces conditions d'utilisation :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Email : contact@edupreneurs.com</li>
                <li>Via le formulaire de contact disponible sur la plateforme</li>
              </ul>
              <p className="mt-4">
                Voir aussi notre <Link to="/privacy-policy" className="underline hover:text-primary">Politique de Confidentialité</Link>.
              </p>
            </section>

            <p className="text-sm mt-8 pt-6 border-t border-border">Dernière mise à jour : Mars 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
