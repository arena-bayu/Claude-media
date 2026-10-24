import React, { useId } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { INK } from "../lib/sketch";

export const HAND_FONT = "Patrick Hand";

type Props = {
  x: number;
  y: number;
  size: number;
  from: number;
  dur: number;
  anchor?: "start" | "middle";
  color?: string;
  children: string;
};

/** Handwritten text that is "written" left to right. */
export const HandText: React.FC<Props> = ({ x, y, size, from, dur, anchor = "middle", color = INK, children }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const p = interpolate(frame, [from, from + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= 0) return null;
  const estWidth = children.length * size * 0.46;
  const left = anchor === "middle" ? x - estWidth / 2 - size : x - size * 0.2;
  return (
    <g>
      <clipPath id={id}>
        <rect x={left} y={y - size * 1.2} width={(estWidth + size * 1.4) * p} height={size * 1.8} />
      </clipPath>
      <text x={x} y={y} fontFamily={HAND_FONT} fontSize={size} fill={color} textAnchor={anchor} clipPath={`url(#${id})`}>
        {children}
      </text>
    </g>
  );
};
