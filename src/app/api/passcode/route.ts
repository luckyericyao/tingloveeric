import { NextRequest, NextResponse } from "next/server";

const unlockedCookie = "love_site_unlocked";

export async function POST(request: NextRequest) {
  const configuredPasscode = process.env.LOVE_SITE_PASSCODE;

  if (!configuredPasscode) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(unlockedCookie, "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  const payload = (await request.json().catch(() => null)) as { passcode?: unknown } | null;
  const passcode = typeof payload?.passcode === "string" ? payload.passcode : "";

  if (passcode !== configuredPasscode) {
    return NextResponse.json({ ok: false, message: "暗号不对，再轻轻试一次。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(unlockedCookie, "true", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
