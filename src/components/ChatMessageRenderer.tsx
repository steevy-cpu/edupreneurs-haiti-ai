import { MathText } from '@/components/MathContent';

interface ChatMessageRendererProps {
  content: string;
  className?: string;
}

/**
 * Unified chat message renderer with KaTeX math support.
 * Used across all chat surfaces:
 * - HomeChatbot
 * - JudeChatbot
 * - Community MessageBubble
 * 
 * Handles LaTeX delimiters: $...$ (inline), $$...$$ (block)
 */
export function ChatMessageRenderer({ content, className }: ChatMessageRendererProps) {
  if (!content) return null;
  
  return (
    <span className={className}>
      <MathText text={content} />
    </span>
  );
}
