import React from "react";
import { Composition } from "remotion";
import { calculateMetadata, KerbauVideo } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Kerbau"
      component={KerbauVideo}
      durationInFrames={2550}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ sceneFrames: [] }}
      calculateMetadata={calculateMetadata}
    />
  </>
);
