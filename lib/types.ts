export type Platform = "instagram" | "threads";
export type Status = "draft" | "review" | "approved" | "scheduled" | "published" | "rejected";

export type Post = {
  id: string;
  platform: Platform;
  format: "carousel" | "text" | "image";
  topic: string;
  caption: string;
  slides?: string[];
  sources: string[];
  factCheckNotes: string;
  status: Status;
  createdBy: string;
  createdAt: string;
  scheduledAt?: string;
  approvedBy?: string;
  publishedAt?: string;
};
