import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/db";

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

interface FavoriteRow {
  listing_id: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const deviceId = request.nextUrl.searchParams.get("device_id");
  if (!deviceId) {
    return NextResponse.json({ success: false, error: "Missing device_id" }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { data, error } = await withTimeout(
      supabase
        .from("favorites")
        .select("listing_id, created_at")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false }),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      console.error("获取收藏列表出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const favorites = ((data as FavoriteRow[]) || []).map((row) => row.listing_id);

    return NextResponse.json({
      success: true,
      favorites,
    });
  } catch (err) {
    console.error("连接 Supabase 失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { device_id, listing_id } = body;

    if (!device_id || !listing_id) {
      return NextResponse.json(
        { success: false, error: "Missing device_id or listing_id" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await withTimeout(
      supabase.from("favorites").insert([{ device_id, listing_id }]),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Already favorited" });
      }
      console.error("添加收藏出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("连接 Supabase 失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { device_id, listing_id } = body;

    if (!device_id || !listing_id) {
      return NextResponse.json(
        { success: false, error: "Missing device_id or listing_id" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await withTimeout(
      supabase
        .from("favorites")
        .delete()
        .eq("device_id", device_id)
        .eq("listing_id", listing_id),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      console.error("取消收藏出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("连接 Supabase 失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}