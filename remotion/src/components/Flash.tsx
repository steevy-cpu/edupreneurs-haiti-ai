import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

// 3-frame white flash at the start of a scene — aggressive cut signal.
export const Flash: React.FC<{ at?: number; color?: string; duration?: number }> = ({
  at = 0,
  color = "#FFFFFF",
  duration = 3,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: opacity * 0.85,
        pointerEvents: "none",
        zIndex: 999,
      }}
    />
  );
};

// HUD ticker — bottom amber bar that animates across all scenes.
export const HudTicker: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const x = (frame * 4) % 1920;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        height: 28,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          color: "#FF9F00",
          fontFamily: '"Inter", sans-serif',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transform: `translateX(${-x}px)`,
        }}
      >
        {`${text}  ·  ${text}  ·  ${text}  ·  ${text}  ·  ${text}  ·  ${text}`}
      </div>
    </div>
  );
};

// Animated cursor that moves to a target and clicks.
export const Cursor: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startFrame: number;
  durationFrames?: number;
  clickAt?: number;
}> = ({ fromX, fromY, toX, toY, startFrame, durationFrames = 24, clickAt }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const t = Math.min(1, (frame - startFrame) / durationFrames);
  // Ease-out cubic
  const e = 1 - Math.pow(1 - t, 3);
  const x = fromX + (toX - fromX) * e;
  const y = fromY + (toY - fromY) * e;
  const clickPulse =
    clickAt !== undefined && frame >= clickAt && frame < clickAt + 12
      ? 1 - (frame - clickAt) / 12
      : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 60, pointerEvents: "none" }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 2 L3 18 L7 14 L10 21 L13 20 L10 13 L17 13 Z"
          fill="#FFFFFF"
          stroke="#0A0B0D"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {clickPulse > 0 && (
        <div
          style={{
            position: "absolute",
            left: -20,
            top: -20,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `2px solid #FF9F00`,
            opacity: clickPulse * 0.8,
            transform: `scale(${1 + (1 - clickPulse) * 1.2})`,
          }}
        />
      )}
    </div>
  );
};
