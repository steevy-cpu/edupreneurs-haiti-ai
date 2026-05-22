import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

const Card: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 200 } });
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 24,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px) scale(${interpolate(p, [0, 1], [0.96, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Scene 3 (5s / 150f): Dashboard student stats card grid.
export const SceneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  // Animated counters
  const gold = Math.floor(interpolate(frame, [30, 90], [0, 1245], { extrapolateRight: "clamp" }));
  const xp = Math.floor(interpolate(frame, [40, 110], [0, 8420], { extrapolateRight: "clamp" }));
  const streak = Math.floor(interpolate(frame, [50, 100], [0, 23], { extrapolateRight: "clamp" }));
  const progress = interpolate(frame, [60, 130], [0, 0.72], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60 }}>
      <Flash />
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ color: COLORS.textMuted, fontSize: 16, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Tableau de bord
          </div>
          <div style={{ color: COLORS.text, fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Salut, Naïka 👋
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: `${COLORS.amber}22`,
              color: COLORS.amber,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            🏆 NIVEAU 7
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card delay={10}>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>🔥 Streak actuel</div>
          <div style={{ color: COLORS.text, fontSize: 64, fontWeight: 900, lineHeight: 1.1 }}>{streak}</div>
          <div style={{ color: COLORS.amber, fontSize: 14, fontWeight: 600 }}>jours consécutifs</div>
        </Card>
        <Card delay={18}>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>💰 Gold</div>
          <div style={{ color: COLORS.amber, fontSize: 64, fontWeight: 900, lineHeight: 1.1 }}>{gold.toLocaleString()}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>+25 aujourd'hui</div>
        </Card>
        <Card delay={26}>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>⚡ XP total</div>
          <div style={{ color: COLORS.tealGlow, fontSize: 64, fontWeight: 900, lineHeight: 1.1 }}>{xp.toLocaleString()}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Niveau 8 dans 580 XP</div>
        </Card>
      </div>

      {/* Progress card */}
      <Card delay={36} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 700 }}>Progression — Mathématiques NS4</div>
          <div style={{ color: COLORS.tealGlow, fontSize: 18, fontWeight: 700 }}>{Math.round(progress * 100)}%</div>
        </div>
        <div style={{ height: 14, background: COLORS.surfaceElev, borderRadius: 7, overflow: "hidden" }}>
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.tealGlow})`,
              borderRadius: 7,
            }}
          />
        </div>
      </Card>

      {/* Daily quests */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card delay={48}>
          <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>📚 Leçon du jour</div>
          <div style={{ color: COLORS.textMuted, fontSize: 16 }}>Les fonctions exponentielles · Mathématiques</div>
          <div style={{ marginTop: 14, display: "inline-block", padding: "8px 16px", borderRadius: 8, background: COLORS.teal, color: "#fff", fontWeight: 600, fontSize: 14 }}>
            Continuer →
          </div>
        </Card>
        <Card delay={56}>
          <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>🎯 Défis du jour</div>
          {["3 leçons complétées", "Quiz battle gagné", "Un message à la classe"].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: i < 2 ? COLORS.green : COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>{i < 2 ? "✓" : ""}</div>
              <div style={{ color: i < 2 ? COLORS.textMuted : COLORS.text, fontSize: 15, textDecoration: i < 2 ? "line-through" : "none" }}>{t}</div>
            </div>
          ))}
        </Card>
      </div>
    </AbsoluteFill>
  );
};
