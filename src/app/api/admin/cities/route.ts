import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/utils/db";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { invalidateCityCache } from "@/lib/city-cache";
import { pinyin } from "pinyin-pro";

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

function makePinyin(name: string): string {
  return pinyin(name.replace(/[市州区盟县]$/, ""), { toneType: "none", type: "array" })
    .join("")
    .toLowerCase();
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const region = searchParams.get("region") || "";

  const supabase = createServiceRoleClient();

  let query = supabase.from("cities").select("*");

  if (search) {
    const clean = search.trim().toLowerCase();
    query = query.or(
      `name.ilike.%${clean}%,slug.ilike.%${clean}%,pinyin.ilike.%${clean}%`
    );
  }
  if (region) {
    query = query.eq("region", region);
  }

  query = query.order("is_hot", { ascending: false }).order("slug");

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    const { syncCities } = await import("@/lib/cities-db");
    const syncResult = await syncCities(supabase);
    if (syncResult.success) {
      const retry = await supabase.from("cities").select("*").order("is_hot", { ascending: false }).order("slug");
      if (!retry.error && retry.data && retry.data.length > 0) {
        return NextResponse.json({ success: true, cities: retry.data, total: retry.data.length });
      }
    }
  }

  return NextResponse.json({ success: true, cities: data || [], total: (data || []).length });
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { name, slug, region, is_hot, district_label, is_active } = body;

  if (!name || !slug) {
    return NextResponse.json({ success: false, error: "name 和 slug 为必填" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const row = {
    id: slug.toLowerCase(),
    name,
    slug: slug.toLowerCase(),
    pinyin: makePinyin(name),
    pinyin_full: pinyin(name, { toneType: "none", type: "array" }).join(" ").toLowerCase(),
    region: region || null,
    is_hot: !!is_hot,
    district_label: district_label || null,
    is_active: is_active !== false,
  };

  const { error } = await supabase.from("cities").insert(row);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ success: false, error: `城市 ${slug} 已存在` }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  invalidateCityCache();
  return NextResponse.json({ success: true, city: row });
}
