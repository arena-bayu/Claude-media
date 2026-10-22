import { slideTexts } from "./slide";
import type { Post } from "./types";

const THREADS = "https://graph.threads.net/v1.0";
const GRAPH = "https://graph.facebook.com/v21.0";

async function call(url: string, params: Record<string, string>, method = "POST") {
  const res = await fetch(`${url}?${new URLSearchParams(params)}`, { method });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function publishThreads(post: Post, token: string, user: string) {
  const { id } = await call(`${THREADS}/${user}/threads`, { media_type: "TEXT", text: post.caption, access_token: token });
  const pub = await call(`${THREADS}/${user}/threads_publish`, { creation_id: id, access_token: token });
  return `threads ${pub.id}`;
}

// Tunggu container siap (Instagram memproses gambar secara asinkron).
async function waitReady(id: string, token: string) {
  for (let i = 0; i < 10; i++) {
    const { status_code } = await call(`${GRAPH}/${id}`, { fields: "status_code", access_token: token }, "GET");
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`container ${status_code}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("container timeout");
}

// Instagram: gambar slide dilayani dari PUBLIC_BASE_URL (harus bisa diakses internet).
async function publishInstagram(post: Post, token: string, user: string, base: string) {
  const urls = slideTexts(post).map((_, i) => `${base}/api/slides/${post.id}/${i}.png`);
  let creation: string;
  if (urls.length === 1) {
    creation = (await call(`${GRAPH}/${user}/media`, { image_url: urls[0], caption: post.caption, access_token: token })).id;
  } else {
    const children: string[] = [];
    for (const u of urls) {
      const c = await call(`${GRAPH}/${user}/media`, { image_url: u, is_carousel_item: "true", access_token: token });
      await waitReady(c.id, token);
      children.push(c.id);
    }
    creation = (await call(`${GRAPH}/${user}/media`, { media_type: "CAROUSEL", children: children.join(","), caption: post.caption, access_token: token })).id;
  }
  await waitReady(creation, token);
  const pub = await call(`${GRAPH}/${user}/media_publish`, { creation_id: creation, access_token: token });
  return `instagram ${pub.id}`;
}

// Publish sungguhan jika kredensial platform diisi; selain itu dry-run.
export async function publish(post: Post): Promise<string> {
  if (post.platform === "threads") {
    const token = process.env.THREADS_ACCESS_TOKEN, user = process.env.THREADS_USER_ID;
    return token && user ? publishThreads(post, token, user) : "dry-run threads";
  }
  const token = process.env.INSTAGRAM_ACCESS_TOKEN, user = process.env.INSTAGRAM_USER_ID, base = process.env.PUBLIC_BASE_URL;
  return token && user && base ? publishInstagram(post, token, user, base.replace(/\/$/, "")) : "dry-run instagram";
}
