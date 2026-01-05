import { useState, useEffect, useCallback, useRef } from 'react';

interface Section {
  id: string;
  content: string;
  type: 'heading' | 'paragraph' | 'list' | 'box' | 'other';
}

interface UseProgressiveRevealOptions {
  autoReveal?: boolean;
  revealThreshold?: number; // 0-1, percentage of section that must be visible
  initialVisibleSections?: number;
}

export const useProgressiveReveal = (
  sections: Section[],
  options: UseProgressiveRevealOptions = {}
) => {
  const {
    autoReveal = true,
    revealThreshold = 0.8,
    initialVisibleSections = 1
  } = options;

  const [revealedSections, setRevealedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.slice(0, initialVisibleSections).forEach(s => initial.add(s.id));
    return initial;
  });
  
  const [showAll, setShowAll] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Reset when sections change
  useEffect(() => {
    const initial = new Set<string>();
    sections.slice(0, initialVisibleSections).forEach(s => initial.add(s.id));
    setRevealedSections(initial);
  }, [sections.length, initialVisibleSections]);

  const revealNext = useCallback(() => {
    setRevealedSections(prev => {
      const revealed = Array.from(prev);
      const currentIndex = sections.findIndex(s => !prev.has(s.id));
      if (currentIndex !== -1 && currentIndex < sections.length) {
        const newSet = new Set(prev);
        newSet.add(sections[currentIndex].id);
        return newSet;
      }
      return prev;
    });
  }, [sections]);

  const revealAll = useCallback(() => {
    setShowAll(true);
    setRevealedSections(new Set(sections.map(s => s.id)));
  }, [sections]);

  const isRevealed = useCallback((sectionId: string): boolean => {
    return showAll || revealedSections.has(sectionId);
  }, [revealedSections, showAll]);

  const progress = sections.length > 0 
    ? Math.round((revealedSections.size / sections.length) * 100)
    : 100;

  // Set up intersection observer for auto-reveal
  useEffect(() => {
    if (!autoReveal || showAll) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= revealThreshold) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              // Find the index of this section and reveal the next one
              const currentIndex = sections.findIndex(s => s.id === sectionId);
              if (currentIndex !== -1 && currentIndex < sections.length - 1) {
                const nextSection = sections[currentIndex + 1];
                setRevealedSections(prev => {
                  if (!prev.has(nextSection.id)) {
                    const newSet = new Set(prev);
                    newSet.add(nextSection.id);
                    return newSet;
                  }
                  return prev;
                });
              }
            }
          }
        });
      },
      { threshold: [0.5, 0.8, 1.0] }
    );

    // Observe all revealed sections
    sectionRefs.current.forEach((element, id) => {
      if (revealedSections.has(id)) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [autoReveal, showAll, revealThreshold, sections, revealedSections]);

  const registerSection = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      sectionRefs.current.set(id, element);
      if (revealedSections.has(id) && observerRef.current) {
        observerRef.current.observe(element);
      }
    } else {
      sectionRefs.current.delete(id);
    }
  }, [revealedSections]);

  return {
    revealedSections,
    isRevealed,
    revealNext,
    revealAll,
    showAll,
    progress,
    registerSection,
    totalSections: sections.length,
    revealedCount: revealedSections.size
  };
};

// Helper function to parse HTML content into sections
export const parseContentIntoSections = (htmlContent: string): Section[] => {
  if (!htmlContent) return [];
  
  const sections: Section[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  let currentSection = '';
  let sectionIndex = 0;
  
  const flushSection = (type: Section['type'] = 'paragraph') => {
    if (currentSection.trim()) {
      sections.push({
        id: `section-${sectionIndex++}`,
        content: currentSection.trim(),
        type
      });
      currentSection = '';
    }
  };
  
  const walkNodes = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // These tags start new sections
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        flushSection();
        sections.push({
          id: `section-${sectionIndex++}`,
          content: element.outerHTML,
          type: 'heading'
        });
        return;
      }
      
      // Special boxes get their own section
      if (element.classList.contains('didYouKnowBox') || 
          element.classList.contains('exerciseBox') ||
          element.classList.contains('importantBox')) {
        flushSection();
        sections.push({
          id: `section-${sectionIndex++}`,
          content: element.outerHTML,
          type: 'box'
        });
        return;
      }
      
      // Lists get their own section
      if (['ul', 'ol'].includes(tagName)) {
        flushSection();
        sections.push({
          id: `section-${sectionIndex++}`,
          content: element.outerHTML,
          type: 'list'
        });
        return;
      }
      
      // Paragraphs and divs: accumulate content
      if (['p', 'div'].includes(tagName)) {
        currentSection += element.outerHTML;
        // Flush after each paragraph for granular reveal
        if (tagName === 'p') {
          flushSection('paragraph');
        }
        return;
      }
      
      // For other elements, walk children
      element.childNodes.forEach(walkNodes);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        currentSection += text;
      }
    }
  };
  
  tempDiv.childNodes.forEach(walkNodes);
  flushSection();
  
  // If we ended up with too few sections, split by paragraphs as fallback
  if (sections.length < 2) {
    const paragraphs = htmlContent.split(/<\/p>/i).filter(p => p.trim());
    return paragraphs.map((p, i) => ({
      id: `section-${i}`,
      content: p.includes('<p') ? `${p}</p>` : `<p>${p}</p>`,
      type: 'paragraph' as const
    }));
  }
  
  return sections;
};
