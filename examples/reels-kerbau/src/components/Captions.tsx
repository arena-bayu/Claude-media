import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { captionChunks, SceneId } from "../lib/words";
import { leadOf } from "../lib/timing";
import { HAND_FONT } from "./HandText";

/** Sentence-by-sentence subtitles; words darken as they are spoken. */
export const Captions: React.FC<{ id: SceneId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - leadOf(id);
  const chunks = captionChunks(id);
  const idx = chunks.findIndex((c, i) => t < (chunks[i + 1]?.[0].start ?? Infinity));
  const chunk = chunks[Math.max(0, idx)];
  const startT = chunk[0].start;
  if (t < startT - 0.15) return null;
  const opacity = interpolate(t, [startT - 0.15, startT + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1410 }}>
      <div
        style={{
          width: 900,
          textAlign: "center",
          fontFamily: HAND_FONT,
          fontSize: 62,
          lineHeight: 1.22,
          opacity,
        }}
      >
        {chunk.map((w, i) => (
          <span key={i} style={{ color: t >= w.start ? "#161616" : "#b3afa6" }}>
            {w.text}{" "}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
