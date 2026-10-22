import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { LUCY_SYSTEM, NICO_RESEARCH_SYSTEM, NICO_WRITE_SYSTEM } from "./agents";
import { TIMEZONE } from "./time";
import type { Platform, Settings } from "./types";

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

/** Tanpa kredensial Claude, app berjalan dalam mode demo (konten placeholder) supaya alurnya tetap bisa dicoba. */
export const hasClaude = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

let _client: Anthropic | null = null;
const client = () => (_client ??= new Anthropic());

// Jika model menolak (safety classifier), API mencoba ulang otomatis di model cadangan yang sesuai.
const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

function assertNotRefused(res: { stop_reason: string | null; stop_details?: { category?: string | null } | null }) {
  if (res.stop_reason === "refusal") throw new Error(`Claude menolak permintaan (${res.stop_details?.category ?? "tanpa kategori"})`);
  if (res.stop_reason === "max_tokens") throw new Error("Jawaban Claude terpotong (max_tokens)");
}

const brandBrief = (s: Settings) =>
  `Brand: ${s.brand}\nNiche: ${s.niche}\nAudiens: ${s.audience}\nGaya bahasa: ${s.voice}`;

const today = () => new Date().toLocaleDateString("id-ID", { timeZone: TIMEZONE, dateStyle: "full" });

// ---------------- Lucy: rencana topik ----------------

const PlanSchema = z.object({
  topics: z.array(
    z.object({
      title: z.string().describe("Judul kerja topik"),
      angle: z.string().describe("Sudut pandang spesifik dan apa yang harus diriset"),
      platform: z.enum(["instagram", "threads"]),
    }),
  ),
});
export type PlannedTopic = z.infer<typeof PlanSchema>["topics"][number];

export async function planTopics(s: Settings, recentTitles: string[]): Promise<PlannedTopic[]> {
  const platforms = s.platforms.length ? s.platforms : (["threads"] as Platform[]);
  if (!hasClaude()) {
    return Array.from({ length: s.postsPerRun }, (_, i) => ({
      title: `[DEMO] Topik ${i + 1} tentang ${s.niche}`,
      angle: "Mode demo: isi ANTHROPIC_API_KEY untuk rencana sungguhan.",
      platform: platforms[i % platforms.length],
    }));
  }
  const res = await client().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    system: LUCY_SYSTEM,
    output_config: { effort: "high", format: betaZodOutputFormat(PlanSchema) },
    messages: [
      {
        role: "user",
        content:
          `${brandBrief(s)}\nHari ini: ${today()}\n\n` +
          `Rencanakan tepat ${s.postsPerRun} topik untuk putaran ini, dibagi di platform: ${platforms.join(", ")}.\n` +
          `Instagram = carousel edukatif; Threads = teks pendek yang memancing diskusi.\n\n` +
          `Topik yang sudah dibahas baru-baru ini (jangan diulang):\n${recentTitles.map((t) => `- ${t}`).join("\n") || "- (belum ada)"}`,
      },
    ],
  });
  assertNotRefused(res);
  const topics = res.parsed_output?.topics ?? [];
  return topics.filter((t) => platforms.includes(t.platform)).slice(0, s.postsPerRun);
}

// ---------------- Nico: riset + tulis ----------------

export type Research = { notes: string; urls: Set<string> };

export async function research(title: string, angle: string, s: Settings): Promise<Research> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: `${brandBrief(s)}\nHari ini: ${today()}\n\nTopik: ${title}\nAngle: ${angle}` },
  ];
  const urls = new Set<string>();
  let notes = "";
  // Pencarian web bisa berhenti sementara (pause_turn) pada riset panjang; lanjutkan beberapa kali.
  for (let turn = 0; turn < 4; turn++) {
    const res = await client().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      system: NICO_RESEARCH_SYSTEM,
      output_config: { effort: "medium" },
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 6,
          user_location: { type: "approximate", country: "ID", timezone: TIMEZONE },
        },
      ],
      messages,
    });
    assertNotRefused(res);
    for (const block of res.content) {
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const r of block.content) urls.add(r.url);
      } else if (block.type === "text") {
        notes += block.text;
      }
    }
    if (res.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: res.content });
  }
  if (!notes.trim()) throw new Error("Riset tidak menghasilkan catatan");
  return { notes, urls };
}

const DraftSchema = z.object({
  caption: z.string(),
  slides: z.array(z.string()).describe("Teks tiap slide carousel; kosong untuk Threads"),
  sources: z.array(z.string()).describe("URL dari catatan riset"),
  claims: z.array(z.string()).describe("Klaim faktual yang wajib dicek manusia"),
});
export type Draft = z.infer<typeof DraftSchema>;

