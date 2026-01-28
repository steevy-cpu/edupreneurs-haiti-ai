import React from 'react';
import DOMPurify from 'dompurify';

interface HTMLQuizFallbackProps {
  htmlContent: string;
  className?: string;
}

/**
 * Fallback renderer for legacy HTML quizzes
 * Used when no JSON payload exists in lesson_assets
 */
export function HTMLQuizFallback({ htmlContent, className }: HTMLQuizFallbackProps) {
  if (!htmlContent) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucun quiz disponible pour cette leçon.</p>
      </div>
    );
  }

  // Sanitize HTML to prevent XSS
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['data-number', 'data-answer', 'data-correct', 'data-game-type'],
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
