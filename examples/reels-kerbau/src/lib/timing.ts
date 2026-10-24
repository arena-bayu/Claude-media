import { useVideoConfig } from "remotion";
import { at, endOf, SceneId } from "./words";

/** Silence before the voice over starts in each scene (scene 1 opens on the title). */
export const leadOf = (id: SceneId) => (id === "01-pembuka" ? 1.0 : 0.15);
/** Silence after the voice over, longer than the cross-fade so lines never overlap. */
export const TAIL = 0.6;
export const END_HOLD = 2.2;
export const FADE_FRAMES = 10;

/** Frame helpers for a scene: `T("jerami")` is the frame where "jerami" is spoken. */
export const useSceneTime = (id: SceneId) => {
  const { fps } = useVideoConfig();
  const lead = leadOf(id);
  const T = (word: string, nth = 0, offsetSec = 0) => Math.round((lead + at(id, word, nth) + offsetSec) * fps);
  const S = (sec: number) => Math.round(sec * fps);
  const end = Math.round((lead + endOf(id)) * fps);
  return { T, S, end, fps };
};
