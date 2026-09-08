import { NextRequest, NextResponse } from "next/server";
import { accessConfiguration } from "@/lib/siteAccess";
import { createSession, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/siteSession";
import { sameOrigin } from "@/lib/sameOrigin";

const unlockedCookie = SESSION_COOKIE;

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const config = accessConfiguration();
  if (!config) return NextResponse.json({ ok: false, message: "私人入口尚未完成安全配置，请联系所有者。" }, { status: 503 });
  const payload = (await request.json().catch(() => null)) as { passcode?: unknown } | null;
  const passcode = typeof payload?.passcode === "string" ? payload.passcode : "";

  const role = config.ownerPasscode && passcode === config.ownerPasscode ? "owner" : passcode === config.guestPasscode ? "guest" : null;
  if (!role) {
    return NextResponse.json({ ok: false, message: "暗号不对，再轻轻试一次。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(unlockedCookie, await createSession(role, config.secret), {
    httpOnly: true,
    maxAge: SESSION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(unlockedCookie, "", {
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}
