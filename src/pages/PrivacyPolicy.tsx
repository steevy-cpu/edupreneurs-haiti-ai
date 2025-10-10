import { ThemeToggle } from "@/components/ThemeToggle";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-primary">Politique de Confidentialité</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Collecte des Informations</h2>
              <p>EDUPRENEURS collecte les informations suivantes lors de votre inscription :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Nom complet et pseudonyme</li>
                <li>Adresse e-mail</li>
                <li>Numéro de téléphone</li>
                <li>Niveau académique</li>
                <li>Nom de l'école</li>
                <li>Genre</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Utilisation des Données</h2>
              <p>Vos données personnelles sont utilisées pour :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Personnaliser votre expérience d'apprentissage</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
                <li>Améliorer nos services éducatifs</li>
                <li>Gérer le programme de parrainage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Protection des Données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles
                contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Partage des Informations</h2>
              <p>
                Vos informations personnelles ne seront jamais vendues à des tiers. Nous ne partageons vos données
                qu'avec votre consentement explicite ou lorsque la loi l'exige.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Vos Droits</h2>
              <p>Vous avez le droit de :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Accéder à vos données personnelles</li>
                <li>Corriger vos informations</li>
                <li>Supprimer votre compte</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Cookies et Technologies Similaires</h2>
              <p>
                Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience sur notre
                plateforme et analyser l'utilisation de nos services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Modifications de la Politique</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les
                modifications entreront en vigueur dès leur publication sur cette page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, veuillez
                nous contacter à :
              </p>
              <p className="mt-2 font-medium text-foreground">edupreneurs7441@gmail.com</p>
            </section>

            <p className="text-sm mt-8 pt-6 border-t border-border">Dernière mise à jour : Octobre 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
