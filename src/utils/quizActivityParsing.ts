// Shared parsing utilities for quiz and activity content validation

export interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ParsedQuizActivity {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  activityType: 'QUIZ';
}

export interface ParsedTrueFalseActivity {
  statement: string;
  isTrue: boolean;
  explanation: string;
  activityType: 'TRUE_FALSE';
}

export type ParsedActivity = ParsedQuizActivity | ParsedTrueFalseActivity;

export interface ParseResult<T> {
  items: T[];
  errors: string[];
}

/**
 * Parse quiz questions from content (quiz_final field)
 */
export const parseQuizQuestions = (content: string): ParseResult<ParsedQuestion> => {
  const questions: ParsedQuestion[] = [];
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    return { items: questions, errors: ['Contenu vide'] };
  }

  // Check if HTML format
  if (content.includes('<div class="quiz-question"')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const questionDivs = doc.querySelectorAll('.quiz-question');
      
      questionDivs.forEach((questionDiv, idx) => {
        const questionText = questionDiv.querySelector('p')?.textContent?.trim() || '';
        const options: string[] = [];
        const optionDivs = questionDiv.querySelectorAll('.option');
        
        optionDivs.forEach((optionDiv) => {
          const text = optionDiv.textContent?.trim() || '';
          const cleanText = text.replace(/^[A-D]\)\s*/, '').trim();
          if (cleanText) options.push(cleanText);
        });
        
        const correctAnswerDiv = questionDiv.querySelector('.correct-answer');
        const correctAnswerText = correctAnswerDiv?.querySelector('strong')?.textContent?.trim() || '';
        const correctMatch = correctAnswerText.match(/Réponse\s+correcte\s*:\s*([A-D])/i);
        const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : 'A';
        const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
        
        const explanationParagraphs = correctAnswerDiv?.querySelectorAll('p');
        let explanation = '';
        if (explanationParagraphs && explanationParagraphs.length > 1) {
          explanation = Array.from(explanationParagraphs)
            .slice(1)
            .map(p => p.textContent?.trim() || '')
            .join(' ');
        }
        
        if (questionText && options.length === 4 && explanation) {
          questions.push({ question: questionText, options, correctAnswer: correctIndex, explanation });
        } else {
          errors.push(`Question ${idx + 1}: ${
            !questionText ? 'texte manquant' : 
            options.length !== 4 ? `${options.length}/4 options` : 
            !explanation ? 'explication manquante' : 'format invalide'
          }`);
        }
      });
    } catch (e) {
      errors.push('Erreur de parsing HTML');
    }
  } else {
    // Markdown format
    let sections = content.split(/#{2,3}\s*✅?\s*Question\s+\d+/i);
    if (sections.length <= 1) {
      sections = content.split(/Question\s+\d+/i);
    }
    
    sections.slice(1).forEach((section, idx) => {
      const questionMatch = section.match(/^\s*(.+?)(?=\n\s*[A-D][\):\.])/is);
      if (!questionMatch) {
        errors.push(`Question ${idx + 1}: texte non trouvé`);
        return;
      }
      
      const questionText = questionMatch[1].trim().replace(/\*\*/g, '').replace(/#{1,3}/g, '');
      
      const optionMatches = section.matchAll(/([A-D])[\):\.]\s*(.+?)(?=\n\s*[A-D][\):\.]|\n\s*#{2,3}|\n\n|$)/gis);
      const options: string[] = [];
      Array.from(optionMatches).forEach(match => {
        const optionText = match[2]?.trim().replace(/\*\*/g, '');
        if (optionText && optionText.length > 0 && optionText.length < 300) {
          options.push(optionText);
        }
      });
      
      let correctMatch = section.match(/#{2,3}\s*Réponse\s+correcte\s*:?\s*([A-D])/i);
      if (!correctMatch) correctMatch = section.match(/Réponse\s*:?\s*([A-D])/i);
      if (!correctMatch) correctMatch = section.match(/Correct[e]?\s*:?\s*([A-D])/i);
      
      if (!correctMatch) {
        errors.push(`Question ${idx + 1}: réponse correcte non trouvée`);
        return;
      }
      
      if (options.length !== 4) {
        errors.push(`Question ${idx + 1}: ${options.length}/4 options`);
        return;
      }
      
      const correctLetter = correctMatch[1].toUpperCase();
      const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      const explanationMatch = section.match(/#{2,3}\s*Explication\s*:?\s*\n?\s*(.+?)(?=#{2,3}|$)/is);
      const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : "";
      
      if (!explanation) {
        errors.push(`Question ${idx + 1}: explication manquante`);
      }
      
      if (questionText && options.length === 4 && correctIndex >= 0 && correctIndex < 4) {
        questions.push({ question: questionText, options, correctAnswer: correctIndex, explanation: explanation || 'Pas d\'explication' });
      }
    });
  }

  return { items: questions, errors };
};

/**
 * Parse TRUE_FALSE activity block
 */
const parseTrueFalseBlock = (block: string, idx: number): { activity?: ParsedTrueFalseActivity, error?: string } => {
  let statementMatch = block.match(/^[\s\n]*(.+?)(?=\n\s*\*\*Réponse)/is);
  if (!statementMatch) {
    statementMatch = block.match(/^[\s\n]*(.+?)(?=\nRéponse\s*:)/is);
  }
  
  if (!statementMatch) {
    return { error: `Affirmation ${idx + 1}: texte non trouvé` };
  }

  const statement = statementMatch[1]
    .trim()
    .replace(/\*\*/g, '')
    .replace(/#{1,3}/g, '')
    .replace(/^Affirmation\s*\d*:?\s*/i, '')
    .substring(0, 500);

  if (statement.length < 10) {
    return { error: `Affirmation ${idx + 1}: texte trop court` };
  }

  let answerMatch = block.match(/\*\*Réponse\s*:?\s*\*?\*?\s*(VRAI|FAUX)/i);
  if (!answerMatch) answerMatch = block.match(/Réponse\s*:?\s*(VRAI|FAUX)/i);
  
  if (!answerMatch) {
    return { error: `Affirmation ${idx + 1}: réponse VRAI/FAUX non trouvée` };
  }

  const isTrue = answerMatch[1].toUpperCase() === 'VRAI';

  let explanationMatch = block.match(/\*\*Explication\s*:?\s*\*\*\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Affirmation|#{2,3}|---|\n\n\*\*|$)/is);
  if (!explanationMatch) explanationMatch = block.match(/Explication\s*:?\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Affirmation|#{2,3}|---|\n\n|$)/is);
  
  const explanation = explanationMatch 
    ? explanationMatch[1].trim().replace(/\*\*/g, '').replace(/---/g, '').substring(0, 500)
    : 'Pas d\'explication fournie';

  return {
    activity: {
      statement,
      isTrue,
      explanation,
      activityType: 'TRUE_FALSE'
    }
  };
};

/**
 * Parse QUIZ activity block
 */
const parseActivityBlock = (block: string, idx: number): { activity?: Omit<ParsedQuizActivity, 'activityType'>, error?: string } => {
  const normalizedBlock = block
    .replace(/^-\s*([A-D]\))/gm, '$1')
    .replace(/^\*\s*([A-D]\))/gm, '$1')
    .replace(/^([A-D])\.\s+/gm, '$1) ')
    .replace(/^([A-D]):\s+/gm, '$1) ');

  let questionMatch = normalizedBlock.match(/^[\s\n]*(.+?)(?=\n\s*[A-D]\))/is);
  if (!questionMatch) {
    questionMatch = normalizedBlock.match(/^[\s\n]*(.+?)(?=\n\s*\*?\*?[A-D][\):\.])/is);
  }
  
  if (!questionMatch) {
    return { error: `Activité ${idx + 1}: texte de question non trouvé` };
  }

  const questionText = questionMatch[1]
    .trim()
    .replace(/\*\*/g, '')
    .replace(/#{1,3}/g, '')
    .replace(/^Question\s*\d*:?\s*/i, '')
    .substring(0, 500);

  if (questionText.length < 5) {
    return { error: `Activité ${idx + 1}: texte de question trop court` };
  }

  const optionRegex = /^([A-D])\)\s*(.+?)$/gm;
  const optionMatches = Array.from(normalizedBlock.matchAll(optionRegex));
  
  const seenLetters = new Set<string>();
  const options: string[] = [];
  
  for (const match of optionMatches) {
    const letter = match[1].toUpperCase();
    const optionText = match[2]?.trim().replace(/\*\*/g, '').replace(/\n/g, ' ');
    
    if (!seenLetters.has(letter) && optionText && optionText.length > 0 && optionText.length < 500) {
      seenLetters.add(letter);
      options.push(optionText);
    }
    
    if (options.length >= 4) break;
  }

  if (options.length < 4) {
    const fallbackMatches = normalizedBlock.matchAll(/\*?\*?([A-D])[\):\.]?\*?\*?\s*(.+?)(?=\n\s*\*?\*?[A-D][\):\.]|\n\s*\*\*Réponse|\n\s*Réponse|\n\s*\*\*Explication|\n\s*---|\n\s*\*\*Question|\n\s*\*\*TYPE:|\n\n|$)/gis);
    
    options.length = 0;
    seenLetters.clear();
    
    for (const match of Array.from(fallbackMatches)) {
      const letter = match[1].toUpperCase();
      const optionText = match[2]?.trim().replace(/\*\*/g, '').replace(/\n/g, ' ');
      
      if (!seenLetters.has(letter) && optionText && optionText.length > 0 && optionText.length < 500) {
        seenLetters.add(letter);
        options.push(optionText);
      }
      
      if (options.length >= 4) break;
    }
  }

  if (options.length !== 4) {
    return { error: `Activité ${idx + 1}: ${options.length}/4 options trouvées` };
  }

  let correctMatch = normalizedBlock.match(/\*\*Réponse\s+correcte\s*:?\s*\*?\*?\s*([A-D])/i);
  if (!correctMatch) correctMatch = normalizedBlock.match(/Réponse\s+correcte\s*:?\s*([A-D])/i);
  if (!correctMatch) correctMatch = normalizedBlock.match(/Réponse\s*:?\s*([A-D])/i);
  if (!correctMatch) correctMatch = normalizedBlock.match(/Correct[e]?\s*:?\s*([A-D])/i);
  if (!correctMatch) correctMatch = normalizedBlock.match(/data-correct="([A-D])"/i);

  if (!correctMatch) {
    return { error: `Activité ${idx + 1}: réponse correcte non trouvée` };
  }

  const correctLetter = correctMatch[1].toUpperCase();
  const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);

  let explanationMatch = normalizedBlock.match(/\*\*Explication\s*:?\s*\*\*\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Question|#{2,3}|---|\n\n\*\*|$)/is);
  if (!explanationMatch) explanationMatch = normalizedBlock.match(/Explication\s*:?\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Question|#{2,3}|---|\n\n|$)/is);
  
  const explanation = explanationMatch 
    ? explanationMatch[1].trim().replace(/\*\*/g, '').replace(/---/g, '').substring(0, 500)
    : 'Pas d\'explication fournie';

  return {
    activity: {
      question: questionText,
      options,
      correctAnswer: correctIndex,
      explanation,
    }
  };
};

/**
 * Parse activities from content (activites_interactives field)
 */
export const parseActivities = (content: string): ParseResult<ParsedActivity> => {
  const activities: ParsedActivity[] = [];
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    return { items: activities, errors: ['Contenu vide'] };
  }

  const normalizedContent = content
    .replace(/^-\s*([A-D]\))/gm, '$1')
    .replace(/^\*\s*([A-D]\))/gm, '$1')
    .replace(/^([A-D])\.\s+/gm, '$1) ')
    .replace(/^([A-D]):\s+/gm, '$1) ');

  // ============ PARSE TRUE_FALSE ACTIVITIES ============
  const trueFalseSections = normalizedContent.split(/\*\*TYPE:\s*TRUE_FALSE\*\*/i);
  
  if (trueFalseSections.length > 1) {
    trueFalseSections.slice(1).forEach((section, sectionIdx) => {
      const affirmationBlocks = section.split(/(?:^|\n)---\s*\n|\*\*Affirmation\s*\d*:?\s*\*\*/i);
      
      affirmationBlocks.forEach((block, idx) => {
        if (block.trim().length < 10) return;
        if (/\*\*TYPE:\s*QUIZ\*\*/i.test(block)) return;
        
        const parsed = parseTrueFalseBlock(block, sectionIdx * 10 + idx);
        if (parsed.activity) {
          const exists = activities.some(a => 
            a.activityType === 'TRUE_FALSE' && 
            (a as ParsedTrueFalseActivity).statement === parsed.activity!.statement
          );
          if (!exists) {
            activities.push(parsed.activity);
          }
        }
        if (parsed.error) {
          errors.push(parsed.error);
        }
      });
    });
  }

  // ============ PARSE QUIZ ACTIVITIES ============
  const quizSections = normalizedContent.split(/\*\*TYPE:\s*QUIZ\*\*/i);
  
  if (quizSections.length > 1) {
    quizSections.slice(1).forEach((section, sectionIdx) => {
      const nextTypeIdx = section.search(/\*\*TYPE:\s*(TRUE_FALSE|QUIZ)\*\*/i);
      const sectionContent = nextTypeIdx > 0 ? section.substring(0, nextTypeIdx) : section;
      
      const questionBlocks = sectionContent.split(/(?:^|\n)---\s*\n|\*\*Question\s*\d*:?\s*\*\*/i);
      
      questionBlocks.forEach((block, idx) => {
        if (block.trim().length < 20) return;
        const parsed = parseActivityBlock(block, sectionIdx * 10 + idx);
        if (parsed.activity) {
          const quizActivity: ParsedQuizActivity = {
            ...parsed.activity,
            activityType: 'QUIZ'
          };
          const exists = activities.some(a => 
            a.activityType === 'QUIZ' && 
            (a as ParsedQuizActivity).question === quizActivity.question
          );
          if (!exists) {
            activities.push(quizActivity);
          }
        }
        if (parsed.error) {
          errors.push(parsed.error);
        }
      });
    });
  }

  // Legacy format fallback
  if (activities.length === 0) {
    const activityPatterns = [
      /#{2,3}\s*Activité\s+\d+/gi,
      /#{2,3}\s*Exercice\s+\d+/gi,
      /\*\*Activité\s+\d+\*\*/gi,
      /\*\*Exercice\s+\d+\*\*/gi,
    ];

    for (const pattern of activityPatterns) {
      const sections = normalizedContent.split(pattern);
      if (sections.length > 1) {
        sections.slice(1).forEach((section, idx) => {
          const parsed = parseActivityBlock(section, idx);
          if (parsed.activity) {
            const quizActivity: ParsedQuizActivity = {
              ...parsed.activity,
              activityType: 'QUIZ'
            };
            const exists = activities.some(a => 
              a.activityType === 'QUIZ' && 
              (a as ParsedQuizActivity).question === quizActivity.question
            );
            if (!exists) {
              activities.push(quizActivity);
            }
          }
          if (parsed.error && !errors.includes(parsed.error)) {
            errors.push(parsed.error);
          }
        });
        break;
      }
    }
  }

  // Fallback: try parsing as general markdown with options
  if (activities.length === 0) {
    const questionBlocks = normalizedContent.split(/\*\*Question\s*\d*:?\s*\*\*/i);
    if (questionBlocks.length > 1) {
      questionBlocks.slice(1).forEach((block, idx) => {
        const parsed = parseActivityBlock(block, idx);
        if (parsed.activity) {
          const quizActivity: ParsedQuizActivity = {
            ...parsed.activity,
            activityType: 'QUIZ'
          };
          activities.push(quizActivity);
        }
        if (parsed.error) {
          errors.push(parsed.error);
        }
      });
    }
  }

  // Simple detection fallback
  if (activities.length === 0 && normalizedContent.length > 100) {
    if (normalizedContent.includes('A)') || normalizedContent.includes('A.') || normalizedContent.includes('A:')) {
      const parsed = parseActivityBlock(normalizedContent, 0);
      if (parsed.activity) {
        const quizActivity: ParsedQuizActivity = {
          ...parsed.activity,
          activityType: 'QUIZ'
        };
        activities.push(quizActivity);
      } else {
        errors.push('Format d\'activité non reconnu - contenu détecté mais non parsable');
      }
    } else {
      errors.push('Format d\'activité non reconnu');
    }
  }

  return { items: activities, errors };
};

/**
 * Get validation status summary
 */
export const getValidationStatus = (
  quizResult: ParseResult<ParsedQuestion>,
  activityResult: ParseResult<ParsedActivity>
): {
  quizValid: boolean;
  activitiesValid: boolean;
  quizCount: number;
  activityCount: number;
  totalErrors: number;
} => {
  const quizValid = quizResult.items.length > 0 && quizResult.errors.length === 0;
  const activitiesValid = activityResult.items.length > 0 && activityResult.errors.length === 0;
  
  return {
    quizValid,
    activitiesValid,
    quizCount: quizResult.items.length,
    activityCount: activityResult.items.length,
    totalErrors: quizResult.errors.length + activityResult.errors.length,
  };
};
