import { NextRequest, NextResponse } from "next/server";

const unlockedCookie = "love_site_unlocked";

function shouldSkip(pathname: string) {
  return (
    pathname === "/enter" ||
    pathname === "/api/passcode" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  );
}

export function middleware(request: NextRequest) {
  if (!process.env.LOVE_SITE_PASSCODE || shouldSkip(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.cookies.get(unlockedCookie)?.value === "true") {
    return NextResponse.next();
  }

  const enterUrl = new URL("/enter", request.url);
  enterUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(enterUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/favicon.ico"],
};
