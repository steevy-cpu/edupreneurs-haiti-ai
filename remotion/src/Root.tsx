import { Composition } from "remotion";
import { MainVideoV5, TOTAL_FRAMES } from "./v5/MainVideoV5";

// v5 — conversion-driven, faithful to mon-edupreneur.com, 58s @ 30fps
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideoV5}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
