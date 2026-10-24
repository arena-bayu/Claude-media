import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { HandText } from "../components/HandText";
import { Kerbau } from "../components/Kerbau";
import { Scene } from "../components/Scene";
import { NOSE_RING } from "../drawings/kerbau";
import { HORIZON, sun } from "../drawings/props";
import { PENCIL, Sketch } from "../lib/sketch";
import { useSceneTime } from "../lib/timing";

const ID = "04-tali";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The thin rope; it shakes when yanked ("sentak"). */
const Rope: React.FC<{ from: number; yankAt: number }> = ({ from, yankAt }) => {
  const frame = useCurrentFrame();
  const t = frame - yankAt;
  const shake = t >= 0 && t < 20 ? Math.sin(t * 1.6) * 26 * (1 - t / 20) : 0;
  const s = Math.round(shake);
  return <Sketch d={`M462,966 C420,${1080 + s} 300,${1160 - s} -40,1180`} from={from} dur={20} width={1.8} />;
};

export const S4Tali: React.FC = () => {
  const { T, S } = useSceneTime(ID);
  const frame = useCurrentFrame();
  const cut = T("lupa");
  const closeUp = interpolate(frame, [cut - 4, cut + 6], [1, 0], clamp);
  return (
    <Scene id={ID} push={1.04} fx={460} fy={960}>
      {closeUp > 0 ? (
        <g opacity={closeUp}>
          <Kerbau x={310} y={363} scale={2.3} from={0} dur={S(0.8)}>
            <Sketch d={NOSE_RING} from={S(0.6)} dur={S(0.3)} />
          </Kerbau>
          <Rope from={T("Tali")} yankAt={T("sentak")} />
          <HandText x={150} y={1330} size={70} from={T("tipis")} dur={S(0.5)}>
            tipis…
          </HandText>
          <Sketch d="M180,1270 C196,1222 220,1186 252,1160" from={T("tipis", 0, 0.2)} dur={S(0.3)} width={2} />
          <Sketch
            d={["M250,1140 L236,1118", "M258,1144 L278,1124", "M246,1148 L228,1162"]}
            from={T("putus")}
            dur={S(0.3)}
            width={2}
          />
        </g>
      ) : null}
      {frame >= cut - 4 ? (
        <g opacity={1 - closeUp}>
          <Sketch d={HORIZON} from={cut} dur={S(0.5)} width={2.2} />
          <Kerbau x={560} y={850} scale={0.8} from={cut} dur={S(0.8)} />
          <Sketch
            d={[
              "M700,1150 C560,1180 380,1212 100,1282",
              "M716,1192 C580,1232 400,1272 140,1350",
              "M430,1214 C380,1110 360,960 380,770",
              "M500,1200 C452,1100 424,950 412,770",
            ]}
            from={T("melangkah")}
            dur={S(0.9)}
            eraseFrom={T("lain", 0, 0.4)}
            eraseDur={S(0.5)}
            stroke={PENCIL}
            dash="6 14"
            width={2.4}
          />
          <g clipPath="url(#s4-horizon)">
            <Sketch d={sun(396, 742, 30)} from={T("arah")} dur={S(0.5)} eraseFrom={T("lain", 0, 0.4)} eraseDur={S(0.5)} stroke={PENCIL} width={2} />
          </g>
          <clipPath id="s4-horizon">
            <rect x={0} y={0} width={1080} height={758} />
          </clipPath>
        </g>
      ) : null}
    </Scene>
  );
};
