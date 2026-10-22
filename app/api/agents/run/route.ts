import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { draftPost } from "@/lib/llm";
import { readPosts, writePosts } from "@/lib/store";
import type { Platform, Post } from "@/lib/types";

// Nico membuat draft; status langsung "review" (tidak pernah otomatis approved).
export async function POST(req: Request) {
  const { topic, platform = "threads" } = (await req.json()) as { topic: string; platform?: Platform };
  if (!topic) return NextResponse.json({ error: "topic wajib" }, { status: 400 });
  const d = await draftPost(topic, platform);
  const post: Post = {
    id: randomUUID(),
    platform,
    format: d.slides?.length ? "carousel" : "text",
    topic,
    caption: d.caption,
    slides: d.slides,
    sources: d.sources ?? [],
    factCheckNotes: d.factCheckNotes ?? "",
    status: "review",
    createdBy: "nico",
    createdAt: new Date().toISOString(),
  };
  const posts = readPosts();
  posts.push(post);
  writePosts(posts);
  return NextResponse.json(post);
}
