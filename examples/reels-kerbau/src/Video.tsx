import { loadFont } from "@remotion/fonts";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import { CalculateMetadataFunction, staticFile } from "remotion";
import { END_HOLD, FADE_FRAMES, leadOf, TAIL } from "./lib/timing";
import { endOf, SCENES } from "./lib/words";
import { S1Pembuka } from "./scenes/S1Pembuka";
import { S2Patuh } from "./scenes/S2Patuh";
import { S3Jerami } from "./scenes/S3Jerami";
import { S4Tali } from "./scenes/S4Tali";
import { S5Cukup } from "./scenes/S5Cukup";
import { S6Anak } from "./scenes/S6Anak";
import { S7Twist } from "./scenes/S7Twist";
import { S8Kesimpulan } from "./scenes/S8Kesimpulan";

loadFont({ family: "Patrick Hand", url: staticFile("fonts/PatrickHand.woff2") });

export type KerbauProps = {
  /** Frames per scene, filled in by calculateMetadata from the voice-over lengths. */
  sceneFrames: number[];
};

const FPS = 30;
const MAX_SECONDS = 90;

// Scene length follows the last spoken word (the MP3s end in ~0.9 s of silence, which the tail replaces).
export const calculateMetadata: CalculateMetadataFunction<KerbauProps> = ({ props }) => {
  const sceneFrames = SCENES.map((s, i) => {
    const tail = i === SCENES.length - 1 ? END_HOLD : TAIL;
    return Math.ceil((leadOf(s.id) + endOf(s.id) + tail) * FPS);
  });
  const total = sceneFrames.reduce((a, b) => a + b, 0) - FADE_FRAMES * (SCENES.length - 1);
  if (total > MAX_SECONDS * FPS) {
    throw new Error(`Video is ${(total / FPS).toFixed(1)}s, over the ${MAX_SECONDS}s limit. Shorten src/script.json.`);
  }
  return { durationInFrames: total, props: { ...props, sceneFrames } };
};

export const KerbauVideo: React.FC<KerbauProps> = ({ sceneFrames }) => {
  const f = (i: number) => sceneFrames[i] ?? 60;
  const t = <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE_FRAMES })} />;
  return (
    <TransitionSeries name="Kerbau">
      <TransitionSeries.Sequence name="1 Pembuka" durationInFrames={f(0)}>
        <S1Pembuka />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="2 Patuh" durationInFrames={f(1)}>
        <S2Patuh />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="3 Jerami" durationInFrames={f(2)}>
        <S3Jerami />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="4 Tali" durationInFrames={f(3)}>
        <S4Tali />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="5 Merasa cukup" durationInFrames={f(4)}>
        <S5Cukup />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="6 Anak" durationInFrames={f(5)}>
        <S6Anak />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="7 Twist" durationInFrames={f(6)}>
        <S7Twist />
      </TransitionSeries.Sequence>
      {t}
      <TransitionSeries.Sequence name="8 Kesimpulan" durationInFrames={f(7)}>
        <S8Kesimpulan />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
