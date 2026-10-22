// Sesi login reviewer: cookie bertanda tangan HMAC. Memakai Web Crypto agar jalan di proxy dan route handler.

export const SESSION_COOKIE = "media_session";
const MAX_AGE_S = 60 * 60 * 24 * 14;

/** Tanpa ADMIN_PASSWORD di luar production, login dimatikan supaya mudah dicoba lokal. */
export const authDisabled = () => !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";

function secret(): string {
  const s = process.env.AUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-secret-ganti-di-production" : "");
  if (!s) throw new Error("AUTH_SECRET wajib diisi di production");
  return s;
}

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Bandingkan dua string tanpa membocorkan posisi perbedaan lewat waktu eksekusi. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSession(name: string): Promise<{ value: string; maxAge: number }> {
  const payload = `${b64url(enc.encode(name))}.${Math.floor(Date.now() / 1000) + MAX_AGE_S}`;
  return { value: `${payload}.${await hmac(payload)}`, maxAge: MAX_AGE_S };
}

/** Nama reviewer dari cookie sesi, atau null jika tidak valid/kedaluwarsa. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [name, exp, sig] = token.split(".");
  if (!name || !exp || !sig) return null;
  if (!safeEqual(sig, await hmac(`${name}.${exp}`))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return fromB64url(name);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(password, expected!);
}
