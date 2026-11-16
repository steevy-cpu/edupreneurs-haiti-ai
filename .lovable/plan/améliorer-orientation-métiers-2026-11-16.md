# Améliorer Orientation & Métiers

## Objectif
Transformer la première version en un parcours d’orientation fiable, clair et concret pour les élèves haïtiens, sans alourdir leur connexion ni présenter un test de quatre questions comme un verdict sur leur avenir.

Le plan concerne uniquement **Orientation & Métiers**. Aucun changement de l’application n’est réalisé avant approbation. Le précédent plan MCP est conservé séparément et reste en attente : aucune migration, modification ou publication MCP n’est autorisée par ce plan.

## Ce qui existe déjà
- Un questionnaire en quatre étapes, sept domaines, quatorze fiches métiers, trois recommandations et deux alternatives.
- Un catalogue filtrable par secteur et un bouton ouvrant Jude avec une question préremplie.
- Un accès dans le menu, sous Profil ; les réponses finales sont conservées sur l’appareil.

## 1. Priorité : fiabiliser les conseils et les résultats

### Fiches métiers
- Revoir les quatorze fiches avant d’élargir le catalogue : établissements, durées d’études, conditions d’accès et professions réglementées.
- Ajouter des sources consultables et une date de vérification aux informations factuelles. Signaler ce qui reste à confirmer ; ne pas présenter une demande « forte » comme un fait sans source.
- Corriger le repère scolaire : les séries du Nouveau Secondaire concernent NS3–NS4 ; expliquer les sigles et présenter une série comme une piste conseillée, non comme une obligation d’admission.
- Distinguer formation, qualification professionnelle et exercice autorisé : une formation courte ne donne pas automatiquement accès à tous les postes cités.

### Recommandations
- Conserver les quatre axes et les poids actuels : intérêts 40, matières 25, style 20, motivation 15.
- Corriger la normalisation des matières : actuellement, une seule matière choisie et parfaitement compatible ne rapporte que 12,5 points sur 25. Une correspondance complète doit obtenir les 25 points, que l’élève sélectionne une ou deux matières.
- Clarifier le rôle des intérêts : le code actuel attribue 40 points dès qu’un intérêt correspond ; son commentaire évoque à tort un bonus pour le secteur principal. Garder cette règle pour cette phase et retirer l’ambiguïté.
- Remplacer les pourcentages affichés par des correspondances descriptives et des raisons concrètes : « Tu as choisi la santé et aider les autres ». Le score interne n’est pas une probabilité de réussite ni un diagnostic psychologique.
- Conserver trois pistes principales et deux alternatives distinctes. Éviter deux alternatives du même secteur lorsqu’au moins deux secteurs supplémentaires sont disponibles ; expliquer une faible correspondance sans inventer une affinité.

**Résultat attendu :** chaque suggestion se comprend, et les conseils non vérifiés ne se présentent plus comme des certitudes.

## 2. Sécuriser la sauvegarde et simplifier le questionnaire
- Valider les réponses sauvegardées avant de les utiliser : structure, valeurs autorisées, limites de choix et questionnaire complet pour afficher des résultats.
- Sauvegarder aussi la progression pour reprendre un questionnaire interrompu, sans confondre brouillon et résultat terminé.
- Isoler les réponses par compte sur les téléphones partagés ; ne pas attribuer automatiquement une ancienne sauvegarde non identifiée à l’élève connecté.
- Prévoir une suppression explicite des réponses et un fonctionnement temporaire si l’appareil refuse la sauvegarde.
- Afficher le nombre de choix restants et un état clair lorsque le maximum est atteint, au lieu d’ignorer silencieusement un clic.
- Garder les retours entre étapes sans perdre les réponses ; permettre de modifier les choix depuis les résultats.

**Résultat attendu :** moins de réponses perdues et aucune confusion entre élèves utilisant le même appareil.

## 3. Passer d’une fiche à une action concrète
- Ajouter à chaque fiche une petite section « Je peux commencer maintenant » : une compétence à travailler et une première activité réaliste, sans achat obligatoire.
- Relier les compétences aux cours et modules de découverte déjà disponibles, uniquement lorsque leur contenu correspond réellement ; ne pas créer de liens vides.
- Ajouter des favoris privés sur l’appareil et une comparaison de deux métiers : quotidien, parcours, compétences et matériel nécessaire.
- Transmettre à Jude le métier et les choix pertinents du questionnaire, sans nom, adresse, téléphone ou autre donnée personnelle ; ne jamais prétendre que Jude garantit une admission ou un emploi.
- Fermer explicitement la fiche lorsque Jude s’ouvre, plutôt que dépendre d’une détection générale des clics sur les boutons.

**Résultat attendu :** l’élève repart avec une prochaine étape, pas seulement une liste de professions.

