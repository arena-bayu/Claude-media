import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { STRAW } from "../drawings/kerbau";
import { CAL, calendarCell, calendarFrame, cross, handFromTop } from "../drawings/props";
import { ellipse, Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "03-jerami";
const DAYS = ["S", "S", "R", "K", "J", "S", "M"];
const CELLS = CAL.cols * CAL.rows;

const FallingStraw: React.FC<{ drawAt: number; dropAt: number; dur: number }> = ({ drawAt, dropAt, dur }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [dropAt, dropAt + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.5, 0, 0.9, 0.6),
  });
  return (
    <g transform={`translate(${282 - 34 * p},${880 + 438 * p}) rotate(${-8 * p}) scale(1.1)`}>
      <Sketch d={STRAW} from={drawAt} dur={10} width={2.2} />
    </g>
  );
};

export const S3Jerami: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  const crossStart = T("besok", 0, 0.8);
  const crossEnd = T("sehari", 0, -0.2);
  const step = (crossEnd - crossStart) / (CELLS - 1);
  return (
    <Scene id={ID}>
      <Kerbau x={120} y={980} scale={0.9} from={0} dur={S(0.9)} />
      <Sketch d={handFromTop(232, 640)} from={T("Upahnya")} dur={S(0.7)} eraseFrom={T("Cukup")} eraseDur={S(0.5)} />
      <FallingStraw drawAt={T("segenggam")} dropAt={T("jerami", 0, 0.1)} dur={S(0.45)} />
      <Sketch d={calendarFrame()} from={T("besok")} dur={S(0.7)} width={2.2} />
      {DAYS.map((d, i) => (
        <HandText key={i} x={CAL.x + (CAL.w / CAL.cols) * (i + 0.5)} y={CAL.y + 52} size={44} from={T("besok", 0, 0.4)} dur={4}>
          {d}
        </HandText>
      ))}
      {Array.from({ length: CELLS - 1 }, (_, i) => {
        const c = calendarCell(i);
        return <Sketch key={i} d={cross(c.cx, c.cy, c.r)} from={Math.round(crossStart + i * step)} dur={4} seed={i} width={2.4} />;
      })}
      {(() => {
        const c = calendarCell(CELLS - 1);
        return (
          <>
            <Sketch d={ellipse(c.cx, c.cy, c.r * 2, c.r * 1.8)} from={T("sehari", 0, -0.1)} dur={S(0.35)} width={2.4} />
            <Sketch d={cross(c.cx, c.cy, c.r)} from={T("sehari", 0, 0.35)} dur={5} width={2.4} />
          </>
        );
      })()}
    </Scene>
  );
};
