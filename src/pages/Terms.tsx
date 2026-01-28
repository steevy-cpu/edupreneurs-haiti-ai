import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-primary">Conditions d'Utilisation</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Acceptation des Conditions</h2>
              <p>
                En accédant et en utilisant la plateforme EDUPRENEURS Haiti, vous acceptez d'être lié par ces 
                conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser 
                notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Description du Service</h2>
              <p>
                EDUPRENEURS Haiti est une plateforme éducative en ligne qui offre :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Des cours alignés sur le programme du MENFP (7AF à NS4)</li>
                <li>Un assistant IA personnalisé pour l'apprentissage</li>
                <li>Des examens officiels et des ressources pédagogiques</li>
                <li>Une communauté d'apprenants et des fonctionnalités sociales</li>
                <li>Un système de récompenses Gold</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Création de Compte</h2>
              <p>Pour utiliser nos services, vous devez :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Avoir au moins 13 ans ou avoir le consentement parental</li>
                <li>Fournir des informations exactes et complètes</li>
                <li>Maintenir la confidentialité de votre mot de passe</li>
                <li>Être responsable de toutes les activités sur votre compte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Conduite de l'Utilisateur</h2>
              <p>En utilisant notre plateforme, vous vous engagez à ne pas :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Publier du contenu offensant, diffamatoire ou illégal</li>
                <li>Harceler, intimider ou menacer d'autres utilisateurs</li>
                <li>Utiliser la plateforme à des fins commerciales non autorisées</li>
                <li>Tenter de pirater ou de compromettre la sécurité du système</li>
                <li>Partager votre compte avec d'autres personnes</li>
                <li>Tricher ou manipuler le système de récompenses Gold</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Droits de Propriété Intellectuelle</h2>
              <p>
                Tout le contenu éducatif, les graphiques, les logos et le design de la plateforme sont la 
                propriété d'EDUPRENEURS Haiti. Vous ne pouvez pas reproduire, distribuer ou créer des œuvres 
                dérivées sans notre autorisation écrite.
              </p>
              <p className="mt-2">
                Le contenu que vous créez (publications, commentaires) reste votre propriété, mais vous nous 
                accordez une licence pour l'afficher sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Conditions de Paiement</h2>
              <p>
                L'abonnement à EDUPRENEURS Haiti coûte 200 gourdes par mois après une période d'essai gratuite 
                d'une semaine. En vous abonnant :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Vous acceptez le renouvellement automatique sauf annulation</li>
                <li>Les paiements sont non remboursables sauf indication contraire</li>
                <li>Nous nous réservons le droit de modifier les tarifs avec préavis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Système Gold</h2>
              <p>
                Les points Gold sont des récompenses virtuelles gagnées en utilisant la plateforme. 
                EDUPRENEURS Haiti se réserve le droit de :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Modifier les règles d'attribution des Gold</li>
                <li>Annuler les Gold obtenus de manière frauduleuse</li>
                <li>Suspendre le programme de récompenses à tout moment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Résiliation</h2>
              <p>
                Nous pouvons suspendre ou résilier votre compte si vous violez ces conditions. Vous pouvez 
                également supprimer votre compte à tout moment via les paramètres. En cas de résiliation :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Vous perdrez l'accès à votre contenu et vos Gold</li>
                <li>Les obligations de paiement en cours restent dues</li>
                <li>Certaines données peuvent être conservées conformément à la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">9. Limitation de Responsabilité</h2>
              <p>
                EDUPRENEURS Haiti fournit ses services "tels quels". Nous ne garantissons pas que :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Le service sera ininterrompu ou sans erreur</li>
                <li>Les résultats d'apprentissage seront atteints</li>
                <li>Le contenu sera toujours exact et à jour</li>
              </ul>
              <p className="mt-2">
                Notre responsabilité est limitée au montant que vous avez payé pour le service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">10. Modifications des Conditions</h2>
              <p>
                Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront 
                communiquées par notification. Votre utilisation continue du service après les modifications 
                constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">11. Contact</h2>
              <p>
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à :
              </p>
              <p className="mt-2 font-medium text-foreground">contact@edupreneurs.com</p>
            </section>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm">
                Voir aussi notre{" "}
                <Link to="/privacy-policy" className="underline hover:text-primary">
                  Politique de Confidentialité
                </Link>
              </p>
            </div>

            <p className="text-sm mt-8 pt-6 border-t border-border">Dernière mise à jour : Janvier 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
