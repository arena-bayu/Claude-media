import fs from "node:fs";
import path from "node:path";
import type { Post } from "./types";

const file = path.join(process.cwd(), "data/db.json");

export function readPosts(): Post[] {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

export function writePosts(posts: Post[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(posts, null, 2));
}
