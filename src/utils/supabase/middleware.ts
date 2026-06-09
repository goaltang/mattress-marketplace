import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 刷新 Supabase 认证 Session 并返回 Supabase 响应实例和当前用户。
 * 用于在 Next.js 的 Middleware 中保持用户登录状态的活跃。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 必须调用 getUser() 刷新 Session，不要使用 getSession()，因为后者不会重新验证服务端 token 的安全性
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
