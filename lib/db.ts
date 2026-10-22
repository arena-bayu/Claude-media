import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import type { AgentId, AgentState, LogEntry, Platform, Post, Settings, Status } from "./types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const g = globalThis as unknown as { __db?: DatabaseSync };

function db(): DatabaseSync {
  if (g.__db) return g.__db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const conn = new DatabaseSync(path.join(DATA_DIR, "media.db"));
  conn.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      pillar TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      angle TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT '',
      slides TEXT NOT NULL DEFAULT '[]',
      sources TEXT NOT NULL DEFAULT '[]',
      claims TEXT NOT NULL DEFAULT '[]',
      researchNotes TEXT NOT NULL DEFAULT '',
      researchUrls TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 0,
      reviewNote TEXT NOT NULL DEFAULT '',
      reviewedBy TEXT,
      scheduledAt TEXT,
      publishedAt TEXT,
      externalId TEXT,
      error TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS posts_status ON posts(status, scheduledAt);
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at TEXT NOT NULL,
      agent TEXT NOT NULL,
      message TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      busy INTEGER NOT NULL DEFAULT 0,
      task TEXT NOT NULL DEFAULT '',
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      json TEXT NOT NULL
    );
  `);
  // Migrasi kolom yang ditambahkan setelah rilis pertama.
  const cols = new Set((conn.prepare(`PRAGMA table_info(posts)`).all() as { name: string }[]).map((c) => c.name));
  if (!cols.has("pillar")) conn.exec(`ALTER TABLE posts ADD COLUMN pillar TEXT NOT NULL DEFAULT ''`);
  // Status "sibuk" dari proses sebelumnya (mis. server restart di tengah kerja) tidak lagi valid.
  conn.exec(`UPDATE agents SET busy = 0, task = ''`);
  conn.exec(`UPDATE posts SET status = 'failed', error = 'Penulisan terputus karena server restart' WHERE status = 'drafting'`);
  conn.exec(`UPDATE posts SET status = 'review', error = 'Revisi terputus karena server restart; draft lama dipertahankan' WHERE status = 'revising'`);
  conn.exec(`UPDATE posts SET status = 'failed', error = 'Publikasi terputus karena server restart; cek platform sebelum mencoba ulang' WHERE status = 'publishing'`);
  g.__db = conn;
  return conn;
}

const now = () => new Date().toISOString();

// ---------- posts ----------

type Row = Record<string, unknown>;

function toPost(r: Row): Post {
  return {
    ...(r as unknown as Post),
    slides: JSON.parse(r.slides as string),
    sources: JSON.parse(r.sources as string),
    claims: JSON.parse(r.claims as string),
    researchUrls: JSON.parse(r.researchUrls as string),
  };
}

export function listPosts(): Post[] {
  return (db().prepare(`SELECT * FROM posts ORDER BY COALESCE(scheduledAt, createdAt) DESC`).all() as Row[]).map(toPost);
}

export function getPost(id: string): Post | null {
  const r = db().prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as Row | undefined;
  return r ? toPost(r) : null;
}

export function postsWithStatus(...statuses: Status[]): Post[] {
  const q = `SELECT * FROM posts WHERE status IN (${statuses.map(() => "?").join(",")}) ORDER BY createdAt`;
  return (db().prepare(q).all(...statuses) as Row[]).map(toPost);
}

export function createPost(p: { platform: Platform; pillar: string; title: string; angle: string; createdBy: string }): Post {
  const t = now();
  const id = randomUUID();
  db()
    .prepare(`INSERT INTO posts (id, platform, pillar, title, angle, status, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'drafting', ?, ?, ?)`)
    .run(id, p.platform, p.pillar, p.title, p.angle, p.createdBy, t, t);
  return getPost(id)!;
}

const COLUMNS = new Set([
  "title", "angle", "caption", "slides", "sources", "claims", "researchNotes", "researchUrls", "status", "revision", "reviewNote",
  "reviewedBy", "scheduledAt", "publishedAt", "externalId", "error",
]);

export function updatePost(id: string, patch: Partial<Post>): Post {
  const entries = Object.entries(patch).filter(([k]) => COLUMNS.has(k));
  const values = entries.map(([, v]) => (Array.isArray(v) ? JSON.stringify(v) : (v as string | number | null)));
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  db().prepare(`UPDATE posts SET ${sets}, updatedAt = ? WHERE id = ?`).run(...values, now(), id);
  return getPost(id)!;
}

/**
 * Pindahkan status secara atomik: hanya berhasil jika status saat ini masih `from`.
 * Mencegah dua proses (mis. dua tick scheduler) memproses post yang sama.
 */
export function claimPost(id: string, from: Status, to: Status): boolean {
  return db().prepare(`UPDATE posts SET status = ?, updatedAt = ? WHERE id = ? AND status = ?`).run(to, now(), id, from).changes === 1;
}

// ---------- logs ----------

export function log(agent: string, message: string) {
  db().prepare(`INSERT INTO logs (at, agent, message) VALUES (?, ?, ?)`).run(now(), agent, message);
}

export function recentLogs(limit = 40): LogEntry[] {
  return db().prepare(`SELECT * FROM logs ORDER BY id DESC LIMIT ?`).all(limit) as unknown as LogEntry[];
}

// ---------- agents ----------

export function setAgent(id: AgentId, task: string | null) {
  db()
    .prepare(`INSERT INTO agents (id, busy, task, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET busy = excluded.busy, task = excluded.task, updatedAt = excluded.updatedAt`)
    .run(id, task ? 1 : 0, task ?? "", now());
}

export function agentStates(): AgentState[] {
  return (db().prepare(`SELECT * FROM agents`).all() as Row[]).map((r) => ({ ...(r as unknown as AgentState), busy: r.busy === 1 }));
}

// ---------- settings ----------

export const DEFAULT_SETTINGS: Settings = {
  brand: process.env.BRAND_NAME ?? "Media Kita",
  niche: "Trivia ringan yang awet: sejarah, film, dan kejadian unik dari seluruh dunia",
  audience: "Anak muda Indonesia 18–35 tahun yang suka fakta unik untuk bahan obrolan",
  voice: "Santai dan bercerita, seperti teman yang antusias berbagi fakta; tanpa clickbait; jujur kalau sumber berbeda pendapat",
  pillars: ["Trivia sejarah", "Trivia film", "Kejadian unik"],
  postsPerRun: 3,
  platforms: ["instagram", "threads"],
  slots: ["07:00", "12:00", "19:00"],
};

export function getSettings(): Settings {
  const r = db().prepare(`SELECT json FROM settings WHERE id = 1`).get() as { json: string } | undefined;
  return r ? { ...DEFAULT_SETTINGS, ...JSON.parse(r.json) } : DEFAULT_SETTINGS;
}

export function saveSettings(s: Settings) {
  db().prepare(`INSERT INTO settings (id, json) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json`).run(JSON.stringify(s));
}
