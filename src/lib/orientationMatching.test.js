import { describe, test, expect } from "bun:test";
import { scoreMetier, recommend, WEIGHTS } from "./orientationMatching";
import { METIERS } from "../data/metiersData";
import { answersSchema, emptyState, readOrientation, writeOrientation, storageKey, normalizeSearch } from "./orientationStorage";

const answers = { interets: ["tech"], style: "ordinateur", matieres: ["informatique"], objectif: "creer" };
describe("orientation rules", () => {
  test("weights stay 40/25/20/15", () => expect(WEIGHTS).toEqual({ interet: 40, matiere: 25, style: 20, objectif: 15 }));
  test("one matching subject earns 25", () => expect(scoreMetier(METIERS[0], { interets: [], style: null, objectif: null, matieres: ["informatique"] })).toBe(25));
  test("two matching subjects earn 25", () => expect(scoreMetier(METIERS[0], { interets: [], style: null, objectif: null, matieres: ["informatique", "maths_physique"] })).toBe(25));
  test("three interests maximum", () => expect(answersSchema.safeParse({ ...answers, interets: ["tech", "sante", "arts", "justice"] }).success).toBe(false));
  test("two subjects maximum", () => expect(answersSchema.safeParse({ ...answers, matieres: ["informatique", "langues", "sciences_exp"] }).success).toBe(false));
  test("invalid/duplicate choices rejected", () => {
    expect(answersSchema.safeParse({ ...answers, style: "unknown" }).success).toBe(false);
    expect(answersSchema.safeParse({ ...answers, interets: ["tech", "tech"] }).success).toBe(false);
  });
  test("three main and two distinct alternatives", () => {
    const r = recommend(METIERS, answers);
    expect(r.principaux).toHaveLength(3); expect(r.alternatifs).toHaveLength(2);
    expect(new Set([...r.principaux, ...r.alternatifs].map(x => x.metier.slug)).size).toBe(5);
    expect(new Set(r.alternatifs.map(x => x.metier.secteur)).size).toBe(2);
    expect(r.alternatifs.every(a => r.principaux.every(p => p.metier.secteur !== a.metier.secteur))).toBe(true);
  });
  test("account isolation and unowned legacy data", () => {
    const values = new Map([["orientation-diagnostic-v1", JSON.stringify(answers)]]);
    const storage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v); } };
    writeOrientation(storage, "student-a", { ...emptyState(), answers, completed: true });
    expect(readOrientation(storage, "student-a").completed).toBe(true);
    expect(readOrientation(storage, "student-b")).toEqual(emptyState());
  });
  test("corrupt and incomplete completed states rejected", () => {
    expect(readOrientation({ getItem: () => "{" }, "a")).toEqual(emptyState());
    expect(readOrientation({ getItem: () => JSON.stringify({ ...emptyState(), completed: true }) }, "a")).toEqual(emptyState());
  });
  test("draft survives and storage failures do not throw", () => {
    const state = { ...emptyState(), answers, step: 2 };
    expect(readOrientation({ getItem: k => k === storageKey("a") ? JSON.stringify(state) : null }, "a").step).toBe(2);
    expect(writeOrientation({ setItem: () => { throw Error("full"); } }, "a", state)).toBe(false);
  });
  test("accent insensitive search", () => expect(normalizeSearch(" Ingénieur ")).toBe("ingenieur"));
});