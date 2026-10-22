import { getSettings, log, postsWithStatus } from "./db";
import { publishDue, scheduleApproved, startOfficeRun } from "./office";

const g = globalThis as unknown as { __scheduler?: boolean };

const OFFICE_EVERY_H = Number(process.env.OFFICE_INTERVAL_HOURS ?? 6);

/**
 * Tiap menit: Ardi menjadwalkan yang sudah di-approve dan mempublikasikan yang jatuh tempo.
 * Tiap OFFICE_INTERVAL_HOURS: putaran kantor baru, tapi hanya jika antrean review belum menumpuk
 * (agen tidak boleh terus memproduksi kalau tim manusia belum sempat review).
 */
export function startScheduler() {
  if (g.__scheduler) return;
  g.__scheduler = true;

  let lastOffice = Date.now();
  let ticking = false;
  const tick = async () => {
    if (ticking) return;
    ticking = true;
    try {
      scheduleApproved();
      await publishDue();
      if (OFFICE_EVERY_H > 0 && Date.now() - lastOffice >= OFFICE_EVERY_H * 3600_000) {
        lastOffice = Date.now();
        const backlog = postsWithStatus("review").length;
        const limit = getSettings().postsPerRun * 2;
        if (backlog < limit) startOfficeRun("jadwal otomatis");
        else log("lucy", `Putaran otomatis dilewati: ${backlog} draft masih menunggu review`);
      }
    } catch (e) {
      console.error("[scheduler]", e);
    } finally {
      ticking = false;
    }
  };
  setInterval(tick, 60_000);
  console.log(`[scheduler] aktif — publish tiap menit, putaran kantor tiap ${OFFICE_EVERY_H} jam`);
}
