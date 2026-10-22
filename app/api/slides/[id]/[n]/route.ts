import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authDisabled, SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getPost, getSettings } from "@/lib/db";
import { renderSlide } from "@/lib/slide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Publik (lihat proxy.ts) karena Instagram mengunduh gambar dari sini.
// Hanya post yang sudah disetujui/terjadwal/terbit yang bisa diakses tanpa login,
// supaya draft yang belum di-review tidak bocor.
const PUBLIC_STATUSES = new Set(["approved", "scheduled", "publishing", "published"]);

export async function GET(_req: Request, ctx: RouteContext<"/api/slides/[id]/[n]">) {
  const { id, n } = await ctx.params;
  const post = getPost(id);
  const i = Number(n);
  if (!post || !Number.isInteger(i) || i < 0 || i >= post.slides.length)
    return NextResponse.json({ error: "Slide tidak ditemukan" }, { status: 404 });
  if (!PUBLIC_STATUSES.has(post.status) && !authDisabled() && !(await verifySession((await cookies()).get(SESSION_COOKIE)?.value))) return NextResponse.json({ error: "Slide tidak ditemukan" }, { status: 404 });

  const png = await renderSlide(post.slides[i], i, post.slides.length, getSettings().brand);
  return new NextResponse(new Uint8Array(png), {
    headers: { "content-type": "image/png", "cache-control": "private, max-age=60" },
  });
}
