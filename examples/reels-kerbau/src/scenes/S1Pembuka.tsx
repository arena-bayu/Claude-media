import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { PLOUGH, YOKE } from "../drawings/kerbau";
import { furrows, HILLS, HORIZON, HUT, PALM, sun, tally } from "../drawings/props";
import { PENCIL, Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "01-pembuka";

const Sun: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fade = interpolate(frame, [to - 6, to + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g clipPath="url(#above-horizon)" opacity={fade}>
      <g transform={`translate(${150 + 780 * p},${800 - Math.sin(Math.PI * p) * 400})`}>
        <Sketch d={sun(0, 0)} from={from} dur={8} width={2.2} />
      </g>
    </g>
  );
};

export const S1Pembuka: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  return (
    <Scene id={ID}>
      <clipPath id="above-horizon">
        <rect x={0} y={0} width={1080} height={758} />
      </clipPath>
      <HandText x={540} y={250} size={78} from={0} dur={S(0.9)}>
        Kerbau yang Tak Boleh Pintar
      </HandText>
      <Sketch d={[HORIZON, ...HILLS, ...HUT, ...PALM]} from={T("desa")} dur={S(1.2)} width={2.2} />
      <Sun from={T("subuh")} to={T("magrib", 0, 0.9)} />
      <Kerbau
        x={110}
        y={830}
        from={T("kerbau")}
        dur={S(1.5)}
        walk
        behind={<Sketch d={PLOUGH} from={T("membajak")} dur={S(0.8)} />}
      >
        <Sketch d={YOKE} from={T("membajak")} dur={S(0.5)} />
      </Kerbau>
      <Sketch d={furrows(1226, 1380)} from={T("sawah")} dur={S(1)} stroke={PENCIL} width={2} />
      <Sketch d={tally(640, 420, 5)} from={T("Bertahun-tahun")} dur={S(2.2)} width={2.2} />
    </Scene>
  );
};
