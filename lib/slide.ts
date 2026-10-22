import sharp from "sharp";

const W = 1080;
const H = 1350; // rasio 4:5, ukuran terbesar yang diterima feed Instagram
const PAD = 120;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

/** Bungkus teks per kata; kata yang lebih panjang dari satu baris dipecah. */
export function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean).flatMap((w) => w.match(new RegExp(`.{1,${maxChars}}`, "g")) ?? []);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && cur.length + 1 + w.length > maxChars) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Ukuran font terbesar yang membuat seluruh teks muat di area slide. */
function fit(text: string, maxSize: number) {
  for (let size = maxSize; size > 28; size -= 4) {
    const lines = wrap(text, Math.floor((W - 2 * PAD) / (size * 0.56)));
    if (lines.length * size * 1.3 <= H - 2 * PAD - 160) return { size, lines };
  }
  return { size: 28, lines: wrap(text, Math.floor((W - 2 * PAD) / (28 * 0.56))) };
}

export async function renderSlide(text: string, index: number, total: number, brand: string): Promise<Buffer> {
  const hook = index === 0;
  const { size, lines } = fit(text, hook ? 96 : 64);
  const lineH = size * 1.3;
  const y0 = H / 2 - ((lines.length - 1) * lineH) / 2 + size * 0.35;
  const x = hook ? W / 2 : PAD;
  const anchor = hook ? "middle" : "start";
  const body = lines
    .map((l, i) => `<text x="${x}" y="${y0 + i * lineH}" font-size="${size}" font-weight="${hook ? 800 : 600}" text-anchor="${anchor}" fill="#eef3f0">${esc(l)}</text>`)
    .join("");
  const progress = total > 1 ? ((index + 1) / total) * (W - 2 * PAD) : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="DejaVu Sans, Arial, sans-serif">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a16"/><stop offset="1" stop-color="#0a0f0d"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${hook ? `<rect x="${W / 2 - 60}" y="${y0 - size * 1.6}" width="120" height="8" rx="4" fill="#5fd39a"/>` : ""}
  ${body}
  <text x="${PAD}" y="${H - 96}" font-size="30" font-weight="700" fill="#5fd39a">${esc(brand)}</text>
  ${total > 1 ? `<text x="${W - PAD}" y="${H - 96}" font-size="30" text-anchor="end" fill="#8fa39a">${index + 1}/${total}</text>` : ""}
  ${total > 1 ? `<rect x="${PAD}" y="${H - 70}" width="${W - 2 * PAD}" height="6" rx="3" fill="#24302a"/><rect x="${PAD}" y="${H - 70}" width="${progress}" height="6" rx="3" fill="#5fd39a"/>` : ""}
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
