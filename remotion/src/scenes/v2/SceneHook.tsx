import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

// Scene 2 (3s / 90f): logo punch + tagline.
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoP = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const logoScale = interpolate(logoP, [0, 1], [0.4, 1]);
  const taglineP = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 180 } });
  const taglineY = interpolate(taglineP, [0, 1], [30, 0]);
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, justifyContent: "center", alignItems: "center" }}>
      <Flash />
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: 48,
          background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.amber})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 140,
          fontWeight: 900,
          color: "#fff",
          transform: `scale(${logoScale})`,
          boxShadow: `0 30px 80px ${COLORS.teal}66`,
        }}
      >
        É
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 64,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: "-0.04em",
          opacity: taglineP,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        Édupreneurs
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 22,
          color: COLORS.amber,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontWeight: 600,
          opacity: taglineP,
        }}
      >
        Étudie · Crée · Réussis
      </div>
    </AbsoluteFill>
  );
};
