import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const series = [
  { code: "LLA", name: "Lettres", desc: "Littérature & Langues", color: COLORS.violet },
  { code: "SES", name: "Sciences Éco", desc: "Économie & Société", color: COLORS.amber },
  { code: "SMP", name: "Sciences Math", desc: "Mathématiques & Physique", color: COLORS.teal },
  { code: "SVT", name: "Sciences Nat", desc: "Biologie & Géologie", color: COLORS.green },
];

// Scene 7 (5s / 150f): Bacc exams hub — 4 NS4 series cards.
export const SceneExams: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700 }}>
            Examens d'État · NS4
          </div>
          <div style={{ color: COLORS.text, fontSize: 60, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Prépare ton Bacc.
          </div>
        </div>
        <div style={{ color: COLORS.tealGlow, fontSize: 22, fontWeight: 700 }}>
          12 ans d'épreuves · 4 séries
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {series.map((s, i) => {
          const p = spring({ frame: frame - i * 8, fps, config: { damping: 12, stiffness: 200 } });
          return (
            <div
              key={i}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 24,
                padding: 28,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${s.color}22`, filter: "blur(20px)" }} />
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  background: s.color,
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                }}
              >
                {s.code}
              </div>
              <div style={{ color: COLORS.text, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{s.name}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 18 }}>{s.desc}</div>
              <div style={{ color: COLORS.text, fontSize: 32, fontWeight: 800 }}>{180 + i * 30}</div>
              <div style={{ color: COLORS.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em" }}>annales</div>
              <div style={{ marginTop: 18, padding: "10px 16px", background: COLORS.surfaceElev, color: s.color, fontWeight: 700, borderRadius: 10, fontSize: 13, textAlign: "center" }}>
                S'entraîner →
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 30, display: "flex", gap: 12, alignItems: "center", color: COLORS.textMuted, fontSize: 16 }}>
        <span style={{ color: COLORS.amber, fontWeight: 700 }}>🤖 Tuteur IA dédié</span>
        <span>·</span>
        <span>Correction instantanée</span>
        <span>·</span>
        <span>Chronométrage réel</span>
      </div>
    </AbsoluteFill>
  );
};
