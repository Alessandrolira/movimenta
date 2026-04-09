import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  role: "ADMIN" | "USER";
}

const ROLE_ROUTES: Record<string, string[]> = {
  "/companies": ["ADMIN"],
  "/teams": ["ADMIN"],
  "/dashboard": ["ADMIN", "USER"],
  "/movements": ["ADMIN", "USER"],
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = jwtDecode<TokenPayload>(token);
    const pathname = request.nextUrl.pathname;

    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(payload.role)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/companies/:path*", "/teams/:path*", "/dashboard/:path*", "/movements/:path*"],
};
