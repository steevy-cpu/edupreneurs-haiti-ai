import { Composition } from "remotion";
import { MainVideoV7, TOTAL_FRAMES } from "./v7/MainVideoV7";

// v7 — polish pass on v6: word-stagger subtitle, flat hero,
// cursor click choreography, vector formula, accessible footer.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideoV7}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
