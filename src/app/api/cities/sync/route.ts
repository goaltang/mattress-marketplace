import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { isSupabaseConfigured } from "@/utils/db";
import { syncCities } from "@/lib/cities-db";

export async function POST(request: NextRequest) {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json(
      { success: false, error: "Supabase not configured" },
      { status: 503 }
    );
  }

  // 简单的管理密钥保护：通过 Header 或 Query 传入
  const authHeader = request.headers.get("x-admin-key");
  const urlKey = new URL(request.url).searchParams.get("key");
  const adminKey = process.env.ADMIN_SYNC_KEY;

  if (adminKey && authHeader !== adminKey && urlKey !== adminKey) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const supabase = createServiceRoleClient();
    const result = await syncCities(supabase);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `成功同步 ${result.count} 个城市到 Supabase`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
