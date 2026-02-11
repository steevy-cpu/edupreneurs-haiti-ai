/** Count activity blocks from legacy HTML content */
export const countActivities = (activitiesHtml?: string): number => {
  if (!activitiesHtml) return 0;
  const activityMatches = activitiesHtml.match(/data-activity-type|class="activity-|<div[^>]*activity/gi);
  return activityMatches ? Math.min(activityMatches.length, 10) : 0;
};

/** Count quiz questions from legacy HTML content */
export const countQuizQuestions = (quizHtml?: string): number => {
  if (!quizHtml) return 0;
  const questionMatches = quizHtml.match(/data-question|class="quiz-question|<div[^>]*question/gi);
  return questionMatches ? Math.min(questionMatches.length, 20) : 0;
};

/** Estimate reading time in minutes based on word count */
export const estimateReadingTime = (content: string, intro: string, examples: string): number => {
  const totalText = `${intro || ''} ${content || ''} ${examples || ''}`;
  const wordCount = totalText.split(/\s+/).filter(Boolean).length;
  // Average reading speed: 200 words per minute, add time for activities
  return Math.max(5, Math.ceil(wordCount / 200) + 5);
};

/** Motivational messages displayed randomly per session */
export const MOTIVATIONAL_MESSAGES = [
  "Tu fais du bon travail! Continue comme ça! 💪",
  "Chaque leçon te rapproche de ton objectif! 🎯",
  "L'apprentissage est une aventure, profites-en! 🚀",
  "Tu es sur la bonne voie! 🌟",
  "Bravo pour ta persévérance! 👏"
];

/** Subject-specific gradient for header background */
export const getSubjectGradient = (subjectName: string): string => {
  const subjectLower = subjectName.toLowerCase();
  if (subjectLower.includes('anglais')) return 'from-blue-600/20 via-cyan-500/10 to-background';
  if (subjectLower.includes('espagnol')) return 'from-orange-500/20 via-amber-500/10 to-background';
  if (subjectLower.includes('français')) return 'from-indigo-500/20 via-violet-500/10 to-background';
  if (subjectLower.includes('math')) return 'from-purple-500/20 via-pink-500/10 to-background';
  if (subjectLower.includes('science')) return 'from-emerald-500/20 via-teal-500/10 to-background';
  return 'from-primary/10 via-primary/5 to-background';
};
