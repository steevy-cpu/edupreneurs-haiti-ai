// Civic education activities for civique categories
// Structure matches passionActivities.ts exactly

import type { ActivityContent, ModuleContent, CategoryContent } from './passionActivities';

// RIGHTS CATEGORY ACTIVITIES (Droits Fondamentaux)
export const rightsActivities: CategoryContent = {
  education: {
    id: "education",
    title: "Droit à l'Éducation",
    description: "Comprends ton droit fondamental à l'éducation",
    duration: "15 min",
    activities: [
      {
        id: "education-video",
        type: "video",
        title: "Le droit à l'éducation expliqué",
        description: "Découvre pourquoi l'éducation est un droit universel",
        duration: "5 min",
        content: { videoQuery: "droit education enfants francais explique" }
      },
      {
        id: "education-reading",
        type: "reading",
        title: "L'éducation: un droit universel",
        description: "Comprends l'importance de ce droit fondamental",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Qu'est-ce que le droit à l'éducation?</h3>
            <p>Le droit à l'éducation est un droit humain fondamental reconnu par la Déclaration universelle des droits de l'homme. Chaque enfant a le droit d'apprendre, de développer ses talents et de préparer son avenir.</p>
            
            <h4>Pourquoi c'est important?</h4>
            <ul>
              <li><strong>Développement personnel</strong> - L'éducation t'aide à découvrir qui tu es</li>
              <li><strong>Opportunités</strong> - Elle ouvre des portes pour ton avenir</li>
              <li><strong>Citoyenneté</strong> - Elle te prépare à participer à la société</li>
            </ul>
            
            <h4>En Haïti</h4>
            <p>La Constitution haïtienne garantit le droit à l'éducation pour tous. L'État doit assurer l'accès à l'école et la qualité de l'enseignement. C'est un engagement envers chaque jeune Haïtien.</p>
          `
        }
      },
      {
        id: "education-quiz",
        type: "quiz",
        title: "Quiz: Tes droits à l'éducation",
        description: "Vérifie ta compréhension de ce droit fondamental",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quel document international reconnaît le droit à l'éducation?",
              options: ["Le code civil", "La Déclaration universelle des droits de l'homme", "Le code du travail", "La constitution américaine"],
              correctIndex: 1,
              explanation: "La Déclaration universelle des droits de l'homme de 1948 reconnaît l'éducation comme un droit fondamental."
            },
            {
              question: "Qui est responsable d'assurer l'accès à l'éducation en Haïti?",
              options: ["Les parents uniquement", "Les écoles privées", "L'État", "Les organisations internationales"],
              correctIndex: 2,
              explanation: "La Constitution haïtienne donne à l'État la responsabilité d'assurer l'accès à l'éducation."
            }
          ]
        }
      },
      {
        id: "education-game",
        type: "game",
        title: "Exercice: Mon droit à l'éducation",
        description: "Réfléchis à ce que l'éducation signifie pour toi",
        duration: "5 min",
        content: {
          gameDescription: "Écris trois choses que tu apprends à l'école qui t'aideront dans ta vie future. Partage avec un ami pourquoi l'éducation est importante pour toi!"
        }
      }
    ]
  },
  health: {
    id: "health",
    title: "Droit à la Santé",
    description: "Découvre ton droit d'être en bonne santé",
    duration: "15 min",
    activities: [
      {
        id: "health-video",
        type: "video",
        title: "La santé: un droit pour tous",
        description: "Comprends pourquoi la santé est un droit fondamental",
        duration: "5 min",
        content: { videoQuery: "droit sante enfants francais education" }
      },
      {
        id: "health-reading",
        type: "reading",
        title: "Prendre soin de sa santé",
        description: "Apprends comment protéger ta santé",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Ton droit à la santé</h3>
            <p>Chaque personne a le droit de vivre en bonne santé et d'avoir accès aux soins médicaux. Ce droit inclut la prévention, les traitements et l'information sur la santé.</p>
            
            <h4>Ce que comprend le droit à la santé:</h4>
            <ul>
              <li><strong>Accès aux soins</strong> - Pouvoir voir un médecin quand nécessaire</li>
              <li><strong>Eau propre</strong> - Avoir accès à de l'eau potable</li>
              <li><strong>Alimentation</strong> - Manger des repas nutritifs</li>
              <li><strong>Information</strong> - Apprendre comment rester en bonne santé</li>
            </ul>
            
            <h4>Ta responsabilité</h4>
            <p>Tu peux aussi protéger ta santé en te lavant les mains, en mangeant équilibré, en faisant de l'exercice et en dormant suffisamment.</p>
          `
        }
      },
      {
        id: "health-quiz",
        type: "quiz",
        title: "Quiz: La santé et toi",
        description: "Teste tes connaissances sur le droit à la santé",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Lequel de ces éléments fait partie du droit à la santé?",
              options: ["Avoir une voiture", "Accès à l'eau potable", "Avoir un téléphone", "Voyager gratuitement"],
              correctIndex: 1,
              explanation: "L'accès à l'eau potable est essentiel pour la santé et fait partie de ce droit."
            },
            {
              question: "Quelle habitude protège ta santé?",
              options: ["Dormir très peu", "Manger beaucoup de sucre", "Se laver les mains régulièrement", "Éviter l'exercice"],
              correctIndex: 2,
              explanation: "Se laver les mains aide à prévenir les maladies et protège ta santé."
            }
          ]
        }
      },
      {
        id: "health-game",
        type: "game",
        title: "Mon plan santé",
        description: "Crée ton plan pour rester en bonne santé",
        duration: "5 min",
        content: {
          gameDescription: "Dessine ou écris trois habitudes saines que tu pratiques déjà et deux nouvelles habitudes que tu voudrais adopter. Affiche-les dans ta chambre!"
        }
      }
    ]
  },
  "expression-civic": {
    id: "expression-civic",
    title: "Liberté d'Expression",
    description: "Apprends à exprimer tes idées avec respect",
    duration: "15 min",
    activities: [
      {
        id: "expression-civic-video",
        type: "video",
        title: "S'exprimer librement",
        description: "Découvre l'importance de la liberté d'expression",
        duration: "5 min",
        content: { videoQuery: "liberte expression enfants education civique francais" }
      },
      {
        id: "expression-civic-reading",
        type: "reading",
        title: "Ta voix compte",
        description: "Comprends comment utiliser ta liberté d'expression",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La liberté d'expression</h3>
            <p>La liberté d'expression te donne le droit de partager tes pensées, tes opinions et tes idées. C'est un pilier de la démocratie.</p>
            
            <h4>Ce que tu peux faire:</h4>
            <ul>
              <li><strong>Parler</strong> - Exprimer ton opinion en classe ou en famille</li>
              <li><strong>Écrire</strong> - Partager tes idées dans des textes ou lettres</li>
              <li><strong>Créer</strong> - Utiliser l'art, la musique ou la poésie</li>
              <li><strong>Participer</strong> - Joindre des discussions et débats</li>
            </ul>
            
            <h4>Avec responsabilité</h4>
            <p>La liberté d'expression vient avec la responsabilité de respecter les autres. On ne doit pas utiliser sa parole pour blesser, mentir ou discriminer.</p>
          `
        }
      },
      {
        id: "expression-civic-quiz",
        type: "quiz",
        title: "Quiz: S'exprimer avec respect",
        description: "Teste ta compréhension de ce droit",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "La liberté d'expression permet de...",
              options: ["Insulter les autres", "Partager ses opinions respectueusement", "Mentir sans conséquence", "Crier sur tout le monde"],
              correctIndex: 1,
              explanation: "La liberté d'expression permet de partager ses opinions tout en respectant les autres."
            },
            {
              question: "Comment peux-tu exprimer tes idées de façon positive?",
              options: ["En criant plus fort", "En écoutant les autres et en parlant calmement", "En ignorant tout le monde", "En refusant de discuter"],
              correctIndex: 1,
              explanation: "Une bonne communication implique d'écouter les autres et de s'exprimer calmement."
            }
          ]
        }
      },
      {
        id: "expression-civic-game",
        type: "game",
        title: "Mon message au monde",
        description: "Exprime une idée positive",
        duration: "5 min",
        content: {
          gameDescription: "Écris un court message positif que tu voudrais partager avec ta communauté. Cela peut être sur l'environnement, l'entraide, ou un sujet qui te tient à cœur!"
        }
      }
    ]
  },
  duties: {
    id: "duties",
    title: "Devoirs du Citoyen",
    description: "Découvre tes responsabilités envers ta communauté",
    duration: "15 min",
    activities: [
      {
        id: "duties-video",
        type: "video",
        title: "Nos devoirs de citoyens",
        description: "Apprends quelles sont tes responsabilités",
        duration: "5 min",
        content: { videoQuery: "devoirs citoyens responsabilites education civique francais" }
      },
      {
        id: "duties-reading",
        type: "reading",
        title: "Droits et devoirs vont ensemble",
        description: "Comprends l'équilibre entre droits et responsabilités",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Les devoirs du citoyen</h3>
            <p>Avoir des droits signifie aussi avoir des responsabilités. Les devoirs nous aident à vivre ensemble en harmonie.</p>
            
            <h4>Tes principales responsabilités:</h4>
            <ul>
              <li><strong>Respecter les lois</strong> - Les règles protègent tout le monde</li>
              <li><strong>Respecter les autres</strong> - Leurs droits sont aussi importants que les tiens</li>
              <li><strong>Protéger l'environnement</strong> - Notre planète est notre maison commune</li>
              <li><strong>Participer à la communauté</strong> - Aider et s'impliquer</li>
            </ul>
            
            <h4>En Haïti</h4>
            <p>Chaque Haïtien a le devoir de contribuer au bien-être de sa communauté et de respecter les symboles nationaux.</p>
          `
        }
      },
      {
        id: "duties-quiz",
        type: "quiz",
        title: "Quiz: Mes responsabilités",
        description: "Vérifie ta compréhension des devoirs citoyens",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Pourquoi devons-nous respecter les lois?",
              options: ["Pour avoir peur", "Pour protéger tout le monde", "Pour obéir aux adultes", "Pour être populaire"],
              correctIndex: 1,
              explanation: "Les lois existent pour protéger tous les membres de la société."
            },
            {
              question: "Quel est un devoir envers l'environnement?",
              options: ["Jeter les déchets n'importe où", "Ne pas recycler", "Protéger la nature", "Gaspiller l'eau"],
              correctIndex: 2,
              explanation: "Protéger la nature est un devoir pour préserver notre planète."
            }
          ]
        }
      },
      {
        id: "duties-game",
        type: "game",
        title: "Mon engagement citoyen",
        description: "Prends un engagement pour ta communauté",
        duration: "5 min",
        content: {
          gameDescription: "Choisis une action positive que tu peux faire cette semaine pour ta communauté: aider un voisin, ramasser des déchets, ou soutenir un camarade. Note ton engagement!"
        }
      }
    ]
  }
};

