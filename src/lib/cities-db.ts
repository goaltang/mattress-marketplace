import { SupabaseClient } from "@supabase/supabase-js";
import {
  HOT_CITIES,
  generateCitiesFromDatabase,
  City,
} from "@/config/cities";

export interface CityRow {
  id: string;
  name: string;
  slug: string;
  pinyin: string;
  pinyin_full: string | null;
  region: string | null;
  is_hot: boolean;
  district_label: string | null;
  is_active: boolean;
}

export interface GetCitiesOptions {
  activeOnly?: boolean;
  hotOnly?: boolean;
  region?: string;
  search?: string;
  limit?: number;
}

/**
 * 将运行时城市数据合并为可用于 Supabase upsert 的记录。
 * 热门城市保留人工维护的 districtLabel 与 isHot 属性。
 */
export function buildCityRows(): CityRow[] {
  const hotMap = new Map(HOT_CITIES.map((c) => [c.slug, c]));
  const dbCities = generateCitiesFromDatabase();

  const rows: CityRow[] = [];

  dbCities.forEach((city) => {
    const hot = hotMap.get(city.slug);
    rows.push({
      id: city.slug,
      name: city.name,
      slug: city.slug,
      pinyin: city.pinyin,
      pinyin_full: city.pinyinFull || null,
      region: city.region || null,
      is_hot: !!hot?.isHot,
      district_label: hot?.districtLabel || null,
      is_active: city.isActive ?? true,
    });
  });

  // 确保所有热门城市都被包含（理论上 DB 已覆盖，但做兜底）
  HOT_CITIES.forEach((hot) => {
    if (!rows.some((r) => r.slug === hot.slug)) {
      rows.push({
        id: hot.slug,
        name: hot.name,
        slug: hot.slug,
        pinyin: hot.pinyin,
        pinyin_full: null,
        region: hot.region || null,
        is_hot: true,
        district_label: hot.districtLabel || null,
        is_active: hot.isActive ?? true,
      });
    }
  });

  return rows;
}

/**
 * 将城市数据同步到 Supabase。
 */
export async function syncCities(supabase: SupabaseClient): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  const rows = buildCityRows();

  try {
    const { error } = await supabase
      .from("cities")
      .upsert(rows, { onConflict: "slug" });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: rows.length };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 从 Supabase 查询城市列表。
 */
export async function getCities(
  supabase: SupabaseClient,
  options: GetCitiesOptions = {}
): Promise<{ success: boolean; cities?: City[]; error?: string }> {
  const { activeOnly = true, hotOnly, region, search, limit = 500 } = options;

  try {
    let query = supabase.from("cities").select("*");

    if (activeOnly) {
      query = query.eq("is_active", true);
    }
    if (hotOnly) {
      query = query.eq("is_hot", true);
    }
    if (region) {
      query = query.eq("region", region);
    }
    if (search) {
      const clean = search.trim().toLowerCase();
      query = query.or(
        `name.ilike.%${clean}%,slug.ilike.%${clean}%,pinyin.ilike.%${clean}%,pinyin_full.ilike.%${clean}%`
      );
    }

    query = query.order("is_hot", { ascending: false }).order("slug").limit(limit);

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const cities: City[] = (data || []).map((row: CityRow) => ({
      name: row.name,
      slug: row.slug,
      pinyin: row.pinyin,
      pinyinFull: row.pinyin_full || undefined,
      region: row.region || undefined,
      isHot: row.is_hot,
      districtLabel: row.district_label || undefined,
      isActive: row.is_active,
    }));

    return { success: true, cities };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 根据 slug 从 Supabase 查询单个城市。
 */
export async function getCityBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ success: boolean; city?: City; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "City not found" };
    }

    const row = data as CityRow;
    return {
      success: true,
      city: {
        name: row.name,
        slug: row.slug,
        pinyin: row.pinyin,
        pinyinFull: row.pinyin_full || undefined,
        region: row.region || undefined,
        isHot: row.is_hot,
        districtLabel: row.district_label || undefined,
        isActive: row.is_active,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
