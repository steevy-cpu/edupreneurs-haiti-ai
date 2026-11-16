import { z } from "zod";
import type { DiagnosticAnswers } from "@/types/orientation.types";

// Reject unknown values and duplicate choices before they can reach the scorer.
const unique = (items: string[]) => new Set(items).size === items.length;
export const answersSchema = z.object({
  interets: z.array(z.enum(["tech", "sante", "justice", "business", "arts", "construction", "environnement"])).max(3).refine(unique),
  style: z.enum(["terrain", "ordinateur", "public", "atelier", "gestion"]).nullable(),
  matieres: z.array(z.enum(["maths_physique", "sciences_exp", "langues", "sciences_sociales", "informatique"])).max(2).refine(unique),
  objectif: z.enum(["resoudre", "aider", "creer", "diriger", "defendre"]).nullable(),
}).strict();
export const emptyAnswers = (): DiagnosticAnswers => ({ interets: [], style: null, matieres: [], objectif: null });
export const completeAnswers = (a: DiagnosticAnswers) => a.interets.length > 0 && a.matieres.length > 0 && a.style !== null && a.objectif !== null;
const stateSchema = z.object({ version: z.literal(2), answers: answersSchema, step: z.number().int().min(0).max(3), completed: z.boolean(), favorites: z.array(z.string()).max(100) }).strict()
  .refine(s => !s.completed || (s.answers.interets.length > 0 && s.answers.matieres.length > 0 && s.answers.style !== null && s.answers.objectif !== null));
// Explicit domain types avoid Zod's optional-field inference with this project's TS settings.
export interface OrientationState { version: 2; answers: DiagnosticAnswers; step: number; completed: boolean; favorites: string[] }
export const emptyState = (): OrientationState => ({ version: 2, answers: emptyAnswers(), step: 0, completed: false, favorites: [] });
// No anonymous fallback: an unowned v1 result must never become another student's result.
export const storageKey = (userId: string) => `orientation-v2:${userId}`;
export function readOrientation(storage: Pick<Storage, "getItem">, userId: string): OrientationState {
  try {
    const parsed = stateSchema.safeParse(JSON.parse(storage.getItem(storageKey(userId)) ?? "null"));
    return parsed.success ? parsed.data as OrientationState : emptyState();
  } catch { return emptyState(); }
}
export function writeOrientation(storage: Pick<Storage, "setItem">, userId: string, state: OrientationState): boolean {
  try { storage.setItem(storageKey(userId), JSON.stringify(stateSchema.parse(state))); return true; }
  catch { return false; } // Private mode/full storage must not stop the questionnaire.
}
export const normalizeSearch = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim();