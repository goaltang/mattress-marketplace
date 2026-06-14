import { NextResponse, type NextRequest } from "next/server";
import { resolveCitySlug, normalizeCityName } from "@/utils/geo";
import { gaodeIpLocate, gaodeReverseGeocode } from "@/utils/geo/gaode";
import { createPublicClient } from "@/utils/supabase/public";
import { isSupabaseConfigured } from "@/utils/db";
import { getCities } from "@/lib/cities-db";
import { City } from "@/config/cities";

export interface LocateResult {
  success: boolean;
  slug: string;
  name: string;
  source: "h5" | "ip" | "none";
  confidence: "high" | "medium" | "low";
  reason?: string;
}

const TIMEOUT_MS = 5000;

async function loadActiveCities(): Promise<City[]> {
  if (!isSupabaseConfigured()) {
    const { ALL_CITIES } = await import("@/config/cities");
    return ALL_CITIES.filter((c) => c.isActive !== false);
  }

  try {
    const supabase = createPublicClient();
    const result = await getCities(supabase, { activeOnly: true, limit: 500 });
    if (result.success && result.cities && result.cities.length > 0) {
      return result.cities;
    }
  } catch (err) {
    console.error("[locate] 从 Supabase 加载 cities 失败:", err);
  }

  const { ALL_CITIES } = await import("@/config/cities");
  return ALL_CITIES.filter((c) => c.isActive !== false);
}

function getClientIp(request: NextRequest): string | null {
  let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "localhost") {
    return null;
  }
  return ip;
}

async function tryIpApi(ip: string | null): Promise<{ city: string; province: string; rawCity: string } | null> {
  try {
    const url = ip
      ? `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,message,city,regionName,query`
      : `http://ip-api.com/json/?lang=zh-CN&fields=status,message,city,regionName,query`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data = await res.json();
    if (data.status === "success" && data.city) {
      return { city: data.city, province: data.regionName || "", rawCity: data.city };
    }
  } catch {
    /* 静默失败 */
  }
  return null;
}

async function tryIpInfo(ip: string | null): Promise<{ city: string; province: string; rawCity: string } | null> {
  try {
    const url = ip
      ? `https://ipinfo.io/${encodeURIComponent(ip)}/json`
      : `https://ipinfo.io/json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data = await res.json();
    if (data.city) {
      return { city: data.city, province: data.region || "", rawCity: data.city };
    }
  } catch {
    /* 静默失败 */
  }
  return null;
}

interface IpLocateResult {
  city: string;
  province: string;
  rawCity: string;
  service: "gaode" | "ip-api" | "ipinfo";
}

async function ipLocate(ip: string | null): Promise<IpLocateResult | null> {
  const isDev = process.env.NODE_ENV !== "production";
  const log = (msg: string) => {
    if (isDev) console.log(`[locate] ${msg}`);
  };

  // 1. 国内高德 IP 定位（需配置 Key）
  const gaodeKey = process.env.GAODE_IP_KEY;
  if (gaodeKey) {
    const gaodeResult = await gaodeIpLocate(ip, gaodeKey);
    if (gaodeResult?.city) {
      log(`gaode ok: ${gaodeResult.city}`);
      return { ...gaodeResult, rawCity: gaodeResult.city, service: "gaode" };
    }
    log(`gaode empty or failed: ${JSON.stringify(gaodeResult)}`);
  }

  // 2. ip-api
  const ipApiResult = await tryIpApi(ip);
  if (ipApiResult) {
    log(`ip-api ok: ${ipApiResult.rawCity}`);
    return { ...ipApiResult, service: "ip-api" };
  }
  log("ip-api empty or failed");

  // 3. ipinfo.io
  const ipInfoResult = await tryIpInfo(ip);
  if (ipInfoResult) {
    log(`ipinfo ok: ${ipInfoResult.rawCity}`);
    return { ...ipInfoResult, service: "ipinfo" };
  }
  log("ipinfo empty or failed");

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "auto";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const ip = getClientIp(request);

  const activeCities = await loadActiveCities();

  // H5 模式：使用客户端经纬度
  if (source === "h5" && lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      const gaodeKey = process.env.GAODE_REGEO_KEY || process.env.GAODE_IP_KEY;
      let locatedCity = "";

      if (gaodeKey) {
        const raw = await gaodeReverseGeocode(latitude, longitude, gaodeKey);
        if (raw?.city) {
          locatedCity = normalizeCityName(raw.city, activeCities);
        }
      }

      const slug = locatedCity
        ? resolveCitySlug(locatedCity, activeCities)
        : null;
      if (slug) {
        const displayName =
          activeCities.find((c) => c.slug === slug)?.name || locatedCity;
        return NextResponse.json({
          success: true,
          slug,
          name: displayName,
          source: "h5",
          confidence: "high",
        } satisfies LocateResult);
      }

      // H5 解析失败则降级到 IP 定位
      const fallback = await ipLocate(ip);
      if (fallback) {
        const fallbackName = normalizeCityName(fallback.city, activeCities);
        const fallbackSlug = resolveCitySlug(fallbackName, activeCities);
        if (fallbackSlug) {
          const displayName =
            activeCities.find((c) => c.slug === fallbackSlug)?.name ||
            fallbackName;
          return NextResponse.json({
            success: true,
            slug: fallbackSlug,
            name: displayName,
            source: "ip",
            confidence: "medium",
            reason: "h5_reverse_geocode_failed",
          } satisfies LocateResult);
        }
      }

      return NextResponse.json({
        success: false,
        slug: "",
        name: "",
        source: "none",
        confidence: "low",
        reason: "h5_city_not_supported",
      } satisfies LocateResult);
    }
  }

  // IP 模式 / auto 模式
  const result = await ipLocate(ip);
  if (result) {
    const name = normalizeCityName(result.city, activeCities);
    const slug = resolveCitySlug(name, activeCities);
    if (slug) {
      const displayName =
        activeCities.find((c) => c.slug === slug)?.name || name;
      return NextResponse.json({
        success: true,
        slug,
        name: displayName,
        source: "ip",
        confidence: "medium",
      } satisfies LocateResult);
    }
    return NextResponse.json({
      success: false,
      slug: "",
      name: "",
      source: "ip",
      confidence: "low",
      reason: `ip_city_not_supported:${result.service}:${result.rawCity}`,
    } satisfies LocateResult);
  }

  return NextResponse.json({
    success: false,
    slug: "",
    name: "",
    source: "none",
    confidence: "low",
    reason: "all_locate_methods_failed",
  } satisfies LocateResult);
}
