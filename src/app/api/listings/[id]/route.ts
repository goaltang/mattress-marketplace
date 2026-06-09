import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/db";
import { getDeviceIdFromCookie } from "@/utils/auth";
import { DEFAULT_LISTINGS } from "@/config/data";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = params.id;
  if (!listingId) {
    return NextResponse.json({ success: false, error: "Missing listing id" }, { status: 400 });
  }

  const configured = isSupabaseConfigured();
  const cookieDeviceId = getDeviceIdFromCookie(request);

  if (configured) {
    try {
      const supabase = createClient(cookieDeviceId || undefined);
      const { data, error } = await withTimeout(
        supabase.from("listings").select("*").eq("id", listingId).maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (!error && data) {
        return NextResponse.json({
          success: true,
          listing: {
            ...data,
            sellerDeviceId: data.sellerDeviceId || data.seller_device_id || undefined,
          },
        });
      }

      if (error) {
        console.error("获取商品详情出错:", error.message);
      }
    } catch (err) {
      console.error("连接 Supabase 失败:", err);
    }
  }

  const found = DEFAULT_LISTINGS.find((item) => item.id === listingId);
  if (found) {
    return NextResponse.json({ success: true, listing: found });
  }

  return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = params.id;
  if (!listingId) {
    return NextResponse.json({ success: false, error: "Missing listing id" }, { status: 400 });
  }

  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const cookieDeviceId = getDeviceIdFromCookie(request);

  try {
    const body = await request.json();
    const supabase = createClient(cookieDeviceId || undefined);

    if (cookieDeviceId) {
      const { data: listing, error: fetchError } = await withTimeout(
        supabase.from("listings").select("sellerDeviceId").eq("id", listingId).maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (fetchError) {
        return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
      }

      if (listing && listing.sellerDeviceId && listing.sellerDeviceId !== cookieDeviceId) {
        return NextResponse.json({ success: false, error: "Forbidden: not the listing owner" }, { status: 403 });
      }
    }

    const dbUpdates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const allowedFields = ["price", "description", "images", "wechatId", "phone", "isActive", "title"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        dbUpdates[field] = body[field];
      }
    }

    const { error } = await withTimeout(
      supabase.from("listings").update(dbUpdates).eq("id", listingId),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("更新商品失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = params.id;
  if (!listingId) {
    return NextResponse.json({ success: false, error: "Missing listing id" }, { status: 400 });
  }

  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const cookieDeviceId = getDeviceIdFromCookie(request);

  try {
    const supabase = createClient(cookieDeviceId || undefined);

    if (cookieDeviceId) {
      const { data: listing, error: fetchError } = await withTimeout(
        supabase.from("listings").select("sellerDeviceId").eq("id", listingId).maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (fetchError) {
        return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
      }

      if (listing && listing.sellerDeviceId && listing.sellerDeviceId !== cookieDeviceId) {
        return NextResponse.json({ success: false, error: "Forbidden: not the listing owner" }, { status: 403 });
      }
    }

    const { error } = await withTimeout(
      supabase.from("listings").delete().eq("id", listingId),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("删除商品失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}
