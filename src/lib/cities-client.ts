import { City } from "@/config/cities";

export interface FetchCitiesOptions {
  activeOnly?: boolean;
  hotOnly?: boolean;
  region?: string;
  search?: string;
  limit?: number;
}

export interface FetchCitiesResult {
  success: boolean;
  cities?: City[];
  source?: "supabase" | "static";
  error?: string;
}

/**
 * 客户端从 /api/cities 获取城市数据。
 * 当 Supabase 未配置或接口失败时，服务端会自动降级到静态数据。
 */
export async function fetchCities(
  options: FetchCitiesOptions = {}
): Promise<FetchCitiesResult> {
  const params = new URLSearchParams();
  if (options.activeOnly === false) params.set("active_only", "false");
  if (options.hotOnly) params.set("hot_only", "true");
  if (options.region) params.set("region", options.region);
  if (options.search) params.set("search", options.search);
  if (options.limit) params.set("limit", String(options.limit));

  const query = params.toString();
  const url = `/api/cities${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      success: data.success,
      cities: data.cities || [],
      source: data.source,
      error: data.error,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
