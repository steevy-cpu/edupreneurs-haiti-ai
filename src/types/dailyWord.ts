/** Canonical DailyWord type — used by student hook, admin modules, and content editor */
export interface DailyWord {
  id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  definition: string;
  example: string;
  audio_url: string | null;
  category: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;
}
