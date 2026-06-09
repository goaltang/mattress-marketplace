import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 创建并返回一个 Supabase 服务端客户端实例。
 * 适用于在 Next.js 的 Server Component (服务端组件)、Server Action 或 Route Handler 中调用。
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 当从 Server Component 中调用时，如果尝试设置 Cookie 可能会抛出异常，
            // 如果已经在 middleware 中做了 Session 刷新，这可以被安全地忽略。
          }
        },
      },
    }
  );
}
