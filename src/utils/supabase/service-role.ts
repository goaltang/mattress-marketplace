import { createClient } from "@supabase/supabase-js";

/**
 * 创建具有 service_role 权限的 Supabase 客户端。
 * 用于后台同步、seed 等需要绕过 RLS 的场景。
 * 必须仅在服务端使用，且不要泄露给前端。
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
