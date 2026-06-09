import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/db";
import { getDeviceIdFromCookie } from "@/utils/auth";

const SUPABASE_TIMEOUT_MS = 8000;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function withTimeout(promiseLike: any, ms: number): Promise<any> {
  const promise = Promise.resolve(promiseLike);
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Supabase query timed out after ${ms}ms`)), ms)
    ),
  ]);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function PATCH(request: NextRequest) {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const cookieDeviceId = getDeviceIdFromCookie(request);

  try {
    const body = await request.json();
    const { id, price } = body;

    if (!id || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: "Missing id or price" },
        { status: 400 }
      );
    }

    const supabase = createClient(cookieDeviceId || undefined);

    if (cookieDeviceId) {
      const { data: listing, error: fetchError } = await withTimeout(
        supabase.from("listings").select("sellerDeviceId").eq("id", id).maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (fetchError) {
        console.error("查询商品所有者出错:", fetchError.message);
        return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
      }

      if (listing && listing.sellerDeviceId && listing.sellerDeviceId !== cookieDeviceId) {
        return NextResponse.json({ success: false, error: "Forbidden: not the listing owner" }, { status: 403 });
      }
    }

    const { error } = await withTimeout(
      supabase.from("listings").update({ price }).eq("id", id),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      console.error("更新商品价格出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("连接 Supabase 失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}
