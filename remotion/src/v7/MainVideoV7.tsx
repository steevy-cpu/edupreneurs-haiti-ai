/**
 * Edupreneurs Promo v7 — Polish pass on v6
 * Addresses: word-stagger subtitle, flat "ÇA CHANGE" with soft drop shadow,
 * cursor that actually clicks the CTA (with ripple + button press),
 * Quint-out matières stagger, vector-pure quadratic SVG with geometricPrecision,
 * harmonised quiz button radius, accessible footer contrast,
 * +15s of breathing room (total 73s / 2190f).
 */
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily: SANS } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const { fontFamily: SERIF } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });

const C = {
  teal: "#087E7E",
  tealDark: "#065959",
  tealGlow: "#0FB5B5",
  amber: "#FF9F00",
  amberSoft: "#FFB840",
  violet: "#7C3AED",
  ink: "#0A0B0D",
  ink2: "#16191D",
  ink3: "#1F2328",
  paper: "#FFFFFF",
  paper2: "#F7F8FA",
  border: "#E5E7EB",
  text: "#0F172A",
  muted: "#64748B",
  green: "#22C55E",
  red: "#EF4444",
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
// Quint-out — cubic-bezier(0.16, 1, 0.3, 1) feel: very fast in, gentle settle
const easeOutQuint = (t: number) => 1 - Math.pow(1 - clamp01(t), 5);
const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

const fmtNum = (n: number) => n.toLocaleString("fr-FR").replace(/\u00A0/g, " ");

// ============================================================
// Watermark
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

// ============================================================
// FakeCursor v7 — now lands EXACTLY at click target with ripple + press
// ============================================================
const FakeCursor: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  startFrame: number;
  travel?: number;
  clickAt?: number;
}> = ({ from, to, startFrame, travel = 28, clickAt }) => {
  const f = useCurrentFrame();
  if (f < startFrame) return null;
  const p = easeInOut(clamp01((f - startFrame) / travel));
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  // Concentric ripple emerges from the cursor tip when it lands
  const showRipple = clickAt !== undefined && f >= clickAt && f < clickAt + 22;
  const ripP = showRipple ? (f - (clickAt as number)) / 22 : 0;
  // Cursor press: small scale-down around click
  const pressed = clickAt !== undefined && f >= clickAt && f < clickAt + 7;
  return (
    <>
      {showRipple && (
        <>
          <div
            style={{
              position: "absolute",
              left: to.x - 32,
              top: to.y - 32,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: `3px solid ${C.amber}`,
              transform: `scale(${0.3 + ripP * 1.6})`,
              opacity: 1 - ripP,
              zIndex: 200,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: to.x - 18,
              top: to.y - 18,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${C.amber}66 0%, transparent 70%)`,
              transform: `scale(${0.5 + ripP * 1.2})`,
              opacity: 1 - ripP,
              zIndex: 199,
              pointerEvents: "none",
            }}
          />
        </>
      )}
      <svg
        width="28"
        height="32"
        viewBox="0 0 28 32"
        style={{
          position: "absolute",
          left: x,
          top: y,
          zIndex: 201,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
          transform: pressed ? "scale(0.86)" : "scale(1)",
          transformOrigin: "top left",
        }}
      >
        <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L20 16 Z" fill="#fff" stroke="#0A0B0D" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </>
  );
};

// ============================================================
// RollingDigit / RollingNumber (unchanged from v6)
// ============================================================
const RollingDigit: React.FC<{ digit: number; size: number; color: string }> = ({ digit, size, color }) => (
  <span style={{ display: "inline-block", height: size, width: size * 0.6, overflow: "hidden", verticalAlign: "top", position: "relative" }}>
    <span
      style={{
        display: "block",
        transform: `translateY(${-digit * size}px)`,
        color,
        fontVariantNumeric: "tabular-nums",
        lineHeight: `${size}px`,
        fontSize: size * 0.9,
        fontWeight: 900,
        letterSpacing: "-0.04em",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <span key={d} style={{ display: "block", height: size, textAlign: "center" }}>{d}</span>
      ))}
    </span>
  </span>
);

const RollingNumber: React.FC<{ value: number; size: number; color: string; suffix?: string; suffixColor?: string; suffixSize?: number }> = ({
  value, size, color, suffix, suffixColor, suffixSize,
}) => {
  const str = fmtNum(Math.max(0, Math.floor(value)));
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: SANS }}>
      {str.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <RollingDigit key={i} digit={parseInt(ch, 10)} size={size} color={color} />
        ) : (
          <span key={i} style={{ display: "inline-block", width: ch === " " ? size * 0.22 : size * 0.3, textAlign: "center", color, fontSize: size * 0.9, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: `${size}px` }}>{ch}</span>
        )
      )}
      {suffix && (
        <span style={{ color: suffixColor || color, fontSize: suffixSize || size * 0.65, fontWeight: 900, marginLeft: 6, letterSpacing: "-0.02em" }}>{suffix}</span>
      )}
    </span>
  );
};

// ============================================================
// Caption
// ============================================================
const Caption: React.FC<{ text: string; from: number; dur: number; y?: string; size?: number; color?: string; weight?: number }> = ({
  text, from, dur, y = "78%", size = 36, color = "#fff", weight = 700,
}) => {
  const f = useCurrentFrame();
  if (f < from || f > from + dur) return null;
  const local = f - from;
  const inP = easeOut(local / 10);
  const outP = easeOut((from + dur - f) / 8);
  const opacity = Math.min(inP, outP, 1);
  const ty = (1 - inP) * 18;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: SANS, fontWeight: weight, fontSize: size, color, letterSpacing: "-0.01em", opacity, transform: `translateY(${ty}px)`, textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}>
      {text}
    </div>
  );
};

// ============================================================
// ACT 1 — PROBLEM (5s / 150f) — word-by-word subtitle stagger
// ============================================================
const Act1Problem: React.FC = () => {
  const f = useCurrentFrame();
  const grain = (f * 13) % 2;
  // Subtitle tokens entering one-by-one with fade+slide-up, ease-out
  const subtitleTokens = ["Pannes", "·", "Pas de prof", "·", "Manuels chers"];
  const subtitleStart = 28;
  const tokenStagger = 5;

  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: SANS, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.6))" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32, transform: `translate(${grain - 1}px, 0)` }}>
        <div style={{ fontFamily: SERIF, fontSize: 132, color: "#fff", letterSpacing: "-0.04em", opacity: easeOut(f / 18), textAlign: "center", lineHeight: 1 }}>
          Étudier en Haïti,
          <br />
          <em style={{ color: C.amber, fontStyle: "italic" }}>c'est dur.</em>
        </div>
        {/* Subtitle — word-by-word, fade + 12px slide-up, ease-out */}
        <div style={{ fontSize: 40, color: "rgba(255,255,255,0.82)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {subtitleTokens.map((tok, i) => {
            const local = (f - subtitleStart - i * tokenStagger) / 14;
            const p = easeOut(local);
            return (
              <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
                {tok}
              </span>
            );
          })}
        </div>
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// ACT 2 — PROMISE — FLAT white (no bevel), diffuse drop shadow
// ============================================================
const Act2Promise: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 30, 60], [0.85, 1.04, 1.1], { extrapolateRight: "clamp" });
  const op = easeOut(f / 10);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${C.tealGlow} 0%, ${C.teal} 40%, ${C.tealDark} 100%)`, fontFamily: SANS, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 12px)`, opacity: op }} />
      {/* FLAT white text — no bevel, no back shadow div. Just a soft diffuse drop-shadow. */}
      <div
        style={{
          fontSize: 280,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.06em",
          transform: `scale(${s})`,
          opacity: op,
          textShadow: "0 8px 40px rgba(255,159,0,0.35), 0 2px 16px rgba(0,0,0,0.45), 0 30px 80px rgba(0,0,0,0.35)",
        }}
      >
        ÇA CHANGE.
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// AppFrame
// ============================================================
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
      <div style={{ width: 280, background: C.teal, color: "#fff", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ padding: "0 4px 24px" }}><BrandMark size={36} light /></div>
        {items.map((it) => (
          <div key={it.key} style={{ padding: "14px 16px", borderRadius: 12, background: it.key === active ? "rgba(255,255,255,0.18)" : "transparent", fontWeight: it.key === active ? 700 : 500, fontSize: 17, display: "flex", alignItems: "center", gap: 12, color: it.key === active ? "#fff" : "rgba(255,255,255,0.78)" }}>
            <span style={{ fontSize: 20 }}>{it.icon}</span>{it.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ background: "rgba(0,0,0,0.18)", borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.amber}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>W</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Wideline</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>NS4 · Série SVT</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ============================================================
// Scene Dashboard (265f) — cursor lands EXACTLY on "Reprendre" CTA
// ============================================================
const SceneDashboard: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [0, 265], [0, -30]);
  const gold = Math.round(interpolate(f, [10, 80], [0, 2840], { extrapolateRight: "clamp" }));
  const streak = Math.round(interpolate(f, [20, 80], [0, 12], { extrapolateRight: "clamp" }));
  const level = Math.round(interpolate(f, [30, 80], [0, 7], { extrapolateRight: "clamp" }));
  // Click choreography: cursor lands at ~f=145, press 145–152, ripple 145–167
  const clickF = 145;
  const pressed = f >= clickF && f < clickF + 7;
  return (
    <AppFrame active="dash">
      <div style={{ padding: 48, transform: `translateX(${pan}px)`, opacity: easeOut(f / 12) }}>
        <div style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>Bonswa, Wideline 👋</div>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "4px 0 32px" }}>Prête à reprendre ?</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
          {[
            { label: "Gold", value: gold, accent: C.amber, icon: "🪙" },
            { label: "Streak", value: streak, accent: C.red, icon: "🔥", suffix: " jours" },
            { label: "Niveau", value: level, accent: C.violet, icon: "⭐" },
          ].map((s, i) => {
            const cardP = easeOutQuint((f - i * 5) / 16);
            return (
              <div key={i} style={{ background: C.paper, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", opacity: cardP, transform: `translateY(${(1 - cardP) * 24}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 14, fontWeight: 600 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>{s.label}
                </div>
                <div style={{ marginTop: 8, height: 50, display: "flex", alignItems: "center" }}>
                  <RollingNumber value={s.value} size={50} color={s.accent} />
                  {s.suffix && <span style={{ color: s.accent, fontSize: 28, fontWeight: 800, marginLeft: 6 }}>{s.suffix}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: C.paper, borderRadius: 24, padding: 28, border: `1px solid ${C.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 24, opacity: easeOut((f - 30) / 16) }}>
          <div style={{ width: 88, height: 88, borderRadius: 20, background: `linear-gradient(135deg, ${C.teal}, ${C.tealGlow})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🧪</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>Continuer · Sciences SVT</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginTop: 4 }}>Chapitre 3 — La photosynthèse</div>
            <div style={{ marginTop: 12, height: 8, background: C.paper2, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${interpolate(f, [40, 200], [20, 68], { extrapolateRight: "clamp" })}%`, background: C.teal }} />
            </div>
          </div>
          {/* "Reprendre" button — visibly presses when cursor clicks */}
          <div
            style={{
              background: f > clickF ? C.amberSoft : C.amber,
              color: C.ink,
              padding: "14px 22px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 15,
              transform: pressed ? "scale(0.95)" : "scale(1)",
              boxShadow: f > 110 ? `0 10px 30px ${C.amber}66` : "none",
              transition: "none",
            }}
          >
            Reprendre →
          </div>
        </div>
      </div>
      {/* Cursor travels to and clicks the Reprendre button exactly */}
      <FakeCursor from={{ x: 400, y: 200 }} to={{ x: 1470, y: 615 }} startFrame={100} travel={45} clickAt={clickF} />
      <Caption text="Ton tableau de bord. Tout en un." from={20} dur={230} y="86%" size={28} color={C.text} />
    </AppFrame>
  );
};

// ============================================================
// Scene Matières (235f) — Quint-out stagger + cursor click
// ============================================================
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
  const clickF = 130;
  return (
    <AppFrame active="mat">
      <div style={{ padding: 48 }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Tes matières</h1>
        <div style={{ color: C.muted, fontSize: 18, marginBottom: 28 }}>NS4 — Série SVT · 100% programme MENFP</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {subjects.map((s, i) => {
            // Quint-out: rapid entrance, soft settle — cubic-bezier(0.16, 1, 0.3, 1) feel
            const localIn = easeOutQuint((f - i * 6) / 22);
            const opacity = localIn;
            const ty = (1 - localIn) * 32;
            const focused = i === 2 && f > clickF;
            const focusP = focused ? easeOut((f - clickF) / 18) : 0;
            const pressed = i === 2 && f >= clickF && f < clickF + 7;
            const scale = (1 + focusP * 0.05) * (pressed ? 0.97 : 1);
            return (
              <div key={i} style={{ background: C.paper, borderRadius: 20, padding: 24, border: `1px solid ${focused ? s.c : C.border}`, boxShadow: focused ? `0 14px 40px ${s.c}33` : "0 4px 20px rgba(0,0,0,0.04)", opacity, transform: `translateY(${ty}px) scale(${scale})` }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: s.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, marginBottom: 16 }}>{s.e}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{s.n}</div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{12 + i * 3} leçons · {3 + i} quiz</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Cursor hovers and clicks the SVT card (centre) */}
      <FakeCursor from={{ x: 400, y: 200 }} to={{ x: 990, y: 460 }} startFrame={85} travel={42} clickAt={clickF} />
      <Caption text="Tout le programme MENFP, classé pour toi." from={20} dur={200} y="88%" size={26} color={C.text} />
    </AppFrame>
  );
};

// ============================================================
// QuadraticFormulaSVG v7 — vector-pure, geometricPrecision, 2x viewBox
// ============================================================
const QuadraticFormulaSVG: React.FC<{ color: string }> = ({ color }) => (
  <svg
    viewBox="0 0 1040 320"
    width="100%"
    style={{ maxWidth: 760, display: "block", margin: "0 auto" }}
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
  >
    <g fontFamily={SERIF} fill={color}>
      {/* x = */}
      <text x="40" y="200" fontSize="144" fontStyle="italic">x</text>
      <text x="140" y="200" fontSize="128">=</text>
      {/* Numerator: -b ± √(b² - 4ac) */}
      <text x="280" y="124" fontSize="112">−</text>
      <text x="356" y="124" fontSize="112" fontStyle="italic">b</text>
      <text x="424" y="124" fontSize="112">±</text>
      {/* Radical: vector path with rounded joins */}
      <path
        d="M 524 56 L 548 124 L 572 36 L 960 36"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="580" y="124" fontSize="112" fontStyle="italic">b</text>
      <text x="640" y="80" fontSize="64">2</text>
      <text x="692" y="124" fontSize="112">−</text>
      <text x="772" y="124" fontSize="112">4</text>
      <text x="836" y="124" fontSize="112" fontStyle="italic">ac</text>
      {/* Fraction bar */}
      <line x1="280" y1="164" x2="960" y2="164" stroke={color} strokeWidth="5" strokeLinecap="round" />
      {/* Denominator: 2a — centred */}
      <text x="560" y="276" fontSize="112">2</text>
      <text x="624" y="276" fontSize="112" fontStyle="italic">a</text>
    </g>
  </svg>
);

// ============================================================
// Scene Lesson (265f)
// ============================================================
const SceneLesson: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 265], [1, 1.04]);
  return (
    <AppFrame active="mat">
      <div style={{ padding: 48, transform: `scale(${zoom})`, transformOrigin: "50% 30%", opacity: easeOut(f / 12) }}>
        <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>Matières › Mathématiques › Chapitre 5</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "8px 0 20px" }}>Équations du second degré</h1>
        <div style={{ background: C.paper, borderRadius: 24, padding: 36, border: `1px solid ${C.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 18, color: C.text, lineHeight: 1.6, marginBottom: 24 }}>
            Pour résoudre <strong>ax² + bx + c = 0</strong>, la solution est donnée par&nbsp;:
          </div>
          <div style={{ background: `linear-gradient(135deg, ${C.teal}11, ${C.tealGlow}11)`, border: `1px solid ${C.teal}33`, borderRadius: 16, padding: "32px 32px" }}>
            <QuadraticFormulaSVG color={C.text} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <div style={{ padding: "12px 20px", background: C.teal, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>▶ Écouter (voix Eric)</div>
            <div style={{ padding: "12px 20px", background: C.paper2, color: C.text, borderRadius: 12, fontWeight: 700, fontSize: 15, border: `1px solid ${C.border}` }}>✨ Demander à Jude</div>
          </div>
        </div>
      </div>
      <FakeCursor from={{ x: 500, y: 200 }} to={{ x: 595, y: 765 }} startFrame={150} travel={40} clickAt={200} />
      <Caption text="Des leçons claires, audio inclus." from={20} dur={220} y="90%" size={26} color={C.text} />
    </AppFrame>
  );
};

// ============================================================
// Scene Jude (175f) — unchanged from v6
// ============================================================
const SceneJude: React.FC = () => {
  const f = useCurrentFrame();
  const question = "Explique-moi le discriminant simplement";
  const answer = "Le discriminant Δ = b² − 4ac te dit combien de solutions ton équation a. Positif → 2 solutions. Nul → 1. Négatif → aucune (dans ℝ).";
  const qChars = Math.min(question.length, Math.floor(easeOut(f / 30) * question.length));
  const aStart = 55;
  const aProgress = easeOut(Math.max(0, (f - aStart) / 110));
  const aChars = Math.floor(aProgress * answer.length);
  const thinking = f > 40 && f < aStart + 4;
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: SANS }}>
      <div style={{ padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.violet}, ${C.tealGlow})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "#fff" }}>J</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Jude</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Ton tuteur IA · en ligne 24/7</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 48, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
          <div style={{ background: C.teal, color: "#fff", padding: "16px 22px", borderRadius: "20px 20px 4px 20px", fontSize: 22, fontWeight: 500, boxShadow: `0 10px 30px ${C.teal}44` }}>
            {question.slice(0, qChars)}
            {qChars < question.length && <span style={{ opacity: (f % 10) < 5 ? 1 : 0 }}>|</span>}
          </div>
        </div>
        {thinking && (
          <div style={{ alignSelf: "flex-start", color: "rgba(255,255,255,0.6)", fontSize: 18, fontStyle: "italic" }}>
            <span>✨ Jude réfléchit</span>
            <span style={{ opacity: (f % 18) < 6 ? 1 : 0.3 }}>.</span>
            <span style={{ opacity: (f % 18) < 12 ? 1 : 0.3 }}>.</span>
            <span style={{ opacity: (f % 18) < 18 ? 1 : 0.3 }}>.</span>
          </div>
        )}
        {aChars > 0 && (
          <div style={{ alignSelf: "flex-start", maxWidth: "75%" }}>
            <div style={{ background: C.ink2, color: "#fff", padding: "20px 26px", borderRadius: "20px 20px 20px 4px", fontSize: 22, fontWeight: 400, lineHeight: 1.5, border: "1px solid rgba(255,255,255,0.08)", boxShadow: `0 10px 30px ${C.violet}22` }}>
              {answer.slice(0, aChars)}
              {aChars < answer.length && <span style={{ opacity: (f % 10) < 5 ? 1 : 0, color: C.tealGlow }}>▌</span>}
            </div>
          </div>
        )}
      </div>
      <Caption text="Jude, ton tuteur IA. Toujours là." from={20} dur={140} y="88%" size={26} color="#fff" />
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// Particle burst
// ============================================================
const ParticleBurst: React.FC<{ x: number; y: number; startFrame: number; color: string; count?: number }> = ({ x, y, startFrame, color, count = 14 }) => {
  const f = useCurrentFrame();
  if (f < startFrame) return null;
  const t = (f - startFrame) / 30;
  if (t > 1) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = 180 * easeOut(t);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist + t * 40;
        const size = 10 - t * 6;
        return (
          <div key={i} style={{ position: "absolute", left: px, top: py, width: size, height: size, borderRadius: "50%", background: i % 2 === 0 ? color : C.amber, opacity: 1 - t, zIndex: 100 }} />
        );
      })}
    </>
  );
};

