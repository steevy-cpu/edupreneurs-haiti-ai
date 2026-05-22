import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

// Fonts loaded at module scope so the Remotion bundler embeds them.
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

// Apple-style easings used everywhere for coherence.
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// Quadratic Bézier — used so the mouse cursor moves on an arc, not a straight line.
const bezier = (t: number, p0: number, p1: number, p2: number) =>
  (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;

// =================================================================
// Ambiance system — each scene picks one of 6 atmospheres so the eye
// never sits on the same canvas. Subtle but visible.
// =================================================================
type Ambiance = "paper" | "grid" | "halo" | "ivory" | "cold" | "teal" | "haloCenter";
const AmbianceCtx = React.createContext<Ambiance>("paper");

// Floating teal particles — adds depth, ~3-5 dots drifting slowly.
const Particles: React.FC<{ count?: number; color?: string }> = ({ count = 4, color = C.teal }) => {
  const f = useCurrentFrame();
  const pts = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 187) % 1700) + 110,
        y: ((i * 263) % 900) + 90,
        r: 3 + ((i * 7) % 6),
        speed: 0.15 + ((i * 13) % 30) / 100,
        phase: (i * 41) % 360,
      })),
    [count]
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pts.map((p, i) => {
        const dy = Math.sin((f * p.speed + p.phase) * (Math.PI / 180)) * 18;
        const dx = Math.cos((f * p.speed * 0.7 + p.phase) * (Math.PI / 180)) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + dx,
              top: p.y + dy,
              width: p.r,
              height: p.r,
              borderRadius: "50%",
              background: color,
              opacity: 0.18,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Persistent ambiance-aware background. Backward compatible — defaults to paper.
const Paper: React.FC<{ children?: React.ReactNode; ambiance?: Ambiance }> = ({ children, ambiance: amb }) => {
  const ctxAmb = React.useContext(AmbianceCtx);
  const ambiance = amb ?? ctxAmb;
  let bg = C.paper;
  let overlay: React.ReactNode = null;
  let particles: React.ReactNode = null;
  switch (ambiance) {
    case "grid":
      overlay = (
        <AbsoluteFill
          style={{
            backgroundImage:
              "linear-gradient(rgba(8,126,126,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(8,126,126,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            pointerEvents: "none",
          }}
        />
      );
      particles = <Particles count={3} />;
      break;
    case "halo":
      overlay = (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(8,126,126,0.18) 0%, rgba(8,126,126,0) 45%)",
            pointerEvents: "none",
          }}
        />
      );
      particles = <Particles count={4} />;
      break;
    case "ivory":
      bg = "#F7F3EC";
      particles = <Particles count={3} color="#C9A84C" />;
      break;
    case "cold":
      bg = "#F4F6F7";
      particles = <Particles count={3} color={C.tealDim} />;
      break;
    case "teal":
      bg = "#0A4F4F";
      overlay = (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 60%)",
            pointerEvents: "none",
          }}
        />
      );
      particles = <Particles count={5} color="#7BD3D3" />;
      break;
    case "haloCenter":
      overlay = (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(8,126,126,0.14) 0%, rgba(8,126,126,0) 55%)",
            pointerEvents: "none",
          }}
        />
      );
      break;
  }
  return (
    <AbsoluteFill style={{ background: bg, fontFamily: SANS, color: ambiance === "teal" ? "#F7F3EC" : C.ink }}>
      {overlay}
      <AbsoluteFill
        style={{
          background:
            ambiance === "teal"
              ? "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)"
              : "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.05) 100%)",
          pointerEvents: "none",
        }}
      />
      {particles}
      {children}
    </AbsoluteFill>
  );
};

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
// Reusable mouse cursor SVG (used in Google + Grades scenes)
// =================================================================
const MouseCursor: React.FC<{ x: number; y: number; pressed?: boolean }> = ({ x, y, pressed }) => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      left: x - 6,
      top: y - 4,
      pointerEvents: "none",
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
      transform: pressed ? "scale(0.92)" : "scale(1)",
      transformOrigin: "6px 4px",
    }}
  >
    <path
      d="M3 2 L3 18 L7 14 L10 21 L13 20 L10 13 L17 13 Z"
      fill="#fff"
      stroke="#1a1a1a"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

