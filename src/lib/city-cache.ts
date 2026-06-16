import { createPublicClient } from "@/utils/supabase/public";
import { isSupabaseConfigured } from "@/utils/db";
import { getCities, syncCities, type GetCitiesOptions } from "@/lib/cities-db";
import { City } from "@/config/cities";

const CACHE_TTL = 5 * 60 * 1000;

let cache: { data: City[]; ts: number } | null = null;

export async function loadActiveCities(): Promise<City[]> {
  const now = Date.now();
  if (cache && now - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  if (!isSupabaseConfigured()) {
    const { ALL_CITIES } = await import("@/config/cities");
    const cities = ALL_CITIES.filter((c) => c.isActive !== false);
    cache = { data: cities, ts: now };
    return cities;
  }

  try {
    const supabase = createPublicClient();
    const result = await getCities(supabase, { activeOnly: true, limit: 500 });
    if (result.success && result.cities && result.cities.length > 0) {
      cache = { data: result.cities, ts: now };
      return result.cities;
    }

    if (result.success && result.cities && result.cities.length === 0) {
      console.warn("[city-cache] Supabase cities 为空，自动触发 sync");
      const { createServiceRoleClient } = await import("@/utils/supabase/service-role");
      const syncResult = await syncCities(createServiceRoleClient());
      if (syncResult.success) {
        const retry = await getCities(supabase, { activeOnly: true, limit: 500 });
        if (retry.success && retry.cities && retry.cities.length > 0) {
          cache = { data: retry.cities, ts: now };
          return retry.cities;
        }
      }
    }
  } catch (err) {
    console.error("[city-cache] 从 Supabase 加载 cities 失败:", err);
  }

  const { ALL_CITIES } = await import("@/config/cities");
  const cities = ALL_CITIES.filter((c) => c.isActive !== false);
  cache = { data: cities, ts: now };
  return cities;
}

export async function queryCities(options: GetCitiesOptions): Promise<City[]> {
  if (!isSupabaseConfigured()) {
    const { ALL_CITIES, searchCities } = await import("@/config/cities");
    let cities = ALL_CITIES;
    if (options.activeOnly) cities = cities.filter((c) => c.isActive !== false);
    if (options.hotOnly) cities = cities.filter((c) => c.isHot);
    if (options.region) cities = cities.filter((c) => c.region === options.region);
    if (options.search) {
      const matched = searchCities(options.search);
      cities = cities.filter((c) => matched.some((m) => m.slug === c.slug));
    }
    return cities.slice(0, options.limit || 500);
  }

  try {
    const supabase = createPublicClient();
    const result = await getCities(supabase, options);
    if (result.success && result.cities) return result.cities;
  } catch (err) {
    console.error("[city-cache] queryCities 失败:", err);
  }

  return [];
}

export function invalidateCityCache(): void {
  cache = null;
}
