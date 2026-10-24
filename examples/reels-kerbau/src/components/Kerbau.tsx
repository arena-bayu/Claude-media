import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BELLY_SHADE, CALF_HORNS, KERBAU, KERBAU_ORDER, KERBAU_SILHOUETTE } from "../drawings/kerbau";
import { Hatch, Sketch } from "../lib/sketch";
import { PAPER } from "./Paper";

type Props = {
  x: number;
  y: number;
  scale?: number;
  from: number;
  /** Frames to draw the whole animal. */
  dur?: number;
  calf?: boolean;
  /** Gentle walking bob. */
  walk?: boolean;
  /** Eye closed (content) from this frame on. */
  eyeClosedFrom?: number;
  seed?: number;
  /** Drawn behind the animal, in its local coordinates (e.g. the plough beam). */
  behind?: React.ReactNode;
  /** Drawn on top, in local coordinates (e.g. yoke, nose ring). */
  children?: React.ReactNode;
};

const GROUND = "M150,372 C230,388 420,390 530,374 C470,362 260,360 150,372 Z";
const EYE_OPEN = "M106,160 C112,154 122,154 128,160 C122,164 112,164 106,160";
const PUPIL = "M116,158 C117,159 118,160 117,161";
const EYE_SHUT = "M107,158 C114,164 121,164 127,158";

export const Kerbau: React.FC<Props> = ({ x, y, scale = 1, from, dur = 60, calf, walk, eyeClosedFrom, seed = 1, behind, children }) => {
  const frame = useCurrentFrame();
  const bob = walk ? Math.sin(frame / 7) * 4 : 0;
  const parts = KERBAU_ORDER.map((k) => (calf && k === "horns" ? CALF_HORNS : KERBAU[k]));
  const share = dur / parts.length;
  const eyeShut = eyeClosedFrom !== undefined && frame >= eyeClosedFrom;
  const bodyAt = from + share * 3;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${scale})`}>
      <Hatch d={GROUND} from={from + dur * 0.8} seed={seed + 40} />
      {behind}
      <path
        d={KERBAU_SILHOUETTE}
        fill={PAPER}
        opacity={interpolate(frame, [bodyAt, bodyAt + share], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Hatch d={BELLY_SHADE} from={from + dur} seed={seed + 20} gap={10} />
      {parts.map((p, i) => {
        const d = KERBAU_ORDER[i] === "face" && eyeShut ? p.filter((s) => s !== PUPIL).map((s) => (s === EYE_OPEN ? EYE_SHUT : s)) : p;
        return <Sketch key={i} d={d} from={from + i * share} dur={share * 1.2} seed={seed + i} width={2.6 / scale} />;
      })}
      {children}
    </g>
  );
};
