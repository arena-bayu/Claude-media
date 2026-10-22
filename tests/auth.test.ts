import { describe, expect, it } from "vitest";
import { createSession, verifySession } from "@/lib/auth";

describe("sesi", () => {
  it("token valid mengembalikan nama reviewer", async () => {
    const { value } = await createSession("Sinta");
    expect(await verifySession(value)).toBe("Sinta");
  });

  it("token yang diubah ditolak", async () => {
    const { value } = await createSession("Sinta");
    const [, exp, sig] = value.split(".");
    const forged = `${btoa("Admin")}.${exp}.${sig}`;
    expect(await verifySession(forged)).toBeNull();
    expect(await verifySession("sampah")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});
