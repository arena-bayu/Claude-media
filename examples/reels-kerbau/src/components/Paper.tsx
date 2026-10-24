import React from "react";
import { AbsoluteFill } from "remotion";

export const PAPER = "#f2f0eb";

/** Plain paper colour, under the drawing. */
export const Paper: React.FC = () => <AbsoluteFill style={{ backgroundColor: PAPER }} />;

/**
 * Grey grain and a soft vignette, laid over everything so that areas masked with
 * the paper colour (e.g. the buffalo silhouette) keep the same texture. Static, so it never re-renders.
 */
export const PaperTexture: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={4} />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope={0.22} />
        </feComponentTransfer>
      </filter>
      <rect width="1080" height="1920" filter="url(#grain)" />
      <radialGradient id="vig" cx="50%" cy="46%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.16} />
      </radialGradient>
      <rect width="1080" height="1920" fill="url(#vig)" />
    </svg>
  </AbsoluteFill>
);
