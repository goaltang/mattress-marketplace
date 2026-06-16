import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/utils/db";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { invalidateCityCache } from "@/lib/city-cache";

function checkAdmin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
    } catch {}
  }
  const adminKey = process.env.ADMIN_SYNC_KEY;
  if (!adminKey) return true;
  const authHeader = request.headers.get("x-admin-key");
  const urlKey = new URL(request.url).searchParams.get("key");
  return authHeader === adminKey || urlKey === adminKey;
}

interface RouteParams {
  params: { slug: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", params.slug.toLowerCase())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ success: false, error: "城市不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true, city: data });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { name, region, is_hot, district_label, is_active } = body;

  const supabase = createServiceRoleClient();

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (region !== undefined) updates.region = region || null;
  if (is_hot !== undefined) updates.is_hot = !!is_hot;
  if (district_label !== undefined) updates.district_label = district_label || null;
  if (is_active !== undefined) updates.is_active = !!is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "没有需要更新的字段" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cities")
    .update(updates)
    .eq("slug", params.slug.toLowerCase())
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ success: false, error: "城市不存在" }, { status: 404 });
  }

  invalidateCityCache();
  return NextResponse.json({ success: true, city: data });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("cities")
    .delete()
    .eq("slug", params.slug.toLowerCase());

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  invalidateCityCache();
  return NextResponse.json({ success: true, message: `城市 ${params.slug} 已删除` });
}
