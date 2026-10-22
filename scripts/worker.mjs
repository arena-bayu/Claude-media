// Worker 24 jam: tiap menit publish yang jatuh tempo, tiap 6 jam jalankan putaran kantor.
// Pakai: BASE_URL=http://localhost:3000 NICHE="..." node scripts/worker.mjs
const base = process.env.BASE_URL ?? "http://localhost:3000";
const headers = process.env.CRON_SECRET ? { authorization: `Bearer ${process.env.CRON_SECRET}` } : {};
const call = async (path, init) => {
  try { console.log(new Date().toISOString(), path, await (await fetch(base + path, { headers, ...init })).text()); }
  catch (e) { console.error(path, e.message); }
};
setInterval(() => call("/api/cron/publish"), 60_000);
const round = () => call("/api/office", { method: "POST", body: JSON.stringify({ niche: process.env.NICHE ?? "Umum", count: 3 }) });
setInterval(round, 6 * 3600_000);
round();
