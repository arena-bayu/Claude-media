export type Platform = "instagram" | "threads";
export const PLATFORMS: Platform[] = ["instagram", "threads"];

/**
 * Siklus hidup post. Agen hanya bisa menghasilkan `review`; hanya manusia yang
 * bisa memindahkan post ke `approved`. Lihat lib/workflow.ts.
 */
export type Status =
  | "drafting" // Nico sedang menulis
  | "review" // menunggu review & cek fakta manusia
  | "revising" // Nico merevisi berdasarkan catatan reviewer
  | "approved" // disetujui, menunggu dijadwalkan
  | "scheduled"
  | "publishing" // sedang dikirim ke platform
  | "published"
  | "rejected"
  | "failed"; // gagal dibuat atau gagal publish

export type Post = {
  id: string;
  platform: Platform;
  title: string;
  angle: string;
  caption: string;
  slides: string[];
  sources: string[];
  claims: string[]; // klaim yang wajib dicek manusia
  researchNotes: string;
  researchUrls: string[];
  status: Status;
  revision: number;
  reviewNote: string;
  reviewedBy: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  externalId: string | null;
  error: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentId = "lucy" | "nico" | "ardi";

export type AgentState = {
  id: AgentId;
  busy: boolean;
  task: string;
  updatedAt: string;
};

export type LogEntry = { id: number; at: string; agent: string; message: string };

export type Settings = {
  brand: string;
  niche: string;
  audience: string;
  voice: string;
  postsPerRun: number;
  platforms: Platform[];
  slots: string[]; // jam tayang lokal, "HH:MM"
};
