import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/siteSession";

export async function viewerSession() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value, process.env.LOVE_SESSION_SECRET);
}
