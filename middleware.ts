import { NextRequest, NextResponse } from "next/server";

const unlockedCookie = "love_site_unlocked";
const protectedPaths = [
  "/private",
  "/world",
  "/board",
  "/notes",
  "/achievements",
  "/her",
  "/him",
  "/story",
];

function shouldSkip(pathname: string) {
  return (
    pathname === "/enter" ||
    pathname === "/api/passcode" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  );
}

function requiresAccess(pathname: string) {
  return (
    pathname === "/api/board/messages" ||
    pathname === "/api/notes" ||
    pathname === "/api/world/places" ||
    protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  );
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldSkip(pathname) || !requiresAccess(pathname)) {
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
