// Demo pipeline edit foto otomatis: crop fokus -> grayscale kontras -> duotone earth tone -> titik halftone.
// Pakai: node foto-pipeline.cjs <input> <output.png> [ukuran]
const sharp = require("sharp");

const INK = [0x3b, 0x2a, 0x20]; // cokelat tua
const PAPER = [0xf3, 0xe9, 0xd6]; // krem

async function main() {
  const [input, output, sizeArg] = process.argv.slice(2);
  const size = Number(sizeArg ?? 720);

  // 1-2. Crop ke area paling "menarik" (sharp attention: wajah/kontras tinggi), lalu grayscale kontras.
  const gray = await sharp(input)
    .resize(size, size, { fit: "cover", position: sharp.strategy.attention })
    .grayscale()
    .normalise()
    .linear(1.15, -12)
    .raw()
    .toBuffer();

  // 3. Duotone: petakan kecerahan ke gradasi tinta -> kertas, sedikit diangkat agar titik halftone terbaca.
  const duo = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    const t = Math.min(1, Math.pow(gray[i] / 255, 0.8) * 0.72 + 0.3);
    for (let c = 0; c < 3; c++) duo[i * 3 + c] = Math.round(INK[c] + (PAPER[c] - INK[c]) * t);
  }

  // 4. Halftone: satu titik per sel, jari-jari sebanding dengan gelapnya sel.
  const cell = 6;
  const dots = [];
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      let sum = 0, n = 0;
      for (let yy = y; yy < Math.min(y + cell, size); yy++)
        for (let xx = x; xx < Math.min(x + cell, size); xx++) { sum += gray[yy * size + xx]; n++; }
      const dark = 1 - sum / n / 255;
      const r = (cell / 2) * 1.15 * Math.sqrt(dark);
      if (r > 0.6) dots.push(`<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${r.toFixed(2)}"/>`);
    }
  }
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><g fill="rgb(${INK.join(",")})" fill-opacity=".38">${dots.join("")}</g></svg>`);

  await sharp(duo, { raw: { width: size, height: size, channels: 3 } })
    .composite([{ input: svg, blend: "multiply" }])
    .png()
    .toFile(output);
  console.log("ok", output, dots.length, "titik");
}
main();
