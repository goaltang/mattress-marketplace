import { NextResponse, type NextRequest } from "next/server";

const DEVICE_ID_COOKIE = "device_id";

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  if (!request.cookies.get(DEVICE_ID_COOKIE)?.value) {
    supabaseResponse.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  if (pathname === "/") {
    const citySlug = request.cookies.get("city_slug")?.value;
    if (citySlug) {
      return NextResponse.redirect(new URL(`/${citySlug}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
