import { demoResearch, hasClaude, planTopics, research, writeDraft, type Research } from "./claude";
import { claimPost, createPost, getPost, getSettings, listPosts, log, postsWithStatus, setAgent, updatePost } from "./db";
import { publish } from "./publisher";
import { nextFreeSlot } from "./time";
import type { Post } from "./types";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

const g = globalThis as unknown as { __officeRunning?: boolean };

/**
 * Satu putaran kantor: Lucy merencanakan topik, Nico meriset & menulis tiap topik
 * (hasilnya masuk antrean review manusia), lalu Ardi menjadwalkan post yang sudah di-approve.
 * Berjalan di background; hanya satu putaran pada satu waktu.
 */
export function startOfficeRun(trigger: string): boolean {
  if (g.__officeRunning) return false;
  g.__officeRunning = true;
  runOffice(trigger)
    .catch((e) => log("lucy", `Putaran kantor gagal: ${errMsg(e)}`))
    .finally(() => {
      g.__officeRunning = false;
      setAgent("lucy", null);
      setAgent("nico", null);
    });
  return true;
}

export const officeRunning = () => Boolean(g.__officeRunning);

async function runOffice(trigger: string) {
  const s = getSettings();
  log("lucy", `Putaran kantor dimulai (${trigger})${hasClaude() ? "" : " — MODE DEMO tanpa Claude API"}`);

  setAgent("lucy", "Menyusun rencana konten");
  const recent = listPosts().slice(0, 40).map((p) => p.title);
  const topics = await planTopics(s, recent);
  setAgent("lucy", null);
  log("lucy", `Rencana: ${topics.map((t) => `${t.title} (${t.platform})`).join(" | ") || "tidak ada topik"}`);

  for (const t of topics) {
    const post = createPost({ platform: t.platform, title: t.title, angle: t.angle, createdBy: "nico" });
    await draftPost(post);
  }
  scheduleApproved();
}

async function draftPost(post: Post) {
  try {
    setAgent("nico", `Meriset: ${post.title}`);
    const r = hasClaude() ? await research(post.title, post.angle, getSettings()) : demoResearch();
    setAgent("nico", `Menulis: ${post.title}`);
    const d = await writeDraft(post, r, getSettings());
    updatePost(post.id, { ...d, ...researchFields(r), status: "review", error: null });
    log("nico", `Draft masuk review: ${post.title} (${post.platform})`);
  } catch (e) {
    updatePost(post.id, { status: "failed", error: errMsg(e) });
    log("nico", `Gagal menulis "${post.title}": ${errMsg(e)}`);
  } finally {
    setAgent("nico", null);
  }
}

const researchFields = (r: Research) => ({ researchNotes: r.notes, researchUrls: [...r.urls] });

/** Revisi berdasarkan catatan reviewer, memakai catatan riset yang sama. */
export function startRevision(id: string, feedback: string, by: string) {
  const before = getPost(id)!;
  updatePost(id, { status: "revising", reviewNote: feedback, reviewedBy: by });
  log(by, `Minta revisi "${before.title}": ${feedback}`);
  (async () => {
    try {
      setAgent("nico", `Merevisi: ${before.title}`);
      const r: Research = { notes: before.researchNotes, urls: new Set(before.researchUrls) };
      const d = await writeDraft(before, r, getSettings(), { previous: before, feedback });
      updatePost(id, { ...d, status: "review", revision: before.revision + 1, error: null });
      log("nico", `Revisi #${before.revision + 1} masuk review: ${before.title}`);
    } catch (e) {
      // Draft lama tetap valid; kembalikan ke review dengan pesan error.
      updatePost(id, { status: "review", error: `Revisi gagal: ${errMsg(e)}` });
      log("nico", `Revisi "${before.title}" gagal: ${errMsg(e)}`);
    } finally {
      setAgent("nico", null);
    }
  })();
}

/** Coba ulang post gagal: tulis ulang jika belum ada draft, atau kembalikan ke antrean jadwal jika gagal publish. */
export function retryPost(post: Post, by: string) {
  if (!post.caption) {
    updatePost(post.id, { status: "drafting", error: null });
    log(by, `Minta Nico menulis ulang: ${post.title}`);
    void draftPost(getPost(post.id)!);
  } else {
    updatePost(post.id, { status: "approved", scheduledAt: null, error: null });
    log(by, `Publikasi diulang: ${post.title}`);
    scheduleApproved();
  }
}

/** Ardi: tempatkan post yang sudah di-approve manusia ke slot kosong berikutnya, per platform. */
export function scheduleApproved(now = new Date()): number {
  const s = getSettings();
  const all = listPosts();
  let count = 0;
  for (const p of postsWithStatus("approved")) {
    const taken = new Set(
      all.filter((x) => x.platform === p.platform && x.scheduledAt && x.status !== "rejected").map((x) => x.scheduledAt!),
    );
    const slot = nextFreeSlot(now, s.slots, taken);
    if (!slot) {
      log("ardi", `Tidak ada slot kosong 30 hari ke depan untuk "${p.title}"`);
      continue;
    }
    if (!claimPost(p.id, "approved", "scheduled")) continue;
    const updated = updatePost(p.id, { scheduledAt: slot.toISOString() });
    all.splice(all.findIndex((x) => x.id === p.id), 1, updated);
    count++;
    log("ardi", `Menjadwalkan "${p.title}" (${p.platform}) pada ${slot.toLocaleString("id-ID", { timeZone: process.env.TIMEZONE ?? "Asia/Jakarta" })}`);
  }
  return count;
}

/** Ardi: publikasikan post terjadwal yang sudah jatuh tempo. */
export async function publishDue(now = new Date()): Promise<number> {
  let count = 0;
  for (const p of postsWithStatus("scheduled")) {
    if (!p.scheduledAt || new Date(p.scheduledAt) > now) continue;
    if (!claimPost(p.id, "scheduled", "publishing")) continue; // sudah diambil proses lain
    setAgent("ardi", `Mempublikasikan: ${p.title}`);
    try {
      const result = await publish(p);
      updatePost(p.id, { status: "published", publishedAt: new Date().toISOString(), externalId: result.id, error: null });
      log("ardi", `Terbit di ${p.platform}${result.dryRun ? " (dry-run, kredensial belum diisi)" : ""}: ${p.title}`);
      count++;
    } catch (e) {
      updatePost(p.id, { status: "failed", error: errMsg(e) });
      log("ardi", `Gagal publish "${p.title}": ${errMsg(e)}`);
    } finally {
      setAgent("ardi", null);
    }
  }
  return count;
}
