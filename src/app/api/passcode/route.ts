import { NextRequest, NextResponse } from "next/server";
import { sitePasscode } from "@/lib/siteAccess";

const unlockedCookie = "love_site_unlocked";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { passcode?: unknown } | null;
  const passcode = typeof payload?.passcode === "string" ? payload.passcode : "";

  if (passcode !== sitePasscode()) {
    return NextResponse.json({ ok: false, message: "暗号不对，再轻轻试一次。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(unlockedCookie, "true", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(unlockedCookie, "", {
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}
