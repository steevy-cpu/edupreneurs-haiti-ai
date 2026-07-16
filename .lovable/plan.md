## Objectif
Générer un pitch deck PPTX téléchargeable (~14 slides) positionnant Edupreneurs comme un SaaS EdTech, ciblant les investisseurs / VC. Livré sous `/mnt/documents/edupreneurs-pitch-vc.pptx` avec artefact affiché.

## Direction visuelle
- **Palette Paper & Teal** (cohérente avec branding): fond ivoire `#F7F5F0`, Teal `#087E7E`, Amber accent `#FF9F00`, charcoal `#0F1720`, gris muet `#6B7280`.
- **Typo**: Georgia (titres, éditorial, ~54pt) + Calibri (body 24-32pt). Kickers Amber uppercase tracked.
- **Motif**: bande verticale Teal côté gauche des slides de section, gros chiffres (100pt+) pour stats, cartes ivoire avec bordure fine 1px.
- **Densité**: 1 idée par slide, respect du budget (headers 100px, footers 80px, max 3 cartes/ligne).

## Structure (14 slides)

1. **Cover** — Logo É + "Edupreneurs" · tagline "The learning OS for Haitian students" · mon-edupreneur.com
2. **The Problem** — 3 stats chocs: 60% élèves Haïti sans accès au soutien scolaire · profs tuteurs $$$ · contenu FR/créole rare & non-personnalisé
3. **Market** — TAM/SAM/SOM: Haïti 2.5M étudiants K-12, diaspora francophone 4M, LATAM/Afrique francophone 80M — approche bottom-up
4. **The Product** — 4 piliers: AI Tutor (Jude) · Curriculum MENFP · Community & Battles · Passions (musique, échecs, arts)
5. **How it works** — Screenshot Dashboard + flow 3 étapes (Inscription → IA personnalise → Progression trackée)
6. **AI Moat** — 11 tuteurs IA spécialisés · contenu généré + validé · voix Eric ElevenLabs · KaTeX math native
7. **Traction (projections)** — Placeholder: 200 users actifs → 2 000 (Q4 2026) → 20 000 (2027). Marqué "Projections"
8. **Business Model SaaS** — $1.50/mois/user (200 HTG) · B2C direct · B2B écoles ($3-5/élève) · Diaspora premium ($9.99)
9. **Unit Economics** — CAC $2.50 (organique + referral), LTV $18, LTV/CAC 7.2x, payback 2 mois — projections marquées
10. **Competitive Landscape** — Matrice 2x2: Local vs Global × Généraliste vs Curriculum-specific. Kartable/Khan Academy loin du marché haïtien
11. **Go-to-Market** — 3 vagues: (1) Étudiants urbains Port-au-Prince/Cap-Haïtien via TikTok, (2) Partenariats écoles privées, (3) Diaspora US/Canada/France
12. **Team & Vision** — Founders (placeholder) · advisors · vision "Le Duolingo de l'éducation francophone émergente"
13. **The Ask** — Seed $500K pour 18 mois · usage: 40% produit/IA, 30% growth, 20% équipe, 10% ops
14. **Closing** — "Rejoins-nous" · mon-edupreneur.com · email contact · logo

## Implementation

- **Skill**: `pptx` (pptxgenjs).
- **Script**: `/tmp/build-pitch.mjs` génère le PPTX avec pptxgenjs, embed logo Edupreneurs (SVG É gradient teal→amber inline shape), tokens couleur ci-dessus.
- **QA**: convertir en PDF via LibreOffice, rasteriser toutes les 14 slides à 150dpi, inspecter chaque image, corriger overflow/contraste/alignement avant livraison.
- **Livraison**: `<presentation-artifact path="edupreneurs-pitch-vc.pptx" mime_type="application/vnd.openxmlformats-officedocument.presentationml.presentation">`.

Tous les chiffres financiers/traction seront marqués "Projections — non-audité" en footer des slides concernées (7, 8, 9).

## Ce qui n'est PAS inclus
- Pas de code appli modifié (pitch = livrable externe uniquement).
- Pas de nouvelle page `/pitch` dans l'app.
- Pas de vidéo (déjà couvert par le workflow Promo v7 existant).

Prêt à générer.
