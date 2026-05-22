import { Composition } from "remotion";
import { MainVideoV3, TOTAL_FRAMES } from "./v3/MainVideoV3";

// v3 — Paper & Teal, Apple Keynote style, ~80s
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideoV3}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
