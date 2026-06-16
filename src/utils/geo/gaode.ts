interface GaodeRegeoResult {
  status: string;
  info?: string;
  regeocode?: {
    addressComponent: {
      city: string | string[];
      province: string;
      district: string;
    };
  };
}

interface GaodeIpResult {
  status: string;
  info?: string;
  province?: string;
  city?: string;
}

const TIMEOUT_MS = 5000;

/**
 * 高德逆地理编码：将经纬度解析为城市/省份。
 * https://lbs.amap.com/api/webservice/guide/api/georegeo
 */
function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function gaodeReverseGeocode(
  lat: number,
  lng: number,
  key: string
): Promise<{ city: string; province: string } | null> {
  try {
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${encodeURIComponent(
      key
    )}&location=${lng},${lat}&extensions=base`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const text = await res.text();
    const data = safeJsonParse<GaodeRegeoResult>(text);
    if (data?.status === "1" && data.regeocode) {
      const rawCity = data.regeocode.addressComponent.city;
      const city = Array.isArray(rawCity)
        ? rawCity.length > 0 ? String(rawCity[0]) : ""
        : String(rawCity || "");
      if (!city) return null;
      return {
        city,
        province: String(data.regeocode.addressComponent.province || ""),
      };
    }
  } catch {
    /* 静默失败，由调用方兜底 */
  }
  return null;
}

/**
 * 高德 IP 定位：根据 IP 解析城市/省份。
 * https://lbs.amap.com/api/webservice/guide/api/ipconfig
 */
export async function gaodeIpLocate(
  ip: string | null,
  key: string
): Promise<{ city: string; province: string } | null> {
  try {
    const params = new URLSearchParams({ key });
    if (ip) params.set("ip", ip);
    const url = `https://restapi.amap.com/v3/ip?${params.toString()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const text = await res.text();
    const data = safeJsonParse<GaodeIpResult>(text);
    if (data?.status === "1" && data.city) {
      const rawCity = Array.isArray(data.city)
        ? data.city.length > 0 ? String(data.city[0]) : ""
        : String(data.city);
      if (!rawCity) return null;
      const province = Array.isArray(data.province)
        ? data.province.length > 0 ? String(data.province[0]) : ""
        : String(data.province || "");
      return { city: rawCity, province };
    }
  } catch {
    /* 静默失败，由调用方兜底 */
  }
  return null;
}