// =================================================================
// Edupreneurs favicon mark (used in Google autocomplete)
// =================================================================
const EduMark: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: C.teal,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: SERIF,
      fontSize: size * 0.65,
      fontStyle: "italic",
      flexShrink: 0,
    }}
  >
    E
  </div>
);

// =================================================================
// Human typing simulator — variable per-char delays + 1 hesitation/backspace
// Returns the visible text at the current frame, plus a caret hint.
// Why scripted: a real human pauses, mis-types, corrects. Uniform speed = robotic.
// =================================================================
type TypingStep = { ch: string; delay: number; backspace?: boolean };

const TYPING_SCRIPT: TypingStep[] = [
  // "mon"
  { ch: "m", delay: 6 },
  { ch: "o", delay: 5 },
  { ch: "n", delay: 5 },
  // Long pause — "did I spell it right?" beat
  { ch: "-", delay: 24 },
  // "edu" comes faster, in the flow
  { ch: "e", delay: 5 },
  { ch: "d", delay: 4 },
  { ch: "u", delay: 5 },
  // Hesitation: type "pe", pause, backspace, retype "pr"
  { ch: "p", delay: 7 },
  { ch: "e", delay: 6 },
  { ch: "", delay: 14, backspace: true }, // delete the wrong 'e'
  { ch: "r", delay: 9 },
  // "eneur" — comfortable cadence
  { ch: "e", delay: 5 },
  { ch: "n", delay: 5 },
  { ch: "e", delay: 5 },
  { ch: "u", delay: 6 },
  { ch: "r", delay: 6 },
  // Tiny breath before the TLD
  { ch: ".", delay: 12 },
  { ch: "c", delay: 7 },
  { ch: "o", delay: 5 },
  { ch: "m", delay: 6 },
];

const useHumanTyping = (startFrame: number) => {
  const f = useCurrentFrame();
  let text = "";
  let cursor = startFrame;
  let lastEventFrame = startFrame;
  for (const step of TYPING_SCRIPT) {
    cursor += step.delay;
    if (f < cursor) break;
    if (step.backspace) {
      text = text.slice(0, -1);
    } else {
      text += step.ch;
    }
    lastEventFrame = cursor;
  }
  // Caret blinks only when not actively typing (gap ≥ 6f since last event).
  const idle = f - lastEventFrame > 6;
  const showCaret = idle ? Math.floor(f / 14) % 2 === 0 : true;
  const totalDur = TYPING_SCRIPT.reduce((a, s) => a + s.delay, 0);
  const done = f >= startFrame + totalDur;
  return { text, showCaret, done, endFrame: startFrame + totalDur };
};

