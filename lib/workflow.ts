import type { Status } from "./types";

/**
 * Aturan transisi status. Inilah jaminan "tidak ada yang tayang tanpa approval":
 * - agen (Nico) hanya bisa menghasilkan `review`;
 * - hanya aksi manusia yang bisa menghasilkan `approved`;
 * - `scheduled` hanya dari `approved`, dan publisher hanya menyentuh `scheduled`.
 */
export type Action = "approve" | "reject" | "revise" | "edit" | "schedule" | "unschedule" | "retry";

const ALLOWED: Record<Action, Status[]> = {
  approve: ["review"],
  reject: ["review", "approved", "scheduled", "failed"],
  revise: ["review"],
  edit: ["review"],
  schedule: ["approved"],
  unschedule: ["scheduled"],
  retry: ["failed"],
};

export function canApply(action: Action, from: Status): boolean {
  return ALLOWED[action].includes(from);
}

export function assertCanApply(action: Action, from: Status) {
  if (!canApply(action, from)) throw new WorkflowError(`Aksi "${action}" tidak bisa dilakukan pada status "${from}"`);
}

export class WorkflowError extends Error {}
