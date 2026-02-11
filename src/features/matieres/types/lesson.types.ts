export interface LessonData {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url?: string;
  grade_level: string;
  activites_interactives?: string;
  quiz_final?: string;
  // Pre-generated audio URLs
  audio_objectif_url?: string | null;
  audio_introduction_url?: string | null;
  audio_contenu_url?: string | null;
  audio_exemples_url?: string | null;
}

export interface SiblingLesson {
  slug: string;
  title: string;
}

export interface LessonPageTemplateProps {
  lesson: LessonData;
  lessonSlug: string;
  subjectName: string;
  subjectSlug: string;
  gradeLevel: string;
  judeImage: string;
  // Navigation props
  currentLessonIndex?: number;
  totalLessons?: number;
  previousLesson?: SiblingLesson | null;
  nextLesson?: SiblingLesson | null;
  // Audio enabled for first lessons only
  isFirstLesson?: boolean;
}
