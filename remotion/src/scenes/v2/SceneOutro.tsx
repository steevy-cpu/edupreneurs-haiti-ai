import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

// Scene 16 (~11s / 330f): Outro — big URL + CTA + lockup.
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: huge URL appears
  const urlP = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  // Phase 2: CTA appears around frame 90
  const ctaP = spring({ frame: frame - 90, fps, config: { damping: 18, stiffness: 180 } });
  // Phase 3: lockup at frame 200
  const lockupP = spring({ frame: frame - 200, fps, config: { damping: 20, stiffness: 160 } });

  const bgPan = interpolate(frame, [0, 330], [0, 200]);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Flash />
      {/* Animated gradient backdrop */}
      <div
        style={{
          position: "absolute",
          inset: -100,
          background: `radial-gradient(circle at ${50 + bgPan / 4}% 50%, ${COLORS.teal}55, transparent 60%), radial-gradient(circle at ${50 - bgPan / 4}% 70%, ${COLORS.amber}44, transparent 60%)`,
          filter: "blur(30px)",
        }}
      />

      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            color: COLORS.amber,
            fontSize: 20,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 700,
            opacity: urlP,
            transform: `translateY(${interpolate(urlP, [0, 1], [20, 0])}px)`,
            marginBottom: 24,
          }}
        >
          Rendez-vous sur
        </div>

        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.tealGlow})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: urlP,
            transform: `scale(${interpolate(urlP, [0, 1], [0.85, 1])})`,
            lineHeight: 1,
          }}
        >
          mon-edupreneur
        </div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: "-0.04em",
            opacity: urlP,
            marginTop: -10,
          }}
        >
          .com
        </div>

        {ctaP > 0 && (
          <div
            style={{
              marginTop: 50,
              display: "inline-flex",
              padding: "20px 44px",
              background: COLORS.amber,
              color: COLORS.bg,
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: "-0.01em",
              opacity: ctaP,
              transform: `translateY(${interpolate(ctaP, [0, 1], [20, 0])}px) scale(${interpolate(ctaP, [0, 1], [0.9, 1])})`,
              boxShadow: `0 30px 60px ${COLORS.amber}66`,
            }}
          >
            Commence gratuitement →
          </div>
        )}

        {lockupP > 0 && (
          <div
            style={{
              marginTop: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              opacity: lockupP,
              transform: `translateY(${interpolate(lockupP, [0, 1], [10, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.amber})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#fff",
                fontSize: 22,
              }}
            >
              É
            </div>
            <div style={{ color: COLORS.text, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Édupreneurs · 2026
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
