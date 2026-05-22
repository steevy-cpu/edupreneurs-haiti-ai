import { AbsoluteFill, Series, useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { COLORS } from "./theme";
import { HudTicker } from "./components/Flash";

import { SceneGoogleIntro } from "./scenes/v2/SceneGoogleIntro";
import { SceneHook } from "./scenes/v2/SceneHook";
import { SceneDashboard } from "./scenes/v2/SceneDashboard";
import { SceneMatieres } from "./scenes/v2/SceneMatieres";
import { SceneLesson } from "./scenes/v2/SceneLesson";
import { SceneJude } from "./scenes/v2/SceneJude";
import { SceneExams } from "./scenes/v2/SceneExams";
import { SceneFeed } from "./scenes/v2/SceneFeed";
import { SceneMessages } from "./scenes/v2/SceneMessages";
import { SceneQuizBattle } from "./scenes/v2/SceneQuizBattle";
import { SceneChess } from "./scenes/v2/SceneChess";
import { ScenePassion } from "./scenes/v2/ScenePassion";
import { SceneLeaderboard } from "./scenes/v2/SceneLeaderboard";
import { SceneLibrary } from "./scenes/v2/SceneLibrary";
import { SceneTranslate } from "./scenes/v2/SceneTranslate";
import { SceneOutro } from "./scenes/v2/SceneOutro";

// Load Inter at module scope so every text node has the right metrics on first paint.
loadFont("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"] });

// Total: 2340 frames @ 30fps = 78s. Aggressive pitch with hard cuts (Series, no transitions).
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  // Soft fade at very end
  const globalOpacity = interpolate(frame, [2310, 2340], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Hide HUD during the Google intro and outro (they need clean canvases)
  const showHud = frame > 150 && frame < 2010;

  return (
    <AbsoluteFill style={{ opacity: globalOpacity, backgroundColor: COLORS.bg }}>
      <Series>
        <Series.Sequence durationInFrames={150}><SceneGoogleIntro /></Series.Sequence>
        <Series.Sequence durationInFrames={90}><SceneHook /></Series.Sequence>
        <Series.Sequence durationInFrames={150}><SceneDashboard /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneMatieres /></Series.Sequence>
        <Series.Sequence durationInFrames={150}><SceneLesson /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneJude /></Series.Sequence>
        <Series.Sequence durationInFrames={150}><SceneExams /></Series.Sequence>
        <Series.Sequence durationInFrames={180}><SceneFeed /></Series.Sequence>
        <Series.Sequence durationInFrames={180}><SceneMessages /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneQuizBattle /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneChess /></Series.Sequence>
        <Series.Sequence durationInFrames={150}><ScenePassion /></Series.Sequence>
        <Series.Sequence durationInFrames={90}><SceneLeaderboard /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneLibrary /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneTranslate /></Series.Sequence>
        <Series.Sequence durationInFrames={330}><SceneOutro /></Series.Sequence>
      </Series>
      {showHud && <HudTicker text="STREAK +1 · GOLD +25 · NIVEAU 7 · 1.2K EN LIGNE · QUIZ BATTLE GAGNÉ · ELO +24" />}
    </AbsoluteFill>
  );
};
