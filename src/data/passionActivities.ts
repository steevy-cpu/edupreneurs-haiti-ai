// Real educational activities for each passion category

export interface ActivityContent {
  id: string;
  type: "video" | "quiz" | "reading" | "game";
  title: string;
  description: string;
  duration: string;
  content?: {
    videoQuery?: string; // For YouTube search
    readingContent?: string; // HTML content for reading
    quizQuestions?: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
    gameDescription?: string;
  };
}

export interface ModuleContent {
  id: string;
  title: string;
  description: string;
  duration: string;
  activities: ActivityContent[];
}

export interface CategoryContent {
  [moduleId: string]: ModuleContent;
}

// MUSIC CATEGORY ACTIVITIES
export const musicActivities: CategoryContent = {
  rhythm: {
    id: "rhythm",
    title: "Bases du Rythme",
    description: "Apprends à compter les temps et sentir le rythme",
    duration: "15 min",
    activities: [
      {
        id: "rhythm-video",
        type: "video",
        title: "Introduction au rythme",
        description: "Découvre comment les battements forment le cœur de la musique",
        duration: "5 min",
        content: { videoQuery: "apprendre le rythme musique débutant français" }
      },
      {
        id: "rhythm-reading",
        type: "reading",
        title: "Le tempo et les mesures",
        description: "Comprends comment la musique est organisée dans le temps",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Qu'est-ce que le rythme?</h3>
            <p>Le rythme est l'organisation des sons dans le temps. C'est ce qui donne à la musique son mouvement et son énergie.</p>
            
            <h4>Les éléments clés du rythme:</h4>
            <ul>
              <li><strong>Le tempo</strong> - La vitesse de la musique (lent, modéré, rapide)</li>
              <li><strong>Les temps</strong> - Les pulsations régulières de la musique</li>
              <li><strong>La mesure</strong> - Le regroupement des temps (2/4, 3/4, 4/4)</li>
            </ul>
            
            <h4>En Haïti</h4>
            <p>La musique haïtienne est connue pour ses rythmes riches! Le compas, le rara et le vodou ont chacun leurs propres patterns rythmiques distinctifs.</p>
          `
        }
      },
      {
        id: "rhythm-quiz",
        type: "quiz",
        title: "Quiz: Teste tes connaissances",
        description: "Vérifie ta compréhension du rythme",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Qu'est-ce que le tempo en musique?",
              options: ["La hauteur des notes", "La vitesse de la musique", "Le volume sonore", "Le type d'instrument"],
              correctIndex: 1,
              explanation: "Le tempo détermine à quelle vitesse la musique est jouée."
            },
            {
              question: "Combien de temps y a-t-il dans une mesure 4/4?",
              options: ["2 temps", "3 temps", "4 temps", "5 temps"],
              correctIndex: 2,
              explanation: "Une mesure 4/4 contient 4 temps, c'est la mesure la plus courante."
            },
            {
              question: "Quel style musical haïtien est célèbre pour son rythme distinctif?",
              options: ["Le jazz", "Le compas", "Le rock", "Le classique"],
              correctIndex: 1,
              explanation: "Le compas est un genre musical haïtien avec un rythme caractéristique."
            }
          ]
        }
      },
      {
        id: "rhythm-game",
        type: "game",
        title: "Pratique le rythme",
        description: "Tape le rythme avec Eric!",
        duration: "5 min",
        content: {
          gameDescription: "Essaie de taper dans tes mains en suivant le rythme de différentes chansons!"
        }
      }
    ]
  },
  instruments: {
    id: "instruments",
    title: "Découverte des Instruments",
    description: "Explore les instruments traditionnels et modernes",
    duration: "20 min",
    activities: [
      {
        id: "instruments-video",
        type: "video",
        title: "Les familles d'instruments",
        description: "Découvre les différents types d'instruments de musique",
        duration: "6 min",
        content: { videoQuery: "familles instruments musique éducatif français" }
      },
      {
        id: "instruments-reading",
        type: "reading",
        title: "Instruments traditionnels haïtiens",
        description: "Connais les instruments de notre patrimoine culturel",
        duration: "7 min",
        content: {
          readingContent: `
            <h3>Les instruments traditionnels d'Haïti</h3>
            
            <h4>Les percussions</h4>
            <ul>
              <li><strong>Le tanbou (tambour)</strong> - L'instrument sacré du vodou haïtien</li>
              <li><strong>Le vaksin</strong> - Un instrument à vent en bambou utilisé dans le rara</li>
              <li><strong>Le tchatcha</strong> - Une maraca traditionnelle</li>
            </ul>
            
            <h4>Les instruments à cordes</h4>
            <ul>
              <li><strong>La guitare</strong> - Essentielle dans le compas et le twoubadou</li>
              <li><strong>Le banjo</strong> - Utilisé dans la musique folklorique</li>
            </ul>
            
            <p>Ces instruments racontent l'histoire de notre peuple et portent notre culture à travers les générations.</p>
          `
        }
      },
      {
        id: "instruments-quiz",
        type: "quiz",
        title: "Quiz: Les instruments",
        description: "Reconnais les différents instruments",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quel instrument est central dans les cérémonies vodou?",
              options: ["La guitare", "Le piano", "Le tanbou", "La flûte"],
              correctIndex: 2,
              explanation: "Le tanbou (tambour) est l'instrument sacré du vodou haïtien."
            },
            {
              question: "Le vaksin est un instrument...",
              options: ["À cordes", "À vent", "À percussion", "Électronique"],
              correctIndex: 1,
              explanation: "Le vaksin est un instrument à vent en bambou."
            }
          ]
        }
      },
      {
        id: "instruments-game",
        type: "game",
        title: "Identifie les sons",
        description: "Devine quel instrument produit chaque son",
        duration: "5 min",
        content: {
          gameDescription: "Écoute différents sons et essaie d'identifier l'instrument!"
        }
      }
    ]
  },
  production: {
    id: "production",
    title: "Production Sonore",
    description: "Crée ta propre musique avec des outils numériques",
    duration: "25 min",
    activities: [
      {
        id: "production-video",
        type: "video",
        title: "Introduction à la production musicale",
        description: "Découvre comment créer de la musique sur ordinateur",
        duration: "7 min",
        content: { videoQuery: "production musicale débutant français tutoriel" }
      },
      {
        id: "production-reading",
        type: "reading",
        title: "Les bases du mixage",
        description: "Comprends comment assembler les différentes pistes",
        duration: "8 min",
        content: {
          readingContent: `
            <h3>Créer de la musique numériquement</h3>
            
            <h4>Les outils essentiels</h4>
            <ul>
              <li><strong>DAW (Digital Audio Workstation)</strong> - Le logiciel pour créer (GarageBand, FL Studio, etc.)</li>
              <li><strong>Les samples</strong> - Des sons préenregistrés à utiliser</li>
              <li><strong>Les plugins</strong> - Des instruments virtuels et effets</li>
            </ul>
            
            <h4>Étapes de création</h4>
            <ol>
              <li>Choisir un tempo et une tonalité</li>
              <li>Créer une progression de base</li>
              <li>Ajouter des mélodies</li>
              <li>Mixer et équilibrer les sons</li>
            </ol>
            
            <p>De nombreux artistes haïtiens modernes combinent les rythmes traditionnels avec la production électronique!</p>
          `
        }
      },
      {
        id: "production-quiz",
        type: "quiz",
        title: "Quiz: Production musicale",
        description: "Teste tes connaissances en production",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Que signifie DAW?",
              options: ["Digital Audio Workstation", "Dynamic Audio Wave", "Digital Analog Work", "Dance Audio Wizard"],
              correctIndex: 0,
              explanation: "DAW signifie Digital Audio Workstation, le logiciel de création musicale."
            },
            {
              question: "Qu'est-ce qu'un sample en musique?",
              options: ["Un instrument", "Un son préenregistré", "Une partition", "Un microphone"],
              correctIndex: 1,
              explanation: "Un sample est un extrait sonore préenregistré utilisé dans la création."
            }
          ]
        }
      },
      {
        id: "production-game",
        type: "game",
        title: "Crée ton premier beat",
        description: "Assemble des sons pour créer un rythme",
        duration: "8 min",
        content: {
          gameDescription: "Utilise les outils en ligne gratuits pour créer ton premier beat!"
        }
      }
    ]
  },
  culture: {
    id: "culture",
    title: "Culture Musicale",
    description: "Découvre la richesse de la musique haïtienne et mondiale",
    duration: "20 min",
    activities: [
      {
        id: "culture-video",
        type: "video",
        title: "Histoire de la musique haïtienne",
        description: "Voyage à travers l'évolution de notre musique",
        duration: "6 min",
        content: { videoQuery: "histoire musique haïtienne compas documentaire" }
      },
      {
        id: "culture-reading",
        type: "reading",
        title: "Les genres musicaux d'Haïti",
        description: "Explore la diversité de notre patrimoine musical",
        duration: "7 min",
        content: {
          readingContent: `
            <h3>La richesse musicale d'Haïti</h3>
            
            <h4>Les genres principaux</h4>
            <ul>
              <li><strong>Compas (Konpa)</strong> - Créé par Nemours Jean-Baptiste dans les années 1950</li>
              <li><strong>Rara</strong> - Musique traditionnelle jouée pendant le carnaval</li>
              <li><strong>Twoubadou</strong> - Style acoustique romantique</li>
              <li><strong>Mizik Rasin</strong> - Fusion des rythmes vodou et du rock</li>
            </ul>
            
            <h4>Artistes légendaires</h4>
            <p>Tabou Combo, Boukman Eksperyans, Wyclef Jean, et bien d'autres ont porté la musique haïtienne dans le monde entier.</p>
          `
        }
      },
      {
        id: "culture-quiz",
        type: "quiz",
        title: "Quiz: Culture musicale",
        description: "Teste tes connaissances sur la musique haïtienne",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Qui a créé le compas?",
              options: ["Wyclef Jean", "Nemours Jean-Baptiste", "Boukman Eksperyans", "Tabou Combo"],
              correctIndex: 1,
              explanation: "Nemours Jean-Baptiste est considéré comme le père du compas."
            },
            {
              question: "Le rara est traditionnellement joué pendant...",
              options: ["Noël", "Le carnaval", "La fête de l'Indépendance", "La rentrée scolaire"],
              correctIndex: 1,
              explanation: "Le rara est la musique du carnaval haïtien."
            }
          ]
        }
      },
      {
        id: "culture-game",
        type: "game",
        title: "Devine le genre musical",
        description: "Écoute et identifie les différents genres",
        duration: "5 min",
        content: {
          gameDescription: "Écoute des extraits et devine s'il s'agit de compas, rara, twoubadou ou rasin!"
        }
      }
    ]
  }
};

// ARTS CATEGORY ACTIVITIES  
export const artsActivities: CategoryContent = {
  drawing: {
    id: "drawing",
    title: "Dessin de Base",
    description: "Maîtrise les techniques fondamentales du dessin",
    duration: "20 min",
    activities: [
      {
        id: "drawing-video",
        type: "video",
        title: "Les bases du dessin",
        description: "Apprends les techniques fondamentales",
        duration: "6 min",
        content: { videoQuery: "apprendre dessiner débutant tutoriel français" }
      },
      {
        id: "drawing-reading",
        type: "reading",
        title: "Lignes, formes et perspectives",
        description: "Comprends les éléments essentiels du dessin",
        duration: "6 min",
        content: {
          readingContent: `
            <h3>Les fondamentaux du dessin</h3>
            
            <h4>Les éléments de base</h4>
            <ul>
              <li><strong>Les lignes</strong> - Droites, courbes, épaisses, fines</li>
              <li><strong>Les formes</strong> - Cercles, carrés, triangles comme base</li>
              <li><strong>Les valeurs</strong> - Les nuances de clair à foncé</li>
              <li><strong>La perspective</strong> - Créer l'illusion de profondeur</li>
            </ul>
            
            <h4>L'art haïtien</h4>
            <p>L'art haïtien est reconnu mondialement pour ses couleurs vives et ses représentations de la vie quotidienne. Des artistes comme Hector Hyppolite et Préfète Duffaut ont marqué l'histoire de l'art.</p>
          `
        }
      },
      {
        id: "drawing-quiz",
        type: "quiz",
        title: "Quiz: Fondamentaux du dessin",
        description: "Vérifie ta compréhension",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle forme géométrique est la base pour dessiner un visage?",
              options: ["Un carré", "Un triangle", "Un ovale/cercle", "Un rectangle"],
              correctIndex: 2,
              explanation: "L'ovale ou le cercle est utilisé comme base pour dessiner un visage."
            },
            {
              question: "Qu'est-ce que la perspective en dessin?",
              options: ["La couleur", "L'illusion de profondeur", "Le type de crayon", "La taille du papier"],
              correctIndex: 1,
              explanation: "La perspective crée l'illusion de profondeur et de distance."
            }
          ]
        }
      },
      {
        id: "drawing-game",
        type: "game",
        title: "Exercice pratique",
        description: "Dessine en suivant les instructions d'Eric",
        duration: "8 min",
        content: {
          gameDescription: "Prends un crayon et du papier, et suis les instructions étape par étape!"
        }
      }
    ]
  },
  design: {
    id: "design",
    title: "Design Graphique",
    description: "Crée des visuels impactants",
    duration: "25 min",
    activities: [
      {
        id: "design-video",
        type: "video",
        title: "Principes du design",
        description: "Découvre les règles du design graphique",
        duration: "7 min",
        content: { videoQuery: "design graphique principes débutant français" }
      },
      {
        id: "design-reading",
        type: "reading",
        title: "Couleurs et composition",
        description: "Apprends à créer des designs harmonieux",
        duration: "8 min",
        content: {
          readingContent: `
            <h3>Les bases du design graphique</h3>
            
            <h4>Principes fondamentaux</h4>
            <ul>
              <li><strong>L'équilibre</strong> - Répartition visuelle des éléments</li>
              <li><strong>Le contraste</strong> - Différences qui attirent l'œil</li>
              <li><strong>L'alignement</strong> - Organisation ordonnée des éléments</li>
              <li><strong>La répétition</strong> - Cohérence visuelle</li>
            </ul>
            
            <h4>La théorie des couleurs</h4>
            <p>Les couleurs primaires (rouge, bleu, jaune) se mélangent pour créer les couleurs secondaires. Comprendre les couleurs complémentaires aide à créer des designs attrayants.</p>
          `
        }
      },
      {
        id: "design-quiz",
        type: "quiz",
        title: "Quiz: Design graphique",
        description: "Teste tes connaissances en design",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quelles sont les couleurs primaires?",
              options: ["Vert, orange, violet", "Rouge, bleu, jaune", "Noir, blanc, gris", "Rose, turquoise, marron"],
              correctIndex: 1,
              explanation: "Les couleurs primaires sont rouge, bleu et jaune."
            },
            {
              question: "Quel principe crée une différence visuelle qui attire l'œil?",
              options: ["L'équilibre", "Le contraste", "L'alignement", "La répétition"],
              correctIndex: 1,
              explanation: "Le contraste crée des différences visuelles qui attirent l'attention."
            }
          ]
        }
      },
      {
        id: "design-game",
        type: "game",
        title: "Crée une affiche",
        description: "Conçois ta propre affiche avec les outils gratuits",
        duration: "8 min",
        content: {
          gameDescription: "Utilise Canva ou un autre outil gratuit pour créer une affiche sur un sujet qui te passionne!"
        }
      }
    ]
  },
  digital: {
    id: "digital",
    title: "Création Numérique",
    description: "Utilise les outils digitaux pour créer",
    duration: "30 min",
    activities: [
      {
        id: "digital-video",
        type: "video",
        title: "Introduction aux outils numériques",
        description: "Découvre les logiciels de création",
        duration: "8 min",
        content: { videoQuery: "création numérique débutant logiciel gratuit tutoriel" }
      },
      {
        id: "digital-reading",
        type: "reading",
        title: "Les outils de création gratuits",
        description: "Connais les ressources accessibles",
        duration: "7 min",
        content: {
          readingContent: `
            <h3>Outils de création numérique gratuits</h3>
            
            <h4>Pour le dessin et la peinture</h4>
            <ul>
              <li><strong>Krita</strong> - Logiciel professionnel gratuit</li>
              <li><strong>GIMP</strong> - Alternative gratuite à Photoshop</li>
              <li><strong>Canva</strong> - Design facile en ligne</li>
            </ul>
            
            <h4>Pour le design 3D</h4>
            <ul>
              <li><strong>Blender</strong> - Modélisation 3D puissante et gratuite</li>
              <li><strong>Tinkercad</strong> - Introduction simple au 3D</li>
            </ul>
            
            <p>Tous ces outils sont accessibles et parfaits pour commencer ton voyage créatif!</p>
          `
        }
      },
      {
        id: "digital-quiz",
        type: "quiz",
        title: "Quiz: Outils numériques",
        description: "Connais-tu ces outils?",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quel logiciel gratuit est une alternative à Photoshop?",
              options: ["Word", "GIMP", "Excel", "PowerPoint"],
              correctIndex: 1,
              explanation: "GIMP est un logiciel gratuit d'édition d'images similaire à Photoshop."
            },
            {
              question: "Blender est utilisé pour...",
              options: ["L'écriture", "La modélisation 3D", "La musique", "Les tableurs"],
              correctIndex: 1,
              explanation: "Blender est un logiciel de modélisation et animation 3D."
            }
          ]
        }
      },
      {
        id: "digital-game",
        type: "game",
        title: "Premier projet digital",
        description: "Crée ton avatar ou logo personnel",
        duration: "12 min",
        content: {
          gameDescription: "Utilise Canva pour créer un avatar ou un logo qui te représente!"
        }
      }
    ]
  },
  illustration: {
    id: "illustration",
    title: "Art Digital",
    description: "Deviens un artiste numérique",
    duration: "25 min",
    activities: [
      {
        id: "illustration-video",
        type: "video",
        title: "Techniques d'illustration digitale",
        description: "Apprends à illustrer numériquement",
        duration: "7 min",
        content: { videoQuery: "illustration digitale tutoriel français débutant" }
      },
      {
        id: "illustration-reading",
        type: "reading",
        title: "Styles d'illustration",
        description: "Explore différents styles artistiques",
        duration: "6 min",
        content: {
          readingContent: `
            <h3>Les différents styles d'illustration</h3>
            
            <h4>Styles populaires</h4>
            <ul>
              <li><strong>Réaliste</strong> - Représentation fidèle de la réalité</li>
              <li><strong>Cartoon/Manga</strong> - Style exagéré et expressif</li>
              <li><strong>Minimaliste</strong> - Formes simples et épurées</li>
              <li><strong>Flat design</strong> - Couleurs plates sans ombres</li>
            </ul>
            
            <h4>Trouver ton style</h4>
            <p>Expérimente différents styles pour découvrir celui qui te correspond le mieux. Ton style unique émergera avec la pratique!</p>
          `
        }
      },
      {
        id: "illustration-quiz",
        type: "quiz",
        title: "Quiz: Styles d'illustration",
        description: "Identifie les différents styles",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quel style utilise des formes simples et des couleurs plates?",
              options: ["Réaliste", "Manga", "Flat design", "Baroque"],
              correctIndex: 2,
              explanation: "Le flat design utilise des formes simples et des couleurs plates sans ombres."
            }
          ]
        }
      },
      {
        id: "illustration-game",
        type: "game",
        title: "Crée un personnage",
        description: "Dessine un personnage original",
        duration: "10 min",
        content: {
          gameDescription: "Crée un personnage original en utilisant les techniques apprises!"
        }
      }
    ]
  }
};

// CHESS CATEGORY ACTIVITIES
export const chessActivities: CategoryContent = {
  basics: {
    id: "basics",
    title: "Bases des Échecs",
    description: "Apprends les règles et mouvements",
    duration: "15 min",
    activities: [
      {
        id: "basics-video",
        type: "video",
        title: "Règles des échecs",
        description: "Découvre les règles fondamentales",
        duration: "5 min",
        content: { videoQuery: "apprendre échecs règles débutant français tutoriel" }
      },
      {
        id: "basics-reading",
        type: "reading",
        title: "Les pièces et leurs mouvements",
        description: "Connais chaque pièce du jeu",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Les pièces d'échecs</h3>
            
            <h4>Les pièces et leurs mouvements</h4>
            <ul>
              <li><strong>Le Roi ♔</strong> - Une case dans toutes les directions</li>
              <li><strong>La Dame ♕</strong> - Toutes directions, toutes distances</li>
              <li><strong>La Tour ♖</strong> - Horizontalement et verticalement</li>
              <li><strong>Le Fou ♗</strong> - En diagonale</li>
              <li><strong>Le Cavalier ♘</strong> - En "L" (2+1 cases), saute par-dessus</li>
              <li><strong>Le Pion ♙</strong> - Avance d'une case (ou deux au départ), capture en diagonale</li>
            </ul>
            
            <h4>L'objectif</h4>
            <p>Mettre le Roi adverse en échec et mat - il ne peut plus bouger sans être capturé!</p>
          `
        }
      },
      {
        id: "basics-quiz",
        type: "quiz",
        title: "Quiz: Les bases",
        description: "Vérifie ta compréhension des règles",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle pièce peut sauter par-dessus les autres?",
              options: ["La Tour", "Le Fou", "Le Cavalier", "La Dame"],
              correctIndex: 2,
              explanation: "Le Cavalier est la seule pièce qui peut sauter par-dessus d'autres pièces."
            },
            {
              question: "Quel est l'objectif du jeu d'échecs?",
              options: ["Capturer tous les pions", "Mettre le Roi en échec et mat", "Avoir plus de pièces", "Atteindre l'autre côté"],
              correctIndex: 1,
              explanation: "L'objectif est de mettre le Roi adverse en échec et mat."
            }
          ]
        }
      },
      {
        id: "basics-game",
        type: "game",
        title: "Pratique les mouvements",
        description: "Entraîne-toi sur un échiquier virtuel",
        duration: "5 min",
        content: {
          gameDescription: "Utilise lichess.org ou chess.com pour pratiquer les mouvements de base!"
        }
      }
    ]
  },
  strategy: {
    id: "strategy",
    title: "Stratégies",
    description: "Développe ton jeu tactique",
    duration: "20 min",
    activities: [
      {
        id: "strategy-video",
        type: "video",
        title: "Stratégies de base",
        description: "Apprends les concepts stratégiques fondamentaux",
        duration: "6 min",
        content: { videoQuery: "stratégie échecs débutant tactique français" }
      },
      {
        id: "strategy-reading",
        type: "reading",
        title: "Principes stratégiques",
        description: "Les fondements d'un bon jeu",
        duration: "7 min",
        content: {
          readingContent: `
            <h3>Stratégies essentielles aux échecs</h3>
            
            <h4>Principes d'ouverture</h4>
            <ul>
              <li><strong>Contrôle du centre</strong> - Les cases e4, d4, e5, d5 sont cruciales</li>
              <li><strong>Développement des pièces</strong> - Sors tes pièces rapidement</li>
              <li><strong>Sécurité du Roi</strong> - Roque tôt pour protéger ton Roi</li>
            </ul>
            
            <h4>Tactiques de base</h4>
            <ul>
              <li><strong>La fourchette</strong> - Attaquer deux pièces à la fois</li>
              <li><strong>Le clouage</strong> - Immobiliser une pièce</li>
              <li><strong>L'enfilade</strong> - Attaque en ligne</li>
            </ul>
          `
        }
      },
      {
        id: "strategy-quiz",
        type: "quiz",
        title: "Quiz: Stratégie",
        description: "Teste tes connaissances tactiques",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Qu'est-ce qu'une 'fourchette' aux échecs?",
              options: ["Un ustensile", "Attaquer deux pièces à la fois", "Une ouverture", "Un type de mat"],
              correctIndex: 1,
              explanation: "La fourchette est une tactique où une pièce attaque deux pièces adverses simultanément."
            },
            {
              question: "Pourquoi le contrôle du centre est-il important?",
              options: ["C'est plus joli", "Les pièces ont plus d'options au centre", "C'est une règle obligatoire", "Pour protéger les pions"],
              correctIndex: 1,
              explanation: "Au centre, les pièces contrôlent plus de cases et ont plus de mobilité."
            }
          ]
        }
      },
      {
        id: "strategy-game",
        type: "game",
        title: "Résous des puzzles",
        description: "Entraîne ta vision tactique",
        duration: "6 min",
        content: {
          gameDescription: "Va sur lichess.org/training pour résoudre des puzzles tactiques!"
        }
      }
    ]
  },
  problems: {
    id: "problems",
    title: "Résolution de Problèmes",
    description: "Entraîne ton esprit logique",
    duration: "20 min",
    activities: [
      {
        id: "problems-video",
        type: "video",
        title: "Puzzles d'échecs",
        description: "Apprends à résoudre des problèmes",
        duration: "6 min",
        content: { videoQuery: "puzzles échecs mat en 1 2 français tutoriel" }
      },
      {
        id: "problems-reading",
        type: "reading",
        title: "Méthodes de réflexion",
        description: "Comment analyser une position",
        duration: "6 min",
        content: {
          readingContent: `
            <h3>Résoudre des problèmes d'échecs</h3>
            
            <h4>Méthode d'analyse</h4>
            <ol>
              <li><strong>Observer</strong> - Regarde la position entière</li>
              <li><strong>Identifier</strong> - Trouve les pièces vulnérables</li>
              <li><strong>Calculer</strong> - Visualise les coups possibles</li>
              <li><strong>Vérifier</strong> - Assure-toi que ton coup fonctionne</li>
            </ol>
            
            <h4>Patterns à reconnaître</h4>
            <p>Mat du couloir, mat du berger, échec à la découverte... Plus tu en connais, plus tu les verras!</p>
          `
        }
      },
      {
        id: "problems-quiz",
        type: "quiz",
        title: "Quiz: Analyse",
        description: "Teste ta capacité d'analyse",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle est la première étape pour résoudre un puzzle?",
              options: ["Jouer vite", "Observer la position entière", "Bouger le premier pion", "Abandonner"],
              correctIndex: 1,
              explanation: "Il faut d'abord bien observer et comprendre la position."
            }
          ]
        }
      },
      {
        id: "problems-game",
        type: "game",
        title: "Défi puzzles",
        description: "Résous le plus de puzzles possible",
        duration: "7 min",
        content: {
          gameDescription: "Essaie de résoudre 10 puzzles de suite sur lichess.org/training!"
        }
      }
    ]
  },
  mindgames: {
    id: "mindgames",
    title: "Jeux d'Esprit",
    description: "Stimule ta concentration",
    duration: "15 min",
    activities: [
      {
        id: "mindgames-video",
        type: "video",
        title: "Améliorer sa concentration",
        description: "Techniques pour mieux se concentrer",
        duration: "5 min",
        content: { videoQuery: "améliorer concentration mémoire exercices français" }
      },
      {
        id: "mindgames-reading",
        type: "reading",
        title: "Le cerveau et les jeux",
        description: "Comment les jeux améliorent l'esprit",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Les bienfaits des jeux d'esprit</h3>
            
            <h4>Compétences développées</h4>
            <ul>
              <li><strong>Concentration</strong> - Rester focalisé plus longtemps</li>
              <li><strong>Mémoire</strong> - Se souvenir des patterns et positions</li>
              <li><strong>Patience</strong> - Réfléchir avant d'agir</li>
              <li><strong>Pensée critique</strong> - Analyser et décider</li>
            </ul>
            
            <h4>Autres jeux à explorer</h4>
            <p>Sudoku, mots croisés, puzzles logiques, jeux de stratégie... Tous stimulent le cerveau!</p>
          `
        }
      },
      {
        id: "mindgames-quiz",
        type: "quiz",
        title: "Quiz: Jeux d'esprit",
        description: "Teste tes connaissances",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quel bienfait les jeux d'esprit apportent-ils?",
              options: ["Seulement du plaisir", "Amélioration de la concentration et mémoire", "Rien de spécial", "Fatigue mentale"],
              correctIndex: 1,
              explanation: "Les jeux d'esprit améliorent la concentration, la mémoire et d'autres capacités cognitives."
            }
          ]
        }
      },
      {
        id: "mindgames-game",
        type: "game",
        title: "Défi mémoire",
        description: "Teste ta mémoire avec des exercices",
        duration: "5 min",
        content: {
          gameDescription: "Essaie de mémoriser une position d'échecs puis de la reproduire!"
        }
      }
    ]
  }
};

// LITERATURE CATEGORY ACTIVITIES
export const literatureActivities: CategoryContent = {
  writing: {
    id: "writing",
    title: "Écriture Créative",
    description: "Libère ton imagination par l'écriture",
    duration: "20 min",
    activities: [
      {
        id: "writing-video",
        type: "video",
        title: "Techniques d'écriture",
        description: "Apprends à raconter des histoires",
        duration: "6 min",
        content: { videoQuery: "écriture créative techniques débutant français" }
      },
      {
        id: "writing-reading",
        type: "reading",
        title: "Les éléments d'une histoire",
        description: "Comprends la structure narrative",
        duration: "6 min",
        content: {
          readingContent: `
            <h3>L'art de raconter des histoires</h3>
            
            <h4>Les éléments essentiels</h4>
            <ul>
              <li><strong>Les personnages</strong> - Qui sont les acteurs de ton histoire?</li>
              <li><strong>Le cadre</strong> - Où et quand se passe l'action?</li>
              <li><strong>L'intrigue</strong> - Que se passe-t-il?</li>
              <li><strong>Le conflit</strong> - Quel problème faut-il résoudre?</li>
              <li><strong>La résolution</strong> - Comment tout se termine?</li>
            </ul>
            
            <h4>Auteurs haïtiens célèbres</h4>
            <p>Jacques Roumain (Gouverneurs de la Rosée), Marie Vieux-Chauvet, Dany Laferrière... Ils ont enrichi la littérature mondiale!</p>
          `
        }
      },
      {
        id: "writing-quiz",
        type: "quiz",
        title: "Quiz: Écriture",
        description: "Teste tes connaissances narratives",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quel élément représente le problème dans une histoire?",
              options: ["Le cadre", "Les personnages", "Le conflit", "La résolution"],
              correctIndex: 2,
              explanation: "Le conflit est le problème central que les personnages doivent résoudre."
            },
            {
              question: "Qui a écrit 'Gouverneurs de la Rosée'?",
              options: ["Dany Laferrière", "Jacques Roumain", "Victor Hugo", "Aimé Césaire"],
              correctIndex: 1,
              explanation: "Jacques Roumain est l'auteur de ce chef-d'œuvre de la littérature haïtienne."
            }
          ]
        }
      },
      {
        id: "writing-game",
        type: "game",
        title: "Écris une histoire courte",
        description: "Crée ta propre histoire",
        duration: "7 min",
        content: {
          gameDescription: "Écris une histoire de 5-10 phrases avec un début, un milieu et une fin!"
        }
      }
    ]
  },
  poetry: {
    id: "poetry",
    title: "Poésie",
    description: "Exprime tes émotions en vers",
    duration: "20 min",
    activities: [
      {
        id: "poetry-video",
        type: "video",
        title: "Introduction à la poésie",
        description: "Découvre l'art des vers",
        duration: "5 min",
        content: { videoQuery: "poésie française introduction écrire poème débutant" }
      },
      {
        id: "poetry-reading",
        type: "reading",
        title: "Formes poétiques",
        description: "Explore différents types de poèmes",
        duration: "7 min",
        content: {
          readingContent: `
            <h3>La magie de la poésie</h3>
            
            <h4>Types de poèmes</h4>
            <ul>
              <li><strong>Haïku</strong> - 3 vers (5-7-5 syllabes)</li>
              <li><strong>Sonnet</strong> - 14 vers structurés</li>
              <li><strong>Vers libre</strong> - Sans règles fixes</li>
              <li><strong>Acrostiche</strong> - Premières lettres forment un mot</li>
            </ul>
            
            <h4>Éléments poétiques</h4>
            <ul>
              <li><strong>Rimes</strong> - Sons répétés en fin de vers</li>
              <li><strong>Métaphores</strong> - Comparaisons imagées</li>
              <li><strong>Rythme</strong> - Musicalité des mots</li>
            </ul>
          `
        }
      },
      {
        id: "poetry-quiz",
        type: "quiz",
        title: "Quiz: Poésie",
        description: "Teste tes connaissances poétiques",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Combien de vers a un haïku?",
              options: ["2 vers", "3 vers", "4 vers", "5 vers"],
              correctIndex: 1,
              explanation: "Un haïku est composé de 3 vers avec 5, 7 et 5 syllabes."
            },
            {
              question: "Qu'est-ce qu'une métaphore?",
              options: ["Une rime", "Une comparaison imagée", "Un type de poème", "Une ponctuation"],
              correctIndex: 1,
              explanation: "Une métaphore est une comparaison sans mots de comparaison."
            }
          ]
        }
      },
      {
        id: "poetry-game",
        type: "game",
        title: "Écris un poème",
        description: "Crée ton premier poème",
        duration: "7 min",
        content: {
          gameDescription: "Écris un haïku sur un sujet qui te tient à cœur!"
        }
      }
    ]
  },
  reading: {
    id: "reading",
    title: "Lecture Analytique",
    description: "Comprends et analyse les textes",
    duration: "25 min",
    activities: [
      {
        id: "reading-video",
        type: "video",
        title: "Comment analyser un texte",
        description: "Techniques de lecture analytique",
        duration: "7 min",
        content: { videoQuery: "analyse littéraire méthode français texte commentaire" }
      },
      {
        id: "reading-reading",
        type: "reading",
        title: "Méthodes d'analyse",
        description: "Outils pour comprendre les textes",
        duration: "8 min",
        content: {
          readingContent: `
            <h3>Analyser un texte littéraire</h3>
            
            <h4>Questions à se poser</h4>
            <ul>
              <li><strong>Qui?</strong> - Qui parle? Qui sont les personnages?</li>
              <li><strong>Quoi?</strong> - De quoi parle le texte?</li>
              <li><strong>Comment?</strong> - Quels procédés l'auteur utilise-t-il?</li>
              <li><strong>Pourquoi?</strong> - Quel est le message de l'auteur?</li>
            </ul>
            
            <h4>Éléments à repérer</h4>
            <ul>
              <li>Le vocabulaire et les champs lexicaux</li>
              <li>Les figures de style (métaphores, comparaisons)</li>
              <li>Le ton et le registre</li>
            </ul>
          `
        }
      },
      {
        id: "reading-quiz",
        type: "quiz",
        title: "Quiz: Analyse",
        description: "Teste ta compréhension",
        duration: "5 min",
        content: {
          quizQuestions: [
            {
              question: "Qu'est-ce qu'un champ lexical?",
              options: ["Un type de texte", "Un ensemble de mots liés à un thème", "Une figure de style", "Un personnage"],
              correctIndex: 1,
              explanation: "Un champ lexical est un ensemble de mots se rapportant à un même thème."
            }
          ]
        }
      },
      {
        id: "reading-game",
        type: "game",
        title: "Analyse un extrait",
        description: "Pratique l'analyse littéraire",
        duration: "8 min",
        content: {
          gameDescription: "Lis un court extrait et identifie les éléments clés avec Eric!"
        }
      }
    ]
  },
  expression: {
    id: "expression",
    title: "Expression Artistique",
    description: "Valorise la culture haïtienne par les mots",
    duration: "20 min",
    activities: [
      {
        id: "expression-video",
        type: "video",
        title: "L'art de s'exprimer",
        description: "Techniques d'expression orale et écrite",
        duration: "6 min",
        content: { videoQuery: "expression orale éloquence techniques français" }
      },
      {
        id: "expression-reading",
        type: "reading",
        title: "La tradition orale haïtienne",
        description: "Notre héritage culturel",
        duration: "6 min",
        content: {
          readingContent: `
            <h3>L'expression artistique haïtienne</h3>
            
            <h4>Tradition orale</h4>
            <p>En Haïti, les contes, proverbes et chansons transmettent notre sagesse de génération en génération.</p>
            
            <h4>Formes d'expression</h4>
            <ul>
              <li><strong>Contes (Kont)</strong> - "Krik? Krak!" ouvre chaque histoire</li>
              <li><strong>Proverbes</strong> - Sagesse populaire condensée</li>
              <li><strong>Poésie créole</strong> - Expression de l'âme haïtienne</li>
            </ul>
            
            <h4>Proverbes haïtiens</h4>
            <ul>
              <li>"Piti piti zwazo fè nich li" - Petit à petit l'oiseau fait son nid</li>
              <li>"Men anpil, chay pa lou" - Plusieurs mains rendent le fardeau léger</li>
            </ul>
          `
        }
      },
      {
        id: "expression-quiz",
        type: "quiz",
        title: "Quiz: Culture haïtienne",
        description: "Teste tes connaissances culturelles",
        duration: "4 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle formule ouvre les contes haïtiens?",
              options: ["Il était une fois", "Krik? Krak!", "Bonjour!", "Fin"],
              correctIndex: 1,
              explanation: "'Krik? Krak!' est la formule traditionnelle pour commencer un conte haïtien."
            },
            {
              question: "Que signifie 'Piti piti zwazo fè nich li'?",
              options: ["L'oiseau chante", "Petit à petit l'oiseau fait son nid", "Les oiseaux volent", "La nature est belle"],
              correctIndex: 1,
              explanation: "Ce proverbe signifie que la persévérance mène au succès."
            }
          ]
        }
      },
      {
        id: "expression-game",
        type: "game",
        title: "Crée ton expression",
        description: "Invente un proverbe ou un court conte",
        duration: "7 min",
        content: {
          gameDescription: "Écris ton propre proverbe ou un court conte à la manière haïtienne!"
        }
      }
    ]
  }
};

// Helper function to get activities for a category and module
export const getActivitiesForModule = (categoryId: string, moduleId: string): ActivityContent[] | null => {
  let categoryData: CategoryContent | undefined;
  
  switch (categoryId) {
    case "music":
      categoryData = musicActivities;
      break;
    case "arts":
      categoryData = artsActivities;
      break;
    case "chess":
      categoryData = chessActivities;
      break;
    case "literature":
      categoryData = literatureActivities;
      break;
    default:
      return null;
  }
  
  const module = categoryData[moduleId];
  return module?.activities || null;
};

// Get all category IDs that have real activities
export const getCategoriesWithActivities = (): string[] => {
  return ["music", "arts", "chess", "literature"];
};
