import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const choices = [
  { icon: "🎨", label: "Arts & Design", picked: false },
  { icon: "💻", label: "Code & Tech", picked: true },
  { icon: "🎵", label: "Musique", picked: false },
  { icon: "📷", label: "Photo & Vidéo", picked: false },
  { icon: "✍️", label: "Écriture", picked: true },
  { icon: "⚽", label: "Sport", picked: false },
];

// Scene 12 (5s / 150f): Passion Discovery wizard step.
export const ScenePassion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60, alignItems: "center", justifyContent: "center" }}>
      <Flash />
      <div
        style={{
          width: 1200,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 28,
          padding: 50,
        }}
      >
        {/* Wizard progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: i <= 1 ? COLORS.amber : COLORS.surfaceElev,
              }}
            />
          ))}
        </div>

        <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800 }}>
          Découverte · Étape 2 / 4
        </div>
        <div style={{ color: COLORS.text, fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 8, marginBottom: 12 }}>
          Qu'est-ce qui te passionne ?
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 18, marginBottom: 32 }}>
          Choisis tout ce qui t'attire. On construit ton parcours autour de toi.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {choices.map((c, i) => {
            const p = spring({ frame: frame - 20 - i * 5, fps, config: { damping: 14, stiffness: 200 } });
            const pickPulse = c.picked && frame > 90 ? spring({ frame: frame - 90 - i * 8, fps, config: { damping: 10, stiffness: 220 } }) : 0;
            const isPicked = c.picked && pickPulse > 0.3;
            return (
              <div
                key={i}
                style={{
                  background: isPicked ? `${COLORS.amber}22` : COLORS.surfaceElev,
                  border: `2px solid ${isPicked ? COLORS.amber : COLORS.border}`,
                  borderRadius: 18,
                  padding: 24,
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${1 + pickPulse * 0.04})`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                }}
              >
                <div style={{ fontSize: 36 }}>{c.icon}</div>
                <div style={{ color: COLORS.text, fontSize: 19, fontWeight: 700 }}>{c.label}</div>
                {isPicked && (
                  <div style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: "50%", background: COLORS.amber, color: COLORS.bg, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 14 }}>
          <div style={{ padding: "14px 24px", color: COLORS.textMuted, fontSize: 15, fontWeight: 600 }}>Retour</div>
          <div
            style={{
              padding: "14px 28px",
              background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.tealGlow})`,
              color: COLORS.bg,
              fontWeight: 800,
              borderRadius: 12,
              fontSize: 16,
            }}
          >
            Continuer →
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
