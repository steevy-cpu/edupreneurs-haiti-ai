import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

// Scene 10 (4s / 120f): Live PvP quiz battle.
export const SceneQuizBattle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meScore = Math.floor(interpolate(frame, [0, 120], [120, 480], { extrapolateRight: "clamp" }));
  const opScore = Math.floor(interpolate(frame, [0, 120], [100, 410], { extrapolateRight: "clamp" }));
  const timerProgress = interpolate(frame, [0, 120], [1, 0.2], { extrapolateRight: "clamp" });
  const correctP = frame > 70 ? spring({ frame: frame - 70, fps, config: { damping: 10, stiffness: 200 } }) : 0;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ color: COLORS.amber, fontSize: 16, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800 }}>
          Quiz Battle · Live
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 280, height: 8, background: COLORS.surfaceElev, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${timerProgress * 100}%`, height: "100%", background: timerProgress < 0.3 ? COLORS.red : COLORS.amber }} />
          </div>
          <div style={{ color: COLORS.text, fontSize: 28, fontWeight: 900 }}>{Math.ceil(timerProgress * 15)}s</div>
        </div>
      </div>

      {/* VS bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center", marginBottom: 36 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.teal, color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>TOI</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 700 }}>Naïka</div>
            <div style={{ color: COLORS.tealGlow, fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{meScore}</div>
          </div>
        </div>
        <div style={{ color: COLORS.amber, fontSize: 56, fontWeight: 900, letterSpacing: "-0.05em" }}>VS</div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.violet, color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>WJ</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 700 }}>Wilkenson</div>
            <div style={{ color: COLORS.violet, fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{opScore}</div>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32, marginBottom: 20 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.2em" }}>Question 7 / 10</div>
        <div style={{ color: COLORS.text, fontSize: 32, fontWeight: 800, marginTop: 10, letterSpacing: "-0.02em" }}>
          Quelle est la dérivée de f(x) = e<sup>2x</sup> ?
        </div>
      </div>

      {/* Answer options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { t: "f'(x) = e^(2x)", correct: false },
          { t: "f'(x) = 2e^(2x)", correct: true },
          { t: "f'(x) = 2xe^(2x)", correct: false },
          { t: "f'(x) = e^(x)", correct: false },
        ].map((a, i) => (
          <div
            key={i}
            style={{
              background: a.correct && correctP > 0 ? COLORS.green : COLORS.surface,
              border: `1px solid ${a.correct && correctP > 0 ? COLORS.green : COLORS.border}`,
              padding: "18px 22px",
              borderRadius: 14,
              color: a.correct && correctP > 0 ? "#fff" : COLORS.text,
              fontSize: 18,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 12,
              transform: a.correct && correctP > 0 ? `scale(${1 + correctP * 0.04})` : "scale(1)",
              boxShadow: a.correct && correctP > 0 ? `0 10px 40px ${COLORS.green}66` : "none",
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: a.correct && correctP > 0 ? "#fff" : COLORS.surfaceElev, color: a.correct && correctP > 0 ? COLORS.green : COLORS.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
              {["A", "B", "C", "D"][i]}
            </div>
            {a.t}
            {a.correct && correctP > 0 && <div style={{ marginLeft: "auto", fontSize: 22 }}>✓</div>}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
