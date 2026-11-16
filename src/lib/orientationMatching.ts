import type { DiagnosticAnswers, Metier } from "@/types/orientation.types";

/**
 * Weights per axis: interests dominate (the student's stated passion),
 * then subjects (academic feasibility), then style and motivation.
 */
export const WEIGHTS = { interet: 40, matiere: 25, style: 20, objectif: 15 } as const;

/** Returns a 0–100 match score for one métier. */
export function scoreMetier(m: Metier, a: DiagnosticAnswers): number {
  let s = 0;
  if (a.interets.length) {
    const hits = a.interets.filter((i) => m.tags.interets.includes(i)).length;
    // One matching interest grants this axis; tag order does not imply a bonus.
    s += hits > 0 ? WEIGHTS.interet : 0;
  }
  if (a.matieres.length) {
    const hits = a.matieres.filter((x) => m.tags.matieres.includes(x)).length;
    // Normalize by selected subjects so a single fully matching subject earns 25 too.
    s += (WEIGHTS.matiere * hits) / a.matieres.length;
  }
  if (a.style && m.tags.styles.includes(a.style)) s += WEIGHTS.style;
  if (a.objectif && m.tags.objectifs.includes(a.objectif)) s += WEIGHTS.objectif;
  return Math.round(s);
}

/**
 * 3 main matches (highest scores) + 2 alternatives taken from sectors
 * NOT already in the top 3, to widen the student's horizon.
 */
export function recommend(catalogue: Metier[], a: DiagnosticAnswers) {
  const ranked = catalogue
    .map((m) => ({ metier: m, score: scoreMetier(m, a) }))
    .sort((x, y) => y.score - x.score || x.metier.titre.localeCompare(y.metier.titre));
  const principaux = ranked.slice(0, 3);
  const used = new Set(principaux.map((r) => r.metier.secteur));
  const rest = ranked.slice(3);
  const alt = rest.filter((r) => !used.has(r.metier.secteur));
  // Prefer different alternative sectors before filling any remaining position.
  const distinct = alt.filter((r, index) => alt.findIndex(x => x.metier.secteur === r.metier.secteur) === index);
  const alternatifs = [...distinct, ...rest.filter(r => !distinct.includes(r))].slice(0, 2);
  return { principaux, alternatifs };
}
