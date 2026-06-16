import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/utils/db";
import { queryCities } from "@/lib/city-cache";
import { ALL_CITIES, searchCities as staticSearchCities } from "@/config/cities";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active_only") !== "false";
  const hotOnly = searchParams.get("hot_only") === "true";
  const region = searchParams.get("region") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "500", 10);

  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const cities = await queryCities({
        activeOnly,
        hotOnly,
        region: region || undefined,
        search: search || undefined,
        limit,
      });

      if (cities.length > 0) {
        return NextResponse.json({
          success: true,
          cities,
          source: "supabase",
        });
      }

      console.error("从 Supabase 查询 cities 为空，降级到静态数据");
    } catch (err) {
      console.error("连接 Supabase 查询 cities 失败，降级到静态数据:", err);
    }
  }

  let cities = ALL_CITIES;
  if (activeOnly) {
    cities = cities.filter((c) => c.isActive !== false);
  }
  if (hotOnly) {
    cities = cities.filter((c) => c.isHot);
  }
  if (region) {
    cities = cities.filter((c) => c.region === region);
  }
  if (search) {
    cities = staticSearchCities(search).filter((c) => cities.some((x) => x.slug === c.slug));
  }

  return NextResponse.json({
    success: true,
    cities: cities.slice(0, limit),
    source: "static",
  });
}
