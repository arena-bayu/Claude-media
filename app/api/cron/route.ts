import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/auth";
import { publishDue, scheduleApproved } from "@/lib/office";

export const dynamic = "force-dynamic";

/**
 * Pemicu eksternal opsional (mis. cron platform hosting) selain scheduler bawaan.
 * Mati kecuali CRON_SECRET diisi.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET belum diisi" }, { status: 404 });
  if (!safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const scheduled = scheduleApproved();
  const published = await publishDue();
  return NextResponse.json({ scheduled, published });
}
