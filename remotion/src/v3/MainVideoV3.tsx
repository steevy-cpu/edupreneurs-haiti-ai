import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Img,
  staticFile,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

// Load fonts at module scope so Remotion can embed them.
const { fontFamily: SERIF } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SANS } = loadSans("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

// =================================================================
// Design tokens — Paper & Teal (Apple Keynote vibe)
// =================================================================
const C = {
  paper: "#FAFAF7",
  surface: "#EDEAE1",
  surface2: "#F2EFE7",
  teal: "#087E7E",
  tealDim: "#0A9494",
  amber: "#FF9F00",
  ink: "#1A1A1A",
  inkDim: "#3a3a3a",
  muted: "#8a8275",
  border: "#E1DDD2",
};

// Ease-out cubic (Apple-style)
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// =================================================================
// Persistent paper background with subtle grain
// =================================================================
const Paper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.paper, fontFamily: SANS, color: C.ink }}>
    {/* subtle vignette */}
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.04) 100%)",
        pointerEvents: "none",
      }}
    />
    {children}
  </AbsoluteFill>
);

// Soft cross-fade wrapper for scene entry/exit
const SceneFade: React.FC<{ children: React.ReactNode; durationInFrames: number; fadeIn?: number; fadeOut?: number }> = ({
  children,
  durationInFrames,
  fadeIn = 12,
  fadeOut = 12,
}) => {
  const f = useCurrentFrame();
  const opacity = interpolate(
    f,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// =================================================================
// SCENE 1 — Google search typing "mon-edupreneur.com"
// =================================================================
const SceneGoogle: React.FC = () => {
  const f = useCurrentFrame();
  const query = "mon-edupreneur.com";
  // Typing: 1 char every 5 frames, starts at frame 20
  const typed = Math.max(0, Math.min(query.length, Math.floor((f - 20) / 5)));
  const text = query.slice(0, typed);
  const showCaret = Math.floor(f / 12) % 2 === 0;
  const showAuto = f > 60;
  const submit = f > 130;

  // Window enters with subtle scale
  const enterScale = interpolate(f, [0, 25], [0.98, 1], { extrapolateRight: "clamp", easing: ease });
  const enterOp = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 1200,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 30px 80px -30px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.04)",
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            transform: `scale(${enterScale})`,
            opacity: enterOp,
          }}
        >
          {/* browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: "#FAFAFA" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
            <div style={{ marginLeft: 18, padding: "6px 14px", background: "#fff", borderRadius: 8, fontSize: 14, color: "#5f6368", border: `1px solid ${C.border}`, minWidth: 420 }}>
              🔒 google.com/search
            </div>
          </div>
          {/* google body */}
          <div style={{ padding: "60px 80px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 72, fontWeight: 400, letterSpacing: -2, marginBottom: 32 }}>
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC04" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 22px",
                border: `1px solid ${C.border}`,
                borderRadius: 28,
                boxShadow: "0 1px 6px rgba(32,33,36,0.08)",
                background: "#fff",
                margin: "0 auto",
                maxWidth: 700,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <div style={{ fontSize: 22, color: C.ink, textAlign: "left", flex: 1 }}>
                {text}
                {showCaret && !submit && <span style={{ borderLeft: "2px solid #4285F4", marginLeft: 1 }}>&nbsp;</span>}
              </div>
            </div>

            {/* autocomplete suggestion */}
            {showAuto && !submit && (
              <div
                style={{
                  marginTop: 8,
                  maxWidth: 700,
                  margin: "8px auto 0",
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "10px 22px",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 18,
                  color: C.ink,
                  opacity: interpolate(f, [60, 75], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <span style={{ color: "#9aa0a6" }}>↗</span>
                <span><b>mon-edupreneur.com</b> — apprendre autrement en Haïti</span>
              </div>
            )}

            {submit && (
              <div
                style={{
                  marginTop: 30,
                  fontSize: 16,
                  color: C.teal,
                  opacity: interpolate(f, [130, 145], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                Chargement…
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE 2 — Landing reveal
// =================================================================
const SceneLanding: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 30], [30, 0], { extrapolateRight: "clamp", easing: ease });
  const subY = interpolate(f, [15, 45], [20, 0], { extrapolateRight: "clamp", easing: ease });
  const subOp = interpolate(f, [15, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
        <div style={{ textAlign: "center", opacity: op, transform: `translateY(${y}px)` }}>
          <div style={{ fontSize: 28, color: C.teal, letterSpacing: 4, marginBottom: 24, fontWeight: 600 }}>
            ÉDUPRENEURS · HAÏTI
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 200, lineHeight: 0.95, letterSpacing: -6, color: C.ink }}>
            Apprendre.
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 200, lineHeight: 0.95, letterSpacing: -6, color: C.teal, fontStyle: "italic" }}>
            Autrement.
          </div>
          <div
            style={{
              marginTop: 50,
              fontSize: 28,
              color: C.muted,
              opacity: subOp,
              transform: `translateY(${subY}px)`,
            }}
          >
            Pensé pour chaque élève haïtien — du 7ᵉ AF au Bacc.
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE 3 — Grade selection (7 classes)
// =================================================================
const GRADES = [
  { code: "7ᵉ AF", sub: "Fondamental" },
  { code: "8ᵉ AF", sub: "Fondamental" },
  { code: "9ᵉ AF", sub: "Fondamental" },
  { code: "NS1", sub: "Secondaire" },
  { code: "NS2", sub: "Secondaire" },
  { code: "NS3", sub: "Secondaire" },
  { code: "NS4", sub: "Baccalauréat" },
];

const SceneGrades: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(f, [0, 25], [20, 0], { extrapolateRight: "clamp", easing: ease });

  // Cursor target: NS3 card (index 5) — grid is 4 cols x 2 rows
  // Coords computed below
  const cardW = 240;
  const cardH = 200;
  const gap = 24;
  const cols = 4;
  const gridW = cols * cardW + (cols - 1) * gap;
  const startX = (1920 - gridW) / 2;
  const startY = 420;

  // Cursor animation
  const cursorStart = 90;
  const cursorEnd = 130;
  const cursorT = interpolate(f, [cursorStart, cursorEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetIdx = 5; // NS3
  const targetCol = targetIdx % cols;
  const targetRow = Math.floor(targetIdx / cols);
  const targetX = startX + targetCol * (cardW + gap) + cardW / 2;
  const targetY = startY + targetRow * (cardH + gap) + cardH / 2;
  const cursorFromX = 1700;
  const cursorFromY = 200;
  const cursorX = cursorFromX + (targetX - cursorFromX) * easeInOut(cursorT);
  const cursorY = cursorFromY + (targetY - cursorFromY) * easeInOut(cursorT);
  const clicked = f >= 130;

  return (
    <Paper>
      <AbsoluteFill style={{ paddingTop: 140 }}>
        <div style={{ textAlign: "center", opacity: titleOp, transform: `translateY(${titleY}px)` }}>
          <div style={{ fontSize: 22, color: C.teal, letterSpacing: 3, fontWeight: 600, marginBottom: 18 }}>
            ÉTAPE 1 / 3
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 110, letterSpacing: -3, color: C.ink, lineHeight: 1 }}>
            Choisis ta classe.
          </div>
          <div style={{ fontSize: 24, color: C.muted, marginTop: 18 }}>
            7 niveaux. Du fondamental au Baccalauréat.
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            position: "absolute",
            top: startY,
            left: startX,
            width: gridW,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
            gap: gap,
          }}
        >
          {GRADES.map((g, i) => {
            const delay = 25 + i * 7;
            const op = interpolate(f, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const ty = interpolate(f, [delay, delay + 25], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
            const isTarget = i === targetIdx;
            const hover = isTarget && f >= 120 && f < 130 ? 1 : 0;
            const isSelected = isTarget && clicked;
            const sc = 1 + hover * 0.04;
            const bg = isSelected ? C.teal : C.surface;
            const fg = isSelected ? "#fff" : C.ink;
            const sub = isSelected ? "rgba(255,255,255,0.75)" : C.muted;
            return (
              <div
                key={g.code}
                style={{
                  height: cardH,
                  background: bg,
                  border: `1px solid ${isSelected ? C.teal : C.border}`,
                  borderRadius: 18,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: op,
                  transform: `translateY(${ty}px) scale(${sc})`,
                  transition: "none",
                  color: fg,
                  position: "relative",
                  boxShadow: isSelected ? "0 20px 50px -20px rgba(8,126,126,0.5)" : "none",
                }}
              >
                <div style={{ fontSize: 14, color: sub, letterSpacing: 1.5, fontWeight: 600 }}>{g.sub.toUpperCase()}</div>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, letterSpacing: -1 }}>{g.code}</div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#fff",
                      color: C.teal,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 22,
                      opacity: interpolate(f, [130, 145], [0, 1], { extrapolateRight: "clamp" }),
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cursor */}
        {f >= cursorStart && (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            style={{ position: "absolute", left: cursorX - 8, top: cursorY - 8, pointerEvents: "none", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}
          >
            <path d="M3 2 L3 18 L7 14 L10 21 L13 20 L10 13 L17 13 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        )}

        {/* Selected badge */}
        {clicked && (
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: interpolate(f, [140, 160, 175, 180], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <span style={{ background: C.ink, color: "#fff", padding: "14px 28px", borderRadius: 999, fontSize: 18, fontWeight: 600, letterSpacing: 0.5 }}>
              NS3 sélectionnée — Sciences & Lettres
            </span>
          </div>
        )}
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// Big serif word scenes
// =================================================================
const BigWord: React.FC<{ word: string; sub?: string; accent?: boolean }> = ({ word, sub, accent }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const blur = interpolate(f, [0, 22], [12, 0], { extrapolateRight: "clamp" });
  const scale = interpolate(f, [0, 60], [1.0, 1.04], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", opacity: op, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 320,
              letterSpacing: -10,
              color: accent ? C.teal : C.ink,
              lineHeight: 0.9,
              fontStyle: accent ? "italic" : "normal",
            }}
          >
            {word}
          </div>
          {sub && (
            <div style={{ marginTop: 30, fontSize: 26, letterSpacing: 4, color: C.muted, fontWeight: 500 }}>{sub}</div>
          )}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Dashboard mockup with counters
// =================================================================
const Counter: React.FC<{ target: number; suffix?: string; from?: number }> = ({ target, suffix = "", from = 0 }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [10, 60], [from, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  return <span>{v.toLocaleString("fr-FR")}{suffix}</span>;
};

const SceneDashboard: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const sc = interpolate(f, [0, 150], [1, 1.05], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ transform: `scale(${sc})`, width: 1500 }}>
          <div style={{ fontSize: 18, color: C.muted, letterSpacing: 3, marginBottom: 14, fontWeight: 600 }}>TABLEAU DE BORD</div>
          <div style={{ fontFamily: SERIF, fontSize: 88, letterSpacing: -2, marginBottom: 50, color: C.ink }}>
            Salut, <span style={{ color: C.teal, fontStyle: "italic" }}>Marvens</span>.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { label: "GOLD", value: 2840, color: C.amber, icon: "◆" },
              { label: "STREAK", value: 27, suffix: " j", color: "#E85D3A", icon: "♦" },
              { label: "XP NIVEAU 12", value: 7350, color: C.teal, icon: "▲" },
            ].map((s, i) => {
              const delay = 20 + i * 10;
              const cOp = interpolate(f, [delay, delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const cY = interpolate(f, [delay, delay + 30], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return (
                <div
                  key={s.label}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 24,
                    padding: 36,
                    opacity: cOp,
                    transform: `translateY(${cY}px)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                    <div style={{ fontSize: 28, color: s.color }}>{s.icon}</div>
                    <div style={{ fontSize: 14, color: C.muted, letterSpacing: 2, fontWeight: 700 }}>{s.label}</div>
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 96, letterSpacing: -3, color: C.ink, lineHeight: 1 }}>
                    <Counter target={s.value} suffix={s.suffix} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Matières grid
// =================================================================
const MATIERES = [
  { name: "Mathématiques", emoji: "∑", color: C.teal },
  { name: "Français", emoji: "✎", color: "#7C3AED" },
  { name: "Sciences Physiques", emoji: "⚛", color: "#3B82F6" },
  { name: "SVT", emoji: "❀", color: "#10B981" },
  { name: "Histoire", emoji: "🏛", color: "#B45309" },
  { name: "Anglais", emoji: "A", color: "#E11D48" },
];

const SceneMatieres: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1500 }}>
          <div style={{ fontFamily: SERIF, fontSize: 96, letterSpacing: -2, marginBottom: 40, color: C.ink, textAlign: "left" }}>
            Toutes tes matières.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {MATIERES.map((m, i) => {
              const delay = i * 8;
              const op = interpolate(f, [delay, delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const ty = interpolate(f, [delay, delay + 30], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return (
                <div
                  key={m.name}
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    padding: 32,
                    opacity: op,
                    transform: `translateY(${ty}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 18,
                      background: m.color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 38,
                      fontWeight: 700,
                    }}
                  >
                    {m.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{m.name}</div>
                    <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>Programme NS3 · 24 leçons</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Lesson with KaTeX-like formula
// =================================================================
const SceneLesson: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(f, [40, 150], [1, 1.15], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 1500, transform: `scale(${zoom})` }}>
          <div style={{ fontSize: 16, color: C.teal, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>MATHÉMATIQUES · NS3 · LEÇON 12</div>
          <div style={{ fontFamily: SERIF, fontSize: 72, letterSpacing: -1.5, marginBottom: 36, color: C.ink, lineHeight: 1.05 }}>
            Équations du second degré
          </div>
          <div style={{ fontSize: 26, color: C.inkDim, lineHeight: 1.6, marginBottom: 40, maxWidth: 1100 }}>
            La formule du discriminant permet de résoudre toute équation de la forme <i>ax² + bx + c = 0</i> :
          </div>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "50px 60px",
              fontFamily: SERIF,
              fontSize: 92,
              textAlign: "center",
              color: C.ink,
              letterSpacing: -1,
            }}
          >
            x = <span style={{ display: "inline-block", verticalAlign: "middle", textAlign: "center", margin: "0 12px" }}>
              <div style={{ borderBottom: `3px solid ${C.ink}`, padding: "0 20px 8px" }}>
                −b ± √<span style={{ borderTop: `3px solid ${C.ink}`, padding: "4px 8px 0" }}>b² − 4ac</span>
              </div>
              <div style={{ paddingTop: 8 }}>2a</div>
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Jude AI tutor (streaming chat)
// =================================================================
const SceneJude: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const reply =
    "Bien sûr ! Pour résoudre x² − 5x + 6 = 0, on calcule le discriminant : Δ = b² − 4ac = 25 − 24 = 1. Comme Δ > 0, on a deux solutions réelles : x₁ = 2 et x₂ = 3. Tu veux qu'on en fasse un autre ensemble ? ✨";
  const charsPerFrame = 2.5;
  const shown = Math.max(0, Math.floor((f - 50) * charsPerFrame));
  const text = reply.slice(0, shown);

  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 1200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 36 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDim})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SERIF, fontSize: 32 }}>J</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>Jude</div>
              <div style={{ fontSize: 16, color: C.teal, fontWeight: 600 }}>● Ton tuteur IA · en ligne</div>
            </div>
          </div>

          {/* user bubble */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, opacity: interpolate(f, [10, 30], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ background: C.ink, color: "#fff", padding: "16px 24px", borderRadius: 20, fontSize: 22, maxWidth: 700 }}>
              Aide-moi à résoudre x² − 5x + 6 = 0
            </div>
          </div>

          {/* jude bubble */}
          <div style={{ opacity: interpolate(f, [40, 55], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ background: C.surface, color: C.ink, padding: "22px 28px", borderRadius: 20, fontSize: 22, lineHeight: 1.55, maxWidth: 900, border: `1px solid ${C.border}` }}>
              {text}
              {text.length < reply.length && f > 50 && (
                <span style={{ display: "inline-block", width: 10, height: 22, background: C.teal, marginLeft: 4, verticalAlign: "middle" }} />
              )}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Bacc exams
// =================================================================
const SERIES = [
  { code: "LLA", name: "Lettres & Langues", color: "#7C3AED" },
  { code: "SES", name: "Sciences Économiques", color: "#F59E0B" },
  { code: "SMP", name: "Sciences Math & Physiques", color: "#3B82F6" },
  { code: "SVT", name: "Sciences de la Vie & Terre", color: "#10B981" },
];

const SceneExams: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1500 }}>
          <div style={{ fontSize: 18, color: C.amber, letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>BACCALAURÉAT · NS4</div>
          <div style={{ fontFamily: SERIF, fontSize: 96, letterSpacing: -2, marginBottom: 48, color: C.ink }}>
            Prêt pour le <span style={{ fontStyle: "italic", color: C.teal }}>Bacc</span>.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {SERIES.map((s, i) => {
              const delay = i * 10;
              const op = interpolate(f, [delay, delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const ty = interpolate(f, [delay, delay + 30], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return (
                <div key={s.code} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, opacity: op, transform: `translateY(${ty}px)`, display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ width: 100, height: 100, borderRadius: 16, background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 38, fontWeight: 700 }}>
                    {s.code}
                  </div>
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 18, color: C.muted, marginTop: 6 }}>Annales · Sujets corrigés · Tuteur IA</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Feed (community)
// =================================================================
const SceneFeed: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const likes = Math.round(interpolate(f, [60, 110], [42, 87], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const liked = f >= 70;
  const pulse = liked ? 1 + 0.3 * Math.exp(-((f - 70) / 8) ** 2) : 1;
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 900 }}>
          <div style={{ fontSize: 16, color: C.teal, letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>FEED COMMUNAUTÉ</div>
          <div style={{ fontFamily: SERIF, fontSize: 64, letterSpacing: -1.5, marginBottom: 36 }}>Personne n'apprend seul.</div>

          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FF9F00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>WC</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Wideline C. <span style={{ color: C.teal, fontSize: 14, marginLeft: 6 }}>NS3 · Cap-Haïtien</span></div>
                <div style={{ fontSize: 14, color: C.muted }}>il y a 12 min</div>
              </div>
            </div>
            <div style={{ fontSize: 22, lineHeight: 1.5, color: C.ink, marginBottom: 22 }}>
              Yo, j'ai enfin compris les équations du 2nd degré grâce à Jude 🔥 quelqu'un veut réviser ensemble avant le test de vendredi ?
            </div>
            <div style={{ display: "flex", gap: 28, alignItems: "center", color: C.muted, fontSize: 18, fontWeight: 600 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: liked ? "#E11D48" : C.muted, transform: `scale(${pulse})` }}>
                <span style={{ fontSize: 24 }}>{liked ? "♥" : "♡"}</span> {likes}
              </div>
              <div>💬 14</div>
              <div>↗ Partager</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Messages
// =================================================================
const SceneMessages: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const dot = Math.floor(f / 8) % 3;
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 900 }}>
          <div style={{ fontFamily: SERIF, fontSize: 64, letterSpacing: -1.5, marginBottom: 28 }}>Messages directs.</div>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, minHeight: 380 }}>
            {/* incoming */}
            <div style={{ display: "flex", marginBottom: 14, opacity: interpolate(f, [10, 30], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ background: C.surface, padding: "14px 20px", borderRadius: 18, fontSize: 20, maxWidth: 500 }}>
                Salut ! Tu fais quoi ce soir ? On révise SVT ?
              </div>
            </div>
            {/* outgoing */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, opacity: interpolate(f, [40, 60], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ background: C.teal, color: "#fff", padding: "14px 20px", borderRadius: 18, fontSize: 20, maxWidth: 500 }}>
                Carrément 🙌 j'arrive à 19h sur l'app
              </div>
            </div>
            {/* typing indicator */}
            {f > 70 && (
              <div style={{ display: "flex", opacity: interpolate(f, [70, 85], [0, 1], { extrapolateRight: "clamp" }) }}>
                <div style={{ background: C.surface, padding: "16px 22px", borderRadius: 18, display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: dot === i ? C.teal : "#bbb" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Quiz Battle countdown
// =================================================================
const SceneQuiz: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const n = f < 40 ? 3 : f < 70 ? 2 : f < 100 ? 1 : 0;
  const showGo = f >= 100;
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: C.amber, letterSpacing: 4, fontWeight: 700, marginBottom: 18 }}>QUIZ BATTLE · 1 vs 1</div>
          <div style={{ fontFamily: SERIF, fontSize: 64, marginBottom: 50, color: C.ink, letterSpacing: -1 }}>
            Marvens <span style={{ color: C.muted }}>vs</span> Stéphanie
          </div>
          <div
            key={n}
            style={{
              fontFamily: SERIF,
              fontSize: 380,
              lineHeight: 1,
              color: showGo ? C.teal : C.ink,
              transform: `scale(${interpolate((f) % 30, [0, 15, 30], [0.85, 1.05, 1])})`,
            }}
          >
            {showGo ? "GO!" : n}
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Chess + Passions split
// =================================================================
const SceneChessPassions: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <Paper>
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", opacity: op }}>
        {/* chess */}
        <div style={{ flex: 1, padding: 80, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 16, color: C.teal, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>ÉCHECS · MULTIJOUEUR</div>
          <div style={{ fontFamily: SERIF, fontSize: 72, letterSpacing: -1.5, marginBottom: 40 }}>Joue. Apprends.</div>
          <div style={{ width: 500, height: 500, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", border: `2px solid ${C.ink}`, borderRadius: 8, overflow: "hidden" }}>
            {Array.from({ length: 64 }).map((_, i) => {
              const r = Math.floor(i / 8);
              const c = i % 8;
              const dark = (r + c) % 2 === 1;
              return <div key={i} style={{ background: dark ? "#B5876A" : "#F2E3CC" }} />;
            })}
          </div>
        </div>
        {/* passions */}
        <div style={{ flex: 1, padding: 80, background: C.surface, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 16, color: C.amber, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>PASSIONS</div>
          <div style={{ fontFamily: SERIF, fontSize: 72, letterSpacing: -1.5, marginBottom: 40 }}>Découvre ta voie.</div>
          {["Médecine", "Ingénierie", "Arts & Design", "Entrepreneuriat", "Droit"].map((p, i) => {
            const d = i * 8;
            const o = interpolate(f, [d, d + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const x = interpolate(f, [d, d + 30], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
            return (
              <div key={p} style={{ fontFamily: SERIF, fontSize: 48, color: C.ink, opacity: o, transform: `translateX(${x}px)`, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                {p}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Translate Kreyòl
// =================================================================
const SceneTranslate: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const word = "Bonjou";
  const trans = "Bonjour";
  const showTrans = f > 40;
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 1200 }}>
          <div style={{ fontSize: 16, color: C.teal, letterSpacing: 3, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>TRADUCTEUR · KREYÒL ↔ FRANÇAIS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 40, alignItems: "center" }}>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: C.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 18 }}>KREYÒL</div>
              <div style={{ fontFamily: SERIF, fontSize: 96, color: C.ink, letterSpacing: -2 }}>{word}</div>
            </div>
            <div style={{ fontSize: 48, color: C.teal }}>→</div>
            <div style={{ background: C.teal, color: "#fff", borderRadius: 20, padding: 40, textAlign: "center", opacity: showTrans ? interpolate(f, [40, 60], [0, 1], { extrapolateRight: "clamp" }) : 0 }}>
              <div style={{ fontSize: 14, opacity: 0.8, letterSpacing: 2, fontWeight: 700, marginBottom: 18 }}>FRANÇAIS</div>
              <div style={{ fontFamily: SERIF, fontSize: 96, letterSpacing: -2 }}>{trans}</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Outro
// =================================================================
const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 40], [20, 0], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", opacity: op, transform: `translateY(${y}px)` }}>
          <div style={{ fontSize: 28, color: C.teal, letterSpacing: 4, fontWeight: 600, marginBottom: 30 }}>ÉDUPRENEURS</div>
          <div style={{ fontFamily: SERIF, fontSize: 220, lineHeight: 0.95, letterSpacing: -6, color: C.ink }}>
            Ton école.
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 220, lineHeight: 0.95, letterSpacing: -6, color: C.teal, fontStyle: "italic" }}>
            Réinventée.
          </div>
          <div
            style={{
              marginTop: 70,
              display: "inline-block",
              background: C.ink,
              color: "#fff",
              padding: "22px 44px",
              borderRadius: 999,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 0.5,
              opacity: interpolate(f, [30, 60], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            mon-edupreneur.com
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// MAIN — Series of all scenes with cross-fades
// =================================================================
// Scene durations (frames @ 30fps). Total: 2400 frames = 80s.
const SCENES: Array<{ comp: React.FC; dur: number }> = [
  { comp: SceneGoogle, dur: 165 }, // 5.5s
  { comp: SceneLanding, dur: 120 }, // 4s
  { comp: SceneGrades, dur: 195 }, // 6.5s — selection wizard
  { comp: () => <BigWord word="ÉCOLE." />, dur: 90 }, // 3s
  { comp: SceneDashboard, dur: 150 }, // 5s
  { comp: SceneMatieres, dur: 135 }, // 4.5s
  { comp: SceneLesson, dur: 150 }, // 5s
  { comp: () => <BigWord word="Jude." accent />, dur: 90 }, // 3s
  { comp: SceneJude, dur: 195 }, // 6.5s
  { comp: SceneExams, dur: 150 }, // 5s
  { comp: () => <BigWord word="ENSEMBLE." />, dur: 90 }, // 3s
  { comp: SceneFeed, dur: 150 }, // 5s
  { comp: SceneMessages, dur: 135 }, // 4.5s
  { comp: SceneQuiz, dur: 135 }, // 4.5s
  { comp: SceneChessPassions, dur: 150 }, // 5s
  { comp: SceneTranslate, dur: 120 }, // 4s
  { comp: SceneOutro, dur: 180 }, // 6s
];

export const MainVideoV3: React.FC = () => {
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {SCENES.map((s, i) => {
        const from = acc;
        acc += s.dur;
        const Comp = s.comp;
        return (
          <Sequence key={i} from={from} durationInFrames={s.dur}>
            <SceneFade durationInFrames={s.dur}>
              <Comp />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);
