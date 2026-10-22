import { agent } from "./agents";
import type { Platform } from "./types";

export type Draft = { caption: string; slides?: string[]; sources: string[]; factCheckNotes: string };

export const hasLLM = () => !!process.env.ANTHROPIC_API_KEY;

async function ask(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

const jsonOf = (t: string) => JSON.parse(t.slice(t.search(/[{[]/), Math.max(t.lastIndexOf("}"), t.lastIndexOf("]")) + 1));

// Lucy (CEO) menentukan topik minggu ini.
export async function planTopics(niche: string, n: number): Promise<string[]> {
  if (!hasLLM()) return Array.from({ length: n }, (_, i) => `${niche} — ide #${i + 1}`);
  const t = await ask(agent("lucy").system, `Niche media: ${niche}. Beri ${n} topik konten untuk minggu ini. Balas HANYA JSON array string.`);
  return jsonOf(t);
}

// Nico (CMO) menulis draft. Tanpa API key dipakai placeholder supaya alur bisa dicoba.
export async function draftPost(topic: string, platform: Platform): Promise<Draft> {
  if (!hasLLM())
    return {
      caption: `[DRAFT PLACEHOLDER] ${topic}`,
      sources: [],
      factCheckNotes: "Belum ada API key; isi ANTHROPIC_API_KEY untuk draft sungguhan.",
    };
  const t = await ask(
    agent("nico").system,
    `Topik: ${topic}\nPlatform: ${platform}\nBalas HANYA JSON: {"caption": string, "slides": string[] (kosong jika bukan carousel), "sources": string[], "factCheckNotes": string (klaim yang perlu dicek manusia)}`,
  );
  return jsonOf(t);
}
