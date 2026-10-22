import { agent } from "./agents";
import type { Platform } from "./types";

export type Draft = { caption: string; slides?: string[]; sources: string[]; factCheckNotes: string };

// Nico menulis draft. Tanpa ANTHROPIC_API_KEY, dipakai draft placeholder supaya alur bisa dicoba.
export async function draftPost(topic: string, platform: Platform): Promise<Draft> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return {
      caption: `[DRAFT PLACEHOLDER] ${topic}`,
      sources: [],
      factCheckNotes: "Belum ada API key; isi ANTHROPIC_API_KEY untuk draft sungguhan.",
    };
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 1500,
      system: agent("nico").system,
      messages: [
        {
          role: "user",
          content:
            `Topik: ${topic}\nPlatform: ${platform}\n` +
            `Balas HANYA JSON: {"caption": string, "slides": string[] (kosong jika bukan carousel), ` +
            `"sources": string[], "factCheckNotes": string (klaim yang perlu dicek manusia)}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "{}";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json);
}
