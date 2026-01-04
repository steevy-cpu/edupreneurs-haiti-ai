import React, { useMemo } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface MathContentProps {
  content: string;
  className?: string;
}

// Convert common HTML math patterns to LaTeX
const htmlToLatex = (text: string): string => {
  let result = text;
  
  // Convert HTML entities to LaTeX
  result = result.replace(/&times;/g, "\\times ");
  result = result.replace(/&div;/g, "\\div ");
  result = result.replace(/&plusmn;/g, "\\pm ");
  result = result.replace(/&le;/g, "\\leq ");
  result = result.replace(/&ge;/g, "\\geq ");
  result = result.replace(/&ne;/g, "\\neq ");
  result = result.replace(/&rarr;/g, "\\rightarrow ");
  result = result.replace(/&larr;/g, "\\leftarrow ");
  result = result.replace(/&harr;/g, "\\leftrightarrow ");
  result = result.replace(/&infin;/g, "\\infty ");
  result = result.replace(/&pi;/g, "\\pi ");
  result = result.replace(/&alpha;/g, "\\alpha ");
  result = result.replace(/&beta;/g, "\\beta ");
  result = result.replace(/&gamma;/g, "\\gamma ");
  result = result.replace(/&delta;/g, "\\delta ");
  result = result.replace(/&theta;/g, "\\theta ");
  result = result.replace(/&lambda;/g, "\\lambda ");
  result = result.replace(/&mu;/g, "\\mu ");
  result = result.replace(/&sigma;/g, "\\sigma ");
  result = result.replace(/&phi;/g, "\\phi ");
  result = result.replace(/&omega;/g, "\\omega ");
  result = result.replace(/&sum;/g, "\\sum ");
  result = result.replace(/&prod;/g, "\\prod ");
  result = result.replace(/&int;/g, "\\int ");
  result = result.replace(/&radic;/g, "\\sqrt ");
  result = result.replace(/&prop;/g, "\\propto ");
  result = result.replace(/&asymp;/g, "\\approx ");
  result = result.replace(/&equiv;/g, "\\equiv ");
  result = result.replace(/&forall;/g, "\\forall ");
  result = result.replace(/&exist;/g, "\\exists ");
  result = result.replace(/&isin;/g, "\\in ");
  result = result.replace(/&notin;/g, "\\notin ");
  result = result.replace(/&sub;/g, "\\subset ");
  result = result.replace(/&sup;/g, "\\supset ");
  result = result.replace(/&cup;/g, "\\cup ");
  result = result.replace(/&cap;/g, "\\cap ");
  result = result.replace(/&empty;/g, "\\emptyset ");
  result = result.replace(/×/g, "\\times ");
  result = result.replace(/÷/g, "\\div ");
  result = result.replace(/±/g, "\\pm ");
  result = result.replace(/≤/g, "\\leq ");
  result = result.replace(/≥/g, "\\geq ");
  result = result.replace(/≠/g, "\\neq ");
  result = result.replace(/→/g, "\\rightarrow ");
  result = result.replace(/←/g, "\\leftarrow ");
  result = result.replace(/↔/g, "\\leftrightarrow ");
  result = result.replace(/∞/g, "\\infty ");
  result = result.replace(/π/g, "\\pi ");
  result = result.replace(/√/g, "\\sqrt ");
  result = result.replace(/∑/g, "\\sum ");
  result = result.replace(/∏/g, "\\prod ");
  result = result.replace(/∫/g, "\\int ");
  result = result.replace(/∈/g, "\\in ");
  result = result.replace(/∉/g, "\\notin ");
  result = result.replace(/⊂/g, "\\subset ");
  result = result.replace(/⊃/g, "\\supset ");
  result = result.replace(/∪/g, "\\cup ");
  result = result.replace(/∩/g, "\\cap ");
  result = result.replace(/∅/g, "\\emptyset ");
  result = result.replace(/∀/g, "\\forall ");
  result = result.replace(/∃/g, "\\exists ");
  result = result.replace(/≈/g, "\\approx ");
  result = result.replace(/≡/g, "\\equiv ");
  result = result.replace(/∝/g, "\\propto ");
  
  // Convert superscript: a<sup>n</sup> -> a^{n}
  result = result.replace(/<sup>([^<]+)<\/sup>/gi, "^{$1}");
  
  // Convert subscript: a<sub>n</sub> -> a_{n}
  result = result.replace(/<sub>([^<]+)<\/sub>/gi, "_{$1}");
  
  // Handle sqrt patterns like sqrt(x) or √(x)
  result = result.replace(/sqrt\(([^)]+)\)/gi, "\\sqrt{$1}");
  result = result.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}");
  
  return result;
};

