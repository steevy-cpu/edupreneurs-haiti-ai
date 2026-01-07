// Demo data for visitor mode
// This static data is shown to visitors to preview the platform

export const visitorDashboardData = {
  streak: 7,
  studyTime: 45,
  lessonsCompleted: 12,
  weeklyGoal: 5,
  weeklyProgress: 3,
  goldEarned: 150,
  subjectProgress: [
    { name: "Mathématiques", progress: 75, color: "hsl(var(--success))" },
    { name: "Français", progress: 60, color: "hsl(var(--primary))" },
    { name: "Sciences", progress: 45, color: "hsl(var(--accent))" },
    { name: "Histoire-Géo", progress: 30, color: "hsl(var(--warning))" },
  ],
  weeklyActivity: [
    { day: "Lun", minutes: 45 },
    { day: "Mar", minutes: 30 },
    { day: "Mer", minutes: 60 },
    { day: "Jeu", minutes: 25 },
    { day: "Ven", minutes: 50 },
    { day: "Sam", minutes: 15 },
    { day: "Dim", minutes: 40 },
  ],
  recentAchievements: [
    { name: "Premier pas", icon: "🎯", description: "Terminer votre première leçon" },
    { name: "Série de 7 jours", icon: "🔥", description: "Étudier 7 jours consécutifs" },
    { name: "Maître des maths", icon: "🧮", description: "Terminer 10 leçons de maths" },
  ],
};

export const visitorFeedPosts = [
  {
    id: "demo-1",
    content: "Je viens de terminer le chapitre sur les fractions ! 🎉 C'était difficile mais j'ai réussi grâce aux explications claires de la plateforme.",
    author: {
      nickname: "Marie",
      avatar_url: "avatar-1",
      academic_grade: "9e AF",
    },
    likes_count: 24,
    comments_count: 5,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    content: "Quelqu'un peut m'expliquer la différence entre le passé composé et l'imparfait ? Je suis un peu perdu... 📚",
    author: {
      nickname: "Jean",
      avatar_url: "avatar-2",
      academic_grade: "8e AF",
    },
    likes_count: 8,
    comments_count: 12,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    content: "J'ai gagné 50 pièces d'or cette semaine ! 🏆 Qui d'autre participe au classement ?",
    author: {
      nickname: "Sophie",
      avatar_url: "avatar-3",
      academic_grade: "9e AF",
    },
    likes_count: 42,
    comments_count: 8,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const visitorConversationPreview = {
  groups: [
    { name: "Mathématiques 9e AF", members: 45, lastMessage: "Quelqu'un peut m'aider avec les équations ?" },
    { name: "Sciences Expérimentales", members: 32, lastMessage: "Le quiz de demain porte sur quoi ?" },
    { name: "Groupe d'étude", members: 8, lastMessage: "On se retrouve à 18h pour réviser ?" },
  ],
  directMessages: [
    { name: "Pierre", lastMessage: "Merci pour ton aide !", unread: 2 },
    { name: "Claire", lastMessage: "À demain !", unread: 0 },
  ],
};

export const visitorProfileData = {
  nickname: "Visiteur",
  fullName: "Visiteur Edupreneurs",
  academicGrade: "9e AF",
  avatar_url: "avatar-default",
  goldEarned: 0,
  lessonsCompleted: 0,
  streak: 0,
};

export const visitorChessData = {
  eloRating: 1200,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  puzzlesSolved: 0,
};

export const visitorPassionCategories = [
  {
    id: "music",
    name: "Musique",
    description: "Découvre les bases de la théorie musicale et apprends à jouer d'un instrument",
    icon: "🎵",
    modules: 12,
    locked: true,
  },
  {
    id: "art",
    name: "Arts Visuels",
    description: "Explore le dessin, la peinture et les techniques artistiques",
    icon: "🎨",
    modules: 10,
    locked: true,
  },
  {
    id: "chess",
    name: "Échecs",
    description: "Maîtrise les stratégies d'échecs avec notre coach IA Jude",
    icon: "♟️",
    modules: 8,
    locked: true,
  },
  {
    id: "literature",
    name: "Littérature",
    description: "Découvre les grands classiques de la littérature haïtienne et mondiale",
    icon: "📖",
    modules: 15,
    locked: true,
  },
];
