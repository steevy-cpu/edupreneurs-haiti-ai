import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Briefcase, Compass, GraduationCap, MessageCircle, Search, Sparkles, Wrench, TrendingUp, Sun } from "lucide-react";
import { METIERS, SECTEURS } from "@/data/metiersData";
import { recommend } from "@/lib/orientationMatching";
import type { DiagnosticAnswers, Interet, Matiere, Metier, Objectif, StyleTravail } from "@/types/orientation.types";

// Results persisted locally so the student finds them again without a network call (3G-first).
const STORAGE_KEY = "orientation-diagnostic-v1";

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

const EMPTY: DiagnosticAnswers = { interets: [], style: null, matieres: [], objectif: null };

function loadSaved(): DiagnosticAnswers | null {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/** Opens the shell-level Jude chat with the métier's starter question pre-filled. */
const askJude = (prompt: string) => window.dispatchEvent(new CustomEvent("jude:open", { detail: { prompt } }));

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card hover:border-primary/50"}`}>
      {children}
    </button>
  );
}

function FicheMetier({ m }: { m: Metier }) {
  const block = (icon: React.ReactNode, title: string, body: React.ReactNode) => (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 font-semibold text-primary">{icon}{title}</h3>
      <div className="text-sm text-muted-foreground space-y-1">{body}</div>
    </section>
  );
  return (
    <div className="space-y-5 pb-6">
      {block(<Sun className="h-4 w-4" />, "Le quotidien du métier", <p>{m.quotidien}</p>)}
      {block(<Briefcase className="h-4 w-4" />, "Ce que tu pourras faire avec", <>
        <p><strong className="text-foreground">Postes :</strong> {m.debouches.postes.join(", ")}</p>
        <p><strong className="text-foreground">Qui recrute :</strong> {m.debouches.secteurs.join(", ")}</p>
        <p><strong className="text-foreground">Entrepreneuriat :</strong> {m.debouches.entrepreneuriat}</p>
      </>)}
      {block(<GraduationCap className="h-4 w-4" />, "Le chemin pour y arriver", <>
        <p><strong className="text-foreground">Série conseillée (NS1–NS4) :</strong> {m.serie_ns.join(" ou ")}</p>
        <p><strong className="text-foreground">Après le bac :</strong> {m.parcours_etudes.diplomes} — {m.parcours_etudes.duree}</p>
        <p><strong className="text-foreground">Où étudier :</strong> {m.parcours_etudes.etablissements.join(", ")}</p>
      </>)}
      {block(<Wrench className="h-4 w-4" />, "Compétences & qualités clés", <>
        <p><strong className="text-foreground">Savoir-faire :</strong> {m.competences.hard.join(", ")}</p>
        <p><strong className="text-foreground">Qualités humaines :</strong> {m.competences.soft.join(", ")}</p>
      </>)}
      {block(<TrendingUp className="h-4 w-4" />, "Réalités du terrain", <>
        <p><strong className="text-foreground">Demande en Haïti :</strong> {m.realites.demande}</p>
        <p><strong className="text-foreground">Freelance possible :</strong> {m.realites.freelance ? "Oui" : "Rarement"}</p>
        <p><strong className="text-foreground">Investissement :</strong> {m.realites.materiel}</p>
      </>)}
      <Button className="w-full" onClick={() => askJude(m.prompt_jude)}>
        <MessageCircle className="h-4 w-4 mr-2" /> Discuter de ce métier avec Jude
      </Button>
    </div>
  );
}

function MetierCard({ m, score, onOpen }: { m: Metier; score?: number; onOpen: () => void }) {
  return (
    <Card className="cursor-pointer hover:border-primary/60 transition-colors" onClick={onOpen}>
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">{m.titre}</p>
          <p className="text-xs text-muted-foreground">{SECTEURS[m.secteur]}</p>
        </div>
        {score !== undefined && <Badge variant="secondary" className="shrink-0">{score}%</Badge>}
      </CardContent>
    </Card>
  );
}

