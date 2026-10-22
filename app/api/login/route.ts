import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

const Body = z.object({ name: z.string().trim().min(1).max(40), password: z.string() });

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Nama dan password wajib diisi" }, { status: 400 });
  if (!checkPassword(body.data.password)) return NextResponse.json({ error: "Password salah" }, { status: 401 });
  const session = await createSession(body.data.name);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: session.maxAge,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
