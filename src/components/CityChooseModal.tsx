"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Search, X, Check, RefreshCw } from "lucide-react";
import { HOT_CITIES, searchCities, City } from "@/config/cities";

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

  // 模糊匹配城市
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchCities(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // H5 Geolocation 定位 + 模拟反地理编码
  const handleAutoLocate = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      setTimeout(() => {
        alert("您的浏览器不支持 H5 原生定位，已通过网络 IP 自动兜底定位到：杭州");
        onSelectCity("hangzhou");
        setIsLocating(false);
      }, 1000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 模拟腾讯/高德逆地理编码 API，成功解析出城市为杭州
        setTimeout(() => {
          alert(
            `GPS 定位成功！经纬度 (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})，反地理编码解析为：【杭州】`
          );
          onSelectCity("hangzhou");
          setIsLocating(false);
        }, 1200);
      },
      (error) => {
        console.warn("Location error:", error);
        // 兜底网络 IP 定位
        setTimeout(() => {
          alert("GPS 获取失败，已启用基站 IP 兜底，解析位置为：【北京】");
          onSelectCity("beijing");
          setIsLocating(false);
        }, 1200);
      },
      { timeout: 5000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
        
        {/* 头部标题 */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-black" />
            <h3 className="font-headline font-bold text-lg select-none">选择交易城市 Selected City</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-black cursor-pointer transition-colors border-0 bg-transparent"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 flex-grow scrollbar-none">
          <p className="text-[13.5px] text-gray-500 font-medium leading-relaxed select-none">
            Restored 专注于同城寝具循环。自动定位及热门快选将帮助您快速定位到本市在售的优质消杀二手床垫。
          </p>

          {/* 1. 优先定位 */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-black">优先定位 (H5 / IP 反地理编码)</h4>
                <p className="text-[11px] text-gray-400">调用网络基站与地理位置服务自动判断所在城市</p>
              </div>
            </div>
            <button
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white disabled:bg-gray-300 font-semibold rounded-lg text-xs transition-colors shrink-0 border-0 cursor-pointer"
            >
              {isLocating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <MapPin className="w-3 h-3" />
              )}
              <span>{isLocating ? "定位中..." : "自动定位"}</span>
            </button>
          </div>

          {/* 2. 搜索框模糊匹配 (兜底三四线城市) */}
          <div className="space-y-2">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
              输入框模糊匹配城市
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索拼音或中文城市，如: wuxi 或 无锡"
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 focus:border-black rounded-xl text-sm placeholder-gray-400 outline-none text-black transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-gray-400 hover:text-black border-0 bg-transparent p-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery.trim() && (
              <div className="border border-gray-100 rounded-xl bg-white divide-y divide-gray-100 max-h-[140px] overflow-y-auto shadow-sm">
                {searchResults.length === 0 ? (
                  <p className="p-3 text-xs text-gray-400 text-center select-none">
                    暂未覆盖当前城市，消杀评测站建设中
                  </p>
                ) : (
                  searchResults.map((city) => (
                    <button
                      key={city.slug}
                      onClick={() => onSelectCity(city.slug)}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-neutral-50 hover:text-black transition-colors flex justify-between items-center border-0 cursor-pointer"
                    >
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-gray-400 uppercase text-[10px] tracking-wider">
                        {city.slug}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 3. 热门城市快选 (一屏列出 20 城) */}
          <div className="space-y-3">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
              热门城市快选 Selected Cities
            </label>
            <div className="grid grid-cols-4 gap-2">
              {HOT_CITIES.map((city) => {
                const isActive = city.name.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={city.slug}
                    onClick={() => onSelectCity(city.slug)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all border text-center cursor-pointer ${
                      isActive
                        ? "bg-black border-black text-white font-bold shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>{city.name}</span>
                      {isActive && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-left text-[11px] text-gray-400 font-medium shrink-0 mt-4 select-none">
          Restored 的消杀与仓储中心正在中国大陆主要节点快速搭建，所有列出城市均提供楼宇直配服务。
        </div>

      </div>
    </div>
  );
}