export default function Orientation() {
  const saved = useMemo(loadSaved, []);
  const [view, setView] = useState<"home" | "quiz" | "results" | "catalogue">(saved ? "results" : "home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswers>(saved ?? EMPTY);
  const [open, setOpen] = useState<Metier | null>(null);
  const [query, setQuery] = useState("");
  const [secteur, setSecteur] = useState<Interet | "all">("all");

  const results = useMemo(() => recommend(METIERS, answers), [answers]);

  const toggle = <T,>(list: T[], v: T, max: number) =>
    list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v];

  const canNext = [answers.interets.length > 0, !!answers.style, answers.matieres.length > 0, !!answers.objectif][step];

  const next = () => {
    if (step < 3) return setStep(step + 1);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* storage full / private mode */ }
    setView("results");
  };
  const restart = () => { setAnswers(EMPTY); setStep(0); setView("quiz"); };

  const filtered = METIERS.filter((m) =>
    (secteur === "all" || m.secteur === secteur) && m.titre.toLowerCase().includes(query.toLowerCase()));

  const steps = [
    { title: "Qu'est-ce qui t'attire ?", hint: "Choisis jusqu'à 3 domaines.", body:
      (Object.keys(SECTEURS) as Interet[]).map((k) => (
        <Choice key={k} active={answers.interets.includes(k)} onClick={() => setAnswers({ ...answers, interets: toggle(answers.interets, k, 3) })}>{SECTEURS[k]}</Choice>)) },
    { title: "Où te vois-tu travailler ?", hint: "Un seul choix.", body:
      (Object.keys(STYLES) as StyleTravail[]).map((k) => (
        <Choice key={k} active={answers.style === k} onClick={() => setAnswers({ ...answers, style: k })}>{STYLES[k]}</Choice>)) },
    { title: "Tes matières fortes ?", hint: "Jusqu'à 2 choix.", body:
      (Object.keys(MATIERES) as Matiere[]).map((k) => (
        <Choice key={k} active={answers.matieres.includes(k)} onClick={() => setAnswers({ ...answers, matieres: toggle(answers.matieres, k, 2) })}>{MATIERES[k]}</Choice>)) },
    { title: "Qu'est-ce qui te motive ?", hint: "Un seul choix.", body:
      (Object.keys(OBJECTIFS) as Objectif[]).map((k) => (
        <Choice key={k} active={answers.objectif === k} onClick={() => setAnswers({ ...answers, objectif: k })}>{OBJECTIFS[k]}</Choice>)) },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
      {view !== "home" && (
        <Button variant="ghost" size="sm" onClick={() => setView("home")}><ArrowLeft className="h-4 w-4 mr-1" /> Orientation</Button>
      )}

      {view === "home" && (
        <>
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">Orientation & Métiers</h1>
            <p className="text-muted-foreground">Salut ! Découvre les métiers qui te correspondent et le chemin pour y arriver en Haïti.</p>
          </header>
          <Card className="border-primary/40"><CardContent className="p-5 space-y-3">
            <Compass className="h-8 w-8 text-primary" />
            <h2 className="font-semibold text-lg">Parcours Découverte</h2>
            <p className="text-sm text-muted-foreground">4 questions, moins de 3 minutes. Tu obtiens 3 métiers recommandés et 2 pistes alternatives.</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={restart}>{saved ? "Refaire le test" : "Commencer"}</Button>
              {saved && <Button variant="outline" onClick={() => setView("results")}>Voir mes résultats</Button>}
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-5 space-y-3">
            <Search className="h-8 w-8 text-accent" />
            <h2 className="font-semibold text-lg">Explorer les métiers</h2>
            <p className="text-sm text-muted-foreground">Parcours le catalogue par secteur et ouvre chaque fiche métier.</p>
            <Button variant="outline" onClick={() => setView("catalogue")}>Voir le catalogue</Button>
          </CardContent></Card>
        </>
      )}

      {view === "quiz" && (
        <div className="space-y-4">
          <Progress value={((step + 1) / 4) * 100} />
          <p className="text-xs text-muted-foreground">Étape {step + 1} sur 4</p>
          <h2 className="text-xl font-bold">{steps[step].title}</h2>
          <p className="text-sm text-muted-foreground">{steps[step].hint}</p>
          <div className="grid gap-2">{steps[step].body}</div>
          <div className="flex gap-2 pt-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Retour</Button>}
            <Button className="flex-1" disabled={!canNext} onClick={next}>{step < 3 ? "Suivant" : "Voir mes métiers"}</Button>
          </div>
        </div>
      )}

      {view === "results" && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Tes métiers recommandés</h2>
          <div className="grid gap-2">{results.principaux.map((r) => <MetierCard key={r.metier.slug} m={r.metier} score={r.score} onOpen={() => setOpen(r.metier)} />)}</div>
          <h3 className="font-semibold">Pour élargir ton horizon</h3>
          <div className="grid gap-2">{results.alternatifs.map((r) => <MetierCard key={r.metier.slug} m={r.metier} score={r.score} onOpen={() => setOpen(r.metier)} />)}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={restart}>Refaire le test</Button>
            <Button variant="ghost" onClick={() => setView("catalogue")}>Tous les métiers</Button>
          </div>
        </div>
      )}

      {view === "catalogue" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Catalogue des métiers</h2>
          <Input placeholder="Rechercher un métier…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Badge variant={secteur === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSecteur("all")}>Tous</Badge>
            {(Object.keys(SECTEURS) as Interet[]).map((k) => (
              <Badge key={k} variant={secteur === k ? "default" : "outline"} className="cursor-pointer" onClick={() => setSecteur(k)}>{SECTEURS[k]}</Badge>
            ))}
          </div>
          <div className="grid gap-2">
            {filtered.map((m) => <MetierCard key={m.slug} m={m} onOpen={() => setOpen(m)} />)}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun métier trouvé pour « {query} ».</p>}
          </div>
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {open && <>
            <SheetHeader className="mb-4"><SheetTitle>{open.titre}</SheetTitle></SheetHeader>
            {/* Close the sheet before opening Jude so the chat isn't hidden behind it */}
            <div onClickCapture={(e) => { if ((e.target as HTMLElement).closest("button")) setTimeout(() => setOpen(null), 0); }}>
              <FicheMetier m={open} />
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