// Check if a string contains mathematical notation (including LaTeX delimiters and plain text math)
const containsMath = (text: string): boolean => {
  const mathPatterns = [
    // Standard LaTeX delimiters - check these first
    /\$\$[\s\S]+?\$\$/,         // $$...$$ block math
    /\$[^$\n]+?\$/,              // $...$ inline math (not spanning lines)
    /\\\([\s\S]+?\\\)/,          // \(...\) inline math
    /\\\[[\s\S]+?\\\]/,          // \[...\] block math
    // LaTeX commands without delimiters
    /\\frac\s*\{/,               // \frac{a}{b}
    /\\sqrt\s*[\[{]/,            // \sqrt{x} or \sqrt[n]{x}
    /\\sum|\\prod|\\int/,        // Integrals and sums
    /\\neq|\\leq|\\geq|\\times|\\div|\\pm/, // Operators
    /\\alpha|\\beta|\\gamma|\\delta|\\theta|\\pi|\\lambda|\\mu|\\sigma/, // Greek letters
    /\\rightarrow|\\leftarrow|\\Rightarrow/, // Arrows
    /\\binom|\\approx/,          // Binomial and approx
    // HTML patterns
    /<sup>/i,
    /<sub>/i,
    /&times;|&div;|&plusmn;|&le;|&ge;|&ne;|&rarr;|&infin;|&pi;|&radic;/,
    /×|÷|±|≤|≥|≠|→|∞|π|√|∑|∏|∫|∈|∉|⊂|⊃|∪|∩|∅|≈|λ|μ|σ/,
    /\^{|\_{/,
    /sqrt\(/i,
    // Plain text math patterns
    /\w\^\(?-?\d+\)?/,           // e^(-3), x^2, a^n
    /\)\^\d+/,                   // (0.90)^5
    /\d+!/,                      // Factorial: 5!
    /C\(\d+,\s*\d+\)/,           // Combinations: C(5, 0)
    /P\([^)]+=[^)]+\)/,          // Probability: P(X=0)
    /[A-Za-z]\([A-Za-z]\)\s*=/,  // Function notation: f(x) =
  ];
  return mathPatterns.some(pattern => pattern.test(text));
};

// Check if content has LaTeX delimiters
const hasLatexDelimiters = (text: string): boolean => {
  return /\$\$[\s\S]+?\$\$/.test(text) ||    // $$...$$
         /\$[^$\n]+?\$/.test(text) ||         // $...$
         /\\\([\s\S]+?\\\)/.test(text) ||     // \(...\)
         /\\\[[\s\S]+?\\\]/.test(text);       // \[...\]
};

// Parse content with LaTeX delimiters and render math
const renderWithLatexDelimiters = (content: string): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  let remaining = content;
  let keyCounter = 0;
  
  while (remaining.length > 0) {
    // Try to find the next math delimiter
    // Order matters: check $$ before $ to avoid partial matches
    
    // Block math: $$...$$
    const blockDollarMatch = remaining.match(/^([\s\S]*?)\$\$([\s\S]+?)\$\$/);
    // Block math: \[...\]
    const blockBracketMatch = remaining.match(/^([\s\S]*?)\\\[([\s\S]+?)\\\]/);
    // Inline math: $...$
    const inlineDollarMatch = remaining.match(/^([\s\S]*?)\$([^$\n]+?)\$/);
    // Inline math: \(...\)
    const inlineParenMatch = remaining.match(/^([\s\S]*?)\\\(([\s\S]+?)\\\)/);
    
    // Find the earliest match
    type MatchResult = { match: RegExpMatchArray; type: 'block' | 'inline'; fullLength: number } | null;
    
    const candidates: MatchResult[] = [];
    
    if (blockDollarMatch) {
      candidates.push({ 
        match: blockDollarMatch, 
        type: 'block', 
        fullLength: blockDollarMatch[0].length 
      });
    }
    if (blockBracketMatch) {
      candidates.push({ 
        match: blockBracketMatch, 
        type: 'block', 
        fullLength: blockBracketMatch[0].length 
      });
    }
    if (inlineDollarMatch) {
      candidates.push({ 
        match: inlineDollarMatch, 
        type: 'inline', 
        fullLength: inlineDollarMatch[0].length 
      });
    }
    if (inlineParenMatch) {
      candidates.push({ 
        match: inlineParenMatch, 
        type: 'inline', 
        fullLength: inlineParenMatch[0].length 
      });
    }
    
    // Sort by position (length of prefix before match)
    candidates.sort((a, b) => a.match[1].length - b.match[1].length);
    
    const best = candidates[0];
    
    if (best) {
      const [fullMatch, prefix, mathContent] = best.match;
      
      // Add prefix text if any
      if (prefix) {
        result.push(<span key={keyCounter++}>{prefix}</span>);
      }
      
      // Add math content
      try {
        if (best.type === 'block') {
          result.push(
            <BlockMath key={keyCounter++} math={mathContent.trim()} />
          );
        } else {
          result.push(
            <InlineMath key={keyCounter++} math={mathContent.trim()} />
          );
        }
      } catch (error) {
        // If KaTeX fails, show original text
        result.push(<span key={keyCounter++}>{fullMatch}</span>);
      }
      
      // Move past this match
      remaining = remaining.slice(fullMatch.length);
    } else {
      // No more math delimiters found, add remaining text
      result.push(<span key={keyCounter++}>{remaining}</span>);
      break;
    }
  }
  
  return result;
};

// Parse HTML and replace math expressions with KaTeX components
const parseAndRenderMath = (html: string): React.ReactNode => {
  if (!html) return null;
  
  // If content has LaTeX delimiters, parse them first
  if (hasLatexDelimiters(html)) {
    // First, parse as HTML to handle any HTML tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Process the document recursively with LaTeX delimiter support
    const processNodeWithLatex = (node: Node): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (!text.trim()) return text;
        
        // Check for LaTeX delimiters in text
        if (hasLatexDelimiters(text)) {
          return <>{renderWithLatexDelimiters(text)}</>;
        }
        
        // Check for other math patterns
        if (containsMath(text)) {
          const latex = htmlToLatex(text);
          try {
            return <InlineMath key={Math.random()} math={latex} />;
          } catch {
            return text;
          }
        }
        return text;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Process children
        const children = Array.from(node.childNodes).map((child, index) => {
          const result = processNodeWithLatex(child);
          return typeof result === 'string' ? result : 
                 React.isValidElement(result) ? React.cloneElement(result, { key: index }) : result;
        });
        
        // Reconstruct the element with processed children
        const props: Record<string, any> = { key: Math.random() };
        
        // Copy attributes
        Array.from(element.attributes).forEach(attr => {
          let name = attr.name;
          if (name === "class") name = "className";
          if (name === "for") name = "htmlFor";
          props[name] = attr.value;
        });
        
        // Map HTML tags to React elements
        const Tag = tagName as keyof JSX.IntrinsicElements;
        
        // Void elements cannot have children
        const voidElements = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
        if (voidElements.includes(tagName)) {
          return <Tag {...props} />;
        }
        
        return <Tag {...props}>{children}</Tag>;
      }
      
      return null;
    };
    
    const result = Array.from(doc.body.childNodes).map((node, index) => {
      const processed = processNodeWithLatex(node);
      return typeof processed === 'string' ? processed :
             React.isValidElement(processed) ? React.cloneElement(processed, { key: index }) : processed;
    });
    
    return <>{result}</>;
  }
  
  // Fallback: Original HTML parsing for content without LaTeX delimiters
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // Process the document recursively
  const processNode = (node: Node): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text.trim()) return text;
      
      // Check for math content
      if (containsMath(text)) {
        const latex = htmlToLatex(text);
        try {
          // Check if this is a block-level math expression
          const isBlock = latex.trim().startsWith("\\sum") || 
                          latex.trim().startsWith("\\int") ||
                          latex.trim().startsWith("\\frac");
          
          if (isBlock) {
            return <BlockMath key={Math.random()} math={latex} />;
          }
          return <InlineMath key={Math.random()} math={latex} />;
        } catch {
          return text;
        }
      }
      return text;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Handle <sup> and <sub> specially for math
      if (tagName === "sup" || tagName === "sub") {
        const content = element.textContent || "";
        const parent = element.previousSibling;
        const prefix = parent?.textContent?.slice(-1) || "";
        
        // If this is part of a math expression, convert to LaTeX
        if (/[a-zA-Z0-9]/.test(prefix)) {
          try {
            const latex = tagName === "sup" ? `^{${content}}` : `_{${content}}`;
            return <InlineMath key={Math.random()} math={latex} />;
          } catch {
            // Fall through to normal rendering
          }
        }
      }
      
      // Process children
      const children = Array.from(node.childNodes).map((child, index) => {
        const result = processNode(child);
        return typeof result === 'string' ? result : 
               React.isValidElement(result) ? React.cloneElement(result, { key: index }) : result;
      });
      
      // Reconstruct the element with processed children
      const props: Record<string, any> = { key: Math.random() };
      
      // Copy attributes
      Array.from(element.attributes).forEach(attr => {
        let name = attr.name;
        if (name === "class") name = "className";
        if (name === "for") name = "htmlFor";
        props[name] = attr.value;
      });
      
      // Map HTML tags to React elements
      const Tag = tagName as keyof JSX.IntrinsicElements;
      
      // Skip sup/sub if we already handled them as math
      if ((tagName === "sup" || tagName === "sub") && children.some(c => React.isValidElement(c))) {
        return children;
      }
      
      // Void elements cannot have children
      const voidElements = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
      if (voidElements.includes(tagName)) {
        return <Tag {...props} />;
      }
      
      return <Tag {...props}>{children}</Tag>;
    }
    
    return null;
  };
  
  // Process the body content
  const result = Array.from(doc.body.childNodes).map((node, index) => {
    const processed = processNode(node);
    return typeof processed === 'string' ? processed :
           React.isValidElement(processed) ? React.cloneElement(processed, { key: index }) : processed;
  });
  
  return <>{result}</>;
};

