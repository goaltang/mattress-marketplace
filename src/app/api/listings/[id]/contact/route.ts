import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/db";
import { DEFAULT_LISTINGS } from "@/config/data";

const SUPABASE_TIMEOUT_MS = 5000;

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = params.id;

  if (!listingId) {
    return NextResponse.json({ success: false, error: "Missing listing id" }, { status: 400 });
  }

  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const supabase = createClient();
      const { data, error } = await withTimeout(
        supabase
          .from("listings")
          .select("wechatId, phone, seller_device_id, sellerDeviceId")
          .eq("id", listingId)
          .maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (!error && data) {
        return NextResponse.json({
          success: true,
          contact: {
            wechatId: data.wechatId,
            phone: data.phone,
            sellerDeviceId: data.sellerDeviceId || data.seller_device_id,
          },
        });
      }

      if (error) {
        console.error("获取联系方式出错:", error.message);
      }
    } catch (err) {
      console.error("连接 Supabase 失败:", err);
    }
  }

  const found = DEFAULT_LISTINGS.find((item) => item.id === listingId);
  if (found) {
    return NextResponse.json({
      success: true,
      contact: {
        wechatId: found.wechatId,
        phone: found.phone,
      },
    });
  }

  return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
}
