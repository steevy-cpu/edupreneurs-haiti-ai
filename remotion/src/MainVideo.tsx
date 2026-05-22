import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/Inter";
import { COLORS } from "./theme";
import { SceneHook } from "./scenes/SceneHook";
import { SceneDashboard } from "./scenes/SceneDashboard";
import { SceneCourses } from "./scenes/SceneCourses";
import { ScenePassions } from "./scenes/ScenePassions";
import { SceneCalendar } from "./scenes/SceneCalendar";
import { SceneOutro } from "./scenes/SceneOutro";

// Load Inter at module scope so every text node has the right metrics on first paint.
loadFont("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"] });

// Persistent ambient layer: subtle drifting gradient orbs and grain.
// Lives outside TransitionSeries so it never resets between scenes.
const AmbientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  // Slow sinusoidal drift — gives the static-looking dark canvas a "breathing" quality.
  const driftX = Math.sin(frame / 180) * 80;
  const driftY = Math.cos(frame / 220) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: `calc(20% + ${driftX}px)`,
          top: `calc(15% + ${driftY}px)`,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.teal}33 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: `calc(10% + ${-driftX}px)`,
          bottom: `calc(10% + ${-driftY}px)`,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.amber}22 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* Subtle vignette to anchor focus toward the centre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  // Global fade-out for the very last 20 frames to feel like a soft cut to black.
  const globalOpacity = interpolate(frame, [2230, 2250], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      <AmbientBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={360}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={450}>
          <SceneDashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={450}>
          <SceneCourses />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={390}>
          <ScenePassions />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={360}>
          <SceneCalendar />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={340}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
