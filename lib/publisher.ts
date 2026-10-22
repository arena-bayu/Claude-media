import type { Post } from "./types";

const API = "https://graph.threads.net/v1.0";

// Threads (teks) sungguhan jika THREADS_ACCESS_TOKEN & THREADS_USER_ID diisi; selain itu dry-run.
// Instagram butuh media publik (carousel) — masih dry-run.
export async function publish(post: Post): Promise<string> {
  const token = process.env.THREADS_ACCESS_TOKEN;
  const user = process.env.THREADS_USER_ID;
  if (post.platform !== "threads" || !token || !user) return `dry-run ${post.platform}`;

  const create = await fetch(`${API}/${user}/threads?${new URLSearchParams({ media_type: "TEXT", text: post.caption, access_token: token })}`, { method: "POST" });
  if (!create.ok) throw new Error(`Threads create ${create.status}: ${await create.text()}`);
  const { id } = await create.json();

  const pub = await fetch(`${API}/${user}/threads_publish?${new URLSearchParams({ creation_id: id, access_token: token })}`, { method: "POST" });
  if (!pub.ok) throw new Error(`Threads publish ${pub.status}: ${await pub.text()}`);
  return `threads ${(await pub.json()).id}`;
}
