import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// Scene 4 — Passion & Skills Tracker (13s). Six passion cards with animating skill bars.

const passions = [
  { icon: "♟", label: "Échecs", level: "Intermédiaire", value: 72, accent: COLORS.amber },
  { icon: "✦", label: "Origami", level: "Avancé", value: 88, accent: COLORS.tealGlow },
  { icon: "🎤", label: "Art oratoire", level: "Confirmé", value: 65, accent: COLORS.violet },
  { icon: "✎", label: "Écriture créative", level: "Débutant", value: 34, accent: COLORS.amberGlow },
  { icon: "♪", label: "Théorie musicale", level: "Initiation", value: 22, accent: COLORS.green },
  { icon: "△", label: "Dessin technique", level: "Intermédiaire", value: 56, accent: COLORS.red },
];

const PassionCard: React.FC<{ delay: number; p: (typeof passions)[number] }> = ({ delay, p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 26, stiffness: 150 } });
  const bar = spring({ frame: frame - delay - 20, fps, config: { damping: 30, stiffness: 100 } });
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `${p.accent}22`, color: p.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          {p.icon}
        </div>
        <div>
          <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{p.label}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 2 }}>{p.level}</div>
        </div>
        <div style={{ marginLeft: "auto", color: p.accent, fontSize: 28, fontWeight: 700 }}>{Math.round(p.value * bar)}%</div>
      </div>
      <div style={{ height: 8, background: COLORS.surfaceElev, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${p.value * bar}%`, height: "100%", background: `linear-gradient(90deg, ${p.accent}, ${p.accent}cc)` }} />
      </div>
    </div>
  );
};

export const ScenePassions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerEnter = spring({ frame, fps, config: { damping: 28 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONT, padding: 80, justifyContent: "center" }}>
      <div style={{ opacity: headerEnter, transform: `translateY(${interpolate(headerEnter, [0, 1], [12, 0])}px)`, marginBottom: 40 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 18, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
          Passions & Compétences
        </div>
        <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Cartographie ce qui te fait <span style={{ background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.tealGlow})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>vibrer</span>.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {passions.map((p, i) => (
          <PassionCard key={p.label} delay={30 + i * 14} p={p} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
