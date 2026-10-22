import { NextResponse } from "next/server";
import { readPosts, writePosts } from "@/lib/store";

type Action = { action: "approve" | "reject" | "schedule"; by?: string; scheduledAt?: string };

// Hanya manusia (lewat endpoint ini) yang bisa memindah status melewati "review".
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Action;
  const posts = readPosts();
  const post = posts.find((p) => p.id === params.id);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body.action === "reject") post.status = "rejected";
  else if (body.action === "approve") {
    if (post.status !== "review") return NextResponse.json({ error: "bukan di review" }, { status: 409 });
    post.status = "approved";
    post.approvedBy = body.by ?? "human";
  } else if (body.action === "schedule") {
    if (post.status !== "approved") return NextResponse.json({ error: "belum approved" }, { status: 409 });
    if (!body.scheduledAt) return NextResponse.json({ error: "scheduledAt wajib" }, { status: 400 });
    post.status = "scheduled";
    post.scheduledAt = body.scheduledAt;
  }
  writePosts(posts);
  return NextResponse.json(post);
}
