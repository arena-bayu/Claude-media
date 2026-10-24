import React from "react";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { PLOUGH, STRAW, YOKE } from "../drawings/kerbau";
import { coil, fieldPlot, handFromTop, sweat } from "../drawings/props";
import { ellipse, Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "07-twist";

export const S7Twist: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  return (
    <Scene id={ID}>
      <Kerbau x={150} y={1000} scale={0.9} from={0} dur={S(1)} walk behind={<Sketch d={PLOUGH} from={S(0.6)} dur={S(0.5)} />}>
        <Sketch d={YOKE} from={S(0.7)} dur={S(0.3)} />
      </Kerbau>
      <Sketch d={[...sweat(330, 1000), ...sweat(380, 980), ...sweat(276, 1020)]} from={T("keras")} dur={S(0.6)} width={2.2} />

      <Sketch d={coil(200, 640)} from={T("tali")} dur={S(0.5)} />
      <HandText x={200} y={800} size={58} from={T("tali")} dur={S(0.4)}>
        tali
      </HandText>
      <Sketch d={ellipse(200, 590, 140, 130)} from={T("tali", 0, 0.35)} dur={S(0.4)} width={2.8} />

      <g transform="translate(540,680) scale(1.5)">
        <Sketch d={STRAW} from={T("jerami")} dur={S(0.4)} />
      </g>
      <HandText x={540} y={800} size={58} from={T("jerami")} dur={S(0.4)}>
        jerami
      </HandText>
      <Sketch d={ellipse(540, 590, 125, 130)} from={T("jerami", 0, 0.35)} dur={S(0.4)} width={2.8} />

      <Sketch d={[...fieldPlot(800, 580), ...handFromTop(858, 400)]} from={T("memegang")} dur={S(0.8)} />
      <HandText x={900} y={800} size={58} from={T("sawah")} dur={S(0.4)}>
        sawah
      </HandText>
      <Sketch d={ellipse(900, 590, 160, 135)} from={T("sawah", 0, 0.2)} dur={S(0.4)} width={2.8} />
    </Scene>
  );
};
