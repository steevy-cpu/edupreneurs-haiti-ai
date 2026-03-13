/**
 * @file courseHelpers.ts
 * @description Shared constants, interfaces, and helpers for course/lesson pages (month ordering, HTML stripping, lesson grouping).
 * @module utils
 *
 * @example
 * const groups = groupLessonsByMonth(lessons); // → { "Octobre": [...], "Novembre": [...] }
 */

// Standard month order for lessons
export const MONTH_ORDER = [
  "Octobre",
  "Novembre", 
  "Décembre", 
  "Janvier", 
  "Février", 
  "Mars", 
  "Avril", 
  "Mai", 
  "Juin"
];

// Month colors for visual styling
export const MONTH_COLORS: Record<string, string> = {
  "Octobre": "from-orange-500 to-amber-500",
  "Novembre": "from-amber-500 to-yellow-500",
  "Décembre": "from-blue-500 to-indigo-500",
  "Janvier": "from-cyan-500 to-blue-500",
  "Février": "from-purple-500 to-pink-500",
  "Mars": "from-green-500 to-emerald-500",
  "Avril": "from-teal-500 to-cyan-500",
  "Mai": "from-rose-500 to-pink-500",
  "Juin": "from-amber-500 to-orange-500",
  "Sans mois": "from-gray-500 to-slate-500"
};

/**
 * Removes HTML tags from a string, using DOM parsing when available.
 * @param html - Raw HTML string to strip
 * @returns Plain text with all HTML tags removed
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  // Create a temporary element and use textContent for safer HTML stripping
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  // Fallback for SSR or when document is not available
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Groups lessons by their month property, normalizing weekly formats to parent month.
 * @param lessons - Array of lesson objects with optional mois field
 * @returns Record mapping month names to arrays of lessons
 */
export const groupLessonsByMonth = <T extends { mois?: string | null }>(
  lessons: T[]
): Record<string, T[]> => {
  return lessons.reduce((acc, lesson) => {
    let month = lesson.mois || "Sans mois";
    
    // Normalize weekly format: "Décembre - Semaine 1" -> "Décembre"
    const weeklyMatch = month.match(/^(\S+)\s*-\s*Semaines?\b/);
    if (weeklyMatch) {
      month = weeklyMatch[1];
    }
    
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Interface for a basic lesson
 */
export interface BaseLesson {
  id: string;
  title: string;
  slug: string;
  objectif?: string | null;
  mois?: string | null;
  order_index: number;
  is_published?: boolean | null;
  introduction?: string | null;
  contenu?: string | null;
  exemples_exercices?: string | null;
  activites_interactives?: string | null;
  quiz_final?: string | null;
  youtube_url?: string | null;
  grade_level?: string;
}

/**
 * Interface for a subject
 */
export interface BaseSubject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  grade_level: string;
  icon_name?: string | null;
  color?: string | null;
  lesson_count?: number | null;
  exercise_count?: number | null;
}

/**
 * Gets the appropriate Eric image based on subject name
 */
export const getEricImageForSubject = (subjectName: string): string => {
  const lower = subjectName.toLowerCase();
  
  if (lower.includes('mathématique') || lower.includes('matematik')) {
    return 'eric-math';
  }
  if (lower.includes('informatique')) {
    return 'eric-computer';
  }
  if (lower.includes('chimie') || lower.includes('physique')) {
    return 'eric-scientist';
  }
  if (lower.includes('biologie') || lower.includes('géologie') || lower.includes('sciences')) {
    return 'eric-biologist';
  }
  
  return 'eric-teaching';
};

/**
 * Truncates text to a specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  const stripped = stripHtml(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
};
