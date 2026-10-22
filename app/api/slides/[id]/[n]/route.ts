import { NextResponse } from "next/server";
import { renderSlide, slideTexts } from "@/lib/slide";
import { readPosts } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gambar slide dipakai dashboard (preview) dan Instagram (image_url publik).
export async function GET(_: Request, { params }: { params: { id: string; n: string } }) {
  const post = readPosts().find((p) => p.id === params.id);
  const texts = post && slideTexts(post);
  const i = Number(params.n.replace(/\.png$/, ""));
  if (!texts || !(i >= 0 && i < texts.length)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const png = await renderSlide(texts[i], i, texts.length);
  return new NextResponse(new Uint8Array(png), { headers: { "content-type": "image/png", "cache-control": "public, max-age=300" } });
}
