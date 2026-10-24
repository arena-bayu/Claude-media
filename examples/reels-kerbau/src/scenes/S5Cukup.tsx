import React from "react";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { NOSE_RING, OWNER } from "../drawings/kerbau";
import { bubble, QUESTION } from "../drawings/props";
import { Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "05-cukup";

export const S5Cukup: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  return (
    <Scene id={ID}>
      <g transform="translate(30,700)">
        <Sketch d={OWNER} from={0} dur={S(0.9)} />
      </g>
      <Kerbau x={360} y={920} scale={0.95} from={0} dur={S(0.9)} eyeClosedFrom={T("cukup")}>
        <Sketch d={NOSE_RING} from={S(0.8)} dur={S(0.2)} />
      </Kerbau>
      <Sketch d="M206,962 C260,1080 340,1160 423,1169" from={S(0.9)} dur={S(0.3)} width={2} />
      <Sketch d={QUESTION(580, 850)} from={T("bertanya")} dur={S(0.6)} eraseFrom={T("cukup", 0, -0.3)} eraseDur={S(0.5)} width={3.2} />
      <Sketch d={bubble(80, 330, 880, 300, 150, 752)} from={T("berbisik")} dur={S(0.6)} />
      <HandText x={520} y={455} size={84} from={T("Bersyukurlah")} dur={S(0.7)}>
        “Bersyukurlah.
      </HandText>
      <HandText x={520} y={560} size={66} from={T("Kamu")} dur={S(1.1)}>
        Kamu masih punya jerami.”
      </HandText>
    </Scene>
  );
};
