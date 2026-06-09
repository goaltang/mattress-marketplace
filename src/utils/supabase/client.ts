import { createBrowserClient } from "@supabase/ssr";

/**
 * 创建并返回一个 Supabase 浏览器客户端实例。
 * 适用于在 Next.js 的 Client Component (客户端组件) 中调用。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
