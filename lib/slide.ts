import fs from "node:fs";
import path from "node:path";
import opentype, { type Font } from "opentype.js";
import sharp from "sharp";

export const W = 1080;
export const H = 1350; // rasio 4:5, ukuran terbesar yang diterima feed Instagram
export const MARGIN = 96;
export const MAX_SLIDES = 5;

// Kobalt untuk cover & penutup, merah muda untuk slide poin: warna berganti saat di-swipe.
export const COLORS = {
  cobalt: "#2338D4",
  pink: "#FFD3E3",
  ink: "#0D1640",
  white: "#FFFFFF",
} as const;

// Teks digambar sebagai path vektor dari file font: ukurannya presisi dan hasilnya
// sama di mesin mana pun, tanpa bergantung pada font yang terpasang di server.
type Fonts = { bold: Font; medium: Font };
let fonts: Fonts | null = null;
function loadFonts(): Fonts {
  if (fonts) return fonts;
  const dir = path.join(process.cwd(), "assets/fonts");
  const load = (file: string) => {
    const buf = fs.readFileSync(path.join(dir, file));
    return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
  };
  fonts = {
    bold: load("bricolage-grotesque-latin-800-normal.woff"),
    medium: load("bricolage-grotesque-latin-500-normal.woff"),
  };
  return fonts;
}

