/**
 * ContentBlocksRenderer - Unified block renderer with KaTeX support
 * Used for exercise prompts, options, explanations, and tutor responses
 */
import { memo } from 'react';
import { MathText } from '@/components/MathContent';
import type { ContentBlock } from '../types/exam.types';

interface ContentBlocksRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

export const ContentBlocksRenderer = memo(function ContentBlocksRenderer({ 
  blocks, 
  className 
}: ContentBlocksRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  // Convert blocks to a single string with LaTeX delimiters
  const text = blocks.map(block => {
    switch (block.type) {
      case 'text':
        return block.content || '';
      case 'math-inline':
        return `$${block.latex || ''}$`;
      case 'math-block':
        return `$$${block.latex || ''}$$`;
      default:
        return '';
    }
  }).join('');

  return (
    <span className={className}>
      <MathText text={text} />
    </span>
  );
});

/**
 * Parse a text string containing LaTeX delimiters into ContentBlocks
 * Supports: $...$ (inline) and $$...$$ (block)
 */
export function parseTextToBlocks(text: string): ContentBlock[] {
  if (!text) return [];
  
  const blocks: ContentBlock[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent) {
        blocks.push({ type: 'text', content: textContent });
      }
    }
    
    const mathContent = match[0];
    
    // Check if it's block math ($$...$$) or inline math ($...$)
    if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
      blocks.push({
        type: 'math-block',
        latex: mathContent.slice(2, -2).trim(),
      });
    } else {
      blocks.push({
        type: 'math-inline',
        latex: mathContent.slice(1, -1).trim(),
      });
    }
    
    lastIndex = match.index + mathContent.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      blocks.push({ type: 'text', content: remaining });
    }
  }
  
  // If no blocks were created, treat the whole thing as text
  if (blocks.length === 0 && text) {
    blocks.push({ type: 'text', content: text });
  }
  
  return blocks;
}

/**
 * Render a text string that may contain LaTeX
 * Convenience wrapper that parses and renders in one step
 */
export function TextWithMath({ text, className }: { text: string; className?: string }) {
  const blocks = parseTextToBlocks(text);
  return <ContentBlocksRenderer blocks={blocks} className={className} />;
}