export const MathContent = React.memo(({ content, className = "" }: MathContentProps) => {
  const renderedContent = useMemo(() => {
    if (!content) return null;
    
    // Check if content likely contains math
    if (!containsMath(content)) {
      // No math detected, use regular HTML rendering for performance
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    // Parse and render with KaTeX
    return parseAndRenderMath(content);
  }, [content]);
  
  return (
    <div className={`lesson-content prose prose-sm sm:prose-lg max-w-none ${className}`}>
      {renderedContent}
    </div>
  );
});

MathContent.displayName = 'MathContent';

// Convert plain text math patterns to LaTeX
const convertPlainTextMath = (text: string): string => {
  let result = text;
  
  // Convert ≈ to \approx
  result = result.replace(/≈/g, '\\approx ');
  
  // Convert Greek letters
  result = result.replace(/λ/g, '\\lambda ');
  result = result.replace(/μ/g, '\\mu ');
  result = result.replace(/σ/g, '\\sigma ');
  
  // Convert C(n,k) to \binom{n}{k}
  result = result.replace(/C\((\d+),\s*(\d+)\)/g, '\\binom{$1}{$2}');
  
  // Convert e^(-3) or e^(x) to e^{-3} or e^{x}
  result = result.replace(/e\^\(([^)]+)\)/g, 'e^{$1}');
  
  // Convert (0.90)^5 to (0.90)^{5}
  result = result.replace(/\)\^(\d+)/g, ')^{$1}');
  
  // Convert x^2 to x^{2} (simple exponents)
  result = result.replace(/([a-zA-Z0-9])\^(\d+)/g, '$1^{$2}');
  
  // Convert * to \times when surrounded by spaces
  result = result.replace(/\s\*\s/g, ' \\times ');
  
  return result;
};

