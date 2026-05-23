import { Composition } from "remotion";
import { MainVideoV6, TOTAL_FRAMES } from "./v6/MainVideoV6";

// v6 — polish pass (rolling tickers, fake cursor, SVG formula, particles, glow CTA)
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideoV6}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
