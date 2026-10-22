import { describe, expect, it } from "vitest";
import type { Status } from "@/lib/types";
import { canApply } from "@/lib/workflow";

const ALL: Status[] = ["drafting", "review", "revising", "approved", "scheduled", "publishing", "published", "rejected", "failed"];

describe("aturan approval", () => {
  it("approve hanya dari review", () => {
    expect(ALL.filter((s) => canApply("approve", s))).toEqual(["review"]);
  });

  it("tidak ada aksi yang bisa menjadwalkan post yang belum di-approve", () => {
    for (const s of ["drafting", "review", "revising", "failed", "rejected"] as Status[]) {
      expect(canApply("schedule", s)).toBe(false);
    }
  });

  it("post yang sedang dikerjakan agen atau sudah terbit tidak bisa diubah", () => {
    for (const s of ["drafting", "revising", "publishing", "published"] as Status[]) {
      for (const a of ["approve", "edit", "revise", "reject", "unschedule"] as const) {
        expect(canApply(a, s)).toBe(false);
      }
    }
  });

  it("edit & revisi hanya saat review", () => {
    expect(ALL.filter((s) => canApply("edit", s))).toEqual(["review"]);
    expect(ALL.filter((s) => canApply("revise", s))).toEqual(["review"]);
  });
});
