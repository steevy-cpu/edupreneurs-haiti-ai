/**
 * ExamHub Practice - Barrel exports
 */

// Types
export * from './types';

// Utils
export { 
  detectQuestionType, 
  parseMatchingColumns, 
  formatMatchingAnswer,
  type QuestionType 
} from './utils';

// Hooks
export { useTutorAction } from './hooks/useTutorAction';
export { useExamTutorChat, type ChatMessage } from './hooks/useExamTutorChat';

// Components
export { ExamTutorPanel } from './components/ExamTutorPanel';
export { ExerciseHeader } from './components/ExerciseHeader';
export { ExercisePrompt } from './components/ExercisePrompt';
export { AnswerInput } from './components/AnswerInput';
export { FeedbackCard } from './components/FeedbackCard';
export { ActionRow } from './components/ActionRow';
export { AskJudeDrawer } from './components/AskJudeDrawer';
export { ExamResultsModal } from './components/ExamResultsModal';

// Input Components (for direct usage if needed)
export { MCQInput, ShortInput, MatchingInput, EssayInput } from './components/inputs';
