import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { COLORS, FONT, FONT_MONO } from "../theme";

// Scene 3 — Course viewer triptych (15s). Three course cards highlighted in sequence.

const CourseCard: React.FC<{
  subject: string;
  level: string;
  title: string;
  progress: number;
  accent: string;
  highlighted: boolean;
  delay: number;
  children?: React.ReactNode;
}> = ({ subject, level, title, progress, accent, highlighted, delay, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 26, stiffness: 160 } });
  const lift = highlighted ? -16 : 0;
  const scale = highlighted ? 1.04 : 0.96;
  const opacity = highlighted ? 1 : 0.42;
  return (
    <div
      style={{
        opacity: enter * opacity,
        transform: `translateY(${interpolate(enter, [0, 1], [30, lift])}px) scale(${interpolate(enter, [0, 1], [0.92, scale])})`,
        background: COLORS.surface,
        border: `1px solid ${highlighted ? COLORS.borderStrong : COLORS.border}`,
        borderRadius: 24,
        padding: 32,
        boxShadow: highlighted ? `0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px ${accent}33` : "0 20px 50px rgba(0,0,0,0.3)",
        transition: "all 200ms",
        width: 460,
        minHeight: 540,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ padding: "6px 12px", background: `${accent}22`, color: accent, borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>{level}</div>
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>{subject}</div>
      </div>
      <div style={{ color: COLORS.text, fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 24 }}>{title}</div>
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.textMuted, fontSize: 13, marginBottom: 8 }}>
          <span>Progression</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 6, background: COLORS.surfaceElev, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: accent }} />
        </div>
      </div>
    </div>
  );
};

export const SceneCourses: React.FC = () => {
  const frame = useCurrentFrame();
  // Highlight rotates: 0-150 → Espagnol, 150-300 → Python, 300-450 → HTML
  const active = frame < 150 ? 0 : frame < 300 ? 1 : 2;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, justifyContent: "center", alignItems: "center" }}>
      <div style={{ color: COLORS.textMuted, fontSize: 18, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>
        Cours
      </div>
      <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 48 }}>
        Apprends ce qui te passionne
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <CourseCard
          subject="Langues"
          level="A2"
          title="Espagnol — Conversation quotidienne"
          progress={62}
          accent={COLORS.amber}
          highlighted={active === 0}
          delay={20}
        >
          {/* Dialogue mockup */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ alignSelf: "flex-start", background: COLORS.surfaceElev, color: COLORS.text, padding: "12px 16px", borderRadius: 16, fontSize: 18, maxWidth: "85%" }}>
              ¿Cómo estás hoy?
            </div>
            <div style={{ alignSelf: "flex-end", background: `${COLORS.amber}22`, color: COLORS.amberGlow, padding: "12px 16px", borderRadius: 16, fontSize: 18, maxWidth: "85%" }}>
              Estoy muy bien, gracias.
            </div>
            <div style={{ alignSelf: "flex-start", background: COLORS.surfaceElev, color: COLORS.text, padding: "12px 16px", borderRadius: 16, fontSize: 18, maxWidth: "85%" }}>
              ¿Qué hiciste ayer?
            </div>
          </div>
        </CourseCard>

        <CourseCard
          subject="Programmation"
          level="Débutant"
          title="Python — Premiers pas"
          progress={38}
          accent={COLORS.tealGlow}
          highlighted={active === 1}
          delay={40}
        >
          <CodeBlock startFrame={150} />
        </CourseCard>

        <CourseCard
          subject="Web"
          level="Initiation"
          title="HTML & CSS — Crée ta première page"
          progress={15}
          accent={COLORS.violet}
          highlighted={active === 2}
          delay={60}
        >
          <Sequence from={300}>
            <BrowserMockup />
          </Sequence>
        </CourseCard>
      </div>
    </AbsoluteFill>
  );
};

// Python code that types itself out
const CodeBlock: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const lines = [
    'def saluer(nom):',
    '    return f"Salut, {nom} !"',
    '',
    'print(saluer("Édupreneur"))',
    '# → Salut, Édupreneur !',
  ];
  const totalChars = lines.join("\n").length;
  const typed = Math.max(0, Math.min(totalChars, Math.floor((frame - startFrame) * 1.4)));
  const text = lines.join("\n").slice(0, typed);

  return (
    <div style={{ background: "#0B0D10", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, fontFamily: FONT_MONO, fontSize: 17, color: COLORS.text, lineHeight: 1.55, minHeight: 200, whiteSpace: "pre-wrap" }}>
      {text.split("\n").map((l, i) => (
        <div key={i}>
          {l.startsWith("def ") ? <span style={{ color: COLORS.violet }}>def </span> : null}
          {l.startsWith("def ") ? l.slice(4) : l.startsWith("#") ? <span style={{ color: COLORS.textDim }}>{l}</span> : l}
        </div>
      ))}
      <span style={{ color: COLORS.tealGlow }}>▍</span>
    </div>
  );
};

const BrowserMockup: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: 30, config: { damping: 24, stiffness: 140 } });
  return (
    <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [16, 0])}px)`, background: "#FFFFFF", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
      <div style={{ background: "#F5F5F7", padding: "10px 14px", display: "flex", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#FF5F57" }} />
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#FEBC2E" }} />
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#28C840" }} />
      </div>
      <div style={{ padding: 20, color: "#111" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.violet, marginBottom: 8 }}>Mon portfolio</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
          Bienvenue ! Je m'appelle Anaëlle et je découvre le monde du web. Voici mes premiers projets.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <div style={{ flex: 1, height: 50, background: "#EEF2FF", borderRadius: 6 }} />
          <div style={{ flex: 1, height: 50, background: "#FEF3C7", borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
};
