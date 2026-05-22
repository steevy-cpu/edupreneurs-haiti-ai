import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const REPLY =
  "Salut Naïka ! 👋 Pour résoudre cette équation exponentielle, on isole d'abord le terme en e^x puis on applique le logarithme népérien des deux côtés. Tu veux que je te montre étape par étape ?";

// Scene 6 (4s / 120f): Jude AI chat streaming reply.
export const SceneJude: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const userBubbleP = spring({ frame, fps, config: { damping: 18, stiffness: 200 } });
  // Streaming typewriter starts at frame 25, 1 char per 1.2 frames
  const chars = Math.max(0, Math.min(REPLY.length, Math.floor((frame - 25) / 1.2)));
  const streamed = REPLY.slice(0, chars);
  const judePulse = 1 + Math.sin(frame / 6) * 0.05;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60, alignItems: "center", justifyContent: "center" }}>
      <Flash />
      <div style={{ width: 1100, background: COLORS.surface, borderRadius: 28, border: `1px solid ${COLORS.border}`, padding: 36 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${COLORS.border}` }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, ${COLORS.tealGlow}, ${COLORS.teal} 60%, #053838)`,
              boxShadow: `0 0 40px ${COLORS.tealGlow}88`,
              transform: `scale(${judePulse})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ color: COLORS.text, fontSize: 24, fontWeight: 800 }}>Jude</div>
            <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 600 }}>● Ton tuteur IA · disponible 24/7</div>
          </div>
          <div style={{ marginLeft: "auto", padding: "6px 14px", background: `${COLORS.amber}22`, color: COLORS.amber, borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
            GEMINI · GPT
          </div>
        </div>

        {/* User message */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, opacity: userBubbleP, transform: `translateY(${interpolate(userBubbleP, [0, 1], [20, 0])}px)` }}>
          <div
            style={{
              maxWidth: 600,
              background: COLORS.teal,
              color: "#fff",
              padding: "14px 20px",
              borderRadius: "20px 20px 6px 20px",
              fontSize: 17,
              lineHeight: 1.5,
            }}
          >
            Jude, j'comprends pas comment résoudre e^(2x) - 5e^x + 6 = 0 😅
          </div>
        </div>

        {/* Jude streaming reply */}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div
            style={{
              maxWidth: 720,
              background: COLORS.surfaceElev,
              color: COLORS.text,
              padding: "16px 22px",
              borderRadius: "20px 20px 20px 6px",
              fontSize: 17,
              lineHeight: 1.6,
              border: `1px solid ${COLORS.border}`,
              minHeight: 60,
            }}
          >
            {streamed}
            {chars < REPLY.length && (
              <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: COLORS.amber }}>▍</span>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
