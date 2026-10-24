import React from "react";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { PLOUGH, YOKE } from "../drawings/kerbau";
import { BOOK } from "../drawings/props";
import { ellipse, Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "06-anak";

export const S6Anak: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  return (
    <Scene id={ID}>
      <Kerbau x={350} y={780} scale={0.82} from={0} dur={S(1)} behind={<Sketch d={PLOUGH} from={S(0.6)} dur={S(0.5)} />}>
        <Sketch d={YOKE} from={S(0.7)} dur={S(0.3)} />
      </Kerbau>
      <Kerbau
        x={70}
        y={1100}
        scale={0.5}
        calf
        seed={9}
        from={T("anaknya")}
        dur={S(0.9)}
        behind={<Sketch d={PLOUGH} from={T("bajak")} dur={S(0.6)} seed={9} />}
      >
        <Sketch d={YOKE} from={T("dipasangi")} dur={S(0.4)} seed={9} />
      </Kerbau>
      <Sketch d={BOOK(80, 1010)} from={T("belajar")} dur={S(0.4)} eraseFrom={T("lehernya")} eraseDur={S(0.35)} />
      <Sketch d={ellipse(908, 975, 96, 128)} from={T("sama")} dur={S(0.45)} width={2.6} />
      <Sketch d={ellipse(412, 1222, 66, 86)} from={T("sama", 0, 0.25)} dur={S(0.45)} width={2.6} />
    </Scene>
  );
};
