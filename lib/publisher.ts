import type { Post } from "./types";

const THREADS = "https://graph.threads.net/v1.0";
const GRAPH = "https://graph.facebook.com/v21.0";

export type PublishResult = { id: string | null; dryRun: boolean };

async function call(url: string, params: Record<string, string>, method: "GET" | "POST" = "POST") {
  const res = await fetch(`${url}?${new URLSearchParams(params)}`, { method });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${body?.error?.message ?? JSON.stringify(body)}`);
  return body;
}

/** Container media Meta diproses asinkron; tunggu sampai siap dipublikasikan. */
async function waitReady(host: string, id: string, token: string) {
  for (let i = 0; i < 20; i++) {
    const { status } = await call(`${host}/${id}`, { fields: "status", access_token: token }, "GET");
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") throw new Error(`Container media ${status}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Container media tidak siap setelah 60 detik");
}

async function publishThreads(post: Post, token: string, user: string): Promise<PublishResult> {
  const { id } = await call(`${THREADS}/${user}/threads`, { media_type: "TEXT", text: post.caption, access_token: token });
  const pub = await call(`${THREADS}/${user}/threads_publish`, { creation_id: id, access_token: token });
  return { id: pub.id, dryRun: false };
}

async function publishInstagram(post: Post, token: string, user: string, baseUrl: string): Promise<PublishResult> {
  // Instagram mengunduh gambar dari URL publik app ini.
  const urls = post.slides.map((_, i) => `${baseUrl}/api/slides/${post.id}/${i}?v=${encodeURIComponent(post.updatedAt)}`);
  let creation: string;
  if (urls.length === 1) {
    creation = (await call(`${GRAPH}/${user}/media`, { image_url: urls[0], caption: post.caption, access_token: token })).id;
  } else {
    const children: string[] = [];
    for (const image_url of urls) {
      const c = await call(`${GRAPH}/${user}/media`, { image_url, is_carousel_item: "true", access_token: token });
      children.push(c.id);
    }
    for (const c of children) await waitReady(GRAPH, c, token);
    creation = (await call(`${GRAPH}/${user}/media`, { media_type: "CAROUSEL", children: children.join(","), caption: post.caption, access_token: token })).id;
  }
  await waitReady(GRAPH, creation, token);
  const pub = await call(`${GRAPH}/${user}/media_publish`, { creation_id: creation, access_token: token });
  return { id: pub.id, dryRun: false };
}

/** Publikasi sungguhan jika kredensial platform diisi; selain itu dry-run (dicatat, tidak dikirim). */
export async function publish(post: Post): Promise<PublishResult> {
  const env = process.env;
  if (post.platform === "threads") {
    if (!env.THREADS_ACCESS_TOKEN || !env.THREADS_USER_ID) return { id: null, dryRun: true };
    return publishThreads(post, env.THREADS_ACCESS_TOKEN, env.THREADS_USER_ID);
  }
  if (!env.INSTAGRAM_ACCESS_TOKEN || !env.INSTAGRAM_USER_ID || !env.PUBLIC_BASE_URL) return { id: null, dryRun: true };
  return publishInstagram(post, env.INSTAGRAM_ACCESS_TOKEN, env.INSTAGRAM_USER_ID, env.PUBLIC_BASE_URL.replace(/\/$/, ""));
}
