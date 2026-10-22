import sharp from "sharp";

const W = 1080, H = 1350;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

// Slide 1080x1350 (rasio 4:5 Instagram), teks di tengah.
export async function renderSlide(text: string, index: number, total: number, brand = process.env.BRAND_NAME ?? ""): Promise<Buffer> {
  const size = text.length > 120 ? 52 : text.length > 60 ? 64 : 80;
  const lines = wrap(text, Math.floor(900 / (size * 0.55))).slice(0, 12);
  const y0 = H / 2 - ((lines.length - 1) * size * 1.3) / 2;
  const body = lines.map((l, i) => `<text x="${W / 2}" y="${y0 + i * size * 1.3}" font-size="${size}" font-weight="700" text-anchor="middle" fill="#e6ede9">${esc(l)}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="DejaVu Sans, Arial, sans-serif">
<rect width="${W}" height="${H}" fill="#0d1210"/><rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="32" fill="none" stroke="#2c3a33" stroke-width="3"/>
${body}
<text x="100" y="${H - 100}" font-size="32" fill="#7ee0a8">${esc(brand)}</text>
<text x="${W - 100}" y="${H - 100}" font-size="32" text-anchor="end" fill="#7ee0a8">${index + 1}/${total}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Slide yang dipakai sebuah post: slides dari Nico, atau caption sebagai satu slide.
export const slideTexts = (p: { slides?: string[]; caption: string }) => (p.slides?.length ? p.slides : [p.caption]);
