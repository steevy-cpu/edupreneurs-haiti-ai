// Personal development activities for the personnel category
// Structure matches passionActivities.ts exactly

import type { ActivityContent, ModuleContent, CategoryContent } from './passionActivities';

// PERSONAL GROWTH CATEGORY ACTIVITIES (Croissance Personnelle)
export const personalActivities: CategoryContent = {
  "time-management": {
    id: "time-management",
    title: "Gestion du Temps",
    description: "Apprends à organiser ton temps efficacement",
    duration: "15 min",
    activities: [
      {
        id: "time-management-video",
        type: "video",
        title: "Les secrets de la gestion du temps",
        description: "Découvre comment organiser tes journées",
        duration: "5 min",
        content: { videoQuery: "gestion temps etudiant conseils organisation francais" }
      },
      {
        id: "time-management-reading",
        type: "reading",
        title: "Maîtriser ton emploi du temps",
        description: "Techniques pour mieux gérer ton temps",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La gestion du temps</h3>
            <p>Le temps est précieux et limité. Apprendre à bien l'utiliser t'aidera à réussir dans tes études et dans la vie.</p>
            
            <h4>Techniques efficaces:</h4>
            <ul>
              <li><strong>Faire une liste</strong> - Note les tâches à accomplir chaque jour</li>
              <li><strong>Prioriser</strong> - Commence par les tâches les plus importantes</li>
              <li><strong>Planifier</strong> - Utilise un calendrier ou agenda</li>
              <li><strong>Éviter les distractions</strong> - Concentre-toi sur une chose à la fois</li>
            </ul>
            
            <h4>La règle des 2 minutes</h4>
            <p>Si une tâche prend moins de 2 minutes, fais-la tout de suite! Sinon, note-la pour plus tard.</p>
            
            <h4>L'équilibre</h4>
            <p>N'oublie pas de prévoir du temps pour te reposer et t'amuser. Un bon équilibre est essentiel!</p>
          `
        }
      },
      {
        id: "time-management-quiz",
        type: "quiz",
        title: "Quiz: Gestion du temps",
        description: "Teste tes connaissances en organisation",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Quelle est une bonne façon de commencer sa journée?",
              options: ["Regarder son téléphone pendant une heure", "Faire une liste des tâches à accomplir", "Repousser tout au lendemain", "Ne rien planifier"],
              correctIndex: 1,
              explanation: "Faire une liste aide à organiser sa journée et à rester concentré."
            },
            {
              question: "Que signifie 'prioriser'?",
              options: ["Faire tout en même temps", "Commencer par ce qui est le plus important", "Ignorer les tâches difficiles", "Attendre la dernière minute"],
              correctIndex: 1,
              explanation: "Prioriser signifie s'occuper d'abord des tâches les plus importantes."
            }
          ]
        }
      },
      {
        id: "time-management-game",
        type: "game",
        title: "Mon planning de la semaine",
        description: "Crée ton emploi du temps personnel",
        duration: "5 min",
        content: {
          gameDescription: "Prends une feuille et crée ton planning pour la semaine. Note tes heures d'école, de devoirs, d'activités et de repos. Essaie de le suivre pendant une semaine!"
        }
      }
    ]
  },
  confidence: {
    id: "confidence",
    title: "Confiance en Soi",
    description: "Développe ta confiance et ton estime personnelle",
    duration: "15 min",
    activities: [
      {
        id: "confidence-video",
        type: "video",
        title: "Croire en toi",
        description: "Apprends à développer ta confiance",
        duration: "5 min",
        content: { videoQuery: "confiance en soi enfants adolescents motivation francais" }
      },
      {
        id: "confidence-reading",
        type: "reading",
        title: "Tu es capable!",
        description: "Comprends comment renforcer ton estime",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>La confiance en soi</h3>
            <p>La confiance en soi, c'est croire en tes capacités et en ta valeur. C'est une qualité qui se développe avec le temps et la pratique.</p>
            
            <h4>Comment renforcer ta confiance:</h4>
            <ul>
              <li><strong>Célèbre tes réussites</strong> - Même les petites victoires comptent</li>
              <li><strong>Accepte tes erreurs</strong> - Elles sont des opportunités d'apprendre</li>
              <li><strong>Parle-toi positivement</strong> - Remplace "je ne peux pas" par "je vais essayer"</li>
              <li><strong>Fixe-toi des objectifs</strong> - Atteindre des buts renforce la confiance</li>
            </ul>
            
            <h4>Le pouvoir des pensées positives</h4>
            <p>Ce que tu te dis à toi-même influence comment tu te sens. Sois ton propre encouragement!</p>
            
            <h4>Rappelle-toi</h4>
            <p>Tu as des talents uniques. Personne d'autre ne peut être toi!</p>
          `
        }
      },
      {
        id: "confidence-quiz",
        type: "quiz",
        title: "Quiz: Confiance en soi",
        description: "Évalue ta compréhension de la confiance",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Que faire quand tu fais une erreur?",
              options: ["Abandonner", "Te critiquer sévèrement", "Apprendre de cette erreur et continuer", "Blâmer les autres"],
              correctIndex: 2,
              explanation: "Les erreurs sont des occasions d'apprendre et de grandir."
            },
            {
              question: "Comment peux-tu te parler de façon positive?",
              options: ["\"Je suis nul\"", "\"C'est trop difficile pour moi\"", "\"Je vais faire de mon mieux\"", "\"Je n'y arriverai jamais\""],
              correctIndex: 2,
              explanation: "Se parler positivement aide à renforcer la confiance en soi."
            }
          ]
        }
      },
      {
        id: "confidence-game",
        type: "game",
        title: "Mon journal de victoires",
        description: "Célèbre tes accomplissements",
        duration: "5 min",
        content: {
          gameDescription: "Écris 5 choses que tu as réussies récemment, même petites (terminer un devoir, aider quelqu'un, apprendre quelque chose de nouveau). Relis cette liste quand tu doutes de toi!"
        }
      }
    ]
  },
  emotions: {
    id: "emotions",
    title: "Intelligence Émotionnelle",
    description: "Apprends à comprendre et gérer tes émotions",
    duration: "15 min",
    activities: [
      {
        id: "emotions-video",
        type: "video",
        title: "Comprendre tes émotions",
        description: "Découvre le monde des émotions",
        duration: "5 min",
        content: { videoQuery: "intelligence emotionnelle enfants gerer emotions francais" }
      },
      {
        id: "emotions-reading",
        type: "reading",
        title: "Tes émotions sont tes amies",
        description: "Apprends à accueillir toutes tes émotions",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>L'intelligence émotionnelle</h3>
            <p>Toutes les émotions sont normales et utiles! La joie, la tristesse, la colère, la peur - chacune a un rôle important.</p>
            
            <h4>Les 4 piliers de l'intelligence émotionnelle:</h4>
            <ul>
              <li><strong>Reconnaître</strong> - Identifier ce que tu ressens</li>
              <li><strong>Comprendre</strong> - Savoir pourquoi tu ressens cela</li>
              <li><strong>Exprimer</strong> - Communiquer tes émotions de façon saine</li>
              <li><strong>Gérer</strong> - Réagir de manière appropriée</li>
            </ul>
            
            <h4>Techniques pour te calmer:</h4>
            <ul>
              <li>Respire profondément (inspire 4 secondes, expire 6 secondes)</li>
              <li>Compte jusqu'à 10 avant de réagir</li>
              <li>Parle à quelqu'un de confiance</li>
              <li>Écris ce que tu ressens</li>
            </ul>
          `
        }
      },
      {
        id: "emotions-quiz",
        type: "quiz",
        title: "Quiz: Tes émotions",
        description: "Teste ta connaissance des émotions",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Est-ce normal de ressentir de la colère?",
              options: ["Non, c'est toujours mal", "Oui, c'est une émotion normale", "Seulement pour les adultes", "Non, il faut toujours être content"],
              correctIndex: 1,
              explanation: "La colère est une émotion normale. Ce qui compte, c'est comment tu la gères."
            },
            {
              question: "Que faire quand tu te sens très en colère?",
              options: ["Crier sur tout le monde", "Respirer profondément et te calmer d'abord", "Casser des choses", "Garder tout pour toi et exploser plus tard"],
              correctIndex: 1,
              explanation: "Respirer profondément aide à te calmer avant de réagir."
            }
          ]
        }
      },
      {
        id: "emotions-game",
        type: "game",
        title: "Mon thermomètre émotionnel",
        description: "Évalue tes émotions quotidiennement",
        duration: "5 min",
        content: {
          gameDescription: "Dessine un thermomètre avec 5 niveaux (de 'super calme' à 'très agité'). Chaque soir, marque où tu te situes et note une chose qui t'a fait du bien aujourd'hui."
        }
      }
    ]
  },
  communication: {
    id: "communication",
    title: "Communication",
    description: "Développe tes compétences en communication",
    duration: "15 min",
    activities: [
      {
        id: "communication-video",
        type: "video",
        title: "L'art de bien communiquer",
        description: "Apprends à t'exprimer clairement",
        duration: "5 min",
        content: { videoQuery: "communication efficace enfants parler ecouter francais" }
      },
      {
        id: "communication-reading",
        type: "reading",
        title: "Parler et écouter",
        description: "Les deux faces de la communication",
        duration: "5 min",
        content: {
          readingContent: `
            <h3>Bien communiquer</h3>
            <p>La communication, c'est l'art de transmettre des idées et de comprendre les autres. C'est une compétence essentielle pour réussir dans la vie.</p>
            
            <h4>Les bases de la bonne communication:</h4>
            <ul>
              <li><strong>Être clair</strong> - Exprime tes idées simplement et directement</li>
              <li><strong>Écouter activement</strong> - Concentre-toi sur ce que l'autre dit</li>
              <li><strong>Le langage corporel</strong> - Regarde la personne, souris, opine</li>
              <li><strong>Poser des questions</strong> - Montre ton intérêt pour l'autre</li>
            </ul>
            
            <h4>L'écoute active</h4>
            <p>Écouter, c'est plus que simplement entendre. C'est essayer de vraiment comprendre ce que l'autre personne veut dire.</p>
            
            <h4>Conseil pratique</h4>
            <p>Avant de répondre, reformule ce que l'autre a dit: "Si je comprends bien, tu dis que..." Cela montre que tu écoutes vraiment.</p>
          `
        }
      },
      {
        id: "communication-quiz",
        type: "quiz",
        title: "Quiz: Communication",
        description: "Teste tes compétences communicationnelles",
        duration: "3 min",
        content: {
          quizQuestions: [
            {
              question: "Que signifie 'écouter activement'?",
              options: ["Parler en même temps que l'autre", "Se concentrer vraiment sur ce que l'autre dit", "Penser à ce qu'on va dire ensuite", "Regarder son téléphone en écoutant"],
              correctIndex: 1,
              explanation: "L'écoute active signifie donner toute son attention à la personne qui parle."
            },
            {
              question: "Quel élément aide à bien communiquer?",
              options: ["Interrompre souvent", "Regarder la personne et hocher la tête", "Regarder ailleurs", "Parler très vite"],
              correctIndex: 1,
              explanation: "Le contact visuel et le hochement de tête montrent que tu écoutes et comprends."
            }
          ]
        }
      },
      {
        id: "communication-game",
        type: "game",
        title: "Le jeu du miroir",
        description: "Pratique l'écoute active",
        duration: "5 min",
        content: {
          gameDescription: "Avec un ami, l'un raconte une histoire (1 minute). L'autre écoute sans interrompre, puis résume ce qu'il a entendu. Inversez les rôles! Avez-vous bien écouté?"
        }
      }
    ]
  }
};