// CITIZENSHIP CATEGORY ACTIVITIES (Citoyenneté Active)
export const citizenshipActivities: CategoryContent = {
  democracy: {
    id: "democracy",
    title: "Principes de la Démocratie",
    description: "Comprends comment fonctionne la démocratie",
    duration: "15 min",
    activities: [
      {
        id: "democracy-video",
        type: "video",
        title: "C'est quoi la démocratie?",
        description: "Découvre les bases du système démocratique",
        duration: "5 min",
        content: { videoQuery: "democratie expliquee enfants francais simple" }
      },
      {
        id: "democracy-reading",
        type: "reading",
        title: "Le pouvoir du peuple",
        description: "Apprends les principes démocratiques",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La démocratie</h3>
            <p>Le mot "démocratie" vient du grec et signifie "le pouvoir du peuple". Dans une démocratie, les citoyens participent aux décisions qui affectent leur vie.</p>
            
            <h4>Les piliers de la démocratie:</h4>
            <ul>
              <li><strong>Le vote</strong> - Les citoyens choisissent leurs représentants</li>
              <li><strong>L'égalité</strong> - Chaque voix a la même valeur</li>
              <li><strong>La liberté</strong> - Liberté d'expression, de réunion, de presse</li>
              <li><strong>L'État de droit</strong> - Les lois s'appliquent à tous</li>
            </ul>
            
            <h4>En Haïti</h4>
            <p>Haïti est une république démocratique. Les citoyens élisent leur président et leurs représentants au Parlement.</p>
          `
        }
      },
      {
        id: "democracy-quiz",
        type: "quiz",
        title: "Quiz: La démocratie",
        description: "Teste tes connaissances démocratiques",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Que signifie 'démocratie'?",
              options: ["Le pouvoir de l'armée", "Le pouvoir du peuple", "Le pouvoir d'un roi", "Le pouvoir de l'argent"],
              correctIndex: 1,
              explanation: "Démocratie vient du grec 'demos' (peuple) et 'kratos' (pouvoir)."
            },
            {
              question: "Dans une démocratie, les citoyens...",
              options: ["N'ont aucun pouvoir", "Votent pour choisir leurs représentants", "Obéissent sans questionner", "Ne peuvent pas s'exprimer"],
              correctIndex: 1,
              explanation: "Le vote est un moyen fondamental pour les citoyens de participer à la démocratie."
            }
          ]
        }
      },
      {
        id: "democracy-game",
        type: "game",
        title: "Un vote en classe",
        description: "Pratique la démocratie avec tes camarades",
        duration: "5 min",
        content: {
          gameDescription: "Organise un petit vote dans ta classe ou ta famille sur un sujet simple (quel film regarder, quelle activité faire). Assure-toi que chacun puisse voter en secret!"
        }
      }
    ]
  },
  participation: {
    id: "participation",
    title: "Participation Civique",
    description: "Apprends à t'impliquer dans ta communauté",
    duration: "15 min",
    activities: [
      {
        id: "participation-video",
        type: "video",
        title: "S'engager dans sa communauté",
        description: "Découvre comment participer activement",
        duration: "5 min",
        content: { videoQuery: "engagement civique jeunes participation communaute francais" }
      },
      {
        id: "participation-reading",
        type: "reading",
        title: "Devenir un citoyen actif",
        description: "Les différentes façons de s'impliquer",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La participation civique</h3>
            <p>Être un bon citoyen, c'est plus que simplement suivre les règles. C'est s'impliquer activement pour améliorer ta communauté.</p>
            
            <h4>Comment participer?</h4>
            <ul>
              <li><strong>S'informer</strong> - Comprendre les enjeux de ta communauté</li>
              <li><strong>Voter</strong> - Quand tu auras l'âge, exerce ce droit précieux</li>
              <li><strong>S'engager</strong> - Rejoindre des associations ou groupes</li>
              <li><strong>Aider</strong> - Faire du bénévolat ou aider tes voisins</li>
            </ul>
            
            <h4>Même jeune, tu peux agir!</h4>
            <p>Participe aux projets de ton école, aide dans ton quartier, ou lance une initiative avec tes amis pour résoudre un problème local.</p>
          `
        }
      },
      {
        id: "participation-quiz",
        type: "quiz",
        title: "Quiz: La participation",
        description: "Évalue ta compréhension de l'engagement civique",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Comment un jeune peut-il participer à sa communauté?",
              options: ["Attendre d'être adulte", "Faire du bénévolat et aider les autres", "Ignorer les problèmes", "Ne rien faire"],
              correctIndex: 1,
              explanation: "Même jeune, tu peux faire du bénévolat et aider dans ta communauté."
            },
            {
              question: "Pourquoi est-il important de s'informer sur sa communauté?",
              options: ["Ce n'est pas important", "Pour comprendre les enjeux et pouvoir aider", "Pour critiquer les autres", "Pour s'ennuyer"],
              correctIndex: 1,
              explanation: "S'informer permet de mieux comprendre et de contribuer efficacement."
            }
          ]
        }
      },
      {
        id: "participation-game",
        type: "game",
        title: "Mon projet communautaire",
        description: "Imagine un projet pour ta communauté",
        duration: "5 min",
        content: {
          gameDescription: "Pense à un problème dans ton quartier ou ton école. Imagine une solution et décris comment tu pourrais la mettre en place avec l'aide de tes amis!"
        }
      }
    ]
  },
  laws: {
    id: "laws",
    title: "Respect des Lois",
    description: "Comprends pourquoi les lois sont importantes",
    duration: "15 min",
    activities: [
      {
        id: "laws-video",
        type: "video",
        title: "Les lois et nous",
        description: "Apprends pourquoi nous avons des lois",
        duration: "5 min",
        content: { videoQuery: "importance lois societe education civique francais" }
      },
      {
        id: "laws-reading",
        type: "reading",
        title: "Vivre ensemble grâce aux lois",
        description: "Découvre le rôle des lois dans la société",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Pourquoi avons-nous des lois?</h3>
            <p>Les lois sont des règles que tout le monde dans un pays doit suivre. Elles permettent à des millions de personnes de vivre ensemble en harmonie.</p>
            
            <h4>Les lois servent à:</h4>
            <ul>
              <li><strong>Protéger</strong> - Les lois protègent nos droits et notre sécurité</li>
              <li><strong>Organiser</strong> - Elles créent de l'ordre dans la société</li>
              <li><strong>Résoudre</strong> - Elles aident à régler les conflits</li>
              <li><strong>Punir</strong> - Elles sanctionnent ceux qui font du mal</li>
            </ul>
            
            <h4>La justice</h4>
            <p>Les tribunaux veillent à ce que les lois soient respectées et appliquées de façon juste pour tous.</p>
          `
        }
      },
      {
        id: "laws-quiz",
        type: "quiz",
        title: "Quiz: Lois et société",
        description: "Teste tes connaissances sur les lois",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quel est le rôle principal des lois?",
              options: ["Ennuyer les gens", "Permettre de vivre ensemble en harmonie", "Favoriser les riches", "Créer des problèmes"],
              correctIndex: 1,
              explanation: "Les lois permettent à la société de fonctionner en harmonie."
            },
            {
              question: "Qui doit respecter les lois?",
              options: ["Seulement les enfants", "Seulement les adultes", "Tout le monde", "Personne"],
              correctIndex: 2,
              explanation: "Les lois s'appliquent à tout le monde, sans exception."
            }
          ]
        }
      },
      {
        id: "laws-game",
        type: "game",
        title: "Créer des règles justes",
        description: "Imagine des règles pour un groupe",
        duration: "5 min",
        content: {
          gameDescription: "Imagine que tu dois créer 3 règles pour ta classe. Quelles règles choisirais-tu pour que tout le monde soit respecté et en sécurité? Explique pourquoi!"
        }
      }
    ]
  },
  "civic-role": {
    id: "civic-role",
    title: "Rôle du Citoyen",
    description: "Découvre ce que signifie être un bon citoyen",
    duration: "15 min",
    activities: [
      {
        id: "civic-role-video",
        type: "video",
        title: "Être un bon citoyen",
        description: "Apprends les qualités d'un bon citoyen",
        duration: "5 min",
        content: { videoQuery: "bon citoyen qualites responsabilites education civique francais" }
      },
      {
        id: "civic-role-reading",
        type: "reading",
        title: "Mon rôle dans la société",
        description: "Comprends ta place dans la communauté",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Qu'est-ce qu'un bon citoyen?</h3>
            <p>Un bon citoyen contribue positivement à sa communauté et à son pays. Ce n'est pas qu'une question de suivre les règles, mais aussi d'agir pour le bien commun.</p>
            
            <h4>Les qualités d'un bon citoyen:</h4>
            <ul>
              <li><strong>Respectueux</strong> - Traite les autres comme tu voudrais être traité</li>
              <li><strong>Responsable</strong> - Assume tes actions et leurs conséquences</li>
              <li><strong>Solidaire</strong> - Aide ceux qui en ont besoin</li>
              <li><strong>Engagé</strong> - Participe à améliorer ta communauté</li>
            </ul>
            
            <h4>Ton impact</h4>
            <p>Chaque petite action compte! Ton comportement influence les autres et contribue à créer une société meilleure.</p>
          `
        }
      },
      {
        id: "civic-role-quiz",
        type: "quiz",
        title: "Quiz: Le bon citoyen",
        description: "Évalue tes connaissances sur la citoyenneté",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle qualité caractérise un bon citoyen?",
              options: ["L'égoïsme", "La solidarité", "L'indifférence", "La paresse"],
              correctIndex: 1,
              explanation: "La solidarité est une qualité essentielle d'un bon citoyen."
            },
            {
              question: "Comment peux-tu être un bon citoyen à ton âge?",
              options: ["Attendre d'être adulte", "Aider les autres et respecter les règles", "Ignorer tout le monde", "Ne rien faire"],
              correctIndex: 1,
              explanation: "Tu peux être un bon citoyen dès maintenant en aidant les autres et en respectant les règles."
            }
          ]
        }
      },
      {
        id: "civic-role-game",
        type: "game",
        title: "Mon portrait de citoyen",
        description: "Décris le citoyen que tu veux devenir",
        duration: "5 min",
        content: {
          gameDescription: "Dessine ou décris le citoyen que tu veux être quand tu seras adulte. Quelles qualités auras-tu? Comment aideras-tu ta communauté?"
        }
      }
    ]
  }
};

