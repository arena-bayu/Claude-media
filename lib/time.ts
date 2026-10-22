// Semua jadwal dihitung di zona waktu media (default Asia/Jakarta), bukan zona server.
export const TIMEZONE = process.env.TIMEZONE ?? "Asia/Jakarta";

type Parts = { year: number; month: number; day: number; hour: number; minute: number };

export function zonedParts(date: Date, tz = TIMEZONE): Parts {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, Number(x.value)]));
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute };
}

/** Instant UTC untuk jam dinding tertentu di zona `tz`. */
export function zonedTime(year: number, month: number, day: number, hour: number, minute: number, tz = TIMEZONE): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const p = zonedParts(new Date(guess), tz);
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - guess;
  return new Date(guess - offset);
}

/** Kunci tanggal lokal "YYYY-MM-DD". */
export function dayKey(date: Date, tz = TIMEZONE): string {
  const p = zonedParts(date, tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Slot tayang berikutnya yang masih kosong, berurutan, mulai setelah `now`.
 * `slots` adalah jam lokal "HH:MM"; `taken` berisi ISO string yang sudah terpakai.
 */
export function nextFreeSlot(now: Date, slots: string[], taken: Set<string>, horizonDays = 30, tz = TIMEZONE): Date | null {
  const times = slots
    .map((s) => s.split(":").map(Number))
    .filter(([h, m]) => h >= 0 && h < 24 && m >= 0 && m < 60)
    .sort((a, b) => a[0] * 60 + a[1] - (b[0] * 60 + b[1]));
  const today = zonedParts(now, tz);
  for (let d = 0; d < horizonDays; d++) {
    // Date.UTC menormalkan tanggal yang melewati akhir bulan.
    const base = new Date(Date.UTC(today.year, today.month - 1, today.day + d));
    for (const [h, m] of times) {
      const t = zonedTime(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), h, m, tz);
      if (t > now && !taken.has(t.toISOString())) return t;
    }
  }
  return null;
}