// Check if text contains plain text math that needs conversion
const hasPlainTextMath = (text: string): boolean => {
  const patterns = [
    /\w\^\(?-?\d+\)?/,           // e^(-3), x^2
    /\)\^\d+/,                   // (0.90)^5
    /C\(\d+,\s*\d+\)/,           // C(5, 0)
    /≈/,                         // Approximately equal
    /λ|μ|σ/,                     // Greek letters in plain text
  ];
  return patterns.some(p => p.test(text));
};

// Lightweight inline math text component for activity questions/options
export const MathText = React.memo(({ text, className = "" }: { text: string; className?: string }) => {
  const rendered = useMemo(() => {
    if (!text) return null;
    
    // Quick check for math content
    if (!containsMath(text)) {
      return <span className={className}>{text}</span>;
    }
    
    // Check for LaTeX delimiters first
    if (hasLatexDelimiters(text)) {
      return <span className={className}>{renderWithLatexDelimiters(text)}</span>;
    }
    
    // Check for plain text math patterns that need conversion
    if (hasPlainTextMath(text)) {
      const converted = convertPlainTextMath(text);
      // Wrap the converted text with $ delimiters for inline math rendering
      // But we need to be smart - only wrap the math parts
      try {
        // If the whole text is math-like, render it all as math
        if (/^[\d\s\.\+\-\*\/\^\(\)\{\}\\a-zA-Z≈λμσ]+$/.test(converted.trim())) {
          return <InlineMath math={converted} />;
        }
        // Otherwise, try to find and render math segments
        return <span className={className}>{text}</span>;
      } catch {
        return <span className={className}>{text}</span>;
      }
    }
    
    // Convert HTML math patterns
    const latex = htmlToLatex(text);
    if (latex.includes("\\") || latex.includes("^{") || latex.includes("_{")) {
      try {
        return <InlineMath math={latex} />;
      } catch {
        return <span className={className}>{text}</span>;
      }
    }
    
    return <span className={className}>{text}</span>;
  }, [text, className]);
  
  return <>{rendered}</>;
});

MathText.displayName = 'MathText';

// Helper to check if a subject is math-related
export const isMathSubject = (subjectName: string): boolean => {
  const lowerName = subjectName.toLowerCase();
  return lowerName.includes("math") || 
         lowerName.includes("mathématiques") || 
         lowerName.includes("matematik");
};
