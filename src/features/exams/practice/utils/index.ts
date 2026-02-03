/**
 * Practice Utils - Barrel exports
 */

export { 
  detectQuestionType, 
  hasOptions, 
  isMatchingQuestion, 
  isEssayQuestion,
  type QuestionType 
} from './detectQuestionType';

export { 
  parseMatchingColumns, 
  formatMatchingAnswer,
  type ParsedMatching,
  type MatchingItem 
} from './parseMatching';
