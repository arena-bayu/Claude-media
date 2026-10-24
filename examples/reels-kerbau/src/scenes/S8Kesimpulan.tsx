import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { NOSE_RING, YOKE } from "../drawings/kerbau";
import { HORIZON, SPROUT, STAKE, sun } from "../drawings/props";
import { PENCIL, Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "08-kesimpulan";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Rope from the stake to the nose; it snaps apart on "talinya". */
const Rope: React.FC<{ snapAt: number }> = ({ snapAt }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [snapAt, snapAt + 14], [0, 1], clamp);
  return (
    <>
      <g transform={`translate(${-34 * p},${26 * p}) rotate(${10 * p} 110 1100)`}>
        <Sketch d="M110,1100 C170,1140 230,1150 284,1134" from={0} dur={12} width={2} />
      </g>
      <g transform={`translate(${14 * p},${-4 * p})`}>
        <Sketch d="M290,1132 C318,1126 344,1120 359,1116" from={0} dur={12} width={2} />
      </g>
      <Sketch
        d={["M287,1110 L287,1090", "M300,1118 L318,1104", "M274,1118 L258,1104", "M300,1146 L316,1160", "M274,1146 L258,1160"]}
        from={snapAt}
        dur={6}
        eraseFrom={snapAt + 16}
        eraseDur={10}
        width={2}
      />
    </>
  );
};

const RisingSun: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [from, from + 50], [810, 690], clamp);
  return (
    <g clipPath="url(#s8-horizon)">
      <g transform={`translate(870,${y})`}>
        <Sketch d={sun(0, 0, 44)} from={from} dur={12} width={2.2} />
      </g>
    </g>
  );
};

/** The buffalo lifts its head toward the horizon once the rope is gone. */
const Lift: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [at, at + 20], [0, 4], clamp);
  return <g transform={`rotate(${r} 700 1215)`}>{children}</g>;
};

export const S8Kesimpulan: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  return (
    <Scene id={ID} push={1.03}>
      <clipPath id="s8-horizon">
        <rect x={0} y={0} width={1080} height={758} />
      </clipPath>
      <HandText x={540} y={330} size={96} from={T("Begitulah")} dur={S(1.1)}>
        Begitulah kelas miskin.
      </HandText>
      <HandText x={540} y={440} size={64} from={T("tidak", 1)} dur={S(1.2)}>
        Tidak diberi kesempatan
      </HandText>
      <HandText x={540} y={516} size={64} from={T("untuk")} dur={S(1.4)}>
        untuk tumbuh dan jadi kaya.
      </HandText>
      <Sketch d={HORIZON} from={T("Yang")} dur={S(0.6)} width={2.2} />
      <RisingSun from={T("talinya")} />
      <Sketch d={STAKE(110, 1215)} from={0} dur={S(0.4)} />
      <Sketch d={SPROUT(190, 1215)} from={T("kesempatan")} dur={S(0.8)} stroke={PENCIL} width={2.2} />
      <Lift at={T("talinya", 0, 0.2)}>
        <Kerbau x={300} y={880} scale={0.9} from={0} dur={S(1)}>
          <Sketch d={YOKE} from={S(0.7)} dur={S(0.3)} />
          <Sketch d={NOSE_RING} from={S(0.8)} dur={S(0.2)} />
        </Kerbau>
        <Rope snapAt={T("talinya")} />
      </Lift>
    </Scene>
  );
};
