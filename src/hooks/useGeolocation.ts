"use client";

import { useState, useCallback } from "react";

export type GeolocationErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "NOT_SUPPORTED";

interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  isLoading: boolean;
  error: GeolocationErrorCode | null;
  locate: () => Promise<GeolocationResult | null>;
}

/**
 * 浏览器 H5 地理定位 Hook。
 * 优先在 HTTPS 环境下使用 navigator.geolocation。
 * 失败时返回细分错误码，供调用方降级到 IP 定位。
 */
export function useGeolocation(timeoutMs = 10000): UseGeolocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationErrorCode | null>(null);

  const locate = useCallback(async (): Promise<GeolocationResult | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("NOT_SUPPORTED");
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (err) => {
          setIsLoading(false);
          const codeMap: Record<number, GeolocationErrorCode> = {
            1: "PERMISSION_DENIED",
            2: "POSITION_UNAVAILABLE",
            3: "TIMEOUT",
          };
          const mapped = codeMap[err.code] || "POSITION_UNAVAILABLE";
          setError(mapped);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: timeoutMs,
          maximumAge: 5 * 60 * 1000, // 5 分钟内缓存可用
        }
      );
    });
  }, [timeoutMs]);

  return { isLoading, error, locate };
}
