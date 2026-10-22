import { describe, expect, it } from "vitest";
import { formatProblems, keepKnownSources } from "@/lib/claude";
import { renderSlide, wrap } from "@/lib/slide";

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
    for (const line of wrap("https://contoh.com/" + "x".repeat(80) + " kata biasa", 20)) expect(line.length).toBeLessThanOrEqual(20);
  });

  it("merender PNG 1080x1350", async () => {
    const png = await renderSlide("Hook <dengan> karakter & khusus", 0, 5, "Brand");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1350);
  });
});
