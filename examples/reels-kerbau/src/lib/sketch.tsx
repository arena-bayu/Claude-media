import { getLength } from "@remotion/paths";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export const INK = "#161616";
export const PENCIL = "#8c8c8c";

const gen = rough.generator();
const cache = new Map<string, { d: string; len: number }[]>();

/** Re-seed every few frames so lines "boil" slightly, like hand-drawn animation. */
const BOIL_EVERY = 4;
const BOIL_VARIANTS = 3;

const roughen = (d: string, seed: number, opts: Options) => {
  const key = `${seed}|${opts.roughness}|${opts.bowing}|${d}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = gen
      .toPaths(gen.path(d, { ...opts, seed }))
      .filter((p) => p.d.length > 0)
      .map((p) => ({ d: p.d, len: Math.max(1, getLength(p.d)) }));
    cache.set(key, hit);
  }
  return hit;
};

const ease = Easing.bezier(0.45, 0.05, 0.35, 1);

export type SketchProps = {
  /** One or more SVG path strings, drawn one after another. */
  d: string | readonly string[];
  /** Frame (relative to the enclosing sequence) at which drawing starts. */
  from: number;
  /** Frames the whole drawing takes. */
  dur: number;
  /** Optional frame at which the drawing is erased again (reverse stroke). */
  eraseFrom?: number;
  eraseDur?: number;
  stroke?: string;
  width?: number;
  roughness?: number;
  bowing?: number;
  seed?: number;
  opacity?: number;
  dash?: string;
};

export const Sketch: React.FC<SketchProps> = ({
  d,
  from,
  dur,
  eraseFrom,
  eraseDur = 12,
  stroke = INK,
  width = 2.6,
  roughness = 0.9,
  bowing = 0.8,
  seed = 1,
  opacity = 1,
  dash,
}) => {
  const frame = useCurrentFrame();
  const drawn = interpolate(frame, [from, from + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const erased =
    eraseFrom === undefined
      ? 0
      : interpolate(frame, [eraseFrom, eraseFrom + eraseDur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
  const progress = drawn - erased;
  if (progress <= 0) return null;

  const list = typeof d === "string" ? [d] : d;
  const boil = seed * 7 + (Math.floor(frame / BOIL_EVERY) % BOIL_VARIANTS);
  const opts: Options = { roughness, bowing, stroke };

  return (
    <g opacity={opacity} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {list.map((src, i) => {
        // Each path gets an equal slice of the overall progress.
        const local = Math.min(1, Math.max(0, progress * list.length - i));
        if (local <= 0) return null;
        return roughen(src, boil + i * 13, opts).map((p, j) => (
          // Dashed lines fade in instead of being stroked on.
          <path
            key={`${i}-${j}`}
            d={p.d}
            opacity={dash ? local : undefined}
            strokeDasharray={dash ?? (local < 1 ? `${p.len} ${p.len}` : undefined)}
            strokeDashoffset={dash ? undefined : local < 1 ? p.len * (1 - local) : undefined}
          />
        ));
      })}
    </g>
  );
};

/** Hand-drawn hatching inside a closed path (e.g. shadows), faded in. */
export const Hatch: React.FC<{ d: string; from: number; dur?: number; gap?: number; angle?: number; seed?: number; opacity?: number }> = ({
  d,
  from,
  dur = 15,
  gap = 14,
  angle = -41,
  seed = 3,
  opacity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + dur], [0, opacity], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  const boil = seed * 5 + (Math.floor(frame / BOIL_EVERY) % BOIL_VARIANTS);
  const key = `hatch|${boil}|${gap}|${angle}|${d}`;
  let paths = cache.get(key);
  if (!paths) {
    paths = gen
      .toPaths(gen.path(d, { seed: boil, fill: PENCIL, fillStyle: "hachure", hachureGap: gap, hachureAngle: angle, fillWeight: 1.4, stroke: "none", roughness: 1.1 }))
      .map((p) => ({ d: p.d, len: 0 }));
    cache.set(key, paths);
  }
  return (
    <g opacity={o} fill="none" stroke={PENCIL} strokeWidth={1.4} strokeLinecap="round">
      {paths.map((p, i) => (
        <path key={i} d={p.d} />
      ))}
    </g>
  );
};

/** Ellipse / circle as a path, for scribbled circles around things. */
export const ellipse = (cx: number, cy: number, rx: number, ry: number, turns = 1.08) => {
  const steps = 48;
  const pts: string[] = [];
  for (let i = 0; i <= steps * turns; i++) {
    const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rx).toFixed(1)},${(cy + Math.sin(a) * ry).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};
