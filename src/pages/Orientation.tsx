import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ArrowLeft, Compass, Heart, Search, GitCompare, Trash2 } from "lucide-react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { METIERS, SECTEURS } from "@/data/metiersData";
import { recommend } from "@/lib/orientationMatching";
import { completeAnswers, emptyAnswers, emptyState, normalizeSearch, readOrientation, storageKey, writeOrientation, type OrientationState } from "@/lib/orientationStorage";
import { MetierDetails } from "@/components/orientation/MetierDetails";
import type { DiagnosticAnswers, Interet, Matiere, Metier, Objectif, StyleTravail } from "@/types/orientation.types";

const STYLES: Record<StyleTravail, string> = {
  terrain: "Sur le terrain, en mouvement", ordinateur: "Devant un ordinateur", public: "En contact avec le public",
  atelier: "En atelier ou laboratoire", gestion: "En gestion d'équipe",
};
const MATIERES: Record<Matiere, string> = {
  maths_physique: "Maths & Physique", sciences_exp: "SVT & Chimie", langues: "Langues & Littérature",
  sciences_sociales: "Sciences sociales & Histoire", informatique: "Informatique",
};
const OBJECTIFS: Record<Objectif, string> = {
  resoudre: "Résoudre des problèmes techniques", aider: "Aider directement les autres", creer: "Créer et innover",
  diriger: "Diriger des projets", defendre: "Défendre des causes",
};

// Fixed labels and enumerated answers are the only questionnaire context sent to Jude.
function matchReasons(m: Metier, a: DiagnosticAnswers) {
  const reasons: string[] = [];
  const interests = a.interets.filter(i => m.tags.interets.includes(i));
  if (interests.length) reasons.push(`Tes intérêts : ${interests.map(i => SECTEURS[i]).join(", ")}`);
  const subjects = a.matieres.filter(i => m.tags.matieres.includes(i));
  if (subjects.length) reasons.push(`Tes matières : ${subjects.map(i => MATIERES[i]).join(", ")}`);
  if (a.style && m.tags.styles.includes(a.style)) reasons.push(STYLES[a.style]);
  if (a.objectif && m.tags.objectifs.includes(a.objectif)) reasons.push(OBJECTIFS[a.objectif]);
  return reasons;
}

// Keyed by account so state never flashes another student's local results on account changes.
export default function Orientation() {
  const { user } = useSessionAuth();
  return <OrientationWorkspace key={user?.id ?? "temporary"} userId={user?.id} />;
}

