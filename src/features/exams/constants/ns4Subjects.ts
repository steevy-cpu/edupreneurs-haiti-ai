/**
 * Shared subject lists for NS4 and 9AF exam tracks.
 * Single source of truth — used by both admin upload and student hub.
 */

/** NS4 subjects organized by Baccalauréat series */
export const NS4_SUBJECTS_BY_SERIES: Record<string, string[]> = {
  SVT: ["SVT", "Chimie", "Physique", "Mathématiques", "Philosophie", "Histoire-Géographie", "Anglais", "Espagnol", "Créole"],
  SMP: ["Mathématiques", "Physique", "Chimie", "SVT", "Philosophie", "Histoire-Géographie", "Anglais", "Espagnol", "Créole"],
  SES: ["Économie", "Histoire-Géographie", "Mathématiques", "Philosophie", "SVT", "Physique", "Chimie", "Anglais", "Espagnol", "Créole"],
  LLA: ["Arts et Musique", "Philosophie", "Histoire-Géographie", "SVT", "Anglais", "Espagnol", "Mathématiques", "Chimie", "Créole"],
};

/** 9AF (9ème Année Fondamentale) subject list */
export const SUBJECTS_9AF = [
  "Mathématiques",
  "Français",
  "Sciences Expérimentales",
  "Sciences Sociales",
  "Anglais",
  "Espagnol",
  "Créole",
];