// PEACE CATEGORY ACTIVITIES (Culture de la Paix)
export const peaceActivities: CategoryContent = {
  tolerance: {
    id: "tolerance",
    title: "Tolérance & Diversité",
    description: "Apprends à respecter les différences",
    duration: "15 min",
    activities: [
      {
        id: "tolerance-video",
        type: "video",
        title: "Célébrer nos différences",
        description: "Découvre la beauté de la diversité",
        duration: "5 min",
        content: { videoQuery: "tolerance diversite enfants education francais" }
      },
      {
        id: "tolerance-reading",
        type: "reading",
        title: "Différents mais égaux",
        description: "Comprends l'importance de la tolérance",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La tolérance et la diversité</h3>
            <p>Chaque personne est unique. Nous avons tous des origines, des croyances, des langues et des cultures différentes. Cette diversité est une richesse!</p>
            
            <h4>Qu'est-ce que la tolérance?</h4>
            <ul>
              <li><strong>Accepter</strong> - Reconnaître que les autres peuvent être différents</li>
              <li><strong>Respecter</strong> - Traiter chacun avec dignité</li>
              <li><strong>Écouter</strong> - S'ouvrir aux points de vue différents</li>
              <li><strong>Apprendre</strong> - Découvrir d'autres cultures et traditions</li>
            </ul>
            
            <h4>En Haïti</h4>
            <p>Haïti est un pays riche en culture et en histoire. Notre diversité régionale, linguistique et culturelle fait notre force.</p>
          `
        }
      },
      {
        id: "tolerance-quiz",
        type: "quiz",
        title: "Quiz: Tolérance",
        description: "Teste ta compréhension de la tolérance",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Que signifie être tolérant?",
              options: ["Tout accepter sans réfléchir", "Respecter les différences des autres", "Ignorer les autres", "Forcer les autres à changer"],
              correctIndex: 1,
              explanation: "Être tolérant signifie respecter les différences tout en gardant ses propres valeurs."
            },
            {
              question: "La diversité dans une communauté est...",
              options: ["Un problème", "Une richesse", "Sans importance", "Dangereuse"],
              correctIndex: 1,
              explanation: "La diversité enrichit notre communauté avec différentes perspectives et cultures."
            }
          ]
        }
      },
      {
        id: "tolerance-game",
        type: "game",
        title: "Découvrir l'autre",
        description: "Explore les différences avec curiosité",
        duration: "5 min",
        content: {
          gameDescription: "Trouve un camarade avec qui tu ne parles pas souvent. Pose-lui trois questions sur sa famille, ses traditions ou ses activités préférées. Tu apprendras quelque chose de nouveau!"
        }
      }
    ]
  },
  solidarity: {
    id: "solidarity",
    title: "Solidarité & Entraide",
    description: "Découvre la force de s'entraider",
    duration: "15 min",
    activities: [
      {
        id: "solidarity-video",
        type: "video",
        title: "Ensemble, on est plus forts",
        description: "Apprends la puissance de la solidarité",
        duration: "5 min",
        content: { videoQuery: "solidarite entraide enfants education valeurs francais" }
      },
      {
        id: "solidarity-reading",
        type: "reading",
        title: "L'union fait la force",
        description: "Comprends pourquoi l'entraide est importante",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La solidarité</h3>
            <p>"L'Union Fait La Force" - cette devise haïtienne nous rappelle que nous sommes plus forts quand nous nous entraidons.</p>
            
            <h4>Formes de solidarité:</h4>
            <ul>
              <li><strong>Entre amis</strong> - Aider un camarade en difficulté</li>
              <li><strong>En famille</strong> - Partager les tâches et les responsabilités</li>
              <li><strong>Dans le quartier</strong> - Aider ses voisins</li>
              <li><strong>Au niveau national</strong> - S'unir face aux défis du pays</li>
            </ul>
            
            <h4>Pourquoi c'est important?</h4>
            <p>Quand nous nous entraidons, les problèmes deviennent plus faciles à résoudre et les joies sont multipliées.</p>
          `
        }
      },
      {
        id: "solidarity-quiz",
        type: "quiz",
        title: "Quiz: Solidarité",
        description: "Teste tes connaissances sur l'entraide",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle est la devise d'Haïti?",
              options: ["Liberté, Égalité, Fraternité", "L'Union Fait La Force", "Un pour tous, tous pour un", "Ensemble vers le progrès"],
              correctIndex: 1,
              explanation: "L'Union Fait La Force est la devise nationale d'Haïti."
            },
            {
              question: "Comment peux-tu montrer de la solidarité à l'école?",
              options: ["Ignorer ceux qui ont des difficultés", "Aider un camarade qui a du mal", "Garder tout pour toi", "Critiquer les autres"],
              correctIndex: 1,
              explanation: "Aider ceux qui ont des difficultés est un bel exemple de solidarité."
            }
          ]
        }
      },
      {
        id: "solidarity-game",
        type: "game",
        title: "Ma chaîne de solidarité",
        description: "Lance une action d'entraide",
        duration: "5 min",
        content: {
          gameDescription: "Cette semaine, fais une bonne action pour quelqu'un et demande-lui de faire pareil pour une autre personne. Note combien de personnes ta chaîne de solidarité a pu atteindre!"
        }
      }
    ]
  },
  justice: {
    id: "justice",
    title: "Justice Sociale",
    description: "Comprends l'importance de l'équité",
    duration: "15 min",
    activities: [
      {
        id: "justice-video",
        type: "video",
        title: "C'est quoi la justice sociale?",
        description: "Découvre le concept de justice pour tous",
        duration: "5 min",
        content: { videoQuery: "justice sociale equite enfants education francais" }
      },
      {
        id: "justice-reading",
        type: "reading",
        title: "Une société juste",
        description: "Apprends ce que signifie l'équité",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La justice sociale</h3>
            <p>La justice sociale signifie que chaque personne devrait avoir les mêmes opportunités et être traitée équitablement, peu importe son origine ou sa situation.</p>
            
            <h4>Égalité vs Équité:</h4>
            <ul>
              <li><strong>Égalité</strong> - Donner la même chose à tout le monde</li>
              <li><strong>Équité</strong> - Donner à chacun ce dont il a besoin pour réussir</li>
            </ul>
            
            <h4>Exemples d'injustice:</h4>
            <ul>
              <li>Ne pas avoir accès à l'école à cause de la pauvreté</li>
              <li>Être traité différemment à cause de son apparence</li>
              <li>Ne pas avoir les mêmes opportunités que les autres</li>
            </ul>
            
            <h4>Agir pour la justice</h4>
            <p>Tu peux contribuer à une société plus juste en traitant tout le monde avec respect et en dénonçant les injustices que tu observes.</p>
          `
        }
      },
      {
        id: "justice-quiz",
        type: "quiz",
        title: "Quiz: Justice et équité",
        description: "Teste ta compréhension de la justice sociale",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle est la différence entre égalité et équité?",
              options: ["C'est la même chose", "L'équité donne à chacun selon ses besoins", "L'égalité est mieux", "L'équité est injuste"],
              correctIndex: 1,
              explanation: "L'équité consiste à donner à chacun ce dont il a besoin pour avoir les mêmes chances."
            },
            {
              question: "Que peux-tu faire face à une injustice?",
              options: ["L'ignorer", "La dénoncer respectueusement", "En rire", "Participer à l'injustice"],
              correctIndex: 1,
              explanation: "Dénoncer les injustices de façon respectueuse aide à créer une société plus juste."
            }
          ]
        }
      },
      {
        id: "justice-game",
        type: "game",
        title: "Avocat de la justice",
        description: "Défends une cause juste",
        duration: "5 min",
        content: {
          gameDescription: "Pense à une situation injuste que tu as observée (à l'école, dans ton quartier). Écris un court discours expliquant pourquoi c'est injuste et comment cela pourrait être amélioré."
        }
      }
    ]
  },
  conflict: {
    id: "conflict",
    title: "Résolution de Conflits",
    description: "Apprends à résoudre les désaccords pacifiquement",
    duration: "15 min",
    activities: [
      {
        id: "conflict-video",
        type: "video",
        title: "Résoudre les conflits sans violence",
        description: "Découvre des techniques de résolution pacifique",
        duration: "5 min",
        content: { videoQuery: "resolution conflits enfants non violence communication francais" }
      },
      {
        id: "conflict-reading",
        type: "reading",
        title: "La paix commence par nous",
        description: "Apprends à gérer les désaccords",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Résoudre les conflits pacifiquement</h3>
            <p>Les désaccords font partie de la vie. Ce qui compte, c'est comment nous les gérons. La violence n'est jamais la solution.</p>
            
            <h4>Étapes pour résoudre un conflit:</h4>
            <ol>
              <li><strong>Se calmer</strong> - Respire profondément avant de réagir</li>
              <li><strong>Écouter</strong> - Comprends le point de vue de l'autre</li>
              <li><strong>Exprimer</strong> - Dis ce que tu ressens calmement (utilise "Je...")</li>
              <li><strong>Chercher</strong> - Trouve une solution qui satisfait les deux</li>
            </ol>
            
            <h4>La communication non-violente</h4>
            <p>Au lieu de dire "Tu m'énerves!", essaie "Je me sens frustré quand...". Cela aide à résoudre les conflits sans blesser l'autre.</p>
          `
        }
      },
      {
        id: "conflict-quiz",
        type: "quiz",
        title: "Quiz: Résolution de conflits",
        description: "Teste tes compétences en résolution de conflits",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle est la première étape pour résoudre un conflit?",
              options: ["Crier plus fort", "Se calmer", "Frapper", "Partir en courant"],
              correctIndex: 1,
              explanation: "Se calmer permet de réfléchir clairement et de mieux communiquer."
            },
            {
              question: "Comment exprimer tes sentiments de façon positive?",
              options: ["\"Tu es méchant!\"", "\"Je me sens blessé quand...\"", "\"C'est ta faute!\"", "\"Tu m'énerves!\""],
              correctIndex: 1,
              explanation: "Utiliser 'Je me sens...' permet d'exprimer tes émotions sans accuser l'autre."
            }
          ]
        }
      },
      {
        id: "conflict-game",
        type: "game",
        title: "Médiateur de paix",
        description: "Pratique la résolution de conflits",
        duration: "5 min",
        content: {
          gameDescription: "Avec deux amis, jouez une scène de conflit (qui choisit le jeu, qui passe en premier...). Un troisième joue le médiateur qui aide à trouver une solution juste pour tous!"
        }
      }
    ]
  }
};
