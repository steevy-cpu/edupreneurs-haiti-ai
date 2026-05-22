import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const SOURCE = "Bonjour, comment vas-tu aujourd'hui ?";
const TARGET = "Bonjou, kijan ou ye jodi a ?";

// Scene 15 (4s / 120f): Public translator FR → Kreyòl.
export const SceneTranslate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardP = spring({ frame, fps, config: { damping: 16, stiffness: 200 } });
  const chars = Math.max(0, Math.min(TARGET.length, Math.floor((frame - 50) / 2.2)));
  const translated = TARGET.slice(0, chars);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60, alignItems: "center", justifyContent: "center" }}>
      <Flash />
      <div style={{ width: 1300, opacity: cardP, transform: `translateY(${interpolate(cardP, [0, 1], [30, 0])}px)` }}>
        <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800, marginBottom: 8 }}>
          Traducteur · Public
        </div>
        <div style={{ color: COLORS.text, fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 28 }}>
          Français ↔ Kreyòl, instantané.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 28, minHeight: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>🇫🇷</div>
              <div style={{ color: COLORS.textMuted, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Français</div>
            </div>
            <div style={{ color: COLORS.text, fontSize: 28, lineHeight: 1.5, fontWeight: 500 }}>{SOURCE}</div>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.amber}`, borderRadius: 20, padding: 28, minHeight: 220, position: "relative", boxShadow: `0 20px 60px ${COLORS.amber}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>🇭🇹</div>
              <div style={{ color: COLORS.amber, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Kreyòl ayisyen</div>
            </div>
            <div style={{ color: COLORS.text, fontSize: 28, lineHeight: 1.5, fontWeight: 500 }}>
              {translated}
              {chars < TARGET.length && (
                <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: COLORS.amber }}>▍</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22, color: COLORS.textMuted, fontSize: 16, textAlign: "center" }}>
          ✨ Aucun compte requis · Disponible pour toute la communauté
        </div>
      </div>
    </AbsoluteFill>
  );
};
