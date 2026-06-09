import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // =================================================================
  // 【大陆市场优化 - 本地开发提速】
  // 为了避免本地开发时，每次请求都向海外 Supabase 服务器发起 1秒+ 的身份验证网络请求，
  // 我们在本地开发期间直接放行。在生产环境部署时，可以将其恢复以保证 Auth 功能正常。
  // =================================================================
  const supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  // 2. 城市路由自动重定向逻辑 (对 / 根路径的处理)
  // 仅在 cookie 中已有城市时直接重定向；没有则把 / 暴露给客户端，
  // 由 AppContext 调用 /api/locate 拿到真实 IP 城市后再 router.push，
  // 避免过去「无 cookie 就硬跳 beijing」的 bug 让所有非北京用户被锁死。
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
    /*
     * 匹配所有请求路径，排除静态文件和特定后缀的资源文件。
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
