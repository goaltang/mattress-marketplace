"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MattressListing, MattressSize, MattressMaterial, MattressCondition } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { getCityName, getCityInfo } from "@/config/cities";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";
import CityChooseModal from "@/components/CityChooseModal";
import LocationPrompt from "@/components/LocationPrompt";
import FilterSheet from "@/components/FilterSheet";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import EmptyState from "@/components/EmptyState";

import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface CityBrowseClientProps {
  citySlug: string;
  initialListings: MattressListing[];
  verifiedCount?: number;
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
  King: "King",
  Custom: "Custom",
};

const MATERIAL_LABELS: Record<MattressMaterial, string> = {
  Spring: "独立袋装弹簧",
  Latex: "天然乳胶",
  "Memory Foam": "慢回弹记忆棉",
  Hybrid: "复合混合",
};

const PRICE_MIN = 0;
const PRICE_MAX = 30000;
const FILTER_STORAGE_KEY = "restored_filters_v1";

interface FilterState {
  q: string;
  size: string;
  material: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

function loadFiltersFromSession(citySlug: string): FilterState | null {
  try {
    const stored = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed[citySlug] || null;
    }
  } catch {}
  return null;
}

function saveFiltersToSession(citySlug: string, filters: FilterState) {
  try {
    const stored = sessionStorage.getItem(FILTER_STORAGE_KEY);
    const all = stored ? JSON.parse(stored) : {};
    all[citySlug] = filters;
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

function CityBrowseInner({ citySlug, initialListings }: CityBrowseClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    favorites,
    toggleFavorite,
    unreadNotifCount,
    changeCity,
    syncRouteCity,
    suggestedCity,
    showLocationPrompt,
    dismissLocationPrompt,
  } = useAppContext();

  const cityInfo = getCityInfo(citySlug);
  const cityName = getCityName(citySlug);
  const districtLabel = cityInfo?.districtLabel || "全城";

  const savedFilters = useMemo(() => {
    const fromURL = {
      q: searchParams.get("q") || "",
      size: searchParams.get("size") || "",
      material: searchParams.get("material") || "",
      condition: searchParams.get("condition") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "",
    };
    const hasURLParams = Object.values(fromURL).some((v) => v !== "");
    if (hasURLParams) return fromURL;
    return loadFiltersFromSession(citySlug) || fromURL;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlug]);

  const [searchQuery, setSearchQuery] = useState(savedFilters.q);
  const [selectedSize, setSelectedSize] = useState<MattressSize | "All">(
    (savedFilters.size as MattressSize) || "All"
  );
  const [selectedMaterial, setSelectedMaterial] = useState<MattressMaterial | "All">(
    (savedFilters.material as MattressMaterial) || "All"
  );
  const [selectedCondition, setSelectedCondition] = useState<MattressCondition | "All">(
    (savedFilters.condition as MattressCondition) || "All"
  );
  const [minPrice, setMinPrice] = useState(savedFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(savedFilters.maxPrice);
  const [sortBy, setSortBy] = useState<"default" | "priceAsc" | "priceDesc">(
    (savedFilters.sort as "default" | "priceAsc" | "priceDesc") || "default"
  );

  const [showCityModal, setShowCityModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [mergedListings, setMergedListings] = useState<MattressListing[]>(initialListings);

  useEffect(() => {
    syncRouteCity(citySlug);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [citySlug, syncRouteCity]);

  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "All" && value !== "default" && value !== "") {
          url.searchParams.set(key, value);
        } else {
          url.searchParams.delete(key);
        }
      });
      router.replace(url.pathname + url.search, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    saveFiltersToSession(citySlug, {
      q: searchQuery,
      size: selectedSize,
      material: selectedMaterial,
      condition: selectedCondition,
      minPrice,
      maxPrice,
      sort: sortBy,
    });
  }, [citySlug, searchQuery, selectedSize, selectedMaterial, selectedCondition, minPrice, maxPrice, sortBy]);

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

  const hasActiveFilters =
    searchQuery ||
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
  }, [
    mergedListings,
    citySlug,
    searchQuery,
    selectedSize,
    selectedMaterial,
    selectedCondition,
    minPrice,
    maxPrice,
    sortBy,
  ]);

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

  const renderFilterPills = <T extends string>(
    label: string,
    options: { value: T; label: string }[],
    selected: T,
    onSelect: (value: T) => void,
    allLabel: string
  ) => (
    <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label={label}>
      <span className="text-[12px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider shrink-0 pr-1">
        {label}:
      </span>
      <button
        onClick={() => onSelect("All" as T)}
        role="radio"
        aria-checked={selected === "All"}
        className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
          selected === "All"
            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
            : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500"
        }`}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          role="radio"
          aria-checked={selected === opt.value}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
            selected === opt.value
              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
              : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const filterContent = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[12px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider shrink-0 pr-1">
          价格区间:
        </span>
        <div className="flex-grow">
          <PriceRangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            valueLow={minPrice}
            valueHigh={maxPrice}
            onChangeLow={handleMinPriceChange}
            onChangeHigh={handleMaxPriceChange}
          />
        </div>
      </div>

      {renderFilterPills(
        "床垫尺寸",
        SIZE_OPTIONS.map((sz) => ({ value: sz, label: SIZE_LABELS[sz] })),
        selectedSize,
        handleSizeChange,
        "全部尺寸"
      )}

      {renderFilterPills(
        "材质分类",
        MATERIAL_OPTIONS.map((mat) => ({ value: mat, label: MATERIAL_LABELS[mat] })),
        selectedMaterial,
        handleMaterialChange,
        "所有材质"
      )}

      <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label="成色状况">
        <span className="text-[12px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider shrink-0 pr-1">
          成色状况:
        </span>
        <button
          onClick={() => handleConditionChange("All")}
          role="radio"
          aria-checked={selectedCondition === "All"}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
            selectedCondition === "All"
              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
              : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500"
          }`}
        >
          所有成色
        </button>
        {CONDITION_OPTIONS.map((cond) => (
          <button
            key={cond.value}
            onClick={() => handleConditionChange(cond.value)}
            role="radio"
            aria-checked={selectedCondition === cond.value}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
              selectedCondition === cond.value
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500"
            }`}
          >
            {cond.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto text-[12px] font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 underline underline-offset-4 cursor-pointer border-0 bg-transparent p-0"
            aria-label="重置所有筛选条件"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置筛选</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white flex flex-col font-sans antialiased pt-24 md:pt-28">
      <Header
        currentCity={citySlug}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      <main className="flex-grow pb-24">
        {/* 城市标题 */}
        <section className="pt-8 pb-6 md:pt-10 md:pb-8 bg-white dark:bg-neutral-950">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-left">
            <h1 className="font-headline font-extrabold text-2xl md:text-3xl tracking-tight text-black dark:text-white">
              {cityName}二手床垫
            </h1>
            <p className="text-[14px] text-gray-400 dark:text-gray-500 font-medium mt-1">
              {districtLabel} · {currentListings.length} 张消毒床垫在售
            </p>
          </div>
        </section>

        {/* 搜索 & 筛选 */}
        <section className="py-4 md:py-6 bg-neutral-50 dark:bg-neutral-900" aria-label="搜索与筛选">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-gray-100 dark:border-neutral-700 flex flex-col gap-5 text-left select-none shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 focus-within:border-black dark:focus-within:border-white rounded-xl px-4 py-3 flex items-center transition-all">
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="按品牌（席梦思、Tempur...）、材质或尺寸搜索"
                    className="w-full text-[14.5px] font-medium text-black dark:text-white bg-transparent outline-none p-0 border-0"
                    aria-label="搜索床垫"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="text-gray-400 hover:text-black dark:hover:text-white border-0 bg-transparent p-0 cursor-pointer"
                      aria-label="清除搜索"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as "default" | "priceAsc" | "priceDesc")}
                  className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-black dark:focus:border-white cursor-pointer min-w-[140px]"
                  aria-label="排序方式"
                >
                  <option value="default">默认排序</option>
                  <option value="priceAsc">价格：低到高</option>
                  <option value="priceDesc">价格：高到低</option>
                </select>

                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="md:hidden flex items-center justify-center gap-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
                  aria-label="打开筛选面板"
                  aria-expanded={showMobileFilters}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>筛选</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:flex flex-col gap-4 border-t border-gray-100 dark:border-neutral-700 pt-4">
                {filterContent}
              </div>
            </div>
          </div>
        </section>

        {/* 商品列表 */}
        <section className="py-8 md:py-12 bg-white dark:bg-neutral-950">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-6 select-none text-left">
              <div>
                <h2 className="font-headline font-bold text-xl md:text-2xl text-black dark:text-white tracking-tight">
                  {cityName} · {districtLabel}
                </h2>
                <p className="text-[14px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                  {currentListings.length} 张消毒床垫在售 · 实时更新
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>实时检测通过</span>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : currentListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
              <EmptyState onReset={resetFilters} />
            )}
          </div>
        </section>
      </main>

      <Footer />

      {showLocationPrompt && suggestedCity && (
        <LocationPrompt
          cityName={suggestedCity.name}
          onConfirm={() => changeCity(suggestedCity.slug)}
          onDismiss={dismissLocationPrompt}
        />
      )}

      {showCityModal && (
        <CityChooseModal
          currentCity={citySlug}
          onClose={() => setShowCityModal(false)}
          onSelectCity={handleCityChange}
        />
      )}

      <FilterSheet
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        onReset={resetFilters}
        activeFilterCount={activeFilterCount}
      >
        {filterContent}
      </FilterSheet>
    </div>
  );
}

export default function CityBrowseClient(props: CityBrowseClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">加载中...</span>
          </div>
        </div>
      }
    >
      <CityBrowseInner {...props} />
    </Suspense>
  );
}
