"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MattressListing, MattressSize, MattressMaterial, MattressCondition } from "@/types";
import { useAppContext } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CityChooseModal from "@/components/CityChooseModal";

import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Award,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface CityBrowseClientProps {
  citySlug: string;
  initialListings: MattressListing[];
}

const SIZE_OPTIONS: MattressSize[] = ["1.2m", "1.5m", "1.8m", "King", "Custom"];
const MATERIAL_OPTIONS: MattressMaterial[] = ["Spring", "Latex", "Memory Foam", "Hybrid"];
const CONDITION_OPTIONS: { value: MattressCondition; label: string }[] = [
  { value: "Brand New", label: "全新" },
  { value: "Like New", label: "极好" },
  { value: "Very Good", label: "自用" },
];

const SIZE_LABELS: Record<MattressSize, string> = {
  "1.2m": "1.2m 单人床",
  "1.5m": "1.5m 双人床",
  "1.8m": "1.8m 豪华床",
  "King": "King",
  "Custom": "Custom",
};

const MATERIAL_LABELS: Record<MattressMaterial, string> = {
  "Spring": "独立袋装弹簧",
  "Latex": "天然乳胶",
  "Memory Foam": "慢回弹记忆棉",
  "Hybrid": "复合混合",
};

function CityBrowseInner({ citySlug, initialListings }: CityBrowseClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    favorites,
    toggleFavorite,
    unreadNotifCount,
    changeCity,
  } = useAppContext();

  const cityKey = citySlug.charAt(0).toUpperCase() + citySlug.slice(1).toLowerCase();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSize, setSelectedSize] = useState<MattressSize | "All">(
    (searchParams.get("size") as MattressSize) || "All"
  );
  const [selectedMaterial, setSelectedMaterial] = useState<MattressMaterial | "All">(
    (searchParams.get("material") as MattressMaterial) || "All"
  );
  const [selectedCondition, setSelectedCondition] = useState<MattressCondition | "All">(
    (searchParams.get("condition") as MattressCondition) || "All"
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState<"default" | "priceAsc" | "priceDesc">(
    (searchParams.get("sort") as "default" | "priceAsc" | "priceDesc") || "default"
  );

  const [showCityModal, setShowCityModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [mergedListings, setMergedListings] = useState<MattressListing[]>(initialListings);

  const updateURL = useCallback((params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "default" && value !== "") {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("restored_listings_v1");
      if (stored) {
        const localListings: MattressListing[] = JSON.parse(stored);
        const localForCity = localListings.filter(
          (item) => item.city.toLowerCase() === citySlug.toLowerCase()
        );
        if (localForCity.length > 0) {
          const serverIds = new Set(initialListings.map((l) => l.id));
          const uniqueLocal = localForCity.filter((l) => !serverIds.has(l.id));
          if (uniqueLocal.length > 0) {
            setMergedListings([...uniqueLocal, ...initialListings]);
          }
        }
      }
    } catch {}
  }, [initialListings, citySlug]);

  useEffect(() => {
    document.cookie = `city_slug=${citySlug.toLowerCase()}; path=/; max-age=31536000`;
  }, [citySlug]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL({ q: value });
  };

  const handleSizeChange = (value: MattressSize | "All") => {
    setSelectedSize(value);
    updateURL({ size: value });
  };

  const handleMaterialChange = (value: MattressMaterial | "All") => {
    setSelectedMaterial(value);
    updateURL({ material: value });
  };

  const handleConditionChange = (value: MattressCondition | "All") => {
    setSelectedCondition(value);
    updateURL({ condition: value });
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    updateURL({ minPrice: value });
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    updateURL({ maxPrice: value });
  };

  const handleSortChange = (value: "default" | "priceAsc" | "priceDesc") => {
    setSortBy(value);
    updateURL({ sort: value });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSize("All");
    setSelectedMaterial("All");
    setSelectedCondition("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
    router.replace(window.location.pathname, { scroll: false });
  };

  const hasActiveFilters = searchQuery ||
    selectedSize !== "All" ||
    selectedMaterial !== "All" ||
    selectedCondition !== "All" ||
    minPrice ||
    maxPrice ||
    sortBy !== "default";

  const currentListings = useMemo(() => {
    let list = mergedListings.filter(
      (item) => item.city.toLowerCase() === citySlug.toLowerCase()
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.brand.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (selectedSize !== "All") {
      list = list.filter((item) => item.size === selectedSize);
    }

    if (selectedMaterial !== "All") {
      list = list.filter((item) => item.material === selectedMaterial);
    }

    if (selectedCondition !== "All") {
      list = list.filter((item) => item.condition === selectedCondition);
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      list = list.filter((item) => item.price >= min);
    }
    if (!isNaN(max)) {
      list = list.filter((item) => item.price <= max);
    }

    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [mergedListings, citySlug, searchQuery, selectedSize, selectedMaterial, selectedCondition, minPrice, maxPrice, sortBy]);

  const handleCityChange = (newCitySlug: string) => {
    setShowCityModal(false);
    changeCity(newCitySlug);
  };

  const handleCardClick = (id: string) => {
    router.push(`/listing/${id}`);
  };

  const activeFilterCount = [
    searchQuery,
    selectedSize !== "All" ? selectedSize : null,
    selectedMaterial !== "All" ? selectedMaterial : null,
    selectedCondition !== "All" ? selectedCondition : null,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      <Header
        currentCity={cityKey}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      <main className="flex-grow pb-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          
          <section className="relative rounded-3xl bg-neutral-900 text-white overflow-hidden py-16 px-8 md:py-20 md:px-12 mb-10 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black opacity-90 z-0" />
            
            <div className="relative z-10 max-w-xl text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-[12px] font-bold px-3.5 py-1.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>极致消毒，100% 颗粒安全保障</span>
              </div>
              
              <h1 className="font-headline font-bold text-3xl md:text-5xl tracking-tight leading-tight">
                极简寝具循环，<br />
                透明、卫生、无摩擦。
              </h1>
              
              <p className="text-gray-400 text-[14px] md:text-[15px] font-medium leading-relaxed">
                在 Restored 发现或上架经过深度紫外真空净化的优质二手大牌床垫。
                支持 15天 卫生安心审核，提供楼宇电梯托运直配。
              </p>
            </div>

            <div className="absolute bottom-8 right-8 z-10 hidden md:flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl">
              <Award className="w-8 h-8 text-[#E2E8F0]" />
              <div className="text-left select-none">
                <span className="block text-[11px] text-gray-400 font-bold tracking-widest uppercase">
                  已保洁 Verified
                </span>
                <span className="block text-[13px] font-semibold text-white">
                  423 张高档床垫已成交
                </span>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100 flex flex-col gap-5 text-left select-none">
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow bg-white border border-gray-200 focus-within:border-black rounded-xl px-4 py-3 flex items-center transition-all shadow-inner">
                <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="按品牌（席梦思、Tempur...）、材质或尺寸搜索本市闲置床垫"
                  className="w-full text-[14.5px] font-medium text-black bg-transparent outline-none p-0 border-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="text-gray-400 hover:text-black border-0 bg-transparent p-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as "default" | "priceAsc" | "priceDesc")}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 outline-none focus:border-black cursor-pointer shadow-sm min-w-[140px]"
              >
                <option value="default">默认排序</option>
                <option value="priceAsc">价格：低到高</option>
                <option value="priceDesc">价格：高到低</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>筛选</span>
                {activeFilterCount > 0 && (
                  <span className="bg-black text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className={`flex flex-col gap-4 border-t border-gray-200/60 pt-4 ${showFilters ? "block" : "hidden md:block"}`}>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-1">
                  价格区间:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    placeholder="最低价"
                    className="w-24 bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-1.5 text-[13px] font-medium text-black outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                    placeholder="最高价"
                    className="w-24 bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-1.5 text-[13px] font-medium text-black outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-1">
                  床垫尺寸:
                </span>
                <button
                  onClick={() => handleSizeChange("All")}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                    selectedSize === "All"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  全部尺寸
                </button>
                {SIZE_OPTIONS.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeChange(sz)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                      selectedSize === sz
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {SIZE_LABELS[sz]}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-1">
                  材质分类:
                </span>
                <button
                  onClick={() => handleMaterialChange("All")}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                    selectedMaterial === "All"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  所有材质
                </button>
                {MATERIAL_OPTIONS.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => handleMaterialChange(mat)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                      selectedMaterial === mat
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {MATERIAL_LABELS[mat]}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-1">
                  成色状况:
                </span>
                <button
                  onClick={() => handleConditionChange("All")}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                    selectedCondition === "All"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  所有成色
                </button>
                {CONDITION_OPTIONS.map((cond) => (
                  <button
                    key={cond.value}
                    onClick={() => handleConditionChange(cond.value)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                      selectedCondition === cond.value
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="ml-auto text-[12px] font-bold text-gray-500 hover:text-black flex items-center gap-1.5 underline underline-offset-4 cursor-pointer border-0 bg-transparent p-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重置筛选</span>
                  </button>
                )}
              </div>

            </div>
          </section>

          <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-3 select-none text-left">
            <h2 className="font-headline font-bold text-xl text-black">
              {cityKey === "Hangzhou" ? "杭州滨江与西湖在售" : "北京朝阳与海淀在售"} ({currentListings.length})
            </h2>
            <span className="text-[13px] text-gray-400 font-semibold uppercase">
              实时检测通过
            </span>
          </div>

          {currentListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isBookmarked={favorites.includes(listing.id)}
                  onBookmarkToggle={(id, e) => {
                    e.stopPropagation();
                    toggleFavorite(id);
                  }}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-[#f9f9f9]/50 max-w-md mx-auto mt-4">
              <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-semibold text-lg mb-1 select-none">
                没有找到符合条件的床垫
              </h3>
              <p className="text-gray-400 text-[13.5px] mb-6 font-medium max-w-xs mx-auto select-none">
                可以尝试缩短搜索词，或清除尺寸/材质的筛选条件重新搜索。
              </p>
              <button
                onClick={resetFilters}
                className="bg-black text-white hover:bg-neutral-850 text-[13px] font-bold px-6 py-2.5 rounded-full select-none cursor-pointer transition-all border-0"
              >
                清除所有筛选条件
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer currentCity={citySlug} />

      {showCityModal && (
        <CityChooseModal
          currentCity={cityKey}
          onClose={() => setShowCityModal(false)}
          onSelectCity={handleCityChange}
        />
      )}
    </div>
  );
}

export default function CityBrowseClient(props: CityBrowseClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">加载中...</div>}>
      <CityBrowseInner {...props} />
    </Suspense>
  );
}