// ============================================================
// Scene Quiz (235f) — answer buttons radius harmonised to 18px
// ============================================================
const SceneQuiz: React.FC = () => {
  const f = useCurrentFrame();
  const countdown = f < 60 ? 3 - Math.floor(f / 20) : 0;
  const userScore = Math.round(interpolate(f, [60, 165], [0, 8], { extrapolateRight: "clamp" }));
  const oppScore = Math.round(interpolate(f, [60, 165], [0, 5], { extrapolateRight: "clamp" }));
  const localFrame = f % 20;
  const pulseScale = 1 + easeOut(1 - localFrame / 20) * 0.4;
  const correctAt = 130;
  const flashOpacity = f >= correctAt && f < correctAt + 12 ? 1 - (f - correctAt) / 12 : 0;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.ink} 0%, ${C.ink2} 100%)`, fontFamily: SANS, padding: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <BrandMark size={32} light />
        <div style={{ color: C.amber, fontWeight: 800, fontSize: 20, letterSpacing: "0.1em" }}>⚡ QUIZ BATTLE</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center", marginBottom: 40 }}>
        {[
          { name: "Toi", score: userScore, color: C.teal, init: "W" },
          null,
          { name: "Marvens", score: oppScore, color: C.violet, init: "M" },
        ].map((p, i) =>
          p === null ? (
            <div key={i} style={{ fontSize: 60, color: "#fff", fontWeight: 900 }}>VS</div>
          ) : (
            <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 28, textAlign: "center", border: `1px solid ${p.color}66` }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: p.color, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 36, color: "#fff" }}>{p.init}</div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: p.color, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{p.score}</div>
            </div>
          )
        )}
      </div>
      {countdown > 0 ? (
        <div style={{ textAlign: "center", fontSize: 200, fontWeight: 900, color: C.amber, lineHeight: 1, transform: `scale(${pulseScale})`, textShadow: `0 0 60px ${C.amber}88` }}>{countdown}</div>
      ) : f < 90 ? (
        <div style={{ textAlign: "center", fontSize: 220, fontWeight: 900, color: C.green, lineHeight: 1, transform: `scale(${pulseScale})`, textShadow: `0 0 80px ${C.green}99` }}>GO!</div>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 32, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", position: "relative" }}>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, fontWeight: 600, marginBottom: 12 }}>QUESTION 8 / 10</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, lineHeight: 1.3 }}>Quel est l'auteur de "Gouverneurs de la rosée" ?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>
            {["Jacques Roumain", "Jacques Stephen Alexis", "Frankétienne", "Dany Laferrière"].map((o, i) => {
              const isCorrect = i === 0;
              const revealed = isCorrect && f > correctAt;
              const popScale = revealed ? 1 + easeOut(Math.min(1, (f - correctAt) / 10)) * 0.06 - easeOut(Math.max(0, (f - correctAt - 10) / 12)) * 0.06 : 1;
              return (
                <div
                  key={i}
                  style={{
                    background: revealed ? C.green : "rgba(255,255,255,0.05)",
                    border: `1px solid ${revealed ? C.green : "rgba(255,255,255,0.12)"}`,
                    color: "#fff",
                    padding: "16px 20px",
                    // Harmonised radius — matches Examens cards & Stats blocks
                    borderRadius: 18,
                    fontSize: 18,
                    fontWeight: 600,
                    textAlign: "left",
                    transform: `scale(${popScale})`,
                    boxShadow: revealed ? `0 10px 40px ${C.green}66` : "none",
                  }}
                >
                  {String.fromCharCode(65 + i)}. {o}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {f > 95 && f < 145 && (
        <FakeCursor from={{ x: 600, y: 850 }} to={{ x: 540, y: 720 }} startFrame={100} travel={28} clickAt={130} />
      )}
      <ParticleBurst x={540} y={720} startFrame={correctAt} color={C.green} />
      {flashOpacity > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 70%, ${C.green}66, transparent 60%)`, opacity: flashOpacity, pointerEvents: "none" }} />
      )}
      <Caption text="Affronte tes amis en temps réel." from={20} dur={200} y="92%" size={24} color="#fff" />
      <Watermark />
    </AbsoluteFill>
  );
};

