// Utilitas tanggal di sisi browser, selalu di zona waktu media (bukan zona browser).

export function dayKeyIn(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Tanggal (UTC tengah hari) untuk kunci "YYYY-MM-DD", aman untuk aritmetika hari. */
export const fromKey = (key: string) => new Date(`${key}T12:00:00Z`);

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Senin pada minggu yang memuat `key`. */
export function weekStart(key: string): string {
  const dow = (fromKey(key).getUTCDay() + 6) % 7;
  return addDays(key, -dow);
}

export const fmtDateTime = (iso: string, tz: string) =>
  new Date(iso).toLocaleString("id-ID", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