## 4. Améliorer l’exploration et la lecture sur téléphone
- Rendre les fiches, filtres et choix utilisables au clavier et correctement annoncés par les lecteurs d’écran.
- Ne plus tronquer les intitulés de métiers ; les afficher sur plusieurs lignes si nécessaire.
- Rechercher sans distinction d’accents, dans les titres, secteurs et mots-clés métiers, avec remise à zéro des filtres quand aucun résultat ne correspond.
- Présenter les six rubriques avec une hiérarchie lisible et des sections repliables sur téléphone ; conserver les couleurs et les composants de l’application.
- Ajouter une entrée visible depuis Découverte des passions et une action discrète depuis le tableau de bord, sans changer la navigation générale.
- Après validation des fiches existantes, élargir progressivement les métiers techniques et de proximité sous-représentés, plutôt qu’ajouter beaucoup de fiches non vérifiées.

**Résultat attendu :** une exploration plus accessible, sans nouvelle page promotionnelle ni refonte globale.

## 5. Ordre de livraison proposé

| Lot | Contenu | Condition de validation |
| --- | --- | --- |
| 1 — Fiabilité | Calcul, explications, validation des sauvegardes, séparation par compte, corrections scolaires et signalement des informations incertaines | Tests de calcul et de sauvegarde réussis ; recommandations explicables |
| 2 — Parcours | Reprise du questionnaire, limites visibles, recherche, accessibilité, lecture des fiches | Parcours complet testé sur téléphone et ordinateur |
| 3 — Passage à l’action | Favoris, comparaison, liens vers contenus existants, contexte Jude | Liens réels vérifiés ; ouverture de Jude vérifiée avec une session active |
| 4 — Enrichissement | Sources et vérification éditoriale approfondie, nouveaux métiers | Sources disponibles et revue du contenu avant diffusion |

**Recommandation :** commencer par les lots 1 et 2. Les favoris, la comparaison et l’enrichissement viennent ensuite ; aucune nouvelle génération vocale ou illustration lourde n’est nécessaire.

## Détails techniques
- Garder le catalogue statique et la page chargée à la demande : aucune nouvelle table, aucun appel réseau pour calculer les résultats et aucune nouvelle dépendance.
- Conserver l’AppShell, l’ordre des fournisseurs de contexte et l’événement `jude:open` existants. Ne pas ajouter d’écoute permanente ni de nouvel appel IA au chargement.
- Extraire seulement la validation/persistance et les vues qui deviennent difficiles à maintenir ; pas de restructuration sans bénéfice mesurable.
- Versionner les sauvegardes et séparer brouillon, réponses terminées et favoris. Une ancienne sauvegarde sans compte ne doit pas être importée silencieusement.
- Les favoris et réponses restent locaux : pas de synchronisation entre appareils dans ce plan. Une gestion éditoriale en ligne fera l’objet d’un plan séparé si elle devient nécessaire.
- Ajouter de petits tests de logique : poids 40/25/20/15, une ou deux matières totalement compatibles = 25 points, limites de trois intérêts et deux matières, résultats sans doublon et alternatives diversifiées lorsque possible, rejet de données invalides, isolation entre comptes.

## Vérification de sécurité et de compatibilité

| Point | Engagement du plan | Vérification avant livraison |
| --- | --- | --- |
| Données et droits d’accès | Aucune migration ni modification des droits | Diff limité au module et à ses accès existants |
| Téléphone partagé | Sauvegardes isolées par compte, ancienne donnée non attribuée automatiquement | Deux comptes sur le même navigateur ne retrouvent pas les réponses de l’autre |
| Navigation et outils globaux | AppShell et fournisseurs inchangés | Ouvrir/fermer la fiche puis Jude, naviguer ailleurs sans perdre les outils |
| Connexion 3G | Catalogue et calcul locaux ; aucun nouveau service requis | Questionnaire et résultats accessibles sans réseau après chargement ; Jude reste non bloquant |
| Informations sensibles | Aucun identifiant personnel dans la question envoyée à Jude | Vérifier le contenu réellement transmis |
| Conseils d’orientation | Pas de promesse d’emploi ou de diagnostic scientifique | Revue des fiches, sources et formulation prudente |
| Compatibilité des sauvegardes | Lecture défensive, suppression possible, absence de stockage tolérée | Données corrompues, brouillon, stockage refusé et anciennes réponses testés |
| Mobile et accessibilité | Titres complets, commandes accessibles, fiche sans chevauchement | Vérification à 360 px, au format actuel 704 × 722 et sur ordinateur ; parcours clavier |
| Authentification | Aucun changement de connexion ou de confiance des appareils | Parcours de la section vérifié avec une session active |

## Limites et dépendances
- Les informations d’admission, les établissements et la demande du marché ne sont pas encore vérifiés par cette analyse du code. Leur validation demande des sources officielles et, si nécessaire, une revue par un conseiller local.
- Le catalogue local évite de nouveaux appels réseau ; l’accès initial à l’application et la discussion avec Jude ne sont pas pour autant garantis hors connexion.
- Ce plan ne modifie ni abonnements, ni récompenses, ni MCP et ne publie rien automatiquement.
