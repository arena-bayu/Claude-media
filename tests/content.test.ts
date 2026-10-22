import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { formatProblems, keepKnownSources } from "@/lib/claude";
import { H, MARGIN, renderSlide, slideKind, smartQuotes, W, wrap } from "@/lib/slide";

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

  it("carousel Instagram 2–5 slide, tiap slide tidak terlalu panjang", () => {
    expect(formatProblems("instagram", { caption: "x", slides: ["a"] })).toHaveLength(1);
    expect(formatProblems("instagram", { caption: "x", slides: Array(6).fill("a") })).toHaveLength(1);
    expect(formatProblems("instagram", { caption: "x", slides: Array(5).fill("a") })).toEqual([]);
    expect(formatProblems("instagram", { caption: "x", slides: ["a", "b".repeat(300)] })).toHaveLength(1);
  });
});

describe("tata letak teks", () => {
  const mono = (t: string) => t.length * 10; // tiap karakter 10 px

  it("memecah kata yang terlalu panjang", () => {
    const lines = wrap("https://contoh.com/" + "x".repeat(80) + " kata biasa", 200, mono);
    expect(lines.length).toBeGreaterThan(2);
    for (const line of lines) expect(mono(line)).toBeLessThanOrEqual(200);
  });

  it("tidak menyisakan satu kata yatim di baris terakhir", () => {
    const lines = wrap("satu dua tiga empat lima enam", 200, mono);
    expect(lines.at(-1)!.split(" ").length).toBeGreaterThan(1);
  });

  it("mengubah kutip lurus menjadi kutip tipografis", () => {
    expect(smartQuotes(`kata "Buat email" dan Jum'at`)).toBe("kata “Buat email” dan Jum’at");
  });

  it("menentukan peran slide dari posisi dan format", () => {
    expect(slideKind("Hook", 0, 5).kind).toBe("cover");
    expect(slideKind("Simpan ya", 4, 5).kind).toBe("closing");
    expect(slideKind("2. Tunjukkan contoh. Tempel satu contoh.", 2, 5)).toEqual({ kind: "point", n: "2", title: "Tunjukkan contoh", body: "Tempel satu contoh." });
    expect(slideKind("Tanpa nomor", 2, 5).kind).toBe("plain");
  });
});

/** Batas piksel yang cocok dengan `match` di dalam area tertentu. */
async function bounds(png: Buffer, match: (r: number, g: number, b: number) => boolean, area = { x0: 0, x1: W, y0: 0, y1: H }) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const out = { minX: W, maxX: -1, minY: H, maxY: -1 };
  for (let y = area.y0; y < area.y1; y++)
    for (let x = area.x0; x < area.x1; x++) {
      const o = (y * W + x) * info.channels;
      if (match(data[o], data[o + 1], data[o + 2])) {
        out.minX = Math.min(out.minX, x); out.maxX = Math.max(out.maxX, x);
        out.minY = Math.min(out.minY, y); out.maxY = Math.max(out.maxY, y);
      }
    }
  return out;
}

const isWhite = (r: number, g: number, b: number) => r > 200 && g > 200 && b > 200;
const isInk = (r: number, g: number, b: number) => r < 60 && g < 60 && b < 120; // #0D1640
const isCobalt = (r: number, g: number, b: number) => b > 170 && r < 80; // #2338D4

describe("render slide", () => {
  it("teks cover tetap di dalam margin, termasuk huruf terlebar", async () => {
    for (const text of ["Hasil AI sering meleset? Coba 3 kebiasaan ini", "WWWWWWWW MMMMMMMM WWWWWWWW MMMMMMMM WWWWWWWW"]) {
      const b = await bounds(await renderSlide(text, 0, 5, ""), isWhite);
      expect(b.minX, text).toBeGreaterThanOrEqual(MARGIN - 4);
      expect(b.maxX, text).toBeLessThanOrEqual(W - MARGIN + 4);
    }
  });

  it("teks slide poin tidak menabrak angka besar, walau penjelasannya panjang", async () => {
    const long = "3. Cek klaim penting. " + "Angka, tanggal, dan aturan selalu cocokkan ke sumber aslinya sebelum dipakai. ".repeat(3);
    const png = await renderSlide(long, 3, 5, "");
    const text = await bounds(png, isInk);
    const num = await bounds(png, isCobalt, { x0: W / 2, x1: W, y0: 200, y1: H }); // di bawah label halaman
    expect(text.maxX).toBeLessThanOrEqual(W - MARGIN + 4);
    expect(text.maxY).toBeLessThan(num.minY);
  });

  it("menghasilkan PNG 1080x1350 dan aman untuk karakter khusus & emoji", async () => {
    const png = await renderSlide("Hook <dengan> karakter & khusus 👇", 0, 5, "Brand");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1350);
  });
});

describe("pilar konten", () => {
  it("menghitung jumlah post per pilar untuk dibagi rata", async () => {
    const { pillarBalance } = await import("@/lib/claude");
    const recent = [
      { title: "a", pillar: "Trivia sejarah" },
      { title: "b", pillar: "Trivia sejarah" },
      { title: "c", pillar: "Trivia film" },
    ];
    expect(pillarBalance(["Trivia sejarah", "Trivia film", "Kejadian unik"], recent)).toBe(
      "Trivia sejarah: 2 post; Trivia film: 1 post; Kejadian unik: 0 post",
    );
  });

  it("mode demo menggilir pilar", async () => {
    const { planTopics } = await import("@/lib/claude");
    const { DEFAULT_SETTINGS } = await import("@/lib/db");
    const topics = await planTopics({ ...DEFAULT_SETTINGS, postsPerRun: 3 }, []);
    expect(topics.map((t) => t.pillar)).toEqual(["Trivia sejarah", "Trivia film", "Kejadian unik"]);
  });
});
