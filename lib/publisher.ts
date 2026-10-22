import type { Post } from "./types";

// Stub: ganti dengan Threads API / Instagram Graph API (token via env).
export async function publish(post: Post): Promise<void> {
  console.log(`[publish:${post.platform}] ${post.id} — ${post.caption.slice(0, 60)}`);
}
