import React from "react";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { NOSE_RING, OWNER } from "../drawings/kerbau";
import { BOARD, bulb, cross } from "../drawings/props";
import { Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "02-patuh";

export const S2Patuh: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  return (
    <Scene id={ID}>
      <Kerbau x={300} y={920} scale={0.95} from={0} dur={S(1)}>
        <Sketch d={NOSE_RING} from={S(0.9)} dur={S(0.3)} />
      </Kerbau>
      <Sketch d={BOARD} from={T("diajari")} dur={S(0.8)} />
      <HandText x={770} y={520} size={150} from={T("menarik")} dur={S(0.6)}>
        TARIK
      </HandText>
      <g transform="translate(30,700)">
        <Sketch d={OWNER} from={T("Pemiliknya")} dur={S(0.9)} />
      </g>
      <Sketch d="M206,962 C240,1080 300,1160 363,1169" from={T("Pemiliknya", 0, 0.8)} dur={S(0.4)} width={2} />
      <Sketch d={bulb(440, 850)} from={T("pintar")} dur={S(0.5)} />
      <Sketch d={cross(440, 850, 70)} from={T("pintar", 0, 0.6)} dur={S(0.3)} width={3.4} />
      <Sketch d={["M640,546 C720,554 820,550 900,540", "M664,574 C740,580 820,578 880,568"]} from={T("patuh")} dur={S(0.5)} width={3} />
    </Scene>
  );
};
