import { NextResponse } from "next/server";
import { publish } from "@/lib/publisher";
import { log, readPosts, writePosts } from "@/lib/store";

export const dynamic = "force-dynamic";

// Dipanggil worker tiap menit (Ardi). Hanya memublikasikan post berstatus "scheduled".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const posts = readPosts();
  const now = Date.now();
  let count = 0;
  for (const p of posts) {
    if (p.status !== "scheduled" || !p.scheduledAt || Date.parse(p.scheduledAt) > now) continue;
    try {
      const how = await publish(p);
      p.status = "published";
      p.publishedAt = new Date().toISOString();
      log("ardi", `Terbit (${how}): ${p.topic}`);
      count++;
    } catch (e) {
      log("ardi", `Gagal publish ${p.topic}: ${(e as Error).message}`);
    }
  }
  writePosts(posts);
  return NextResponse.json({ published: count });
}
