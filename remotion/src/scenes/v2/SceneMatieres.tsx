import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const subjects = [
  { icon: "📐", name: "Mathématiques", color: COLORS.teal },
  { icon: "📖", name: "Français", color: COLORS.violet },
  { icon: "🧪", name: "Sciences", color: COLORS.green },
  { icon: "🌍", name: "Histoire-Géo", color: "#3B82F6" },
  { icon: "🇬🇧", name: "Anglais", color: COLORS.amber },
  { icon: "🇪🇸", name: "Espagnol", color: "#F43F5E" },
  { icon: "💻", name: "Informatique", color: COLORS.tealGlow },
  { icon: "🎨", name: "Arts", color: "#EC4899" },
];

// Scene 4 (4s / 120f): Matières grid for NS4 with zoom on one tile.
export const SceneMatieres: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoomP = interpolate(frame, [80, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700 }}>
          Classe NS4 · Terminale
        </div>
        <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em" }}>
          Toutes tes matières
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          transform: `scale(${interpolate(zoomP, [0, 1], [1, 1.05])})`,
          transformOrigin: "0% 50%",
        }}
      >
        {subjects.map((s, i) => {
          const p = spring({ frame: frame - i * 4, fps, config: { damping: 14, stiffness: 210 } });
          const isHighlighted = i === 0 && frame > 70;
          return (
            <div
              key={i}
              style={{
                background: COLORS.surface,
                border: isHighlighted ? `2px solid ${COLORS.amber}` : `1px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: 28,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${isHighlighted ? interpolate(zoomP, [0, 1], [1, 1.05]) : 1})`,
                boxShadow: isHighlighted ? `0 20px 60px ${COLORS.amber}44` : "none",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${s.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  marginBottom: 14,
                }}
              >
                {s.icon}
              </div>
              <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{s.name}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{12 + i * 3} leçons</div>
              <div style={{ marginTop: 12, height: 6, background: COLORS.surfaceElev, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${30 + i * 8}%`, height: "100%", background: s.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
