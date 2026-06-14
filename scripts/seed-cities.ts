/**
 * 城市数据种子脚本
 *
 * 用法：
 *   npx tsx scripts/seed-cities.ts
 *
 * 环境变量（.env.local）：
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=
 *   SUPABASE_SERVICE_ROLE_KEY=（可选，权限更高）
 */
import { createClient } from "@supabase/supabase-js";
import { syncCities } from "../src/lib/cities-db";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("错误：缺少 Supabase 环境变量。");
    console.error("请确保 .env.local 中配置了 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_ANON_KEY。");
    process.exit(1);
  }

  if (url.includes("your-project-id") || key.includes("your-anon-public-key")) {
    console.error("错误：环境变量仍为占位符，请先配置真实 Supabase 凭据。");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("正在生成城市数据...");
  const result = await syncCities(supabase);

  if (!result.success) {
    console.error("同步失败:", result.error);
    process.exit(1);
  }

  console.log(`✅ 成功同步 ${result.count} 个城市到 Supabase。`);
}

main().catch((err) => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