// ============================================================
// Scene Exams (175f) — unchanged
// ============================================================
const SceneExams: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AppFrame active="exam">
      <div style={{ padding: 48, opacity: easeOut(f / 12) }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Bac & Examens d'État</h1>
        <div style={{ color: C.muted, fontSize: 18, marginBottom: 28 }}>15 ans de sujets · corrections expliquées par Jude</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
          {[
            { y: "2024", s: "Mathématiques NS4", d: "Série SMP · 4h", done: 0.42 },
            { y: "2024", s: "Sciences Physiques", d: "Série SVT · 3h", done: 0.78 },
            { y: "2023", s: "Philosophie", d: "Toutes séries · 4h", done: 0.15 },
            { y: "2023", s: "Histoire-Géographie", d: "Toutes séries · 3h", done: 1 },
          ].map((e, i) => {
            const localIn = easeOutQuint((f - i * 7) / 20);
            const opacity = localIn;
            const ty = (1 - localIn) * 28;
            return (
              <div key={i} style={{ background: C.paper, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", opacity, transform: `translateY(${ty}px)`, display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ width: 64, height: 80, borderRadius: 10, background: `linear-gradient(135deg, ${C.amber}, ${C.amberSoft})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18 }}>{e.y}</div>
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
// Testimonial
// ============================================================
const Testimonial: React.FC<{ name: string; grade: string; quote: string; color: string; init: string; index: number }> = ({
  name, grade, quote, color, init, index,
}) => {
  const f = useCurrentFrame();
  const op = easeOut(f / 10) * easeOut((80 - f) / 8);
  const tx = (1 - easeOut(f / 14)) * (index % 2 === 0 ? -40 : 40);
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: SANS, display: "flex", flexDirection: "row", opacity: op }}>
      <div style={{ flex: 1, background: `radial-gradient(circle at 50% 40%, ${color}55, ${C.ink} 70%)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateX(${index % 2 === 0 ? tx : 0}px)` }}>
        <div style={{ width: 340, height: 340, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${C.tealGlow})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 180, color: "#fff", boxShadow: `0 30px 80px ${color}88`, fontFamily: SERIF }}>{init}</div>
      </div>
      <div style={{ flex: 1.2, padding: "0 80px", display: "flex", flexDirection: "column", justifyContent: "center", transform: `translateX(${index % 2 === 1 ? tx : 0}px)` }}>
        <div style={{ fontSize: 120, color: C.amber, lineHeight: 0.6, fontFamily: SERIF }}>"</div>
        <div style={{ fontSize: 44, fontWeight: 600, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.02em", margin: "8px 0 32px" }}>{quote}</div>
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
// ACT 5 — STATS (150f) — unchanged
// ============================================================
const Act5Stats: React.FC = () => {
  const f = useCurrentFrame();
  const stats = [
    { v: Math.round(interpolate(f, [10, 80], [0, 1200], { extrapolateRight: "clamp" })), s: "+", l: "Leçons MENFP" },
    { v: Math.round(interpolate(f, [20, 90], [0, 50000], { extrapolateRight: "clamp" })), s: "+", l: "Questions de quiz" },
    { v: 24, s: "/7", l: "Jude répond" },
    { v: 100, s: "%", l: "Programme officiel" },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.ink} 0%, ${C.ink2} 100%)`, fontFamily: SANS, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.amber, fontSize: 20, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 40 }}>EDUPRENEURS EN CHIFFRES</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 60, padding: "0 120px" }}>
        {stats.map((s, i) => {
          const op = easeOut((f - i * 8) / 16);
          return (
            <div key={i} style={{ textAlign: "center", opacity: op, transform: `translateY(${(1 - op) * 24}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, height: 160 }}>
                <RollingNumber value={s.v} size={140} color={C.amber} />
                <span style={{ color: C.tealGlow, fontSize: 90, fontWeight: 900, letterSpacing: "-0.02em", marginLeft: 8 }}>{s.s}</span>
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
// ACT 6 — CTA (240f) — accessible footer + longer crossfade
// ============================================================
const Act6CTA: React.FC = () => {
  const f = useCurrentFrame();
  const urlP = easeOut(f / 18);
  const ctaP = easeOut((f - 30) / 16);
  // Slower, gentler footer fade (40f) for premium feel + readability
  const flagP = easeOut((f - 80) / 40);
  const pulse = (Math.sin(f / 6) + 1) / 2;
  const glow = 30 + pulse * 30;
  const scale = 1 + pulse * 0.015;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.teal} 0%, ${C.tealDark} 50%, ${C.ink} 100%)`, fontFamily: SANS, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ color: C.amber, fontSize: 22, letterSpacing: "0.32em", fontWeight: 700, marginBottom: 32, opacity: urlP }}>REJOINS-NOUS</div>
        <div style={{ fontSize: 160, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", lineHeight: 0.95, opacity: urlP, transform: `scale(${interpolate(urlP, [0, 1], [0.9, 1])})`, textShadow: `0 30px 80px ${C.amber}55` }}>
          mon-edupreneur
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, color: C.amber, letterSpacing: "-0.04em", marginTop: -8, opacity: urlP }}>.com</div>
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
            transform: `translateY(${(1 - ctaP) * 16}px) scale(${ctaP > 0.9 ? scale : 1})`,
            boxShadow: `0 ${glow}px ${glow * 2}px ${C.amber}${Math.round(60 + pulse * 30).toString(16)}, 0 0 ${glow}px ${C.amberSoft}88`,
          }}
        >
          Crée ton compte · 2 min · Gratuit →
        </div>
        {/* Footer — accessibility pass: rgba(255,255,255,0.72), weight 500, soft 40f crossfade */}
        <div
          style={{
            marginTop: 36,
            color: "rgba(255,255,255,0.72)",
            fontSize: 18,
            fontWeight: 500,
            opacity: flagP,
            letterSpacing: "0.04em",
            transform: `translateY(${(1 - flagP) * 8}px)`,
            textShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          Conçu en Haïti 🇭🇹 · Pour Haïti
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Master composition — 73s @ 30fps = 2190 frames
// ============================================================
type S = { c: React.FC; d: number };
const SCENES: S[] = [
  { c: Act1Problem, d: 150 },   // 5s (+2s for word stagger)
  { c: Act2Promise, d: 60 },    // 2s
  { c: SceneDashboard, d: 265 }, // ~8.8s (+3s — full click choreography)
  { c: SceneMatieres, d: 235 }, // ~7.8s (+2s)
  { c: SceneLesson, d: 265 },   // ~8.8s (+3s — vector formula read time)
  { c: SceneJude, d: 175 },
  { c: SceneExams, d: 175 },
  { c: SceneQuiz, d: 235 },     // ~7.8s (+2s)
  { c: () => <Testimonial index={0} name="Marvens" grade="NS3 · Série SMP" color={C.teal} init="M" quote="J'ai gagné 2 points de moyenne en Maths en 6 semaines." />, d: 80 },
  { c: () => <Testimonial index={1} name="Wideline" grade="NS4 · Série SVT" color={C.violet} init="W" quote="Jude répond à mes questions à 2h du matin. Sérieux." />, d: 80 },
  { c: () => <Testimonial index={2} name="Sara" grade="9AF" color={C.amber} init="S" quote="1ère de ma classe ce trimestre. Grâce aux quiz." />, d: 80 },
  { c: Act5Stats, d: 150 },
  { c: Act6CTA, d: 240 },       // 8s (+3s — accessible footer + glow breathe)
];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.d, 0);

const SceneCrossfade: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const f = useCurrentFrame();
  const op = Math.min(easeOut(f / 8), easeOut((dur - f) / 8), 1);
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

export const MainVideoV7: React.FC = () => {
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
