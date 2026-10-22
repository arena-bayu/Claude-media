import { describe, expect, it } from "vitest";
import { dayKey, nextFreeSlot, zonedTime } from "@/lib/time";

const TZ = "Asia/Jakarta"; // UTC+7, tanpa DST

describe("zonedTime", () => {
  it("mengubah jam dinding Jakarta ke UTC", () => {
    expect(zonedTime(2026, 10, 22, 7, 0, TZ).toISOString()).toBe("2026-10-22T00:00:00.000Z");
    expect(zonedTime(2026, 10, 22, 3, 30, TZ).toISOString()).toBe("2026-10-21T20:30:00.000Z");
  });

  it("menangani zona dengan DST", () => {
    // New York: EDT (UTC-4) pada Juli, EST (UTC-5) pada Desember
    expect(zonedTime(2026, 7, 1, 9, 0, "America/New_York").toISOString()).toBe("2026-07-01T13:00:00.000Z");
    expect(zonedTime(2026, 12, 1, 9, 0, "America/New_York").toISOString()).toBe("2026-12-01T14:00:00.000Z");
  });
});

describe("dayKey", () => {
  it("memakai tanggal lokal, bukan UTC", () => {
    // 20:00 UTC tanggal 21 = 03:00 WIB tanggal 22
    expect(dayKey(new Date("2026-10-21T20:00:00Z"), TZ)).toBe("2026-10-22");
  });
});

describe("nextFreeSlot", () => {
  const slots = ["19:00", "07:00", "12:00"]; // urutan acak sengaja
  const now = new Date("2026-10-22T02:00:00Z"); // 09:00 WIB

  it("memilih slot berikutnya hari ini", () => {
    expect(nextFreeSlot(now, slots, new Set(), 30, TZ)?.toISOString()).toBe("2026-10-22T05:00:00.000Z"); // 12:00 WIB
  });

  it("melewati slot yang sudah terpakai", () => {
    const taken = new Set(["2026-10-22T05:00:00.000Z", "2026-10-22T12:00:00.000Z"]);
    expect(nextFreeSlot(now, slots, taken, 30, TZ)?.toISOString()).toBe("2026-10-23T00:00:00.000Z"); // besok 07:00 WIB
  });

  it("melewati akhir bulan dengan benar", () => {
    const late = new Date("2026-10-31T13:00:00Z"); // 20:00 WIB, 31 Okt
    expect(nextFreeSlot(late, slots, new Set(), 30, TZ)?.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("mengabaikan format jam yang tidak valid dan mengembalikan null jika penuh", () => {
    expect(nextFreeSlot(now, ["25:00", "abc"], new Set(), 30, TZ)).toBeNull();
  });
});
