import { NextResponse, type NextRequest } from "next/server";
import { resolveCitySlug, normalizeCityName } from "@/utils/geo";
import { gaodeIpLocate, gaodeReverseGeocode } from "@/utils/geo/gaode";
import { loadActiveCities } from "@/lib/city-cache";

export interface LocateResult {
  success: boolean;
  slug: string;
  name: string;
  source: "h5" | "ip" | "none";
  confidence: "high" | "medium" | "low";
  reason?: string;
}

const TIMEOUT_MS = 5000;
const IP_CACHE_TTL = 60 * 60 * 1000;
const IP_CACHE_MAX = 1000;

interface IpLocateResult {
  city: string;
  province: string;
  rawCity: string;
  service: "gaode" | "ip-api" | "ipinfo";
}

const ipCache = new Map<string, { data: IpLocateResult; ts: number }>();

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
      ? `https://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,message,city,regionName,query`
      : `https://ip-api.com/json/?lang=zh-CN&fields=status,message,city,regionName,query`;
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

async function ipLocate(ip: string | null): Promise<IpLocateResult | null> {
  const isDev = process.env.NODE_ENV !== "production";
  const log = (msg: string) => {
    if (isDev) console.log(`[locate] ${msg}`);
  };

  const cacheKey = ip || "__no_ip__";
  const now = Date.now();
  const cached = ipCache.get(cacheKey);
  if (cached && now - cached.ts < IP_CACHE_TTL) {
    log(`cache hit: ${cached.data.city} (${cached.data.service})`);
    return cached.data;
  }

  const candidates: Promise<IpLocateResult>[] = [];

  const gaodeKey = process.env.GAODE_IP_KEY;
  if (gaodeKey) {
    candidates.push(
      gaodeIpLocate(ip, gaodeKey).then((r) => {
        if (r?.city) return { ...r, rawCity: r.city, service: "gaode" as const };
        throw new Error("gaode empty");
      })
    );
  }

  candidates.push(
    tryIpApi(ip).then((r) => {
      if (r) return { ...r, service: "ip-api" as const };
      throw new Error("ip-api empty");
    })
  );

  candidates.push(
    tryIpInfo(ip).then((r) => {
      if (r) return { ...r, service: "ipinfo" as const };
      throw new Error("ipinfo empty");
    })
  );

  try {
    const result = await Promise.any(candidates);
    log(`${result.service} ok: ${result.city}`);
    if (ipCache.size >= IP_CACHE_MAX) {
      const oldest = ipCache.keys().next().value;
      if (oldest) ipCache.delete(oldest);
    }
    ipCache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch {
    log("all ip locate methods failed");
    return null;
  }
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
