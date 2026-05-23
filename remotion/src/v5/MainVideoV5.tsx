/**
 * Edupreneurs Promo v5 — Conversion-driven, faithful to mon-edupreneur.com
 *
 * 6 acts in 58s @ 30fps = 1740 frames
 *   1. PROBLEM        90f  (3s)   — dark, tense
 *   2. PROMISE        60f  (2s)   — teal big word
 *   3. SOLUTION      1050f (35s)  — 6 product scenes faithful to the real UI
 *   4. TESTIMONIALS   240f (8s)   — 3 split-screen quotes
 *   5. STATS          150f (5s)   — fullscreen numbers
 *   6. CTA            150f (5s)   — URL + sign-up urgency
 */
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily: SANS } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const { fontFamily: SERIF } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });

// Real brand tokens from src/index.css / tailwind.config.ts
const C = {
  teal: "#087E7E",
  tealDark: "#065959",
  tealGlow: "#0FB5B5",
  amber: "#FF9F00",
  amberSoft: "#FFB840",
  violet: "#7C3AED",
  ink: "#0A0B0D",
  ink2: "#16191D",
  paper: "#FFFFFF",
  paper2: "#F7F8FA",
  border: "#E5E7EB",
  text: "#0F172A",
  muted: "#64748B",
  green: "#22C55E",
  red: "#EF4444",
};

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// ============================================================
// Reusable: persistent URL watermark
// ============================================================
const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 28,
      right: 36,
      fontFamily: SANS,
      fontSize: 18,
      fontWeight: 600,
      color: "rgba(255,255,255,0.55)",
      mixBlendMode: "difference",
      letterSpacing: "0.02em",
      zIndex: 99,
    }}
  >
    mon-edupreneur.com
  </div>
);

// Brand lockup (logo mark + name) — used in app chrome
const BrandMark: React.FC<{ size?: number; light?: boolean }> = ({ size = 32, light }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${C.teal}, ${C.amber})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        color: "#fff",
        fontSize: size * 0.55,
        fontFamily: SANS,
      }}
    >
      É
    </div>
    <span
      style={{
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size * 0.55,
        color: light ? "#fff" : C.text,
        letterSpacing: "-0.02em",
      }}
    >
      Édupreneurs
    </span>
  </div>
);

// Reusable kinetic subtitle (one line in/out)
const Caption: React.FC<{ text: string; from: number; dur: number; y?: string; size?: number; color?: string; weight?: number }> = ({
  text,
  from,
  dur,
  y = "78%",
  size = 36,
  color = "#fff",
  weight = 700,
}) => {
  const f = useCurrentFrame();
  if (f < from || f > from + dur) return null;
  const local = f - from;
  const inP = easeOut(local / 10);
  const outP = easeOut((from + dur - f) / 8);
  const opacity = Math.min(inP, outP, 1);
  const ty = (1 - inP) * 18;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        color,
        letterSpacing: "-0.01em",
        opacity,
        transform: `translateY(${ty}px)`,
        textShadow: "0 2px 24px rgba(0,0,0,0.35)",
      }}
    >
      {text}
    </div>
  );
};

