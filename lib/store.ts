import fs from "node:fs";
import path from "node:path";
import type { Post } from "./types";

const dir = path.join(process.cwd(), "data");
const postsFile = path.join(dir, "db.json");
const logFile = path.join(dir, "log.json");

function read<T>(file: string): T[] {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}
function write(file: string, data: unknown) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export const readPosts = () => read<Post>(postsFile);
export const writePosts = (p: Post[]) => write(postsFile, p);

export type LogEntry = { at: string; agent: string; message: string };
export const readLog = () => read<LogEntry>(logFile);
export function log(agent: string, message: string) {
  write(logFile, [...readLog(), { at: new Date().toISOString(), agent, message }].slice(-100));
}
