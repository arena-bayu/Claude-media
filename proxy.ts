import { NextResponse, type NextRequest } from "next/server";
import { authDisabled, SESSION_COOKIE, verifySession } from "./lib/auth";

// Rute yang boleh diakses tanpa login:
// - /login dan /api/login
// - /api/slides: Instagram harus bisa mengunduh gambar slide
// - /api/cron: dilindungi CRON_SECRET sendiri
const PUBLIC = [/^\/login$/, /^\/api\/login$/, /^\/api\/slides\//, /^\/api\/cron$/];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (authDisabled() || PUBLIC.some((r) => r.test(pathname))) return NextResponse.next();
  if (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
