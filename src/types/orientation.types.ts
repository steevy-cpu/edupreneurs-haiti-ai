/** Orientation & Métiers — data model (MVP, static catalogue). */
export type Interet = "tech" | "sante" | "justice" | "business" | "arts" | "construction" | "environnement";
export type StyleTravail = "terrain" | "ordinateur" | "public" | "atelier" | "gestion";
export type Matiere = "maths_physique" | "sciences_exp" | "langues" | "sciences_sociales" | "informatique";
export type Objectif = "resoudre" | "aider" | "creer" | "diriger" | "defendre";
export type SerieNS = "SMP" | "SVT" | "SES" | "LLA";

export interface Metier {
  slug: string;
  titre: string;
  secteur: Interet;
  /** Weighted matching tags across the 4 diagnostic axes */
  tags: { interets: Interet[]; styles: StyleTravail[]; matieres: Matiere[]; objectifs: Objectif[] };
  quotidien: string;
  debouches: { postes: string[]; secteurs: string[]; entrepreneuriat: string };
  serie_ns: SerieNS[];
  parcours_etudes: { duree: string; diplomes: string; etablissements: string[] };
  competences: { hard: string[]; soft: string[] };
  realites: { demande: "Forte" | "Moyenne" | "Émergente"; freelance: boolean; materiel: string };
  prompt_jude: string;
}

export interface DiagnosticAnswers {
  interets: Interet[];
  style: StyleTravail | null;
  matieres: Matiere[];
  objectif: Objectif | null;
}
