import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, FONT_MONO, COLORS } from "../../theme";
import { Flash } from "../../components/Flash";

// Scene 5 (5s / 150f): Dynamic lesson page with KaTeX-like equation and audio player.
export const SceneLesson: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scrollY = interpolate(frame, [20, 130], [0, -180], { extrapolateRight: "clamp" });
  const audioPulse = 1 + Math.sin(frame / 4) * 0.08;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, padding: 60, overflow: "hidden" }}>
      <Flash />
      <div style={{ display: "flex", gap: 32, height: "100%" }}>
        {/* Side TOC */}
        <div style={{ width: 280, paddingTop: 12 }}>
          <div style={{ color: COLORS.textMuted, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", marginBottom: 14 }}>
            Leçon 4 / 12
          </div>
          {["Introduction", "Définition", "Propriétés", "Exemple résolu", "Exercices"].map((t, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                borderLeft: `3px solid ${i === 2 ? COLORS.amber : "transparent"}`,
                color: i === 2 ? COLORS.text : COLORS.textMuted,
                fontSize: 14,
                fontWeight: i === 2 ? 600 : 400,
                marginBottom: 4,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Main content area scrolling */}
        <div style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 40, overflow: "hidden", position: "relative" }}>
          <div style={{ transform: `translateY(${scrollY}px)` }}>
            <div style={{ color: COLORS.amber, fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Mathématiques · NS4
            </div>
            <h1 style={{ color: COLORS.text, fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", margin: "8px 0 24px" }}>
              Les fonctions exponentielles
            </h1>

            {/* Audio bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                background: COLORS.surfaceElev,
                borderRadius: 14,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: COLORS.teal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${audioPulse})`,
                  boxShadow: `0 0 0 ${(audioPulse - 1) * 60}px ${COLORS.teal}33`,
                }}
              >
                ▶
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>🎙️ Écoute Eric te lire la leçon</div>
                <div style={{ marginTop: 6, height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${interpolate(frame, [0, 150], [10, 60])}%`, height: "100%", background: COLORS.amber }} />
                </div>
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13 }}>02:14 / 04:38</div>
            </div>

            <p style={{ color: COLORS.text, fontSize: 18, lineHeight: 1.7, marginBottom: 18 }}>
              Une fonction exponentielle de base <em>a</em> est définie pour tout réel <em>x</em> par :
            </p>

            {/* KaTeX-like equation block */}
            <div
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "28px 40px",
                fontFamily: FONT_MONO,
                fontSize: 36,
                color: COLORS.tealGlow,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              f(x) = a<sup style={{ fontSize: 22, color: COLORS.amber }}>x</sup>{"   "}avec{"  "}a &gt; 0,{"  "}a ≠ 1
            </div>

            <p style={{ color: COLORS.text, fontSize: 18, lineHeight: 1.7 }}>
              Sa dérivée vérifie la relation fondamentale :
            </p>

            <div
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "28px 40px",
                fontFamily: FONT_MONO,
                fontSize: 32,
                color: COLORS.tealGlow,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              f'(x) = ln(a) · a<sup style={{ fontSize: 20, color: COLORS.amber }}>x</sup>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
