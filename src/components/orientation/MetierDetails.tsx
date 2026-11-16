import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { GUIDANCE, SERIES, ORIENTATION_SOURCES, SPECIFIC_SOURCES } from "@/data/orientationGuidance";
import type { Metier } from "@/types/orientation.types";

export function MetierDetails({ metier: m, onAsk }: { metier: Metier; onAsk: () => void }) {
  const guidance = GUIDANCE[m.slug];
  const source = SPECIFIC_SOURCES[m.slug];
  // Collapsible sections keep long career guidance manageable on a small screen.
  const sections = [
    { title: "Le quotidien du métier", body: <p>{m.quotidien}</p> },
    { title: "Ce que tu pourras faire avec", body: <><p><strong>Postes à explorer :</strong> {m.debouches.postes.join(", ")}</p><p><strong>Secteurs possibles :</strong> {m.debouches.secteurs.join(", ")}</p><p><strong>Entrepreneuriat :</strong> {m.debouches.entrepreneuriat}</p><p>Ces postes peuvent nécessiter des qualifications différentes ; un seul diplôme ne donne pas accès à tous.</p></> },
    { title: "Le chemin pour y arriver", body: <><p><strong>Pistes en NS3–NS4 :</strong> {m.serie_ns.map(s => `${s} — ${SERIES[s]}`).join(" ; ")}</p><p>Une série conseillée n'est pas une condition d'admission. Vérifie les exigences du programme visé.</p><p><strong>Après le bac :</strong> {m.parcours_etudes.diplomes}</p><p><strong>Durée indicative, à confirmer :</strong> {m.parcours_etudes.duree}</p><p><strong>Établissements ou formations à explorer :</strong> {m.parcours_etudes.etablissements.join(", ")}</p><p>Confirme le programme, sa reconnaissance, les frais et les conditions d'exercice auprès de l'établissement et de l'autorité compétente.</p></> },
    { title: "Compétences et qualités clés", body: <><p><strong>Savoir-faire :</strong> {m.competences.hard.join(", ")}</p><p><strong>Qualités humaines :</strong> {m.competences.soft.join(", ")}</p><Button asChild variant="link" className="px-0 h-auto whitespace-normal text-left"><Link to="/matieres">Travailler mes matières <ArrowUpRight className="ml-1 h-4 w-4 shrink-0" /></Link></Button><p>Retrouve les cours de ta classe ; aucun cours ne garantit une qualification professionnelle.</p><Button asChild variant="link" className="px-0 h-auto whitespace-normal text-left"><Link to="/passion-discovery">Développer mes qualités humaines <ArrowUpRight className="ml-1 h-4 w-4 shrink-0" /></Link></Button><p>Explore notamment la gestion du temps dans le parcours personnel.</p></> },
    { title: "Réalités du terrain", body: <><p>La demande actuelle en Haïti et à l'international reste à vérifier : elle varie selon la région, l'expérience et le contexte.</p><p><strong>Travail indépendant :</strong> {m.realites.freelance ? "Une piste à étudier selon les qualifications, autorisations et clients disponibles." : "Ne pas le considérer comme un débouché assuré."}</p><p><strong>Matériel indicatif :</strong> {m.realites.materiel}</p><p>Un métier réglementé exige les autorisations applicables, même en indépendant. Aucun emploi ni revenu n'est garanti.</p></> },
  ];
  return <div className="space-y-5 pb-8">
    <Accordion type="multiple" defaultValue={["0"]}>
      {sections.map((section, i) => <AccordionItem key={section.title} value={String(i)}><AccordionTrigger className="text-left gap-3">{section.title}</AccordionTrigger><AccordionContent><div className="space-y-3 text-muted-foreground">{section.body}</div></AccordionContent></AccordionItem>)}
    </Accordion>
    {guidance && <section className="space-y-2 border-l-2 border-primary pl-4"><h3 className="font-semibold">Je peux commencer maintenant</h3><p className="text-sm text-primary">{guidance.skill}</p><p className="text-sm text-muted-foreground">{guidance.activity}</p></section>}
    <section className="space-y-2 text-sm"><h3 className="font-semibold">Sources et points à confirmer</h3>
      <p className="text-muted-foreground">Revue des références : 16 novembre 2026. Les conditions actuelles d'admission, les durées et le marché du travail restent à confirmer auprès des organismes concernés.</p>
      {source && <p><a className="text-primary underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><span className="block text-muted-foreground">{source.note}</span></p>}
      {ORIENTATION_SOURCES.map(s => <p key={s.url}><a className="text-primary underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a><span className="block text-muted-foreground">{s.scope}</span></p>)}
    </section>
    <section className="space-y-2"><h3 className="font-semibold">Approfondir avec Jude</h3><Button className="w-full h-auto min-h-11 whitespace-normal gap-2" onClick={onAsk}><MessageCircle className="h-4 w-4 shrink-0" />Discuter de ce métier avec Jude</Button></section>
  </div>;
}