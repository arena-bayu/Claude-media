import { describe, expect, it } from "vitest";
import { formatProblems, keepKnownSources } from "@/lib/claude";
import sharp from "sharp";
import { blocksFor, H, PAD, renderSlide, textWidth, W, wrap } from "@/lib/slide";

describe("keepKnownSources", () => {
  it("membuang URL yang tidak ditemukan saat riset", () => {
    const known = new Set(["https://bps.go.id/data/", "https://kompas.com/a"]);
    expect(keepKnownSources(["https://bps.go.id/data", "https://karangan.example/x", "https://kompas.com/a"], known)).toEqual([
      "https://bps.go.id/data",
      "https://kompas.com/a",
    ]);
  });
});

describe("formatProblems", () => {
  it("menolak Threads lebih dari 500 karakter", () => {
    expect(formatProblems("threads", { caption: "a".repeat(501), slides: [] })).toHaveLength(1);
    expect(formatProblems("threads", { caption: "halo", slides: [] })).toEqual([]);
  });

  it("carousel Instagram butuh 2–10 slide", () => {
    expect(formatProblems("instagram", { caption: "x", slides: ["a"] })).toHaveLength(1);
    expect(formatProblems("instagram", { caption: "x", slides: Array(11).fill("a") })).toHaveLength(1);
    expect(formatProblems("instagram", { caption: "x", slides: ["a", "b"] })).toEqual([]);
  });
});

describe("slide", () => {
  it("memecah kata yang terlalu panjang", () => {
    const lines = wrap("https://contoh.com/" + "x".repeat(80) + " kata biasa", 400, 40, 400);
    expect(lines.length).toBeGreaterThan(2);
    for (const line of lines) expect(textWidth(line, 40, 400)).toBeLessThanOrEqual(400);
  });

  it("teks tidak keluar dari margin kiri/kanan", async () => {
    const samples = [
      "Hasil AI sering meleset? Coba 5 kebiasaan ini",
      '1. Kasih konteks. Sebutkan untuk siapa hasilnya dan apa tujuannya. "Buat email" kalah jauh dari "Buat email follow-up ke klien yang belum bayar invoice, nadanya sopan tapi tegas."',
      "Simpan postingan ini buat dicoba besok di kantor. Kirim ke teman satu tim yang sering pakai AI.",
      "WWWWWWWW MMMMMMMM WWWWWWWW MMMMMMMM WWWWWWWW MMMMMMMM", // huruf terlebar
    ];
    for (const [i, text] of samples.entries()) {
      const png = await renderSlide(text, i === 0 ? 0 : 1, 7, "");
      // threshold: hanya teks terang (bukan aksen/latar)
      const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      let minX = W, maxX = 0;
      // Area teks saja (di atas footer brand/progress).
      for (let y = 0; y < H - 160; y++)
        for (let x = 0; x < W; x++) {
          const o = (y * W + x) * info.channels;
          if (data[o] > 180 && data[o + 1] > 180) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
        }
      expect(minX, text).toBeGreaterThanOrEqual(PAD - 8);
      expect(maxX, text).toBeLessThanOrEqual(W - PAD + 8);
    }
  });

  it("slide bernomor dipecah jadi judul + isi", () => {
    expect(blocksFor("2. Tunjukkan contoh. Tempel satu contoh.", false).map((b) => b.text)).toEqual(["2. Tunjukkan contoh.", "Tempel satu contoh."]);
    expect(blocksFor("Tanpa nomor di sini", false)).toHaveLength(1);
  });

  it("merender PNG 1080x1350", async () => {
    const png = await renderSlide("Hook <dengan> karakter & khusus", 0, 5, "Brand");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1350);
  });
});
