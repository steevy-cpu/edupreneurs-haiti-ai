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

// Check if a string contains mathematical notation
const containsMath = (text: string): boolean => {
  const mathPatterns = [
    /<sup>/i,
    /<sub>/i,
    /&times;|&div;|&plusmn;|&le;|&ge;|&ne;|&rarr;|&infin;|&pi;|&radic;/,
    /×|÷|±|≤|≥|≠|→|∞|π|√|∑|∏|∫|∈|∉|⊂|⊃|∪|∩|∅/,
    /\^{|\_{/,
    /\\frac|\\sqrt|\\sum|\\int/,
    /sqrt\(/i,
  ];
  return mathPatterns.some(pattern => pattern.test(text));
};

// Process a text node and extract math expressions
const processTextContent = (text: string): React.ReactNode[] => {
  if (!containsMath(text)) {
    return [text];
  }
  
  const latex = htmlToLatex(text);
  
  // Try to render as math if it contains LaTeX commands
  if (latex.includes("\\") || latex.includes("^{") || latex.includes("_{")) {
    try {
      return [<InlineMath key={Math.random()} math={latex} />];
    } catch {
      // If KaTeX fails, return original text
      return [text];
    }
  }
  
  return [text];
};

// Parse HTML and replace math expressions with KaTeX components
const parseAndRenderMath = (html: string): React.ReactNode => {
  if (!html) return null;
  
  // Create a temporary container to parse HTML
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
          // Check if this is a block-level math expression (starts with newline or is standalone)
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

export const MathContent = ({ content, className = "" }: MathContentProps) => {
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
};

// Helper to check if a subject is math-related
export const isMathSubject = (subjectName: string): boolean => {
  const lowerName = subjectName.toLowerCase();
  return lowerName.includes("math") || 
         lowerName.includes("mathématiques") || 
         lowerName.includes("matematik");
};