// ============================================================
// ACT 1 — PROBLEM (3s / 90f)
// ============================================================
const Act1Problem: React.FC = () => {
  const f = useCurrentFrame();
  const grain = (f * 13) % 2;
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: SANS, overflow: "hidden" }}>
      {/* subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.6))",
        }}
      />
      {/* flicker text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          transform: `translate(${grain - 1}px, 0)`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 132,
            color: "#fff",
            letterSpacing: "-0.04em",
            opacity: easeOut(f / 18),
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          Étudier en Haïti,
          <br />
          <em style={{ color: C.amber, fontStyle: "italic" }}>c'est dur.</em>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.55)",
            fontWeight: 500,
            opacity: easeOut((f - 30) / 20),
            letterSpacing: "0.02em",
          }}
        >
          Pannes · Pas de prof · Manuels chers
        </div>
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// ACT 2 — PROMISE (2s / 60f)
// ============================================================
const Act2Promise: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 30, 60], [0.85, 1.04, 1.1], { extrapolateRight: "clamp" });
  const op = easeOut(f / 10);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${C.tealGlow} 0%, ${C.teal} 40%, ${C.tealDark} 100%)`,
        fontFamily: SANS,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 280,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.06em",
          transform: `scale(${s})`,
          opacity: op,
          textShadow: "0 30px 80px rgba(0,0,0,0.35)",
        }}
      >
        ÇA CHANGE.
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// ACT 3 — SOLUTION (35s / 1050f) — 6 product scenes ~175f each
// Faithful mockups of mon-edupreneur.com built with real brand tokens.
// ============================================================

// Shared app chrome (sidebar teal + content area) — mirrors src/shell/AppShell
const AppFrame: React.FC<{ active: string; children: React.ReactNode }> = ({ active, children }) => {
  const items = [
    { key: "dash", label: "Tableau de bord", icon: "▦" },
    { key: "mat", label: "Matières", icon: "📚" },
    { key: "jude", label: "Jude AI", icon: "✨" },
    { key: "exam", label: "Examens", icon: "📝" },
    { key: "feed", label: "Communauté", icon: "💬" },
    { key: "quiz", label: "Quiz Battle", icon: "⚡" },
  ];
  return (
    <AbsoluteFill style={{ background: C.paper2, fontFamily: SANS, display: "flex", flexDirection: "row" }}>
      {/* Sidebar teal */}
      <div
        style={{
          width: 280,
          background: C.teal,
          color: "#fff",
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ padding: "0 4px 24px" }}>
          <BrandMark size={36} light />
        </div>
        {items.map((it) => (
          <div
            key={it.key}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              background: it.key === active ? "rgba(255,255,255,0.18)" : "transparent",
              fontWeight: it.key === active ? 700 : 500,
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: it.key === active ? "#fff" : "rgba(255,255,255,0.78)",
            }}
          >
            <span style={{ fontSize: 20 }}>{it.icon}</span>
            {it.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {/* user pill */}
        <div
          style={{
            background: "rgba(0,0,0,0.18)",
            borderRadius: 14,
            padding: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.amber}, ${C.violet})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            W
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Wideline</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>NS4 · Série SVT</div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};

// Scene 3.1 — Dashboard (175f)
const SceneDashboard: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [0, 175], [0, -30]);
  const goldTarget = 2840;
  const goldShown = Math.round(interpolate(f, [10, 70], [0, goldTarget], { extrapolateRight: "clamp" }));
  const streakShown = Math.round(interpolate(f, [20, 70], [0, 12], { extrapolateRight: "clamp" }));
  const levelShown = Math.round(interpolate(f, [30, 70], [0, 7], { extrapolateRight: "clamp" }));
  return (
    <AppFrame active="dash">
      <div style={{ padding: 48, transform: `translateX(${pan}px)`, opacity: easeOut(f / 12) }}>
        <div style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>Bonswa, Wideline 👋</div>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "4px 0 32px" }}>
          Prête à reprendre ?
        </h1>
        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
          {[
            { label: "Gold", value: goldShown.toLocaleString(), accent: C.amber, icon: "🪙" },
            { label: "Streak", value: `${streakShown} jours`, accent: C.red, icon: "🔥" },
            { label: "Niveau", value: levelShown, accent: C.violet, icon: "⭐" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: C.paper,
                borderRadius: 20,
                padding: 24,
                border: `1px solid ${C.border}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 14, fontWeight: 600 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                {s.label}
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, color: s.accent, letterSpacing: "-0.03em", marginTop: 8 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
        {/* Continue card */}
        <div
          style={{
            background: C.paper,
            borderRadius: 24,
            padding: 28,
            border: `1px solid ${C.border}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealGlow})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🧪
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>Continuer · Sciences SVT</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginTop: 4 }}>
              Chapitre 3 — La photosynthèse
            </div>
            <div style={{ marginTop: 12, height: 8, background: C.paper2, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${interpolate(f, [40, 140], [20, 68], { extrapolateRight: "clamp" })}%`, background: C.teal }} />
            </div>
          </div>
          <div style={{ background: C.amber, color: C.ink, padding: "14px 22px", borderRadius: 999, fontWeight: 700, fontSize: 15 }}>
            Reprendre →
          </div>
        </div>
      </div>
      <Caption text="Ton tableau de bord. Tout en un." from={20} dur={140} y="86%" size={28} color={C.text} />
    </AppFrame>
  );
};

// Scene 3.2 — Matières grid (175f)
const SceneMatieres: React.FC = () => {
  const f = useCurrentFrame();
  const subjects = [
    { n: "Mathématiques", c: C.violet, e: "M" },
    { n: "Français", c: "#E11D48", e: "F" },
    { n: "Sciences SVT", c: C.teal, e: "S" },
    { n: "Sciences Physiques", c: "#2563EB", e: "P" },
    { n: "Histoire-Géo", c: "#D97706", e: "H" },
    { n: "Anglais", c: "#7C3AED", e: "E" },
  ];
  return (
    <AppFrame active="mat">
      <div style={{ padding: 48 }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Tes matières
        </h1>
        <div style={{ color: C.muted, fontSize: 18, marginBottom: 28 }}>
          NS4 — Série SVT · 100% programme MENFP
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {subjects.map((s, i) => {
            const localIn = (f - i * 6) / 14;
            const opacity = easeOut(localIn);
            const ty = (1 - Math.min(1, Math.max(0, localIn))) * 18;
            const focused = i === 2 && f > 90; // SVT zooms
            const scale = focused ? interpolate(f, [90, 120], [1, 1.04], { extrapolateRight: "clamp" }) : 1;
            return (
              <div
                key={i}
                style={{
                  background: C.paper,
                  borderRadius: 20,
                  padding: 24,
                  border: `1px solid ${focused ? s.c : C.border}`,
                  boxShadow: focused ? `0 14px 40px ${s.c}33` : "0 4px 20px rgba(0,0,0,0.04)",
                  opacity,
                  transform: `translateY(${ty}px) scale(${scale})`,
                  transition: "none",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: s.c,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                    marginBottom: 16,
                  }}
                >
                  {s.e}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{s.n}</div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
                  {12 + i * 3} leçons · {3 + i} quiz
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Caption text="Tout le programme MENFP, classé pour toi." from={20} dur={140} y="88%" size={26} color={C.text} />
    </AppFrame>
  );
};

// Scene 3.3 — Lesson with KaTeX-style formula (175f)
const SceneLesson: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 175], [1, 1.04]);
  return (
    <AppFrame active="mat">
      <div style={{ padding: 48, transform: `scale(${zoom})`, transformOrigin: "50% 30%", opacity: easeOut(f / 12) }}>
        <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
          Matières › Mathématiques › Chapitre 5
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "8px 0 20px" }}>
          Équations du second degré
        </h1>
        <div
          style={{
            background: C.paper,
            borderRadius: 24,
            padding: 36,
            border: `1px solid ${C.border}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 18, color: C.text, lineHeight: 1.6, marginBottom: 24 }}>
            Pour résoudre <strong>ax² + bx + c = 0</strong>, on calcule d'abord le discriminant Δ&nbsp;:
          </div>
          {/* Formula block */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.teal}11, ${C.tealGlow}11)`,
              border: `1px solid ${C.teal}33`,
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 56,
              color: C.text,
              letterSpacing: "0.02em",
            }}
          >
            x = <span style={{ display: "inline-block", verticalAlign: "middle", textAlign: "center" }}>
              <span style={{ display: "block", borderBottom: `2px solid ${C.text}`, padding: "0 16px 6px" }}>
                −b ± √(b² − 4ac)
              </span>
              <span style={{ display: "block", padding: "6px 0 0" }}>2a</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <div style={{ padding: "12px 20px", background: C.teal, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
              ▶ Écouter (voix Eric)
            </div>
            <div style={{ padding: "12px 20px", background: C.paper2, color: C.text, borderRadius: 12, fontWeight: 700, fontSize: 15, border: `1px solid ${C.border}` }}>
              ✨ Demander à Jude
            </div>
          </div>
        </div>
      </div>
      <Caption text="Des leçons claires, audio inclus." from={20} dur={140} y="90%" size={26} color={C.text} />
    </AppFrame>
  );
};

// Scene 3.4 — Jude AI chat (175f)
const SceneJude: React.FC = () => {
  const f = useCurrentFrame();
  const question = "Explique-moi le discriminant simplement";
  const answer = "Le discriminant Δ = b² − 4ac te dit combien de solutions ton équation a. Positif → 2 solutions. Nul → 1. Négatif → aucune (dans ℝ).";
  const qChars = Math.min(question.length, Math.floor(f * 0.9));
  const aStart = 60;
  const aChars = Math.max(0, Math.min(answer.length, Math.floor((f - aStart) * 1.1)));
  const thinking = f > 45 && f < aStart + 6;
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: SANS }}>
      {/* Header */}
      <div
        style={{
          padding: "24px 48px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.violet}, ${C.tealGlow})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 22,
            color: "#fff",
          }}
        >
          J
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Jude</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Ton tuteur IA · en ligne 24/7</div>
        </div>
      </div>
      {/* Chat */}
      <div style={{ flex: 1, padding: 48, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* User bubble */}
        <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
          <div
            style={{
              background: C.teal,
              color: "#fff",
              padding: "16px 22px",
              borderRadius: "20px 20px 4px 20px",
              fontSize: 22,
              fontWeight: 500,
              boxShadow: `0 10px 30px ${C.teal}44`,
            }}
          >
            {question.slice(0, qChars)}
            {qChars < question.length && <span style={{ opacity: (f % 10) < 5 ? 1 : 0 }}>|</span>}
          </div>
        </div>
        {/* Jude thinking / answer */}
        {thinking && (
          <div style={{ alignSelf: "flex-start", color: "rgba(255,255,255,0.55)", fontSize: 18, fontStyle: "italic" }}>
            ✨ Jude réfléchit…
          </div>
        )}
        {aChars > 0 && (
          <div style={{ alignSelf: "flex-start", maxWidth: "75%" }}>
            <div
              style={{
                background: C.ink2,
                color: "#fff",
                padding: "20px 26px",
                borderRadius: "20px 20px 20px 4px",
                fontSize: 22,
                fontWeight: 400,
                lineHeight: 1.5,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: `0 10px 30px ${C.violet}22`,
              }}
            >
              {answer.slice(0, aChars)}
              {aChars < answer.length && <span style={{ opacity: (f % 10) < 5 ? 1 : 0 }}>▌</span>}
            </div>
          </div>
        )}
      </div>
      <Caption text="Jude, ton tuteur IA. Toujours là." from={20} dur={140} y="88%" size={26} color="#fff" />
      <Watermark />
    </AbsoluteFill>
  );
};

// Scene 3.5 — Quiz Battle PvP (175f)
const SceneQuiz: React.FC = () => {
  const f = useCurrentFrame();
  const countdown = f < 60 ? 3 - Math.floor(f / 20) : 0;
  const userScore = Math.round(interpolate(f, [60, 165], [0, 8], { extrapolateRight: "clamp" }));
  const oppScore = Math.round(interpolate(f, [60, 165], [0, 5], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.ink} 0%, ${C.ink2} 100%)`,
        fontFamily: SANS,
        padding: 48,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <BrandMark size={32} light />
        <div style={{ color: C.amber, fontWeight: 800, fontSize: 20, letterSpacing: "0.1em" }}>⚡ QUIZ BATTLE</div>
      </div>
      {/* Players */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center", marginBottom: 40 }}>
        {[
          { name: "Toi", score: userScore, color: C.teal, init: "W" },
          null,
          { name: "Marvens", score: oppScore, color: C.violet, init: "M" },
        ].map((p, i) =>
          p === null ? (
            <div key={i} style={{ fontSize: 60, color: "#fff", fontWeight: 900 }}>
              VS
            </div>
          ) : (
            <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 28, textAlign: "center", border: `1px solid ${p.color}66` }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: p.color,
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 36,
                  color: "#fff",
                }}
              >
                {p.init}
              </div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: p.color, marginTop: 8 }}>{p.score}</div>
            </div>
          )
        )}
      </div>
      {/* Center action */}
      {countdown > 0 ? (
        <div style={{ textAlign: "center", fontSize: 200, fontWeight: 900, color: C.amber, lineHeight: 1 }}>
          {countdown}
        </div>
      ) : f < 90 ? (
        <div style={{ textAlign: "center", fontSize: 200, fontWeight: 900, color: C.amber, lineHeight: 1 }}>
          GO!
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: 32,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            QUESTION 8 / 10
          </div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, lineHeight: 1.3 }}>
            Quel est l'auteur de "Gouverneurs de la rosée" ?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>
            {["Jacques Roumain", "Jacques Stephen Alexis", "Frankétienne", "Dany Laferrière"].map((o, i) => (
              <div
                key={i}
                style={{
                  background: i === 0 && f > 130 ? C.green : "rgba(255,255,255,0.05)",
                  border: `1px solid ${i === 0 && f > 130 ? C.green : "rgba(255,255,255,0.12)"}`,
                  color: "#fff",
                  padding: "16px 20px",
                  borderRadius: 14,
                  fontSize: 18,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {String.fromCharCode(65 + i)}. {o}
              </div>
            ))}
          </div>
        </div>
      )}
      <Caption text="Affronte tes amis en temps réel." from={20} dur={140} y="92%" size={24} color="#fff" />
      <Watermark />
    </AbsoluteFill>
  );
};

