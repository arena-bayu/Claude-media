// Scenery and props, in frame coordinates (1080 × 1920) unless a function takes an origin.
import { ellipse } from "../lib/sketch";

export const HORIZON = "M30,760 C300,750 700,768 1050,756";
export const HILLS = ["M40,758 C150,700 260,688 390,742", "M610,752 C710,690 870,676 1046,728"];
export const HUT = [
  "M796,728 L842,698 L888,728", // roof
  "M806,726 L806,756", // posts
  "M878,726 L878,756",
  "M824,740 L860,740",
];
export const PALM = [
  "M196,758 C190,722 194,690 204,660",
  "M204,660 C184,648 162,652 150,670",
  "M204,660 C224,646 248,650 260,668",
  "M204,660 C200,640 190,628 174,624",
  "M204,660 C212,640 226,630 242,630",
];

/** Perspective furrows of a rice field below the horizon. */
export const furrows = (top: number, bottom: number) => {
  const vp = { x: 540, y: 760 };
  const out: string[] = [];
  for (const x of [-500, -150, 200, 540, 880, 1230, 1580]) {
    const t = (top - bottom) / (vp.y - bottom);
    const x2 = x + (vp.x - x) * t;
    out.push(`M${x},${bottom} L${x2.toFixed(0)},${top}`);
  }
  out.push(`M-20,${top + 40} C300,${top + 34} 780,${top + 46} 1100,${top + 38}`);
  out.push(`M-20,${top + 130} C300,${top + 124} 780,${top + 138} 1100,${top + 128}`);
  return out;
};

export const sun = (cx: number, cy: number, r = 38) => {
  const rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays.push(
      `M${(cx + Math.cos(a) * (r + 12)).toFixed(0)},${(cy + Math.sin(a) * (r + 12)).toFixed(0)} L${(cx + Math.cos(a) * (r + 30)).toFixed(0)},${(cy + Math.sin(a) * (r + 30)).toFixed(0)}`,
    );
  }
  return [ellipse(cx, cy, r, r), ...rays];
};

/** Tally marks in groups of five. */
export const tally = (x: number, y: number, groups: number) => {
  const out: string[] = [];
  for (let g = 0; g < groups; g++) {
    const gx = x + g * 82;
    for (let i = 0; i < 4; i++) out.push(`M${gx + i * 14},${y} L${gx + i * 14 + 2},${y + 56}`);
    out.push(`M${gx - 8},${y + 44} L${gx + 52},${y + 10}`);
  }
  return out;
};

export const BOARD = [
  "M540,330 L1000,330 L1000,610 L540,610 Z",
  "M556,346 L984,346 L984,594 L556,594 Z",
  "M600,610 L580,700",
  "M940,610 L960,700",
];

export const bulb = (cx: number, cy: number) => [
  `M${cx - 22},${cy + 30} C${cx - 60},${cy} ${cx - 50},${cy - 58} ${cx},${cy - 60} C${cx + 50},${cy - 58} ${cx + 60},${cy} ${cx + 22},${cy + 30} Z`,
  `M${cx - 18},${cy + 42} L${cx + 18},${cy + 42}`,
  `M${cx - 14},${cy + 54} L${cx + 14},${cy + 54}`,
  `M${cx - 10},${cy + 8} C${cx - 4},${cy - 12} ${cx + 4},${cy - 12} ${cx + 10},${cy + 8}`,
];

export const cross = (cx: number, cy: number, r: number) => [
  `M${cx - r},${cy - r} L${cx + r},${cy + r}`,
  `M${cx + r},${cy - r} L${cx - r},${cy + r}`,
];

/** An arm and open hand reaching down from the top edge. Fingertips around (x+50, y+150). */
export const handFromTop = (x: number, y: number) => [
  `M${x - 12},-20 C${x - 10},${y * 0.4} ${x - 4},${y * 0.8} ${x},${y}`,
  `M${x + 88},-20 C${x + 84},${y * 0.4} ${x + 80},${y * 0.8} ${x + 78},${y}`,
  `M${x},${y} C${x - 12},${y + 40} ${x - 10},${y + 90} ${x + 18},${y + 100} C${x + 38},${y + 105} ${x + 58},${y + 100} ${x + 73},${y + 90} C${x + 90},${y + 76} ${x + 88},${y + 30} ${x + 78},${y}`,
  `M${x + 18},${y + 100} C${x + 16},${y + 120} ${x + 20},${y + 140} ${x + 28},${y + 148}`,
  `M${x + 38},${y + 103} C${x + 38},${y + 126} ${x + 42},${y + 144} ${x + 50},${y + 150}`,
  `M${x + 58},${y + 98} C${x + 62},${y + 120} ${x + 68},${y + 136} ${x + 76},${y + 140}`,
];

