// Batch Operations System
// Unified infrastructure for quiz/activities validation and regeneration

// Types
export * from './types';

// Core hook
export { useBatchOperation } from './hooks/useBatchOperation';

// UI Components
export { BatchOperationDialog } from './components/BatchOperationDialog';
export { BatchOperationProgress } from './components/BatchOperationProgress';
export { BatchOperationButton } from './components/BatchOperationButton';

// Validators
export { 
  createQuizValidatorConfig, 
  quizValidatorTheme, 
  quizValidatorDialogConfig 
} from './validators/quizValidator';
export { 
  createActivitiesValidatorConfig, 
  activitiesValidatorTheme, 
  activitiesValidatorDialogConfig 
} from './validators/activitiesValidator';

// Regenerators
export { 
  createQuizRegeneratorConfig, 
  quizRegeneratorTheme, 
  quizRegeneratorDialogConfig 
} from './regenerators/quizRegenerator';
export { 
  createActivitiesRegeneratorConfig, 
  activitiesRegeneratorTheme, 
  activitiesRegeneratorDialogConfig 
} from './regenerators/activitiesRegenerator';

// Wrapper components (ready to use)
export { BatchQuizValidator } from './wrappers/BatchQuizValidator';
export { BatchActivitiesValidator } from './wrappers/BatchActivitiesValidator';
export { BatchQuizRegenerator } from './wrappers/BatchQuizRegenerator';
export { BatchActivitiesRegenerator } from './wrappers/BatchActivitiesRegenerator';
