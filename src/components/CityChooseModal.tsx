"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Search, X, Check, RefreshCw } from "lucide-react";
import { HOT_CITIES, searchCities, City } from "@/config/cities";
import { useGeolocation, type GeolocationErrorCode } from "@/hooks/useGeolocation";

interface CityChooseModalProps {
  currentCity: string;
  onClose: () => void;
  onSelectCity: (slug: string) => void;
}

export default function CityChooseModal({
  currentCity,
  onClose,
  onSelectCity,
}: CityChooseModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [locateDebug, setLocateDebug] = useState<string | null>(null);
  const { locate: h5Locate, error: h5Error } = useGeolocation();

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchCities(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const ERROR_MESSAGES: Record<GeolocationErrorCode, string> = {
    PERMISSION_DENIED: "浏览器定位权限被拒绝，已为您切换为 IP 定位",
    POSITION_UNAVAILABLE: "无法获取当前位置，已为您切换为 IP 定位",
    TIMEOUT: "定位超时，已为您切换为 IP 定位",
    NOT_SUPPORTED: "当前浏览器不支持定位，已为您切换为 IP 定位",
  };

  const formatLocateReason = (reason: string): string => {
    if (reason.startsWith("ip_city_not_supported:")) {
      const parts = reason.split(":");
      const service = parts[1] || "ip";
      const rawCity = parts[2] || "";
      if (rawCity) {
        return `定位服务返回「${rawCity}」，暂未覆盖该城市（${service}）`;
      }
      return "当前网络环境无法识别城市，请手动选择";
    }
    if (reason === "all_locate_methods_failed") {
      return "所有定位服务均不可用，请手动选择城市";
    }
    if (reason === "h5_city_not_supported") {
      return "当前位置所在城市暂未开通服务，请手动选择附近城市";
    }
    return reason;
  };

  const handleIpLocate = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/locate?source=ip");
      const data = await res.json();
      if (data?.success && data.slug) {
        onSelectCity(data.slug);
        return true;
      }
      // 记录服务端返回的失败原因，便于排查
      if (data?.reason) {
        setLocateDebug(data.reason);
        setLocateError(formatLocateReason(data.reason));
      }
    } catch {
      /* IP 定位失败 */
    }
    return false;
  };

  const handleAutoLocate = async () => {
    setIsLocating(true);
    setLocateError(null);
    setLocateDebug(null);

    // 1. 优先 H5 定位
    const position = await h5Locate();
    if (position) {
      try {
        const res = await fetch(
          `/api/locate?source=h5&lat=${position.latitude}&lng=${position.longitude}`
        );
        const data = await res.json();
        if (data?.success && data.slug) {
          onSelectCity(data.slug);
          setIsLocating(false);
          return;
        }
        if (data?.reason) {
          setLocateDebug(data.reason);
          setLocateError(formatLocateReason(data.reason));
        }
      } catch {
        /* H5 定位解析失败，继续降级 */
      }
    }

    // 2. H5 失败/未授权时，降级到 IP 定位
    if (h5Error && !locateError) {
      setLocateError(ERROR_MESSAGES[h5Error]);
    }

    const ipSuccess = await handleIpLocate();
    if (ipSuccess) {
      setIsLocating(false);
      return;
    }

    if (!locateError) {
      setLocateError("定位失败，请手动选择城市");
    }
    setIsLocating(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="选择城市"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-black dark:text-white" />
            <h3 className="font-headline font-bold text-lg text-black dark:text-white select-none">选择交易城市 Selected City</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors border-0 bg-transparent"
            aria-label="关闭城市选择"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 flex-grow scrollbar-none">
          <p className="text-[13.5px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed select-none">
            Restored 专注于同城寝具循环。自动定位及热门快选将帮助您快速定位到本市在售的优质消杀二手床垫。
          </p>

          <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-black dark:text-white">优先定位 (H5 / IP 反地理编码)</h4>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">调用网络基站与地理位置服务自动判断所在城市</p>
              </div>
            </div>
            <button
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black disabled:bg-gray-300 dark:disabled:bg-gray-600 font-semibold rounded-lg text-xs transition-colors shrink-0 border-0 cursor-pointer"
            >
              {isLocating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <MapPin className="w-3 h-3" />
              )}
              <span>{isLocating ? "定位中..." : "自动定位"}</span>
            </button>
          </div>

          {locateError && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg px-3 py-2.5">
              {locateError}
            </div>
          )}

          {process.env.NODE_ENV === "development" && locateDebug && (
            <div className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg px-3 py-2 font-mono break-all">
              debug: {locateDebug}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="city-search"
              className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block"
            >
              输入框模糊匹配城市
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 pointer-events-none" />
              <input
                id="city-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索拼音或中文城市，如: wuxi 或 无锡"
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:border-black dark:focus:border-white rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none text-black dark:text-white transition-colors"
                aria-label="搜索城市"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white border-0 bg-transparent p-0 cursor-pointer"
                  aria-label="清除搜索"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery.trim() && (
              <div className="border border-gray-100 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 divide-y divide-gray-100 dark:divide-neutral-700 max-h-[140px] overflow-y-auto shadow-sm">
                {searchResults.length === 0 ? (
                  <p className="p-3 text-xs text-gray-400 dark:text-gray-500 text-center select-none">
                    暂未覆盖当前城市，消杀评测站建设中
                  </p>
                ) : (
                  searchResults.map((city) => (
                    <button
                      key={city.slug}
                      onClick={() => onSelectCity(city.slug)}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-colors flex justify-between items-center border-0 cursor-pointer"
                    >
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-wider">
                        {city.slug}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
              热门城市快选 Selected Cities
            </label>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="热门城市">
              {HOT_CITIES.map((city) => {
                const isActive = city.slug === currentCity.toLowerCase();
                return (
                  <button
                    key={city.slug}
                    onClick={() => onSelectCity(city.slug)}
                    role="radio"
                    aria-checked={isActive}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all border text-center cursor-pointer ${
                      isActive
                        ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black font-bold shadow-sm"
                        : "bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-neutral-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>{city.name}</span>
                      {isActive && <Check className="w-3 h-3 text-white dark:text-black" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4 rounded-xl text-left text-[11px] text-gray-400 dark:text-gray-500 font-medium shrink-0 mt-4 select-none">
          Restored 的消杀与仓储中心正在中国大陆主要节点快速搭建，所有列出城市均提供楼宇直配服务。
        </div>

      </div>
    </div>
  );
}
