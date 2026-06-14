import { createClient } from "@supabase/supabase-js";

/**
 * 创建用于服务端公共读取的 Supabase 客户端。
 * 不依赖 cookie，适用于 RLS 已开放 SELECT 的公开表（如 cities）。
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
