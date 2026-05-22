import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 75s @ 30fps = 2250 frames. Single composition; scene timing handled internally.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={2250}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
