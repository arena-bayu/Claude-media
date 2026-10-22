import { NextResponse } from "next/server";
import { startOfficeRun } from "@/lib/office";
import { currentUser } from "@/lib/session";

/** Mulai putaran kantor di background; progres terlihat dari status agen dan log. */
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  if (!startOfficeRun(`diminta ${user}`)) return NextResponse.json({ error: "Kantor sedang bekerja" }, { status: 409 });
  return NextResponse.json({ started: true }, { status: 202 });
}
