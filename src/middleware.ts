import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const DEVICE_ID_COOKIE = "device_id";

export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);

  if (!request.cookies.get(DEVICE_ID_COOKIE)?.value) {
    supabaseResponse.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const { pathname } = request.nextUrl;

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
