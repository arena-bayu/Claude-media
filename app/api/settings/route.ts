import { NextResponse } from "next/server";
import { z } from "zod";
import { log, saveSettings } from "@/lib/db";
import { currentUser } from "@/lib/session";

const Settings = z.object({
  brand: z.string().trim().min(1).max(60),
  niche: z.string().trim().min(3).max(300),
  audience: z.string().trim().min(3).max(300),
  voice: z.string().trim().min(3).max(300),
  postsPerRun: z.number().int().min(1).max(10),
  platforms: z.array(z.enum(["instagram", "threads"])).min(1),
  slots: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:MM")).min(1).max(12),
});

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  const parsed = Settings.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  saveSettings(parsed.data);
  log(user, "Memperbarui brief brand & jadwal");
  return NextResponse.json(parsed.data);
}
