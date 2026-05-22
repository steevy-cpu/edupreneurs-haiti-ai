import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// Scene 1 — Hook (12s). Two big typographic statements that fade and rise.
// Cinematic Apple-style reveal: kerning tight, blur-to-sharp, micro parallax.
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Eyebrow appears first
  const eyebrowOpacity = spring({ frame: frame - 10, fps, config: { damping: 30, stiffness: 120 } });
  const eyebrowY = interpolate(eyebrowOpacity, [0, 1], [12, 0]);

  // First headline (0-6s)
  const h1Progress = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 100 } });
  const h1Opacity = interpolate(frame, [30, 60, 160, 190], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h1Y = interpolate(h1Progress, [0, 1], [40, 0]);
  const h1Blur = interpolate(h1Progress, [0, 1], [12, 0]);

  // Second headline (6-12s)
  const h2Progress = spring({ frame: frame - 200, fps, config: { damping: 28, stiffness: 100 } });
  const h2Opacity = interpolate(frame, [200, 230, 340, 360], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h2Y = interpolate(h2Progress, [0, 1], [40, 0]);
  const h2Blur = interpolate(h2Progress, [0, 1], [12, 0]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          opacity: eyebrowOpacity,
          transform: `translateY(${eyebrowY}px)`,
          color: COLORS.amber,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          marginBottom: 48,
        }}
      >
        Édition 2026 · Édupreneurs
      </div>

      <div style={{ position: "relative", width: "100%", height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1
          style={{
            position: "absolute",
            margin: 0,
            opacity: h1Opacity,
            transform: `translateY(${h1Y}px)`,
            filter: `blur(${h1Blur}px)`,
            color: COLORS.text,
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          Propulsez vos études.
        </h1>
        <h1
          style={{
            position: "absolute",
            margin: 0,
            opacity: h2Opacity,
            transform: `translateY(${h2Y}px)`,
            filter: `blur(${h2Blur}px)`,
            background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.tealGlow})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          Cultivez vos passions.
        </h1>
      </div>
    </AbsoluteFill>
  );
};
