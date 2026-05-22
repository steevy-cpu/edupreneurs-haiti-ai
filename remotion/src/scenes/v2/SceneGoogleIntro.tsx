import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Cursor } from "../../components/Flash";

// Scene 1 (5s / 150f): browser window typing "mon-edupreneur.com" in Google search.
export const SceneGoogleIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const url = "mon-edupreneur.com";
  // Typing starts at frame 18, 3 frames per character
  const typingStart = 18;
  const charsTyped = Math.max(0, Math.min(url.length, Math.floor((frame - typingStart) / 3)));
  const typed = url.slice(0, charsTyped);
  const caretBlink = Math.floor(frame / 8) % 2 === 0;

  // Browser window scale-in
  const windowProgress = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const winScale = interpolate(windowProgress, [0, 1], [0.96, 1]);
  const winOpacity = interpolate(windowProgress, [0, 1], [0, 1]);

  // Autocomplete dropdown appears after typing completes
  const acStart = typingStart + url.length * 3 + 4;
  const acProgress = spring({ frame: frame - acStart, fps, config: { damping: 20, stiffness: 180 } });

  // Exit zoom: last 20 frames zoom into the result
  const exitProgress = interpolate(frame, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitScale = 1 + exitProgress * 4;
  const exitOpacity = 1 - exitProgress;

  return (
    <AbsoluteFill style={{ background: "#202124", fontFamily: FONT, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 1400,
          height: 820,
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          transform: `scale(${winScale * exitScale})`,
          opacity: winOpacity * exitOpacity,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Browser chrome */}
        <div style={{ height: 44, background: "#F1F3F4", display: "flex", alignItems: "center", paddingLeft: 16, gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          <div
            style={{
              marginLeft: 40,
              flex: 1,
              marginRight: 16,
              height: 28,
              background: "#FFFFFF",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
              fontSize: 13,
              color: "#5F6368",
            }}
          >
            🔒 google.com
          </div>
        </div>

        {/* Page body */}
        <div style={{ padding: "80px 0 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Google logo */}
          <div style={{ fontSize: 88, fontWeight: 500, letterSpacing: "-0.04em", marginBottom: 36 }}>
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC04" }}>o</span>
            <span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>e</span>
          </div>

          {/* Search box */}
          <div
            style={{
              width: 700,
              height: 56,
              borderRadius: 28,
              border: "1px solid #DFE1E5",
              background: "#FFFFFF",
              boxShadow: frame > typingStart ? "0 4px 18px rgba(0,0,0,0.12)" : "none",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              position: "relative",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 14 }}>
              <circle cx="11" cy="11" r="7" stroke="#9AA0A6" strokeWidth="2" />
              <path d="M16 16 L21 21" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 18, color: "#202124", letterSpacing: 0 }}>
              {typed}
              <span style={{ opacity: caretBlink ? 1 : 0, color: "#202124" }}>|</span>
            </span>

            {/* Autocomplete dropdown */}
            {acProgress > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 60,
                  left: -1,
                  right: -1,
                  background: "#FFFFFF",
                  border: "1px solid #DFE1E5",
                  borderRadius: 20,
                  padding: "12px 0",
                  opacity: acProgress,
                  transform: `translateY(${(1 - acProgress) * -8}px)`,
                  boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                }}
              >
                {[
                  { t: "mon-edupreneur.com", strong: true },
                  { t: "mon edupreneur connexion", strong: false },
                  { t: "mon edupreneur leçons bac", strong: false },
                  { t: "mon-edupreneur tutorat IA", strong: false },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      fontSize: 16,
                      background: i === 0 && frame > 120 ? "#F1F3F4" : "transparent",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="#9AA0A6" strokeWidth="2" />
                      <path d="M16 16 L21 21" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span style={{ color: "#202124", fontWeight: s.strong ? 600 : 400 }}>{s.t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Cursor fromX={1100} fromY={650} toX={680} toY={490} startFrame={100} durationFrames={20} clickAt={122} />
      </div>
    </AbsoluteFill>
  );
};
