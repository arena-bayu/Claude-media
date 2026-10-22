// Render contoh carousel ke PNG memakai renderer yang sama dengan app.
// Pakai: node --experimental-strip-types scripts/render-example.ts examples/instagram-carousel [Nama Brand]
import fs from "node:fs";
import path from "node:path";
import { renderSlide } from "../lib/slide.ts";

const dir = process.argv[2] ?? "examples/instagram-carousel";
const brand = process.argv[3] ?? "Media Kita";
const post = JSON.parse(fs.readFileSync(path.join(dir, "post.json"), "utf8")) as { slides: string[] };

for (const [i, text] of post.slides.entries()) {
  const file = path.join(dir, `slide-${i + 1}.png`);
  fs.writeFileSync(file, await renderSlide(text, i, post.slides.length, brand));
  console.log(file);
}
