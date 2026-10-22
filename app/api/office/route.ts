import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { draftPost, planTopics } from "@/lib/llm";
import { log, readPosts, writePosts } from "@/lib/store";
import type { Platform, Post } from "@/lib/types";

export const dynamic = "force-dynamic";

const SLOT_HOURS = [7, 12, 19]; // jam tayang per hari (waktu server)

// Ardi: jadwalkan post yang SUDAH approved manusia ke slot kosong berikutnya.
function autoSchedule(posts: Post[]): number {
  const taken = new Set(posts.filter((p) => p.scheduledAt).map((p) => p.scheduledAt));
  let n = 0;
  for (const p of posts.filter((p) => p.status === "approved")) {
    for (let day = 0; day < 14 && p.status === "approved"; day++) {
      for (const h of SLOT_HOURS) {
        const d = new Date();
        d.setDate(d.getDate() + day);
        d.setHours(h, 0, 0, 0);
        const iso = d.toISOString();
        if (d.getTime() > Date.now() && !taken.has(iso)) {
          p.status = "scheduled";
          p.scheduledAt = iso;
          taken.add(iso);
          n++;
          break;
        }
      }
    }
  }
  return n;
}

// Satu putaran kantor: Lucy rencanakan topik -> Nico tulis draft (status review) -> Ardi jadwalkan yang approved.
// Body opsional: { niche, count, platform }. count=0 berarti hanya putaran Ardi.
export async function POST(req: Request) {
  const { niche = "Umum", count = 3, platform = "threads" } = (await req.json().catch(() => ({}))) as {
    niche?: string; count?: number; platform?: Platform;
  };
  const posts = readPosts();

  if (count > 0) {
    const topics = await planTopics(niche, count);
    log("lucy", `Tema "${niche}": ${topics.join(" | ")}`);
    for (const topic of topics) {
      const d = await draftPost(topic, platform);
      posts.push({
        id: randomUUID(), platform, format: d.slides?.length ? "carousel" : "text", topic,
        caption: d.caption, slides: d.slides, sources: d.sources ?? [], factCheckNotes: d.factCheckNotes ?? "",
        status: "review", createdBy: "nico", createdAt: new Date().toISOString(),
      });
      log("nico", `Draft masuk review: ${topic}`);
    }
  }

  const scheduled = autoSchedule(posts);
  const waiting = posts.filter((p) => p.status === "review").length;
  log("ardi", `${scheduled} post dijadwalkan; ${waiting} menunggu review manusia`);
  writePosts(posts);
  return NextResponse.json({ scheduled, waiting });
}
