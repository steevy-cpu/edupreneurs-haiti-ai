import type { SerieNS } from "@/types/orientation.types";

// Sources cover only the claims named below, not current admissions or job demand.
export const SERIES: Record<SerieNS, string> = {
  SMP: "Sciences mathématiques et physiques", SVT: "Sciences de la vie et de la Terre",
  SES: "Sciences économiques et sociales", LLA: "Lettres, langues et arts",
};
export const GUIDANCE: Record<string, { activity: string; skill: string }> = {
  "developpeur-web": { skill: "Logique", activity: "Sur papier, dessine les écrans d'un site utile à ton école et décris leur fonctionnement." },
  "analyste-donnees": { skill: "Statistiques", activity: "Relève cinq durées de trajet et calcule leur moyenne sur papier." },
  medecin: { skill: "Biologie", activity: "Dessine un organe et explique son rôle avec ton cours de SVT ; ne propose pas de traitement." },
  infirmier: { skill: "Écoute", activity: "Avec une personne de confiance, reformule ce qu'elle te raconte sans la juger ; ne pratique aucun soin." },
  avocat: { skill: "Argumentation", activity: "Écris deux arguments pour et contre une règle de vie scolaire." },
  diplomate: { skill: "Expression", activity: "Résume un sujet d'actualité et distingue les faits des opinions." },
  comptable: { skill: "Calcul", activity: "Construis sur papier le budget fictif d'une petite boutique." },
  entrepreneur: { skill: "Organisation", activity: "Choisis un besoin local et note une idée de service, ses coûts et ses limites." },
  graphiste: { skill: "Créativité", activity: "Dessine une affiche lisible pour un événement fictif de ton école." },
  journaliste: { skill: "Rédaction", activity: "Rédige un court article sur ton école sans noms ni données personnelles." },
  "genie-civil": { skill: "Physique", activity: "Dessine un pont et repère les forces à partir de ton cours, sans essai sur une vraie construction." },
  "electricien-solaire": { skill: "Électricité", activity: "Dessine le trajet de l'énergie dans une installation solaire ; ne manipule pas de circuit électrique." },
  agronome: { skill: "Observation", activity: "Observe une plante pendant une semaine et note ses changements." },
  environnementaliste: { skill: "Écologie", activity: "Liste les déchets observés dans un lieu sûr et propose trois pistes de réduction." },
};
export const ORIENTATION_SOURCES = [
  { title: "UEH — Guide d'admission", url: "https://admission.ueh.edu.ht/instructions", scope: "Conditions générales : vérifier la campagne en cours." },
  { title: "INFP — Centres de formation", url: "https://www.infp.gouv.ht/centres", scope: "Annuaire des centres ; confirmer la filière et son accréditation." },
];
export const SPECIFIC_SOURCES: Record<string, { title: string; url: string; note: string }> = {
  agronome: { title: "UEH — FAMV", url: "https://www.ueh.edu.ht/facultes/famv.php", note: "La page décrit cinq années de formation. Le portail d'admission mentionne aussi un mémoire et un service civique : confirmer le calendrier complet." },
  medecin: { title: "UEH — Médecine", url: "https://www.ueh.edu.ht/facultes/fmp.php", note: "La page décrit dix semestres, un internat puis un service social ; confirmer le cursus actuel et les autorisations d'exercice." },
};