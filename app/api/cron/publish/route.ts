import { NextResponse } from "next/server";
import { publish } from "@/lib/publisher";
import { readPosts, writePosts } from "@/lib/store";

export const dynamic = "force-dynamic";

// Dipanggil cron tiap menit (Ardi). Hanya memublikasikan post berstatus "scheduled".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const posts = readPosts();
  const now = Date.now();
  let count = 0;
  for (const p of posts) {
    if (p.status === "scheduled" && p.scheduledAt && Date.parse(p.scheduledAt) <= now) {
      await publish(p);
      p.status = "published";
      p.publishedAt = new Date().toISOString();
      count++;
    }
  }
  writePosts(posts);
  return NextResponse.json({ published: count });
}