/** Buang karakter yang tidak ada di font (mis. emoji) supaya tidak muncul sebagai kotak kosong. */
export function clean(text: string, font: Font): string {
  return [...text]
    .filter((c) => /\s/.test(c) || font.charToGlyphIndex(c) > 0)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tanda kutip lurus menjadi kutip tipografis (“…” dan ’). */
export function smartQuotes(text: string): string {
  return text
    .replace(/(^|[\s(\[])"/g, "$1\u201C")
    .replace(/"/g, "\u201D")
    .replace(/(^|[\s(\[])'/g, "$1\u2018")
    .replace(/'/g, "\u2019");
}

/** Bungkus teks per kata agar tiap baris muat di `maxWidth`; kata yang terlalu panjang dipecah. */
export function wrap(text: string, maxWidth: number, measure: (t: string) => number): string[] {
  const fits = (t: string) => measure(t) <= maxWidth;
  const words = text.split(/\s+/).filter(Boolean).flatMap((w) => {
    if (fits(w)) return [w];
    const parts: string[] = [];
    let cur = "";
    for (const c of w) {
      if (cur && !fits(cur + c)) {
        parts.push(cur);
        cur = c;
      } else cur += c;
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
  // Hindari satu kata yatim di baris terakhir: turunkan satu kata dari baris sebelumnya jika muat.
  const n = lines.length;
  if (n > 1 && !lines[n - 1].includes(" ")) {
    const prev = lines[n - 2].split(" ");
    const moved = `${prev[prev.length - 1]} ${lines[n - 1]}`;
    if (prev.length > 2 && fits(moved)) {
      lines[n - 2] = prev.slice(0, -1).join(" ");
      lines[n - 1] = moved;
    }
  }
  return lines;
}

type TextStyle = { font: Font; leading: number };
export type Fitted = { size: number; lines: string[]; height: number };

/** Ukuran terbesar (antara max dan min) yang membuat teks muat di kotak `width` × `height`. */
export function fit(text: string, style: TextStyle, width: number, height: number, max: number, min: number): Fitted {
  for (let size = max; ; size -= 2) {
    const lines = wrap(text, width, (t) => style.font.getAdvanceWidth(t, size));
    const h = lines.length * size * style.leading;
    if (h <= height || size <= min) return { size, lines, height: h };
  }
}

const textPaths = (f: Fitted, font: Font, x: number, top: number, leading: number, fill: string) =>
  f.lines
    .map((line, i) => {
      // Baseline: atas kotak baris + ascender, ditambah setengah sisa leading.
      const baseline = top + i * f.size * leading + (f.size * (leading - 1)) / 2 + (font.ascender / font.unitsPerEm) * f.size;
      return `<path fill="${fill}" d="${font.getPath(line, x, baseline, f.size).toPathData(1)}"/>`;
    })
    .join("");

export type SlideKind =
  | { kind: "cover"; text: string }
  | { kind: "point"; n: string; title: string; body: string }
  | { kind: "plain"; text: string }
  | { kind: "closing"; text: string };

/** Peran slide dari posisinya; slide tengah "N. Judul. Penjelasan" menjadi slide poin. */
export function slideKind(text: string, index: number, total: number): SlideKind {
  if (index === 0) return { kind: "cover", text };
  if (index === total - 1) return { kind: "closing", text };
  const m = text.match(/^(\d{1,2})\.\s+([^.!?]+[.!?]?)\s+(.+)$/s);
  if (m) return { kind: "point", n: m[1], title: m[2].replace(/\.$/, ""), body: m[3] };
  return { kind: "plain", text };
}

export async function renderSlide(raw: string, index: number, total: number, brand: string): Promise<Buffer> {
  const { bold, medium } = loadFonts();
  const s = slideKind(smartQuotes(clean(raw, bold)), index, total);
  const width = W - 2 * MARGIN;
  const dark = s.kind === "cover" || s.kind === "closing";
  const bg = dark ? COLORS.cobalt : COLORS.pink;
  const fg = dark ? COLORS.white : COLORS.ink;
  const parts: string[] = [];

  if (s.kind === "cover") {
    const head = fit(s.text, { font: bold, leading: 1.02 }, width, 760, 132, 64);
    parts.push(textPaths(head, bold, MARGIN, 230, 1.02, fg));
    // Penanda swipe: lingkaran merah muda dengan panah.
    parts.push(
      `<circle cx="${W - MARGIN - 56}" cy="${H - MARGIN - 56}" r="56" fill="${COLORS.pink}"/>`,
      `<path d="M${W - MARGIN - 80} ${H - MARGIN - 56}h46m-18-20l20 20-20 20" fill="none" stroke="${COLORS.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  } else if (s.kind === "point") {
    // Angka raksasa terpotong di kanan bawah; teks di atasnya dan tidak pernah menabrak angka.
    const numSize = 980;
    // Posisikan dari bentuk glyph (bukan lebar advance) supaya tiap angka terpotong sama di tepi kanan.
    const probe = bold.getPath(s.n, 0, 0, numSize).getBoundingBox();
    const num = bold.getPath(s.n, W + 90 - probe.x2, H + 110, numSize);
    const numTop = num.getBoundingBox().y1;
    parts.push(`<path fill="${COLORS.cobalt}" d="${num.toPathData(1)}"/>`);
    const titleTop = 170;
    const title = fit(s.title, { font: bold, leading: 1.04 }, width, 260, 96, 56);
    const bodyTop = titleTop + title.height + 40;
    const body = fit(s.body, { font: medium, leading: 1.38 }, 840, numTop - 48 - bodyTop, 56, 34);
    parts.push(textPaths(title, bold, MARGIN, titleTop, 1.04, COLORS.ink), textPaths(body, medium, MARGIN, bodyTop, 1.38, COLORS.ink));
  } else {
    const t = fit(s.text, { font: bold, leading: 1.08 }, width, 700, s.kind === "closing" ? 96 : 84, 48);
    const top = s.kind === "closing" ? 360 : (H - t.height) / 2 - 60;
    if (s.kind === "closing") {
      // Ikon bookmark: ajakan "simpan".
      parts.push(`<path d="M${MARGIN} 200h64v92l-32-24-32 24z" fill="${COLORS.pink}"/>`);
    }
    parts.push(textPaths(t, bold, MARGIN, top, 1.08, fg));
  }

  // Kaki: nama brand kiri bawah, nomor halaman kanan atas (kecuali cover yang punya panah).
  const small = 32;
  const footFill = dark ? COLORS.pink : COLORS.cobalt;
  if (brand) parts.push(`<path fill="${footFill}" d="${medium.getPath(clean(brand, medium), MARGIN, H - MARGIN + 8 - (s.kind === "cover" ? 40 : 0), small).toPathData(1)}"/>`);
  if (s.kind !== "cover" && total > 1) {
    const label = `${index + 1}/${total}`;
    parts.push(`<path fill="${footFill}" d="${medium.getPath(label, W - MARGIN - medium.getAdvanceWidth(label, small), MARGIN + 24, small).toPathData(1)}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${parts.join("")}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
