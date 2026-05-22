import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

// Scene 11 (4s / 120f): Chess multiplayer with ELO gain.
export const SceneChess: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eloP = frame > 70 ? spring({ frame: frame - 70, fps, config: { damping: 10, stiffness: 180 } }) : 0;
  const eloGain = Math.floor(eloP * 24);
  const boardP = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });

  // Build 8x8 board with classic starting position emojis
  const piece: Record<string, string> = {
    r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
    R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
  };
  const layout = [
    "rnbqkbnr",
    "pppppppp",
    "........",
    "........",
    "....P...",
    ".....N..",
    "PPPP.PPP",
    "RNBQKB.R",
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60, display: "flex", alignItems: "center", gap: 60 }}>
      <Flash />

      {/* Chess board */}
      <div
        style={{
          width: 640,
          height: 640,
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          transform: `scale(${interpolate(boardP, [0, 1], [0.9, 1])})`,
          opacity: boardP,
        }}
      >
        {layout.map((row, r) =>
          row.split("").map((c, f) => {
            const isLight = (r + f) % 2 === 0;
            return (
              <div
                key={`${r}-${f}`}
                style={{
                  background: isLight ? "#EBECD0" : COLORS.teal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                  color: c === c.toUpperCase() ? "#FFFFFF" : "#202124",
                  textShadow: c === c.toUpperCase() ? "0 2px 4px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {piece[c] ?? ""}
              </div>
            );
          })
        )}
      </div>

      {/* Side panel */}
      <div style={{ flex: 1 }}>
        <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800, marginBottom: 12 }}>
          Échecs · Multijoueur
        </div>
        <div style={{ color: COLORS.text, fontSize: 60, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
          Joue. Apprends.
        </div>
        <div style={{ color: COLORS.text, fontSize: 60, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 30 }}>
          Grimpe au classement.
        </div>

        {/* ELO display */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24 }}>
          <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 8 }}>Ton ELO</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ color: COLORS.text, fontSize: 64, fontWeight: 900, letterSpacing: "-0.03em" }}>
              {1448 + eloGain}
            </div>
            {eloP > 0 && (
              <div
                style={{
                  color: COLORS.green,
                  fontSize: 32,
                  fontWeight: 800,
                  opacity: eloP,
                  transform: `translateY(${interpolate(eloP, [0, 1], [20, 0])}px)`,
                }}
              >
                +{eloGain}
              </div>
            )}
          </div>
          <div style={{ color: COLORS.green, fontSize: 16, fontWeight: 700, marginTop: 6 }}>
            Victoire · Échec et mat en 18 coups ♛
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
