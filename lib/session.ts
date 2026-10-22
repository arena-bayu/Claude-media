import { cookies } from "next/headers";
import { authDisabled, SESSION_COOKIE, verifySession } from "./auth";

/** Nama reviewer yang sedang login (dipakai untuk mencatat siapa yang approve). */
export async function currentUser(): Promise<string | null> {
  if (authDisabled()) return "reviewer (lokal)";
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}
