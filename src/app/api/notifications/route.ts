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
        .from("notifications")
        .select("*")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false }),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      console.error("获取通知列表出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const notifications = (data || []).map((row: Record<string, unknown>) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      timestamp: row.created_at,
      message: row.message,
      detailUrl: row.detail_url,
      unread: row.unread,
      actionState: row.action_state,
      buyerName: row.buyer_name,
      listingTitle: row.listing_title,
      listingId: row.listing_id,
    }));

    return NextResponse.json({ success: true, notifications });
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
    const { device_id, type, title, message, detail_url, action_state, buyer_name, listing_title, listing_id } = body;

    if (!device_id || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const supabase = createClient();
    const { error } = await withTimeout(
      supabase.from("notifications").insert([{
        id,
        device_id,
        type,
        title,
        message,
        detail_url: detail_url || null,
        unread: true,
        action_state: action_state || null,
        buyer_name: buyer_name || null,
        listing_title: listing_title || null,
        listing_id: listing_id || null,
      }]),
      SUPABASE_TIMEOUT_MS
    );

    if (error) {
      console.error("创建通知出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("连接 Supabase 失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, device_id, unread, action_state, message } = body;

    if (!device_id) {
      return NextResponse.json({ success: false, error: "Missing device_id" }, { status: 400 });
    }

    const supabase = createClient();
    const updates: Record<string, unknown> = {};

    if (unread !== undefined) updates.unread = unread;
    if (action_state !== undefined) updates.action_state = action_state;
    if (message !== undefined) updates.message = message;

    let query = supabase.from("notifications").update(updates).eq("device_id", device_id);

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("unread", true);
    }

    const { error } = await withTimeout(query, SUPABASE_TIMEOUT_MS);

    if (error) {
      console.error("更新通知出错:", error.message);
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
    const { id, device_id } = body;

    if (!device_id) {
      return NextResponse.json({ success: false, error: "Missing device_id" }, { status: 400 });
    }

    const supabase = createClient();
    let query = supabase.from("notifications").delete().eq("device_id", device_id);

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("unread", false);
    }

    const { error } = await withTimeout(query, SUPABASE_TIMEOUT_MS);

    if (error) {
      console.error("删除通知出错:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("连接 Supabase 失败:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}
