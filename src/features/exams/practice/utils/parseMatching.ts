/**
 * Matching Question Parser
 * Extracts Column A and Column B items from question text
 */

export interface MatchingItem {
  id: string;   // "1", "2", "3" for Column A; "a", "b", "c" for Column B
  text: string; // The item text
}

export interface ParsedMatching {
  columnA: MatchingItem[];
  columnB: MatchingItem[];
}

// ============= Column Split Patterns =============
const COLUMN_SPLIT_PATTERNS = [
  // Creole: "Kolòn A: ... Kolòn B: ..."
  {
    splitPattern: /Kol[òo]n\s*B\s*:?/i,
    columnAHeader: /Kol[òo]n\s*A\s*:?\s*/i,
  },
  // English: "Column A: ... Column B: ..."
  {
    splitPattern: /Column\s*B\s*:?/i,
    columnAHeader: /Column\s*A\s*:?\s*/i,
  },
  // French: "Colonne A: ... Colonne B: ..."
  {
    splitPattern: /Colonne\s*B\s*:?/i,
    columnAHeader: /Colonne\s*A\s*:?\s*/i,
  },
];

// ============= Item Extraction Patterns =============

/**
 * Extract numbered items (1, 2, 3...) from text
 * Handles formats: "1. text", "1) text", "1- text", "1 text"
 */
function extractNumberedItems(text: string): MatchingItem[] {
  const items: MatchingItem[] = [];
  
  // Pattern to match numbered items with various formats
  const pattern = /(\d+)\s*[.\-)\s]\s*([^\d]+?)(?=\d+\s*[.\-)\s]|$)/g;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const id = match[1].trim();
    const itemText = match[2].trim();
    
    if (itemText && itemText.length > 0) {
      items.push({ id, text: itemText });
    }
  }
  
  // If regex didn't work, try line-by-line parsing
  if (items.length === 0) {
    const lines = text.split(/[\n;,]/).filter(l => l.trim());
    for (const line of lines) {
      const lineMatch = line.match(/^\s*(\d+)\s*[.\-)\s]\s*(.+)/);
      if (lineMatch) {
        items.push({
          id: lineMatch[1].trim(),
          text: lineMatch[2].trim(),
        });
      }
    }
  }
  
  return items;
}

/**
 * Extract lettered items (a, b, c...) from text
 * Handles formats: "a. text", "a) text", "a- text", "a text"
 */
function extractLetteredItems(text: string): MatchingItem[] {
  const items: MatchingItem[] = [];
  
  // Pattern to match lettered items with various formats
  const pattern = /([a-zA-Z])\s*[.\-)\s]\s*([^a-zA-Z]+?)(?=[a-zA-Z]\s*[.\-)\s]|$)/g;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const id = match[1].toLowerCase().trim();
    const itemText = match[2].trim();
    
    // Only accept single letters a-z
    if (id.length === 1 && /^[a-z]$/.test(id) && itemText && itemText.length > 0) {
      items.push({ id, text: itemText });
    }
  }
  
  // If regex didn't work, try line-by-line parsing
  if (items.length === 0) {
    const lines = text.split(/[\n;]/).filter(l => l.trim());
    for (const line of lines) {
      const lineMatch = line.match(/^\s*([a-zA-Z])\s*[.\-)\s]\s*(.+)/);
      if (lineMatch && lineMatch[1].length === 1) {
        items.push({
          id: lineMatch[1].toLowerCase().trim(),
          text: lineMatch[2].trim(),
        });
      }
    }
  }
  
  return items;
}

/**
 * Parse matching question text into structured columns
 * Returns null if parsing fails (triggers fallback to text input)
 */
export function parseMatchingColumns(text: string): ParsedMatching | null {
  if (!text) return null;
  
  // Try each column split pattern
  for (const { splitPattern, columnAHeader } of COLUMN_SPLIT_PATTERNS) {
    if (!splitPattern.test(text)) continue;
    
    // Split text into Column A and Column B sections
    const parts = text.split(splitPattern);
    if (parts.length < 2) continue;
    
    // Extract Column A (remove header)
    let columnAText = parts[0].replace(columnAHeader, '').trim();
    // Extract Column B
    let columnBText = parts[1].trim();
    
    // Parse items from each column
    const columnA = extractNumberedItems(columnAText);
    const columnB = extractLetteredItems(columnBText);
    
    // Validate we got items from both columns
    if (columnA.length >= 2 && columnB.length >= 2) {
      return { columnA, columnB };
    }
  }
  
  // Fallback: Try to detect items without explicit column headers
  // Look for numbered items followed by lettered items
  const numberedItems = extractNumberedItems(text);
  const letteredItems = extractLetteredItems(text);
  
  if (numberedItems.length >= 2 && letteredItems.length >= 2) {
    return {
      columnA: numberedItems,
      columnB: letteredItems,
    };
  }
  
  // Parsing failed - return null to trigger fallback
  return null;
}

/**
 * Format matching answers for submission
 * Input: { "1": "a", "2": "c", "3": "b" }
 * Output: "1-a, 2-c, 3-b"
 */
export function formatMatchingAnswer(matches: Record<string, string>): string {
  return Object.entries(matches)
    .sort(([a], [b]) => {
      // Sort numerically for numbers, alphabetically otherwise
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    })
    .map(([num, letter]) => `${num}-${letter}`)
    .join(', ');
}
