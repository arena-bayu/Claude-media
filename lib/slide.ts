import sharp from "sharp";

export const W = 1080;
export const H = 1350; // rasio 4:5, ukuran terbesar yang diterima feed Instagram
export const PAD = 120;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

// Perkiraan lebar glyph DejaVu Sans (dalam em) per kelompok karakter; sedikit dilebihkan agar aman.
const NARROW = new Set("ijlI.,:;'!|");
const MID = new Set("tfr()[]\" -");
const WIDE = new Set("mwMW@%");
function charEm(c: string): number {
  if (NARROW.has(c)) return 0.34;
  if (MID.has(c)) return 0.5;
  if (WIDE.has(c)) return 0.96;
  if (/[A-Z]/.test(c)) return 0.72;
  if (/[0-9]/.test(c)) return 0.64;
  return 0.58;
}
const BOLD = { 400: 1, 700: 1.08, 800: 1.12 } as const;
type Weight = keyof typeof BOLD;

export const textWidth = (text: string, size: number, weight: Weight) =>
  [...text].reduce((w, c) => w + charEm(c), 0) * size * BOLD[weight];

/** Bungkus teks per kata agar tiap baris muat di `maxWidth` px; kata yang terlalu panjang dipecah. */
export function wrap(text: string, maxWidth: number, size: number, weight: Weight): string[] {
  const fits = (t: string) => textWidth(t, size, weight) <= maxWidth;
  const words = text.split(/\s+/).filter(Boolean).flatMap((w) => {
    const parts: string[] = [];
    let cur = "";
    for (const c of w) {
      if (cur && !fits(cur + c)) { parts.push(cur); cur = c; } else cur += c;
    }
    return cur ? [...parts, cur] : parts;
  });
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && !fits(next)) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

type Block = { text: string; weight: Weight; color: string; scale: number };

/** Slide bernomor ("1. Judul poin. Penjelasan...") dipecah jadi judul beraksen + isi. */
export function blocksFor(text: string, hook: boolean): Block[] {
  if (hook) return [{ text, weight: 800, color: "#eef3f0", scale: 1 }];
  const m = text.match(/^(\d+\.\s+[^.!?]+[.!?])\s+(.+)$/s);
  if (!m) return [{ text, weight: 700, color: "#eef3f0", scale: 1 }];
  return [
    { text: m[1], weight: 800, color: "#5fd39a", scale: 1.15 },
    { text: m[2], weight: 400, color: "#dfe7e3", scale: 1 },
  ];
}

/** Ukuran font terbesar yang membuat seluruh blok muat di area slide. */
function layout(blocks: Block[], maxSize: number) {
  const area = H - 2 * PAD - 160;
  for (let size = maxSize; size >= 28; size -= 2) {
    const laid = blocks.map((b) => {
      const s = Math.round(size * b.scale);
      return { ...b, size: s, lines: wrap(b.text, W - 2 * PAD, s, b.weight) };
    });
    const height = laid.reduce((h, b) => h + b.lines.length * b.size * 1.3, 0) + (laid.length - 1) * size * 0.6;
    if (height <= area || size === 28) return { laid, height, gap: size * 0.6 };
  }
  throw new Error("unreachable");
}

export async function renderSlide(text: string, index: number, total: number, brand: string): Promise<Buffer> {
  const hook = index === 0;
  const { laid, height, gap } = layout(blocksFor(text, hook), hook ? 96 : 60);
  const x = hook ? W / 2 : PAD;
  const anchor = hook ? "middle" : "start";

  let y = H / 2 - height / 2 - 40;
  const body: string[] = [];
  for (const b of laid) {
    for (const line of b.lines) {
      y += b.size * 1.3;
      body.push(`<text x="${x}" y="${y - b.size * 0.3}" font-size="${b.size}" font-weight="${b.weight}" text-anchor="${anchor}" fill="${b.color}">${esc(line)}</text>`);
    }
    y += gap;
  }
  const top = H / 2 - height / 2 - 40;
  const progress = total > 1 ? ((index + 1) / total) * (W - 2 * PAD) : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="DejaVu Sans, Arial, sans-serif">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a16"/><stop offset="1" stop-color="#0a0f0d"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${hook ? `<rect x="${W / 2 - 60}" y="${top - 40}" width="120" height="8" rx="4" fill="#5fd39a"/>` : ""}
  ${body.join("\n  ")}
  <text x="${PAD}" y="${H - 96}" font-size="30" font-weight="700" fill="#5fd39a">${esc(brand)}</text>
  ${total > 1 ? `<text x="${W - PAD}" y="${H - 96}" font-size="30" text-anchor="end" fill="#8fa39a">${index + 1}/${total}</text>` : ""}
  ${total > 1 ? `<rect x="${PAD}" y="${H - 70}" width="${W - 2 * PAD}" height="6" rx="3" fill="#24302a"/><rect x="${PAD}" y="${H - 70}" width="${progress}" height="6" rx="3" fill="#5fd39a"/>` : ""}
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