export const CAL = { x: 560, y: 330, w: 440, h: 420, cols: 7, rows: 5, header: 70 };
export const calendarFrame = () => {
  const { x, y, w, h, cols, rows, header } = CAL;
  const out = [`M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`, `M${x},${y + header} L${x + w},${y + header}`];
  for (let c = 1; c < cols; c++) out.push(`M${x + (w / cols) * c},${y + header} L${x + (w / cols) * c},${y + h}`);
  const rh = (h - header) / rows;
  for (let r = 1; r < rows; r++) out.push(`M${x},${y + header + rh * r} L${x + w},${y + header + rh * r}`);
  return out;
};
export const calendarCell = (i: number) => {
  const { x, y, w, h, cols, rows, header } = CAL;
  const cw = w / cols;
  const rh = (h - header) / rows;
  return { cx: x + cw * (i % cols) + cw / 2, cy: y + header + rh * Math.floor(i / cols) + rh / 2, r: Math.min(cw, rh) * 0.28 };
};

export const BOOK = (x: number, y: number) => [
  `M${x},${y + 10} C${x + 30},${y} ${x + 60},${y} ${x + 80},${y + 12} C${x + 100},${y} ${x + 130},${y} ${x + 160},${y + 10} L${x + 160},${y + 60} C${x + 130},${y + 50} ${x + 100},${y + 50} ${x + 80},${y + 62} C${x + 60},${y + 50} ${x + 30},${y + 50} ${x},${y + 60} Z`,
  `M${x + 80},${y + 12} L${x + 80},${y + 62}`,
];

export const bubble = (x: number, y: number, w: number, h: number, tailX: number, tailY: number) => [
  `M${x + 40},${y} C${x + w * 0.4},${y - 10} ${x + w * 0.7},${y - 6} ${x + w - 40},${y} C${x + w + 10},${y + 6} ${x + w + 8},${y + h - 6} ${x + w - 40},${y + h} C${x + w * 0.6},${y + h + 8} ${x + 200},${y + h + 6} ${x + 150},${y + h} L${tailX},${tailY} L${x + 90},${y + h - 4} C${x + 20},${y + h} ${x - 10},${y + h - 10} ${x},${y + h / 2} C${x - 8},${y + 20} ${x + 10},${y + 2} ${x + 40},${y} Z`,
];

export const QUESTION = (x: number, y: number) => [
  `M${x - 34},${y - 40} C${x - 36},${y - 90} ${x + 44},${y - 100} ${x + 44},${y - 46} C${x + 44},${y - 10} ${x},${y - 6} ${x},${y + 34}`,
  `M${x - 2},${y + 66} C${x + 2},${y + 70} ${x + 4},${y + 72} ${x},${y + 76}`,
];

export const coil = (cx: number, cy: number) => [
  ellipse(cx, cy, 92, 36, 1),
  ellipse(cx + 6, cy - 16, 86, 34, 1),
  ellipse(cx - 4, cy - 32, 80, 32, 1),
  `M${cx + 80},${cy - 40} C${cx + 120},${cy - 70} ${cx + 110},${cy - 110} ${cx + 70},${cy - 130}`,
];

export const fieldPlot = (x: number, y: number) => [
  `M${x},${y} L${x + 200},${y} L${x + 236},${y + 90} L${x - 36},${y + 90} Z`,
  `M${x + 50},${y} L${x + 36},${y + 90}`,
  `M${x + 100},${y} L${x + 100},${y + 90}`,
  `M${x + 150},${y} L${x + 164},${y + 90}`,
];

export const sweat = (x: number, y: number) => [
  `M${x},${y} C${x - 10},${y + 16} ${x - 8},${y + 30} ${x},${y + 30} C${x + 8},${y + 30} ${x + 10},${y + 16} ${x},${y} Z`,
];

export const SPROUT = (x: number, y: number) => [
  `M${x},${y} C${x - 2},${y - 30} ${x + 2},${y - 60} ${x},${y - 90}`,
  `M${x},${y - 50} C${x - 30},${y - 60} ${x - 46},${y - 84} ${x - 40},${y - 100} C${x - 20},${y - 96} ${x - 4},${y - 76} ${x},${y - 50}`,
  `M${x},${y - 70} C${x + 26},${y - 82} ${x + 44},${y - 104} ${x + 40},${y - 120} C${x + 18},${y - 116} ${x + 4},${y - 96} ${x},${y - 70}`,
];

export const STAKE = (x: number, y: number) => [`M${x},${y - 120} L${x + 4},${y + 20}`, `M${x - 14},${y - 120} L${x + 14},${y - 122}`];
