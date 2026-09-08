import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/siteSession";
import { sameOrigin } from "@/lib/sameOrigin";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/enter" || pathname === "/api/passcode" || pathname === "/favicon.ico" || pathname === "/robots.txt") {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.LOVE_SESSION_SECRET);
  if (!session) {
    if (pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(pathname) || pathname === "/_next/image") {
      return NextResponse.json({ message: "请先进入私人档案馆。" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    }
    const entry = new URL("/enter", request.url);
    entry.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(entry);
  }
  if ((pathname === "/him" || pathname.startsWith("/him/")) && session.role !== "owner") {
    return NextResponse.redirect(new URL("/private", request.url));
  }
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method) && (session.role !== "owner" || !sameOrigin(request))) {
    return NextResponse.json({ message: "只有所有者可以修改记录。" }, { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/webpack-hmr).*)"],
};
