// Quiz questions for different math topics

export const nombresEntiersQuiz = [
  {
    question: "Quel est le résultat de -5 + 8 ?",
    options: ["3", "-3", "13", "-13"],
    correctAnswer: 0,
    explanation: "Pour additionner des nombres de signes différents, on soustrait les valeurs absolues et on garde le signe du plus grand: 8 - 5 = 3"
  },
  {
    question: "Quel est le résultat de -3 × -4 ?",
    options: ["-12", "12", "-7", "7"],
    correctAnswer: 1,
    explanation: "Un nombre négatif multiplié par un nombre négatif donne un nombre positif: -3 × -4 = 12"
  },
  {
    question: "Lequel de ces nombres est divisible par 3 ?",
    options: ["25", "34", "45", "52"],
    correctAnswer: 2,
    explanation: "Un nombre est divisible par 3 si la somme de ses chiffres est divisible par 3. Pour 45: 4 + 5 = 9, et 9 est divisible par 3."
  },
  {
    question: "Quel est le résultat de 7 - 10 ?",
    options: ["3", "-3", "17", "-17"],
    correctAnswer: 1,
    explanation: "Quand on soustrait un nombre plus grand, le résultat est négatif: 7 - 10 = -3"
  },
  {
    question: "Un nombre pair se termine toujours par:",
    options: ["1, 3, 5, 7, 9", "0, 2, 4, 6, 8", "0, 5", "1, 2, 3, 4, 5"],
    correctAnswer: 1,
    explanation: "Un nombre pair se termine toujours par 0, 2, 4, 6 ou 8"
  },
  {
    question: "Quel est le résultat de -2 × 5 ?",
    options: ["10", "-10", "7", "-7"],
    correctAnswer: 1,
    explanation: "Un nombre négatif multiplié par un nombre positif donne un nombre négatif: -2 × 5 = -10"
  },
  {
    question: "72 est divisible par:",
    options: ["Seulement 2", "2, 3, et 4", "Seulement 3", "Aucun de ces nombres"],
    correctAnswer: 1,
    explanation: "72 est pair (divisible par 2), 7+2=9 qui est divisible par 3, et les deux derniers chiffres (72) sont divisibles par 4"
  },
  {
    question: "Quel est le résultat de 0 × -15 ?",
    options: ["-15", "15", "0", "Impossible"],
    correctAnswer: 2,
    explanation: "Zéro multiplié par n'importe quel nombre donne toujours zéro"
  },
  {
    question: "Si on range les nombres -5, 3, -2, 7, 0 du plus petit au plus grand:",
    options: ["-5, -2, 0, 3, 7", "7, 3, 0, -2, -5", "-2, -5, 0, 3, 7", "0, -2, -5, 3, 7"],
    correctAnswer: 0,
    explanation: "Les nombres négatifs sont plus petits que zéro. Plus un nombre négatif a une grande valeur absolue, plus il est petit."
  },
  {
    question: "Le résultat de (-4) + (-6) est:",
    options: ["-10", "10", "-2", "2"],
    correctAnswer: 0,
    explanation: "Quand on additionne deux nombres négatifs, on additionne leurs valeurs absolues et on garde le signe négatif: -4 + (-6) = -10"
  }
];

export const nombresEntiersMatching = [
  {
    id: "1",
    question: "5 + 3",
    answer: "8"
  },
  {
    id: "2",
    question: "-2 × 4",
    answer: "-8"
  },
  {
    id: "3",
    question: "10 - 15",
    answer: "-5"
  },
  {
    id: "4",
    question: "-3 × -3",
    answer: "9"
  },
  {
    id: "5",
    question: "0 × 7",
    answer: "0"
  }
];

export const nombresEntiersDragDrop = [-8, -3, 0, 5, 12, 20];

export const equationsQuiz = [
  {
    question: "Quelle est la solution de l'équation x + 5 = 12 ?",
    options: ["x = 7", "x = 17", "x = -7", "x = 5"],
    correctAnswer: 0,
    explanation: "Pour isoler x, on soustrait 5 des deux côtés: x = 12 - 5 = 7"
  },
  {
    question: "Résous: 2x = 10",
    options: ["x = 5", "x = 20", "x = 12", "x = 8"],
    correctAnswer: 0,
    explanation: "Pour isoler x, on divise les deux côtés par 2: x = 10 ÷ 2 = 5"
  },
  {
    question: "Quelle est la solution de 3x - 6 = 9 ?",
    options: ["x = 1", "x = 3", "x = 5", "x = 15"],
    correctAnswer: 2,
    explanation: "D'abord on additionne 6: 3x = 15. Ensuite on divise par 3: x = 5"
  }
];

export const equationsMatching = [
  {
    id: "1",
    question: "x + 3 = 7",
    answer: "x = 4"
  },
  {
    id: "2",
    question: "2x = 8",
    answer: "x = 4"
  },
  {
    id: "3",
    question: "x - 5 = 0",
    answer: "x = 5"
  },
  {
    id: "4",
    question: "3x = 12",
    answer: "x = 4"
  }
];
