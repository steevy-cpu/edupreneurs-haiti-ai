import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// Scene 2 — Dashboard (15s). UI mockup of a student dashboard assembling card by card.
// Built as pure JSX/SVG to avoid the "AI-generated illustration" look.

const Card: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 28, stiffness: 180 } });
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SceneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated counters
  const progressVal = Math.round(interpolate(spring({ frame: frame - 40, fps, config: { damping: 30 } }), [0, 1], [0, 78]));
  const streakVal = Math.round(interpolate(spring({ frame: frame - 60, fps, config: { damping: 30 } }), [0, 1], [0, 24]));
  const passionVal = Math.round(interpolate(spring({ frame: frame - 80, fps, config: { damping: 30 } }), [0, 1], [0, 12]));

  const headerEnter = spring({ frame: frame - 5, fps, config: { damping: 30, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, padding: 80, justifyContent: "center" }}>
      <div style={{ opacity: headerEnter, transform: `translateY(${interpolate(headerEnter, [0, 1], [10, 0])}px)`, marginBottom: 36 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          Tableau de bord
        </div>
        <div style={{ color: COLORS.text, fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Bonsoir, Maëlle <span style={{ color: COLORS.amber }}>👋</span>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
        <Card delay={30}>
          <div style={{ color: COLORS.textMuted, fontSize: 16, fontWeight: 500 }}>Progression scolaire</div>
          <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 700, marginTop: 8, letterSpacing: "-0.03em" }}>
            {progressVal}<span style={{ color: COLORS.textMuted, fontSize: 32 }}>%</span>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 16, height: 8, background: COLORS.surfaceElev, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${progressVal}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.tealGlow})` }} />
          </div>
        </Card>
        <Card delay={50}>
          <div style={{ color: COLORS.textMuted, fontSize: 16, fontWeight: 500 }}>Série en cours</div>
          <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 700, marginTop: 8, letterSpacing: "-0.03em" }}>
            {streakVal}<span style={{ color: COLORS.textMuted, fontSize: 32 }}> jours</span>
          </div>
          <div style={{ color: COLORS.amber, fontSize: 16, marginTop: 16, fontWeight: 500 }}>🔥 Record personnel</div>
        </Card>
        <Card delay={70}>
          <div style={{ color: COLORS.textMuted, fontSize: 16, fontWeight: 500 }}>Passions actives</div>
          <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 700, marginTop: 8, letterSpacing: "-0.03em" }}>
            {passionVal}
          </div>
          <div style={{ color: COLORS.tealGlow, fontSize: 16, marginTop: 16, fontWeight: 500 }}>+3 cette semaine</div>
        </Card>
      </div>

      {/* Chart card */}
      <Card delay={110} style={{ height: 240 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 600 }}>Activité des 7 derniers jours</div>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Maths · Français · Sciences · Espagnol</div>
        </div>
        {/* Bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 140 }}>
          {[0.45, 0.62, 0.38, 0.78, 0.55, 0.88, 0.71].map((h, i) => {
            const grow = spring({ frame: frame - 140 - i * 6, fps, config: { damping: 22, stiffness: 140 } });
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: "100%",
                    height: `${h * 100 * grow}%`,
                    background: i === 5 ? `linear-gradient(180deg, ${COLORS.amber}, ${COLORS.amberGlow})` : `linear-gradient(180deg, ${COLORS.teal}, ${COLORS.tealGlow})`,
                    borderRadius: 6,
                  }}
                />
                <div style={{ color: COLORS.textDim, fontSize: 13 }}>{["L", "M", "M", "J", "V", "S", "D"][i]}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </AbsoluteFill>
  );
};
