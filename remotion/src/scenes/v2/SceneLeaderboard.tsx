import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const top = [
  { rank: 1, name: "Naïka P.", gold: 12480, color: COLORS.amber },
  { rank: 2, name: "Wilkenson J.", gold: 11920, color: COLORS.tealGlow },
  { rank: 3, name: "Sabine D.", gold: 10780, color: COLORS.violet },
  { rank: 4, name: "Christian L.", gold: 9420, color: COLORS.green },
  { rank: 5, name: "Émeline R.", gold: 8910, color: "#F43F5E" },
];

// Scene 13 (3s / 90f): Leaderboard with #1 zoom.
export const SceneLeaderboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const winnerP = frame > 50 ? spring({ frame: frame - 50, fps, config: { damping: 10, stiffness: 200 } }) : 0;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: COLORS.amber, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800 }}>
          Classement national
        </div>
        <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em" }}>
          Top élèves de la semaine
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {top.map((t, i) => {
          const p = spring({ frame: frame - i * 6, fps, config: { damping: 14, stiffness: 200 } });
          const isFirst = t.rank === 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: isFirst ? "22px 28px" : "16px 24px",
                background: isFirst ? `${COLORS.amber}11` : COLORS.surface,
                border: `1px solid ${isFirst ? COLORS.amber : COLORS.border}`,
                borderRadius: 18,
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px) scale(${isFirst ? 1 + winnerP * 0.03 : 1})`,
                boxShadow: isFirst && winnerP > 0 ? `0 20px 60px ${COLORS.amber}44` : "none",
              }}
            >
              <div
                style={{
                  width: isFirst ? 60 : 44,
                  height: isFirst ? 60 : 44,
                  borderRadius: "50%",
                  background: isFirst ? `linear-gradient(135deg, ${COLORS.amber}, #FFD580)` : COLORS.surfaceElev,
                  color: isFirst ? COLORS.bg : COLORS.text,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isFirst ? 24 : 18,
                  flexShrink: 0,
                }}
              >
                {isFirst ? "🏆" : `#${t.rank}`}
              </div>
              <div
                style={{
                  width: isFirst ? 56 : 40,
                  height: isFirst ? 56 : 40,
                  borderRadius: "50%",
                  background: t.color,
                  color: "#fff",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {t.name.split(" ").map((s) => s[0]).join("")}
              </div>
              <div style={{ flex: 1, color: COLORS.text, fontSize: isFirst ? 24 : 18, fontWeight: 700 }}>{t.name}</div>
              <div style={{ color: COLORS.amber, fontSize: isFirst ? 28 : 20, fontWeight: 900 }}>
                💰 {t.gold.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
