import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// Scene 6 — Outro (11s). Closing statement + logo lockup + URL.
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineProgress = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 90 } });
  const lineY = interpolate(lineProgress, [0, 1], [30, 0]);
  const lineBlur = interpolate(lineProgress, [0, 1], [10, 0]);

  const logoEnter = spring({ frame: frame - 130, fps, config: { damping: 26, stiffness: 140 } });
  const urlEnter = spring({ frame: frame - 170, fps, config: { damping: 30 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div
        style={{
          opacity: lineProgress,
          transform: `translateY(${lineY}px)`,
          filter: `blur(${lineBlur}px)`,
          color: COLORS.text,
          fontSize: 88,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.08,
          textAlign: "center",
          maxWidth: 1500,
        }}
      >
        Un espace pour <span style={{ color: COLORS.tealGlow }}>grandir</span>, <span style={{ color: COLORS.amber }}>apprendre</span><br />
        et s'épanouir au quotidien.
      </div>

      <div style={{ marginTop: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div
          style={{
            opacity: logoEnter,
            transform: `scale(${interpolate(logoEnter, [0, 1], [0.85, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Brand mark — abstract spark */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.amber})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 900,
              boxShadow: `0 10px 30px ${COLORS.teal}66`,
            }}
          >
            É
          </div>
          <div style={{ color: COLORS.text, fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Édupreneurs
          </div>
        </div>
        <div
          style={{
            opacity: urlEnter,
            transform: `translateY(${interpolate(urlEnter, [0, 1], [10, 0])}px)`,
            color: COLORS.textMuted,
            fontSize: 22,
            letterSpacing: "0.18em",
            fontWeight: 500,
          }}
        >
          mon-edupreneur.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