// =================================================================
// SCENE 1 — Google search with HUMAN typing + mouse cursor
// =================================================================
const SceneGoogle: React.FC = () => {
  const f = useCurrentFrame();
  const { text, showCaret, done, endFrame } = useHumanTyping(20);

  // Autocomplete drops after the user pauses near the end (after ".com" or near it).
  const showAuto = text.length >= 12;

  // Mouse moves on a Bézier arc toward the autocomplete suggestion after typing finishes.
  const clickStart = endFrame + 14;
  const clickEnd = clickStart + 22;
  const cursorT = interpolate(f, [clickStart, clickEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx0 = 1180, cy0 = 320; // resting position (near the search bar)
  const cx2 = 1060, cy2 = 700; // suggestion target
  const cxC = 1320, cyC = 460; // control point — gives the arc
  const cursorX = bezier(easeInOut(cursorT), cx0, cxC, cx2);
  const cursorY = bezier(easeInOut(cursorT), cy0, cyC, cy2);
  const pressed = f >= clickEnd - 3 && f < clickEnd + 4;
  const navigating = f >= clickEnd + 4;

  // Whole window enters with subtle scale
  const enterScale = interpolate(f, [0, 25], [0.98, 1], { extrapolateRight: "clamp", easing: ease });
  const enterOp = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Subtle zoom on navigation moment, white flash near the end
  const navScale = navigating ? interpolate(f, [clickEnd + 4, clickEnd + 26], [1, 1.04], { extrapolateRight: "clamp", easing: ease }) : 1;
  const flash = navigating ? interpolate(f, [clickEnd + 18, clickEnd + 30], [0, 1], { extrapolateRight: "clamp" }) : 0;

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
            transform: `scale(${enterScale * navScale})`,
            opacity: enterOp,
          }}
        >
          {/* browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: "#FAFAFA" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
            <div style={{ marginLeft: 18, padding: "6px 14px", background: "#fff", borderRadius: 8, fontSize: 14, color: "#5f6368", border: `1px solid ${C.border}`, minWidth: 420 }}>
              🔒 google.com
            </div>
          </div>
          {/* google body */}
          <div style={{ padding: "60px 80px 50px", textAlign: "center" }}>
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
              <div style={{ fontSize: 22, color: C.ink, textAlign: "left", flex: 1, fontFamily: SANS }}>
                {text}
                {showCaret && !done && <span style={{ borderLeft: "2px solid #4285F4", marginLeft: 1 }}>&nbsp;</span>}
              </div>
            </div>

            {/* autocomplete — 2 suggestions, the first being the chosen one */}
            {showAuto && (
              <div
                style={{
                  marginTop: 10,
                  maxWidth: 700,
                  margin: "10px auto 0",
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "8px 0",
                  textAlign: "left",
                  overflow: "hidden",
                  opacity: interpolate(f, [endFrame - 15, endFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 22px",
                    background: pressed ? "#F1F3F4" : "transparent",
                    fontSize: 18,
                    color: C.ink,
                  }}
                >
                  <EduMark size={22} />
                  <span><b>mon-edupreneur.com</b> — apprendre autrement en Haïti</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 22px",
                    fontSize: 18,
                    color: C.inkDim,
                  }}
                >
                  <span style={{ color: "#9aa0a6", fontSize: 18 }}>↗</span>
                  <span>mon edupreneur connexion</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* mouse cursor — present from frame 0, subtle drift, then arc toward suggestion */}
        <MouseCursor x={cursorX} y={cursorY} pressed={pressed} />

        {/* white flash for the page-transition feel */}
        <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
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
// SCENE 3 — Grade selection (7 classes) with Bézier cursor + focus ring
// =================================================================
const GRADES = [
  { code: "7ᵉ AF", sub: "Fondamental" },
  { code: "8ᵉ AF", sub: "Fondamental" },
  { code: "9ᵉ AF", sub: "Fondamental" },
  { code: "NS1", sub: "Secondaire" },
  { code: "NS2", sub: "Secondaire" },
  { code: "NS3", sub: "Secondaire avancé" }, // corrected: series only appear at NS4
  { code: "NS4", sub: "Baccalauréat" },
];

const SceneGrades: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(f, [0, 25], [20, 0], { extrapolateRight: "clamp", easing: ease });

  const cardW = 240;
  const cardH = 200;
  const gap = 24;
  const cols = 4;
  const gridW = cols * cardW + (cols - 1) * gap;
  const startX = (1920 - gridW) / 2;
  const startY = 420;

  // Cursor moves on a Bézier arc — more natural than a straight slide.
  const cursorStart = 90;
  const cursorEnd = 138;
  const cursorT = interpolate(f, [cursorStart, cursorEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetIdx = 5; // NS3
  const targetCol = targetIdx % cols;
  const targetRow = Math.floor(targetIdx / cols);
  const targetX = startX + targetCol * (cardW + gap) + cardW / 2;
  const targetY = startY + targetRow * (cardH + gap) + cardH / 2;
  const p0x = 1700, p0y = 200;
  const cpx = 1280, cpy = 280; // arc control point
  const cursorX = bezier(easeInOut(cursorT), p0x, cpx, targetX);
  const cursorY = bezier(easeInOut(cursorT), p0y, cpy, targetY);
  // Hover sustained for 18 frames before click
  const hoverActive = f >= 120 && f < 138;
  const pressed = f >= 136 && f < 142;
  const clicked = f >= 138;

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
            gap,
          }}
        >
          {GRADES.map((g, i) => {
            const delay = 25 + i * 7;
            const op = interpolate(f, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const ty = interpolate(f, [delay, delay + 25], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
            const isTarget = i === targetIdx;
            const hover = isTarget && hoverActive ? 1 : 0;
            const isSelected = isTarget && clicked;
            const sc = 1 + hover * 0.04;
            const bg = isSelected ? C.teal : C.surface;
            const fg = isSelected ? "#fff" : C.ink;
            const sub = isSelected ? "rgba(255,255,255,0.75)" : C.muted;
            // Focus ring scales in while hover is active
            const ringT = isTarget ? interpolate(f, [120, 132], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
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
                  color: fg,
                  position: "relative",
                  boxShadow: isSelected ? "0 20px 50px -20px rgba(8,126,126,0.5)" : "none",
                }}
              >
                {/* hover focus ring */}
                {isTarget && !isSelected && ringT > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: 22,
                      border: `2px solid ${C.teal}`,
                      opacity: ringT,
                      transform: `scale(${0.96 + ringT * 0.04})`,
                      pointerEvents: "none",
                    }}
                  />
                )}
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
                      opacity: interpolate(f, [138, 152], [0, 1], { extrapolateRight: "clamp" }),
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
        {f >= cursorStart && <MouseCursor x={cursorX} y={cursorY} pressed={pressed} />}

        {/* Editorial confirmation badge */}
        {clicked && (
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: interpolate(f, [148, 165, 180, 188], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <div style={{ fontFamily: SERIF, fontSize: 44, color: C.ink, letterSpacing: -1 }}>
              NS3 — <span style={{ fontStyle: "italic", color: C.teal }}>tu es prêt.</span>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// Big serif word scenes — now with kicker + subtitle + animated rule
// =================================================================
const BigWord: React.FC<{ word: string; kicker?: string; sub?: string; accent?: boolean }> = ({ word, kicker, sub, accent }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const blur = interpolate(f, [0, 22], [12, 0], { extrapolateRight: "clamp" });
  const scale = interpolate(f, [0, 90], [1.0, 1.08], { extrapolateRight: "clamp", easing: ease });
  const kickerOp = interpolate(f, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const ruleW = interpolate(f, [22, 62], [0, 140], { extrapolateRight: "clamp", easing: ease });
  const subOp = interpolate(f, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(f, [30, 55], [12, 0], { extrapolateRight: "clamp", easing: ease });
  // Big words sit on deep teal — strong cinematic break against paper scenes.
  const ivory = "#F5F0E4";
  const wordColor = accent ? "#FFD27A" : ivory;
  return (
    <Paper ambiance="teal">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", opacity: op, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
          {kicker && (
            <div style={{ fontSize: 18, color: "#7BD3D3", letterSpacing: 6, fontWeight: 700, marginBottom: 32, opacity: kickerOp }}>
              {kicker}
            </div>
          )}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 360,
              letterSpacing: -14,
              color: wordColor,
              lineHeight: 0.9,
              fontStyle: accent ? "italic" : "normal",
              textShadow: "0 8px 40px rgba(0,0,0,0.35)",
            }}
          >
            {word}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
            <div style={{ width: `${ruleW}px`, height: 1.5, background: ivory, opacity: 0.5 }} />
          </div>
          {sub && (
            <div
              style={{
                marginTop: 30,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 44,
                color: "rgba(245,240,228,0.72)",
                opacity: subOp,
                transform: `translateY(${subY}px)`,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Dashboard mockup with counters (Wideline, overshoot, SVG icons)
// =================================================================
// Counter with subtle overshoot — lands above target, then settles.
const Counter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = "" }) => {
  const f = useCurrentFrame();
  const overshoot = target * 1.022;
  // Climbs to overshoot by f=55, then settles to target by f=72
  const v = Math.round(
    f < 55
      ? interpolate(f, [10, 55], [0, overshoot], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })
      : interpolate(f, [55, 72], [overshoot, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })
  );
  return <span>{v.toLocaleString("fr-FR")}{suffix}</span>;
};

// Compact crafted icons (gold coin / flame / level-up) — replaces glyph diamonds.
const IconCoin: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill={color} />
    <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.85" />
    <text x="12" y="16" textAnchor="middle" fontFamily={SERIF} fontSize="11" fill="#fff" fontWeight="700">G</text>
  </svg>
);
const IconFlame: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M12 2 C 13 6 17 8 17 13 a 5 5 0 0 1 -10 0 c 0 -3 2 -4 2 -7 c 1 2 3 3 3 -4 z" fill={color} />
  </svg>
);
const IconLevel: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M4 20 L 12 4 L 20 20 Z" fill={color} />
    <path d="M8 15 L 12 9 L 16 15 Z" fill="#fff" opacity="0.7" />
  </svg>
);

const SceneDashboard: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const sc = interpolate(f, [0, 150], [1, 1.04], { extrapolateRight: "clamp", easing: ease });
  const stats = [
    { label: "GOLD", value: 2840, color: C.amber, Icon: IconCoin },
    { label: "STREAK", value: 27, suffix: " j", color: "#E85D3A", Icon: IconFlame },
    { label: "XP NIVEAU 12", value: 7350, color: C.teal, Icon: IconLevel },
  ] as const;
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ transform: `scale(${sc})`, width: 1500 }}>
          <div style={{ fontSize: 18, color: C.muted, letterSpacing: 3, marginBottom: 14, fontWeight: 600 }}>TABLEAU DE BORD</div>
          <div style={{ fontFamily: SERIF, fontSize: 88, letterSpacing: -2, marginBottom: 50, color: C.ink }}>
            Salut, <span style={{ color: C.teal, fontStyle: "italic" }}>Wideline</span>.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {stats.map((s, i) => {
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
                    padding: 48,
                    opacity: cOp,
                    transform: `translateY(${cY}px)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                    <s.Icon color={s.color} />
                    <div style={{ fontSize: 14, color: C.muted, letterSpacing: 2, fontWeight: 700 }}>{s.label}</div>
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 96, letterSpacing: -3, color: C.ink, lineHeight: 1 }}>
                    <Counter target={s.value} suffix={(s as { suffix?: string }).suffix} />
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
// SCENE — Matières grid (monogram badges, no emoji mix)
// =================================================================
const MATIERES = [
  { name: "Mathématiques", letter: "M", color: C.teal },
  { name: "Français", letter: "F", color: "#7C3AED" },
  { name: "Sciences Physiques", letter: "P", color: "#3B82F6" },
  { name: "SVT", letter: "S", color: "#10B981" },
  { name: "Histoire", letter: "H", color: "#B45309" },
  { name: "Anglais", letter: "E", color: "#E11D48" },
];

const SceneMatieres: React.FC = () => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, 135], [1, 1.03], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1500, transform: `scale(${sc})` }}>
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
                      fontFamily: SERIF,
                      fontSize: 44,
                      lineHeight: 1,
                    }}
                  >
                    {m.letter}
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
// SCENE — Lesson with formula (polished pseudo-KaTeX)
// =================================================================
// Inline fraction renderer — proportional, classic LaTeX look.
const Frac: React.FC<{ top: React.ReactNode; bottom: React.ReactNode }> = ({ top, bottom }) => (
  <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 10px", lineHeight: 1.1 }}>
    <span style={{ padding: "0 14px" }}>{top}</span>
    <span style={{ width: "100%", height: 3, background: C.ink, margin: "8px 0" }} />
    <span style={{ padding: "0 14px" }}>{bottom}</span>
  </span>
);
const Sqrt: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
    <span style={{ fontSize: "1.2em", marginRight: 2 }}>√</span>
    <span style={{ borderTop: `3px solid ${C.ink}`, padding: "4px 6px 0" }}>{children}</span>
  </span>
);

const SceneLesson: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(f, [40, 150], [1, 1.08], { extrapolateRight: "clamp", easing: ease });
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
              background: `linear-gradient(180deg, ${C.paper} 0%, ${C.surface} 100%)`,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "60px 60px",
              fontFamily: SERIF,
              fontSize: 92,
              textAlign: "center",
              color: C.ink,
              letterSpacing: -1,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <span>x = </span>
            <Frac
              top={<span>−b ± <Sqrt>b² − 4ac</Sqrt></span>}
              bottom={<span>2a</span>}
            />
          </div>
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 18 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.teal}>
              <path d="M3 9 v 6 h 4 l 5 4 V 5 L 7 9 H 3 z" />
              <path d="M16 8 a 5 5 0 0 1 0 8" fill="none" stroke={C.teal} strokeWidth="2" />
            </svg>
            <span>Écouter cette leçon · 4 min</span>
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// SCENE — Jude AI tutor (breadcrumb, thinking state, slower streaming)
// =================================================================
const SceneJude: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const reply =
    "Bien sûr ! Pour résoudre x² − 5x + 6 = 0, on calcule le discriminant : Δ = b² − 4ac = 25 − 24 = 1. Comme Δ > 0, il y a deux solutions réelles : x₁ = 2 et x₂ = 3. Tu veux qu'on en fasse un autre ensemble ? ✨";
  // ~36 char/s — close to a real LLM perceived speed
  const charsPerFrame = 1.2;
  const streamStart = 60;
  const shown = Math.max(0, Math.floor((f - streamStart) * charsPerFrame));
  const text = reply.slice(0, shown);
  const thinking = f >= 30 && f < streamStart;
  const dot = Math.floor(f / 6) % 3;

  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 1200 }}>
          {/* header with breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDim})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SERIF, fontSize: 32 }}>J</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>Jude</div>
              <div style={{ fontSize: 15, color: C.muted, fontWeight: 500, marginTop: 2 }}>
                Maths <span style={{ color: C.border, margin: "0 6px" }}>·</span>
                NS3 <span style={{ color: C.border, margin: "0 6px" }}>·</span>
                Équations du 2ⁿᵈ degré
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 14, color: C.teal, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} />
              en ligne
            </div>
          </div>

          {/* user bubble with avatar */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 10, marginBottom: 18, opacity: interpolate(f, [10, 30], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ background: C.ink, color: "#fff", padding: "16px 24px", borderRadius: 20, fontSize: 22, maxWidth: 700 }}>
              Aide-moi à résoudre x² − 5x + 6 = 0
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.amber, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>W</div>
          </div>

          {/* thinking → jude bubble */}
          <div style={{ minHeight: 220 }}>
            {thinking && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.surface, padding: "16px 22px", borderRadius: 18, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18, color: C.teal }}>✨</span>
                <span style={{ fontSize: 18, color: C.muted }}>Jude réfléchit</span>
                <span style={{ display: "inline-flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: dot === i ? C.teal : "#ccc" }} />
                  ))}
                </span>
              </div>
            )}
            {f >= streamStart && (
              <div style={{ opacity: interpolate(f, [streamStart, streamStart + 8], [0, 1], { extrapolateRight: "clamp" }) }}>
                <div style={{ background: C.surface, color: C.ink, padding: "22px 28px", borderRadius: 20, fontSize: 22, lineHeight: 1.55, maxWidth: 900, border: `1px solid ${C.border}` }}>
                  {text}
                  {text.length < reply.length && (
                    <span style={{ display: "inline-block", width: 2, height: 22, background: C.teal, marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0.2 }} />
                  )}
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
  const pulse = liked ? 1 + 0.3 * Math.exp(-Math.pow((f - 70) / 8, 2)) : 1;
  const sc = interpolate(f, [0, 150], [1, 1.03], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 900, transform: `scale(${sc})` }}>
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
  const sc = interpolate(f, [0, 135], [1, 1.03], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 900, transform: `scale(${sc})` }}>
          <div style={{ fontFamily: SERIF, fontSize: 64, letterSpacing: -1.5, marginBottom: 28 }}>Messages directs.</div>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, minHeight: 380 }}>
            <div style={{ display: "flex", marginBottom: 14, opacity: interpolate(f, [10, 30], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ background: C.surface, padding: "14px 20px", borderRadius: 18, fontSize: 20, maxWidth: 500 }}>
                Salut ! Tu fais quoi ce soir ? On révise SVT ?
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, opacity: interpolate(f, [40, 60], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ background: C.teal, color: "#fff", padding: "14px 20px", borderRadius: 18, fontSize: 20, maxWidth: 500 }}>
                Carrément 🙌 j'arrive à 19h sur l'app
              </div>
            </div>
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
// SCENE — Quiz Battle countdown with real UI + clean pulse + screen rumble
// =================================================================
const SceneQuiz: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Countdown beats: 3 (10-40), 2 (40-70), 1 (70-100), GO! (100-130)
  const beat = f < 40 ? { n: "3", start: 10 } : f < 70 ? { n: "2", start: 40 } : f < 100 ? { n: "1", start: 70 } : { n: "GO!", start: 100 };
  const local = f - beat.start;
  // appear (0-8), hold (8-22), fade-out (22-30)
  const num0 = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const num1 = interpolate(local, [22, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numScale = interpolate(local, [0, 8], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const isGo = beat.n === "GO!";

  // Screen rumble for "GO!" — subtle, sinusoidal, 6 frames
  const rumbleActive = isGo && local >= 0 && local < 8;
  const rx = rumbleActive ? Math.sin(local * 4) * 3 : 0;
  const ry = rumbleActive ? Math.cos(local * 5) * 2 : 0;

  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op, transform: `translate(${rx}px, ${ry}px)` }}>
        <div style={{ textAlign: "center", width: 1200 }}>
          <div style={{ fontSize: 18, color: C.amber, letterSpacing: 4, fontWeight: 700, marginBottom: 26 }}>QUIZ BATTLE · 1 vs 1</div>

          {/* Players row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 50, marginBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: C.teal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 44, border: `3px solid ${C.ink}` }}>W</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Wideline</div>
              <div style={{ fontSize: 14, color: C.muted, letterSpacing: 1 }}>NS3 · 1420 pts</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontFamily: SERIF, fontSize: 52, color: C.ink, letterSpacing: -1 }}>0 — 0</div>
              <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, fontWeight: 700 }}>VS</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#7C3AED", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 44, border: `3px solid ${C.ink}` }}>S</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Stéphanie</div>
              <div style={{ fontSize: 14, color: C.muted, letterSpacing: 1 }}>NS3 · 1380 pts</div>
            </div>
          </div>

          {/* Countdown number */}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: isGo ? 280 : 320,
              lineHeight: 1,
              color: isGo ? C.amber : C.ink,
              letterSpacing: isGo ? -8 : -12,
              fontStyle: isGo ? "italic" : "normal",
              opacity: Math.min(num0, num1),
              transform: `scale(${numScale})`,
            }}
          >
            {beat.n}
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
  const sc = interpolate(f, [0, 120], [1, 1.03], { extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
        <div style={{ width: 1200, transform: `scale(${sc})` }}>
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
// SCENE — Outro (editorial, not marketing pill)
// =================================================================
const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 40], [20, 0], { extrapolateRight: "clamp", easing: ease });
  const ruleW = interpolate(f, [50, 90], [0, 120], { extrapolateRight: "clamp", easing: ease });
  const urlOp = interpolate(f, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const footOp = interpolate(f, [110, 140], [0, 1], { extrapolateRight: "clamp" });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", opacity: op, transform: `translateY(${y}px)` }}>
          {/* mark */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
            <EduMark size={72} />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 200, lineHeight: 0.95, letterSpacing: -6, color: C.ink }}>
            Ton école.
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 200, lineHeight: 0.95, letterSpacing: -6, color: C.teal, fontStyle: "italic" }}>
            Réinventée.
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
            <div style={{ width: `${ruleW}px`, height: 1.5, background: C.ink, opacity: 0.6 }} />
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: -0.5,
              color: C.ink,
              opacity: urlOp,
            }}
          >
            mon-edupreneur.com
          </div>
          <div
            style={{
              marginTop: 42,
              fontSize: 16,
              letterSpacing: 3,
              color: C.muted,
              fontWeight: 600,
              opacity: footOp,
            }}
          >
            CONÇU EN HAÏTI · POUR HAÏTI
          </div>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// =================================================================
// MAIN — Sequence of all scenes with cross-fades
// =================================================================
// Scene durations (frames @ 30fps).
// SceneGoogle extended to 240 because human-typing + cursor click takes longer.
// Each scene picks an ambiance so the canvas changes mood across the video.
type SceneDef = { comp: React.FC; dur: number; amb: Ambiance; cam?: "panLeft" | "pushIn" | "pullOut" | "scrollUp" | "none" };
const SCENES: SceneDef[] = [
  { comp: SceneGoogle, dur: 240, amb: "paper", cam: "none" },
  { comp: SceneLanding, dur: 120, amb: "paper", cam: "none" },
  { comp: SceneGrades, dur: 210, amb: "grid", cam: "none" },
  { comp: () => <BigWord word="ÉCOLE." kicker="PARTIE 1" sub="Toute la tienne, dans ta poche." />, dur: 100, amb: "teal" },
  { comp: SceneDashboard, dur: 150, amb: "halo", cam: "panLeft" },
  { comp: SceneMatieres, dur: 135, amb: "grid", cam: "pullOut" },
  { comp: SceneLesson, dur: 150, amb: "halo", cam: "pushIn" },
  { comp: () => <BigWord word="Jude." kicker="PARTIE 2" sub="Ton tuteur, jour et nuit." accent />, dur: 100, amb: "teal" },
  { comp: SceneJude, dur: 240, amb: "ivory", cam: "pushIn" },
  { comp: SceneExams, dur: 150, amb: "ivory", cam: "none" },
  { comp: () => <BigWord word="ENSEMBLE." kicker="PARTIE 3" sub="Parce que personne n'apprend seul." />, dur: 100, amb: "teal" },
  { comp: SceneFeed, dur: 150, amb: "cold", cam: "scrollUp" },
  { comp: SceneMessages, dur: 135, amb: "cold", cam: "none" },
  { comp: SceneQuiz, dur: 140, amb: "cold", cam: "none" },
  { comp: SceneChessPassions, dur: 150, amb: "halo", cam: "none" },
  { comp: SceneTranslate, dur: 120, amb: "ivory", cam: "none" },
  { comp: SceneOutro, dur: 195, amb: "haloCenter", cam: "pushIn" },
];

// Virtual camera — subtle transform applied per-scene to break the static feel.
const Camera: React.FC<{ kind: SceneDef["cam"]; dur: number; children: React.ReactNode }> = ({ kind, dur, children }) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, dur));
  const e = ease(t);
  let transform = "";
  if (kind === "panLeft") transform = `translateX(${interpolate(e, [0, 1], [10, -20])}px)`;
  else if (kind === "pushIn") transform = `scale(${interpolate(e, [0, 1], [1.0, 1.04])})`;
  else if (kind === "pullOut") transform = `scale(${interpolate(e, [0, 1], [1.05, 1.0])})`;
  else if (kind === "scrollUp") transform = `translateY(${interpolate(e, [0, 1], [20, -30])}px)`;
  if (!transform) return <>{children}</>;
  return <AbsoluteFill style={{ transform, transformOrigin: "center center" }}>{children}</AbsoluteFill>;
};

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
            <AmbianceCtx.Provider value={s.amb}>
              <SceneFade durationInFrames={s.dur}>
                <Camera kind={s.cam ?? "none"} dur={s.dur}>
                  <Comp />
                </Camera>
              </SceneFade>
            </AmbianceCtx.Provider>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);