// Scene 3.6 — Examens BAC (175f)
const SceneExams: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AppFrame active="exam">
      <div style={{ padding: 48, opacity: easeOut(f / 12) }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Bac & Examens d'État
        </h1>
        <div style={{ color: C.muted, fontSize: 18, marginBottom: 28 }}>
          15 ans de sujets · corrections expliquées par Jude
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
          {[
            { y: "2024", s: "Mathématiques NS4", d: "Série SMP · 4h", done: 0.42 },
            { y: "2024", s: "Sciences Physiques", d: "Série SVT · 3h", done: 0.78 },
            { y: "2023", s: "Philosophie", d: "Toutes séries · 4h", done: 0.15 },
            { y: "2023", s: "Histoire-Géographie", d: "Toutes séries · 3h", done: 1 },
          ].map((e, i) => {
            const localIn = (f - i * 8) / 16;
            const opacity = easeOut(localIn);
            const ty = (1 - Math.min(1, Math.max(0, localIn))) * 24;
            return (
              <div
                key={i}
                style={{
                  background: C.paper,
                  borderRadius: 20,
                  padding: 24,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  opacity,
                  transform: `translateY(${ty}px)`,
                  display: "flex",
                  gap: 18,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 80,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.amber}, ${C.amberSoft})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  {e.y}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{e.s}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{e.d}</div>
                  <div style={{ marginTop: 10, height: 6, background: C.paper2, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${e.done * 100}%`, background: e.done === 1 ? C.green : C.teal }} />
                  </div>
                </div>
                {e.done === 1 && <div style={{ color: C.green, fontSize: 28 }}>✓</div>}
              </div>
            );
          })}
        </div>
      </div>
      <Caption text="Le BAC, prêt comme jamais." from={20} dur={140} y="90%" size={26} color={C.text} />
    </AppFrame>
  );
};

// ============================================================
// ACT 4 — TESTIMONIALS (240f) — 3 × 80f split-screen
// ============================================================
const Testimonial: React.FC<{ name: string; grade: string; quote: string; color: string; init: string; index: number }> = ({
  name,
  grade,
  quote,
  color,
  init,
  index,
}) => {
  const f = useCurrentFrame();
  const op = easeOut(f / 10) * easeOut((80 - f) / 8);
  const tx = (1 - easeOut(f / 14)) * (index % 2 === 0 ? -40 : 40);
  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        fontFamily: SANS,
        display: "flex",
        flexDirection: "row",
        opacity: op,
      }}
    >
      {/* Photo side (stylized avatar) */}
      <div
        style={{
          flex: 1,
          background: `radial-gradient(circle at 50% 40%, ${color}55, ${C.ink} 70%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${index % 2 === 0 ? tx : 0}px)`,
        }}
      >
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${C.tealGlow})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 180,
            color: "#fff",
            boxShadow: `0 30px 80px ${color}88`,
            fontFamily: SERIF,
          }}
        >
          {init}
        </div>
      </div>
      {/* Quote side */}
      <div
        style={{
          flex: 1.2,
          padding: "0 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateX(${index % 2 === 1 ? tx : 0}px)`,
        }}
      >
        <div style={{ fontSize: 120, color: C.amber, lineHeight: 0.6, fontFamily: SERIF }}>"</div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            margin: "8px 0 32px",
          }}
        >
          {quote}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 4, height: 32, background: C.amber, borderRadius: 2 }} />
          <div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{name}</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 16 }}>{grade}</div>
          </div>
        </div>
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// ACT 5 — STATS (150f)
// ============================================================
const Act5Stats: React.FC = () => {
  const f = useCurrentFrame();
  const stats = [
    { n: Math.round(interpolate(f, [10, 70], [0, 1200], { extrapolateRight: "clamp" })), s: "+", l: "Leçons MENFP" },
    { n: Math.round(interpolate(f, [20, 80], [0, 50000], { extrapolateRight: "clamp" })), s: "+", l: "Questions de quiz" },
    { n: 24, s: "/7", l: "Jude répond" },
    { n: 100, s: "%", l: "Programme officiel" },
  ];
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${C.ink} 0%, ${C.ink2} 100%)`,
        fontFamily: SANS,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ color: C.amber, fontSize: 20, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 40 }}>
        EDUPRENEURS EN CHIFFRES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 60, padding: "0 120px" }}>
        {stats.map((s, i) => {
          const op = easeOut((f - i * 8) / 14);
          return (
            <div key={i} style={{ textAlign: "center", opacity: op, transform: `translateY(${(1 - op) * 20}px)` }}>
              <div
                style={{
                  fontSize: 160,
                  fontWeight: 900,
                  color: C.amber,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                }}
              >
                {s.n.toLocaleString()}
                <span style={{ color: C.tealGlow, fontSize: 100 }}>{s.s}</span>
              </div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginTop: 8 }}>{s.l}</div>
            </div>
          );
        })}
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// ACT 6 — CTA (150f)
// ============================================================
const Act6CTA: React.FC = () => {
  const f = useCurrentFrame();
  const urlP = easeOut(f / 18);
  const ctaP = easeOut((f - 30) / 16);
  const flagP = easeOut((f - 70) / 14);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${C.teal} 0%, ${C.tealDark} 50%, ${C.ink} 100%)`,
        fontFamily: SANS,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: 60 }}>
        <div
          style={{
            color: C.amber,
            fontSize: 22,
            letterSpacing: "0.32em",
            fontWeight: 700,
            marginBottom: 32,
            opacity: urlP,
          }}
        >
          REJOINS-NOUS
        </div>
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.05em",
            lineHeight: 0.95,
            opacity: urlP,
            transform: `scale(${interpolate(urlP, [0, 1], [0.9, 1])})`,
            textShadow: `0 30px 80px ${C.amber}55`,
          }}
        >
          mon-edupreneur
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: C.amber,
            letterSpacing: "-0.04em",
            marginTop: -8,
            opacity: urlP,
          }}
        >
          .com
        </div>
        <div
          style={{
            marginTop: 48,
            display: "inline-flex",
            padding: "22px 48px",
            background: C.amber,
            color: C.ink,
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 900,
            opacity: ctaP,
            transform: `translateY(${(1 - ctaP) * 16}px)`,
            boxShadow: `0 30px 60px ${C.amber}66`,
          }}
        >
          Crée ton compte · 2 min · Gratuit →
        </div>
        <div
          style={{
            marginTop: 36,
            color: "rgba(255,255,255,0.7)",
            fontSize: 18,
            fontWeight: 500,
            opacity: flagP,
            letterSpacing: "0.04em",
          }}
        >
          Conçu en Haïti 🇭🇹 · Pour Haïti
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Master composition
// ============================================================
type S = { c: React.FC; d: number };
const SCENES: S[] = [
  { c: Act1Problem, d: 90 },
  { c: Act2Promise, d: 60 },
  // Act 3 — Solution
  { c: SceneDashboard, d: 175 },
  { c: SceneMatieres, d: 175 },
  { c: SceneLesson, d: 175 },
  { c: SceneJude, d: 175 },
  { c: SceneExams, d: 175 },
  { c: SceneQuiz, d: 175 },
  // Act 4 — Testimonials
  { c: () => <Testimonial index={0} name="Marvens" grade="NS3 · Série SMP" color={C.teal} init="M" quote="J'ai gagné 2 points de moyenne en Maths en 6 semaines." />, d: 80 },
  { c: () => <Testimonial index={1} name="Wideline" grade="NS4 · Série SVT" color={C.violet} init="W" quote="Jude répond à mes questions à 2h du matin. Sérieux." />, d: 80 },
  { c: () => <Testimonial index={2} name="Sara" grade="9AF" color={C.amber} init="S" quote="1ère de ma classe ce trimestre. Grâce aux quiz." />, d: 80 },
  // Act 5 — Stats
  { c: Act5Stats, d: 150 },
  // Act 6 — CTA
  { c: Act6CTA, d: 150 },
];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.d, 0);

export const MainVideoV5: React.FC = () => {
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {SCENES.map((s, i) => {
        const from = acc;
        acc += s.d;
        const Comp = s.c;
        return (
          <Sequence key={i} from={from} durationInFrames={s.d}>
            <SceneCrossfade dur={s.d}>
              <Comp />
            </SceneCrossfade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Smooth in/out edges per scene to avoid hard cuts
const SceneCrossfade: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const f = useCurrentFrame();
  const op = Math.min(easeOut(f / 8), easeOut((dur - f) / 8), 1);
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};