const FORMAT: Record<Platform, string> = {
  instagram:
    "Format Instagram carousel: 5–8 slide. Slide 1 adalah hook singkat (maks 12 kata). Slide berikutnya masing-masing satu poin, maks 35 kata. " +
    "Slide terakhir ajakan (simpan/bagikan/ikuti). Caption maks 1.500 karakter dengan 3–5 hashtag relevan di akhir.",
  threads:
    "Format Threads: satu post teks, maks 450 karakter termasuk spasi, tanpa hashtag berlebihan (maks 1). Slides kosong. " +
    "Buka dengan kalimat yang memancing orang berhenti scroll, tutup dengan pertanyaan untuk diskusi.",
};

const LIMITS: Record<Platform, { caption: number; minSlides: number; maxSlides: number }> = {
  instagram: { caption: 2200, minSlides: 2, maxSlides: 10 },
  threads: { caption: 500, minSlides: 0, maxSlides: 0 },
};

/** Masalah format yang membuat post tidak bisa dipublikasikan. */
export function formatProblems(platform: Platform, d: Pick<Draft, "caption" | "slides">): string[] {
  const l = LIMITS[platform];
  const problems: string[] = [];
  if (!d.caption.trim()) problems.push("caption kosong");
  if (d.caption.length > l.caption) problems.push(`caption ${d.caption.length} karakter (maks ${l.caption})`);
  if (d.slides.length < l.minSlides || d.slides.length > l.maxSlides)
    problems.push(`jumlah slide ${d.slides.length} (harus ${l.minSlides}–${l.maxSlides})`);
  return problems;
}

export async function writeDraft(
  post: { platform: Platform; title: string; angle: string },
  r: Research,
  s: Settings,
  revision?: { previous: Pick<Draft, "caption" | "slides">; feedback: string },
): Promise<Draft> {
  if (!hasClaude()) return demoDraft(post.platform, post.title, revision?.feedback);

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content:
        `${brandBrief(s)}\n\nPlatform: ${post.platform}\n${FORMAT[post.platform]}\n\nTopik: ${post.title}\nAngle: ${post.angle}\n\n` +
        `<catatan_riset>\n${r.notes}\n</catatan_riset>` +
        (revision
          ? `\n\nIni revisi. Draft sebelumnya:\n<draft_lama>\n${revision.previous.caption}\n${revision.previous.slides.map((x, i) => `[Slide ${i + 1}] ${x}`).join("\n")}\n</draft_lama>\n` +
            `Catatan reviewer manusia yang wajib diikuti:\n<catatan_reviewer>\n${revision.feedback}\n</catatan_reviewer>`
          : ""),
    },
  ];

  // Satu kesempatan perbaikan jika formatnya melanggar batas platform.
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      system: NICO_WRITE_SYSTEM,
      output_config: { effort: "high", format: betaZodOutputFormat(DraftSchema) },
      messages,
    });
    assertNotRefused(res);
    const d = res.parsed_output;
    if (!d) throw new Error("Draft tidak sesuai skema");
    const draft = { ...d, slides: post.platform === "threads" ? [] : d.slides, sources: keepKnownSources(d.sources, r.urls) };
    const problems = formatProblems(post.platform, draft);
    if (!problems.length) return draft;
    if (attempt === 1) throw new Error(`Draft melanggar format: ${problems.join("; ")}`);
    messages.push(
      { role: "assistant", content: res.content },
      { role: "user", content: `Perbaiki: ${problems.join("; ")}. Kirim ulang draft lengkap.` },
    );
  }
  throw new Error("unreachable");
}

/** Buang URL yang tidak benar-benar ditemukan saat riset (mencegah sumber halusinasi). */
export function keepKnownSources(sources: string[], known: Set<string>): string[] {
  const norm = (u: string) => u.trim().replace(/\/$/, "");
  const knownNorm = new Set([...known].map(norm));
  return [...new Set(sources.map(norm))].filter((u) => knownNorm.has(u));
}

function demoDraft(platform: Platform, title: string, feedback?: string): Draft {
  const note = feedback ? ` (revisi: ${feedback})` : "";
  return {
    caption: `Contoh caption untuk "${title}"${note}. Isi ANTHROPIC_API_KEY agar Nico meriset dan menulis sungguhan.`,
    slides: platform === "instagram" ? [title, "Poin pertama (demo)", "Poin kedua (demo)", "Simpan & bagikan postingan ini"] : [],
    sources: [],
    claims: ["Mode demo: tidak ada klaim yang diriset"],
  };
}

export const demoResearch = (): Research => ({ notes: "", urls: new Set() });
