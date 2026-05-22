import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 78s @ 30fps = 2340 frames. Aggressive pitch video covering 16 scenes.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={2340}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
