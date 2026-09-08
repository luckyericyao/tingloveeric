export const SESSION_COOKIE = "love_site_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export type ViewerRole = "guest" | "owner";
type Session = { role: ViewerRole; expires: number };
const encoder = new TextEncoder();

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decode(value: string) {
  return Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSession(role: ViewerRole, secret: string, now = Date.now()) {
  if (secret.length < 32) throw new Error("Session signing secret is not configured");
  const body = encode(encoder.encode(JSON.stringify({ role, expires: now + SESSION_SECONDS * 1000 })));
  const signature = await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(body));
  return `${body}.${encode(new Uint8Array(signature))}`;
}

export async function verifySession(token: string | undefined, secret: string | undefined, now = Date.now()): Promise<Session | null> {
  if (!token || token.length > 1024 || !secret || secret.length < 32) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, signature] = parts;
    if (!await crypto.subtle.verify("HMAC", await key(secret), decode(signature), encoder.encode(body))) return null;
    const session = JSON.parse(new TextDecoder().decode(decode(body))) as Session;
    if (session.role !== "guest" && session.role !== "owner") return null;
    if (!Number.isFinite(session.expires) || session.expires <= now || session.expires > now + SESSION_SECONDS * 1000) return null;
    return session;
  } catch {
    return null;
  }
}
