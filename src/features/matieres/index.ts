// Export all matieres feature modules
export * from './validation';
export * from './data';
export * from './renderers';

// Hooks
export { useAIGeneratedQuiz, useAIGeneratedActivities } from './hooks/useAIGeneratedContent';

// Tab components
export { 
  LessonIntroductionTab, 
  LessonContenuTab, 
  LessonActivitiesTab, 
  LessonQuizTab, 
  LessonNotesTab 
} from './components/tabs';