function OrientationWorkspace({ userId }: { userId?: string }) {
  const [state, setState] = useState<OrientationState>(() => {
    try { return userId ? readOrientation(localStorage, userId) : emptyState(); } catch { return emptyState(); }
  });
  const [view, setView] = useState<"home" | "quiz" | "results" | "catalogue" | "favorites">(state.completed ? "results" : "home");
  const [storageFailed, setStorageFailed] = useState(false);
  const [open, setOpen] = useState<Metier | null>(null);
  const [query, setQuery] = useState("");
  const [secteur, setSecteur] = useState<Interet | "all">("all");
  const [comparison, setComparison] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const { answers, step } = state;
  const results = useMemo(() => recommend(METIERS, answers), [answers]);
  const update = (next: OrientationState) => {
    setState(next);
    if (userId) {
      // Even accessing localStorage can throw in privacy-restricted browsers.
      try { setStorageFailed(!writeOrientation(localStorage, userId, next)); } catch { setStorageFailed(true); }
    }
  };
  const setAnswers = (next: DiagnosticAnswers) => update({ ...state, answers: next, completed: false });
  const toggle = <T,>(list: T[], value: T, max: number) => list.includes(value) ? list.filter(x => x !== value) : list.length < max ? [...list, value] : list;
  const restart = () => { update({ ...state, answers: emptyAnswers(), step: 0, completed: false }); setView("quiz"); };
  const erase = () => {
    // Delete only this account's orientation data, never shared application caches.
    try { if (userId) localStorage.removeItem(storageKey(userId)); } catch { setStorageFailed(true); }
    setState(emptyState()); setComparison([]); setView("home");
  };
  const canNext = [answers.interets.length > 0, answers.style !== null, answers.matieres.length > 0, answers.objectif !== null][step];
  const next = () => {
    if (!canNext) return;
    if (step < 3) update({ ...state, step: step + 1 });
    else if (completeAnswers(answers)) { update({ ...state, completed: true }); setView("results"); }
  };
  const askJude = (m: Metier) => {
    const reasons = matchReasons(m, answers);
    setOpen(null);
    // Explicitly close the sheet; no DOM button-detection side effects.
    window.dispatchEvent(new CustomEvent("jude:open", { detail: { prompt: `${m.prompt_jude}${reasons.length ? ` Mes préférences : ${reasons.join(" ; ")}.` : ""} Propose une première activité accessible, sans garantir un emploi ou une admission.` } }));
  };
  const search = normalizeSearch(query);
  const filtered = METIERS.filter(m => (secteur === "all" || m.secteur === secteur) && normalizeSearch([m.titre, SECTEURS[m.secteur], ...m.competences.hard, ...m.debouches.postes].join(" ")).includes(search) && (view !== "favorites" || state.favorites.includes(m.slug)));
  const choices = <T extends string,>(labels: Record<T, string>, selected: T[], onSelect: (key: T) => void, max: number) => <div className="grid gap-2" role="group" aria-label="Choix de réponse">{(Object.keys(labels) as T[]).map(k => <Button key={k} variant={selected.includes(k) ? "secondary" : "outline"} aria-pressed={selected.includes(k)} disabled={selected.length >= max && !selected.includes(k)} className="justify-start text-left whitespace-normal h-auto min-h-11 py-3" onClick={() => onSelect(k)}>{labels[k]}</Button>)}</div>;
  const steps = [
    { title: "Qu'est-ce qui t'attire ?", hint: `${answers.interets.length}/3 choix · ${3 - answers.interets.length} restant(s)${answers.interets.length === 3 ? " · Maximum atteint" : ""}`, body: choices(SECTEURS, answers.interets, k => setAnswers({ ...answers, interets: toggle(answers.interets, k, 3) }), 3) },
    { title: "Où te vois-tu travailler ?", hint: "Choisis un environnement.", body: choices(STYLES, answers.style ? [answers.style] : [], k => setAnswers({ ...answers, style: k }), 10) },
    { title: "Tes matières préférées ou fortes ?", hint: `${answers.matieres.length}/2 choix · ${2 - answers.matieres.length} restant(s)${answers.matieres.length === 2 ? " · Maximum atteint" : ""}`, body: choices(MATIERES, answers.matieres, k => setAnswers({ ...answers, matieres: toggle(answers.matieres, k, 2) }), 2) },
    { title: "Qu'est-ce qui te motive ?", hint: "Choisis ta motivation principale.", body: choices(OBJECTIFS, answers.objectif ? [answers.objectif] : [], k => setAnswers({ ...answers, objectif: k }), 10) },
  ];
  const card = (m: Metier, score?: number) => <article key={m.slug} className="border border-border rounded-lg bg-card p-4 space-y-3">
    <Button variant="ghost" className="px-0 h-auto w-full justify-start text-left whitespace-normal" onClick={() => setOpen(m)}><span className="min-w-0"><span className="block font-semibold">{m.titre}</span><span className="block text-xs font-normal text-muted-foreground mt-1">{SECTEURS[m.secteur]}</span></span></Button>
    {score !== undefined && <><Badge variant="secondary">{score >= 70 ? "Plusieurs affinités" : score >= 40 ? "Des points communs" : "Piste à explorer"}</Badge><ul className="text-sm text-muted-foreground space-y-1">{matchReasons(m, answers).map(r => <li key={r}>{r}</li>)}</ul>{score < 40 && <p className="text-sm text-muted-foreground">Peu de correspondances avec tes réponses ; découvre ce métier avant de te décider.</p>}</>}
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="icon" aria-label={`${state.favorites.includes(m.slug) ? "Retirer des" : "Ajouter aux"} favoris : ${m.titre}`} title="Favori" aria-pressed={state.favorites.includes(m.slug)} onClick={() => update({ ...state, favorites: toggle(state.favorites, m.slug, 100) })}><Heart className={`h-4 w-4 ${state.favorites.includes(m.slug) ? "fill-primary text-primary" : ""}`} /></Button>
      <Button variant={comparison.includes(m.slug) ? "secondary" : "outline"} size="sm" aria-pressed={comparison.includes(m.slug)} disabled={comparison.length === 2 && !comparison.includes(m.slug)} onClick={() => setComparison(toggle(comparison, m.slug, 2))}><GitCompare className="h-4 w-4 mr-2" />{comparison.includes(m.slug) ? "Sélectionné" : "Comparer"}</Button>
    </div>
  </article>;
  const selected = METIERS.filter(m => comparison.includes(m.slug));
  // Reserve the shell's mobile menu and Jude avatar area instead of overlapping the title.
  return <div className="max-w-3xl mx-auto px-4 pt-16 lg:pt-6 pb-28 space-y-6">
    <Helmet><title>Orientation & Métiers — Edupreneurs</title><meta name="description" content="Explore des métiers et des parcours de formation en Haïti avec Edupreneurs." /></Helmet>
    <header className="space-y-2 pr-24 lg:pr-0"><h1 className="text-2xl font-bold">Orientation & Métiers</h1><p className="text-muted-foreground">Des pistes pour ton avenir, à explorer à ton rythme.</p></header>
    {!userId && <p role="status" className="text-sm text-muted-foreground">Tes choix restent temporaires tant que ton compte n'est pas connecté.</p>}
    {storageFailed && <p role="status" className="text-sm text-destructive">L'appareil n'a pas pu sauvegarder tes choix. Tu peux continuer ici.</p>}
    <nav className="flex flex-wrap gap-2" aria-label="Parcours d'orientation"><Button variant={view === "home" ? "secondary" : "ghost"} size="sm" onClick={() => setView("home")}><Compass className="mr-2 h-4 w-4" />Découverte</Button><Button variant={view === "catalogue" ? "secondary" : "ghost"} size="sm" onClick={() => setView("catalogue")}><Search className="mr-2 h-4 w-4" />Catalogue</Button><Button variant={view === "favorites" ? "secondary" : "ghost"} size="sm" onClick={() => setView("favorites")}><Heart className="mr-2 h-4 w-4" />Favoris ({state.favorites.length})</Button></nav>
    {view === "home" && <section className="space-y-4 border-t border-border pt-5"><h2 className="text-xl font-semibold">Parcours Découverte</h2><p className="text-muted-foreground">Quatre questions pour découvrir trois pistes et deux alternatives. Ce n'est pas un test psychologique : tes envies peuvent évoluer.</p><div className="flex flex-wrap gap-2"><Button onClick={() => { if (answers.interets.length || step > 0) setView("quiz"); else restart(); }}>{state.completed ? "Modifier mes réponses" : answers.interets.length || step > 0 ? "Reprendre le questionnaire" : "Commencer"}</Button>{state.completed && <Button variant="outline" onClick={() => setView("results")}>Mes résultats</Button>}</div></section>}
    {view === "quiz" && <section className="space-y-4"><Progress value={((step + 1) / 4) * 100} /><p className="text-sm text-muted-foreground">Étape {step + 1} sur 4</p><h2 className="text-xl font-semibold">{steps[step].title}</h2><p role="status" className="text-sm text-muted-foreground">{steps[step].hint}</p>{steps[step].body}<div className="flex gap-2">{step > 0 && <Button variant="outline" onClick={() => update({ ...state, step: step - 1 })}><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>}<Button className="flex-1" disabled={!canNext} onClick={next}>{step < 3 ? "Suivant" : "Voir mes métiers"}</Button></div></section>}
    {view === "results" && <section className="space-y-4"><h2 className="text-xl font-semibold">Tes métiers recommandés</h2><p className="text-sm text-muted-foreground">Des affinités avec tes choix, pas une mesure de tes capacités ni une garantie de réussite.</p><div className="grid gap-3 sm:grid-cols-2">{results.principaux.map(r => card(r.metier, r.score))}</div><h3 className="font-semibold">Pour élargir ton horizon</h3><div className="grid gap-3 sm:grid-cols-2">{results.alternatifs.map(r => card(r.metier, r.score))}</div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { update({ ...state, step: 0 }); setView("quiz"); }}>Modifier mes réponses</Button><Button variant="ghost" onClick={restart}>Recommencer</Button></div></section>}
    {(view === "catalogue" || view === "favorites") && <section className="space-y-4"><h2 className="text-xl font-semibold">{view === "favorites" ? "Mes métiers favoris" : "Catalogue des métiers"}</h2><Input aria-label="Rechercher un métier" placeholder="Métier, secteur ou compétence…" value={query} onChange={e => setQuery(e.target.value)} /><div className="flex flex-wrap gap-2" role="group" aria-label="Secteurs"><Button size="sm" variant={secteur === "all" ? "secondary" : "outline"} aria-pressed={secteur === "all"} onClick={() => setSecteur("all")}>Tous</Button>{(Object.keys(SECTEURS) as Interet[]).map(k => <Button key={k} size="sm" className="h-auto min-h-9 whitespace-normal" variant={secteur === k ? "secondary" : "outline"} aria-pressed={secteur === k} onClick={() => setSecteur(k)}>{SECTEURS[k]}</Button>)}</div><p className="text-sm text-muted-foreground" role="status">{filtered.length} métier(s)</p><div className="grid gap-3 sm:grid-cols-2">{filtered.map(m => card(m))}</div>{!filtered.length && <div className="space-y-3 text-center py-6"><p className="text-muted-foreground">{view === "favorites" && !state.favorites.length ? "Tu n'as pas encore de favori." : "Aucun métier ne correspond à ces filtres."}</p><Button variant="outline" onClick={() => { setQuery(""); setSecteur("all"); if (!state.favorites.length) setView("catalogue"); }}>Voir tous les métiers</Button></div>}</section>}
    {comparison.length > 0 && <div className="flex items-center gap-3 flex-wrap border-t border-border pt-4"><p className="text-sm">{comparison.length}/2 métiers sélectionnés</p><Button disabled={comparison.length !== 2} onClick={() => setCompareOpen(true)}><GitCompare className="h-4 w-4 mr-2" />Comparer les métiers</Button><Button variant="ghost" size="sm" onClick={() => setComparison([])}>Effacer la sélection</Button></div>}
    {/* This longer destructive action must wrap even in a narrow mobile shell. */}
    <div className="border-t border-border pt-4"><Button variant="ghost" size="sm" className="text-muted-foreground whitespace-normal h-auto min-h-9 max-w-full text-left" onClick={() => { if (window.confirm("Supprimer tes réponses et favoris d'orientation sur cet appareil ?")) erase(); }}><Trash2 className="h-4 w-4 mr-2" />Supprimer mes données d'orientation</Button></div>
    <Sheet open={open !== null} onOpenChange={value => { if (!value) setOpen(null); }}><SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto z-[1100]"><div className="max-w-3xl mx-auto">{open && <><SheetHeader className="mb-4 text-left"><SheetTitle className="pr-8">{open.titre}</SheetTitle><SheetDescription>Un métier à explorer ; confirme les formations et les conditions auprès des organismes concernés.</SheetDescription></SheetHeader><MetierDetails metier={open} onAsk={() => askJude(open)} /></>}</div></SheetContent></Sheet>
    <Sheet open={compareOpen} onOpenChange={setCompareOpen}><SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto z-[1100]"><SheetHeader className="mb-4"><SheetTitle>Comparer deux métiers</SheetTitle><SheetDescription>Des repères indicatifs pour réfléchir à tes préférences.</SheetDescription></SheetHeader><div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto pb-8">{selected.map(m => <section key={m.slug} className="space-y-3 min-w-0"><h3 className="font-semibold text-primary">{m.titre}</h3><p className="text-sm"><strong>Quotidien :</strong> {m.quotidien}</p><p className="text-sm"><strong>Parcours à confirmer :</strong> {m.parcours_etudes.diplomes} — {m.parcours_etudes.duree}</p><p className="text-sm"><strong>Compétences :</strong> {m.competences.hard.join(", ")}</p><p className="text-sm"><strong>Matériel indicatif :</strong> {m.realites.materiel}</p></section>)}</div></SheetContent></Sheet>
  </div>;
}
