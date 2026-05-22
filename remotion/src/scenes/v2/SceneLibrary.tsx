import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const templates = [
  { icon: "📝", title: "CV étudiant", cat: "Carrière", color: COLORS.teal },
  { icon: "📊", title: "Présentation Bacc", cat: "Examens", color: COLORS.amber },
  { icon: "📅", title: "Planning révisions", cat: "Organisation", color: COLORS.violet },
  { icon: "📚", title: "Fiches récap", cat: "Études", color: COLORS.green },
  { icon: "💼", title: "Lettre de motivation", cat: "Université", color: "#3B82F6" },
  { icon: "🎯", title: "Suivi d'objectifs", cat: "Personnel", color: "#F43F5E" },
];

// Scene 14 (4s / 120f): Library / Templates grid with download action.
export const SceneLibrary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800 }}>
          Bibliothèque · Templates gratuits
        </div>
        <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em" }}>
          Tout ce dont tu as besoin.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
        {templates.map((t, i) => {
          const p = spring({ frame: frame - i * 6, fps, config: { damping: 14, stiffness: 200 } });
          const downloadPulse = i === 1 && frame > 70 ? spring({ frame: frame - 70, fps, config: { damping: 10, stiffness: 220 } }) : 0;
          return (
            <div
              key={i}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: 24,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 16,
                  background: `${t.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  marginBottom: 14,
                }}
              >
                {t.icon}
              </div>
              <div style={{ color: t.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{t.cat}</div>
              <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 800, marginTop: 4, marginBottom: 18 }}>{t.title}</div>
              <div
                style={{
                  padding: "10px 16px",
                  background: i === 1 && downloadPulse > 0 ? COLORS.green : COLORS.surfaceElev,
                  color: i === 1 && downloadPulse > 0 ? "#fff" : COLORS.text,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  transform: `scale(${1 + downloadPulse * 0.04})`,
                }}
              >
                {i === 1 && downloadPulse > 0 ? "✓ Téléchargé" : "↓ Télécharger PDF"}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
