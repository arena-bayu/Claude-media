import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { leadOf } from "../lib/timing";
import { SceneId } from "../lib/words";
import { Captions } from "./Captions";
import { Paper, PaperTexture } from "./Paper";

const Camera: React.FC<{ children: React.ReactNode; push: number; fx: number; fy: number }> = ({ children, push, fx, fy }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [1, push], { extrapolateRight: "clamp" });
  return <g transform={`translate(${fx},${fy}) scale(${s}) translate(${-fx},${-fy})`}>{children}</g>;
};

/** Paper, a slowly pushing-in camera over the drawing, voice over and captions. */
export const Scene: React.FC<{ id: SceneId; children: React.ReactNode; push?: number; fx?: number; fy?: number }> = ({
  id,
  children,
  push = 1.05,
  fx = 540,
  fy = 900,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Paper />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Camera push={push} fx={fx} fy={fy}>
          {children}
        </Camera>
      </svg>
      <Captions id={id} />
      <PaperTexture />
      <Audio src={staticFile(`vo/${id}.mp3`)} from={Math.round(leadOf(id) * fps)} />
    </AbsoluteFill>
  );
};
