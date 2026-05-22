import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// Scene 5 — Smart calendar & daily routine (12s).

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const slots = ["07h", "09h", "11h", "13h", "15h", "17h", "19h", "21h"];

// Pre-filled schedule blocks (col, row, span, color, label)
const blocks: { col: number; row: number; span: number; color: string; label: string }[] = [
  { col: 0, row: 1, span: 2, color: COLORS.teal, label: "Maths" },
  { col: 0, row: 4, span: 1, color: COLORS.amber, label: "Échecs" },
  { col: 1, row: 0, span: 2, color: COLORS.violet, label: "Français" },
  { col: 1, row: 3, span: 1, color: COLORS.tealGlow, label: "Espagnol" },
  { col: 2, row: 2, span: 2, color: COLORS.amber, label: "Lecture" },
  { col: 3, row: 1, span: 1, color: COLORS.teal, label: "Sciences" },
  { col: 3, row: 5, span: 2, color: COLORS.violet, label: "Écriture" },
  { col: 4, row: 0, span: 1, color: COLORS.amber, label: "Maths" },
  { col: 4, row: 4, span: 2, color: COLORS.green, label: "Origami" },
  { col: 5, row: 2, span: 1, color: COLORS.tealGlow, label: "Espagnol" },
  { col: 5, row: 5, span: 2, color: COLORS.violet, label: "Art oratoire" },
  { col: 6, row: 3, span: 2, color: COLORS.amber, label: "Repos actif" },
];

export const SceneCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerEnter = spring({ frame, fps, config: { damping: 28 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, padding: 80, justifyContent: "center" }}>
      <div style={{ opacity: headerEnter, transform: `translateY(${interpolate(headerEnter, [0, 1], [12, 0])}px)`, marginBottom: 36 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 18, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
          Routine quotidienne
        </div>
        <div style={{ color: COLORS.text, fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Une semaine pensée pour <span style={{ color: COLORS.tealGlow }}>grandir</span>.
        </div>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 32, boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
        {/* Day header */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 8, marginBottom: 12 }}>
          <div />
          {days.map((d, i) => (
            <div key={d} style={{ textAlign: "center", color: i === 5 ? COLORS.amber : COLORS.textMuted, fontSize: 15, fontWeight: 600, letterSpacing: "0.08em" }}>
              {d}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 8 }}>
          {slots.map((s, rowIdx) => (
            <React.Fragment key={s}>
              <div style={{ color: COLORS.textDim, fontSize: 13, paddingTop: 6 }}>{s}</div>
              {days.map((_d, colIdx) => {
                const block = blocks.find((b) => b.col === colIdx && b.row === rowIdx);
                if (!block) {
                  return <div key={colIdx} style={{ height: 44, background: COLORS.surfaceElev, borderRadius: 8 }} />;
                }
                const delay = 30 + colIdx * 8 + rowIdx * 5;
                const enter = spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 180 } });
                return (
                  <div
                    key={colIdx}
                    style={{
                      gridRow: `span ${block.span}`,
                      height: 44 * block.span + 8 * (block.span - 1),
                      background: `linear-gradient(135deg, ${block.color}, ${block.color}aa)`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      opacity: enter,
                      transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
                      boxShadow: `0 6px 16px ${block.color}55`,
                    }}
                  >
                    {block.label}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// React import for Fragment
import React from "react";
