"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MattressListing, MattressSize, MattressMaterial, MattressCondition } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { getCityName, getCityInfo } from "@/config/cities";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";
import CityChooseModal from "@/components/CityChooseModal";
import FilterSheet from "@/components/FilterSheet";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import EmptyState from "@/components/EmptyState";

import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Plus,
  Truck,
  ScanSearch,
  BadgeCheck,
  Star,
  Sparkles,
  TrendingDown,
  Clock,
  Quote,
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
  "King": "King",
  "Custom": "Custom",
};

const MATERIAL_LABELS: Record<MattressMaterial, string> = {
  "Spring": "独立袋装弹簧",
  "Latex": "天然乳胶",
  "Memory Foam": "慢回弹记忆棉",
  "Hybrid": "复合混合",
};

const MATERIAL_ICONS: Record<MattressMaterial, string> = {
  "Spring": "🔩",
  "Latex": "🌿",
  "Memory Foam": "☁️",
  "Hybrid": "⚡",
};

const MATERIAL_DESCRIPTIONS: Record<MattressMaterial, string> = {
  "Spring": "精准承托，独立袋装互不干扰",
  "Latex": "天然材质，透气抑菌防螨",
  "Memory Foam": "零压感贴合，释放身体压力",
  "Hybrid": "弹簧+泡棉，兼顾支撑与舒适",
};

const BRANDS = [
  { name: "Simmons", label: "席梦思" },
  { name: "Tempur-Pedic", label: "泰普尔" },
  { name: "Sealy", label: "丝涟" },
  { name: "Serta", label: "舒达" },
  { name: "King Koil", label: "金可儿" },
  { name: "Slumberland", label: "斯林百兰" },
];

const TESTIMONIALS = [
  {
    name: "张女士",
    city: "杭州",
    text: "买了一张 Simmons Black，到手跟新的一样，省了两万多。消毒报告很详细，放心。",
    rating: 5,
    avatar: "Z",
  },
  {
    name: "李先生",
    city: "北京",
    text: "搬家出掉了 Tempur 床垫，平台帮忙定价和拍照，三天就卖掉了，体验很好。",
    rating: 5,
    avatar: "L",
  },
  {
    name: "王同学",
    city: "上海",
    text: "留学生租房神器，花一千多买到乳胶床垫，比买新的划算太多了。",
    rating: 5,
    avatar: "W",
  },
  {
    name: "陈先生",
    city: "深圳",
    text: "电梯直配太方便了，师傅直接送到卧室，全程不用我动手。",
    rating: 5,
    avatar: "C",
  },
];

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

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function CityBrowseInner({ citySlug, initialListings, verifiedCount = 0 }: CityBrowseClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    favorites,
    toggleFavorite,
    unreadNotifCount,
    changeCity,
    syncRouteCity,
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

  const displayVerifiedCount = verifiedCount > 0 ? verifiedCount : currentListings.filter((l) => l.isHygieneVerified || l.isVerifiedClean).length;
  const totalListings = mergedListings.filter((l) => l.city.toLowerCase() === citySlug.toLowerCase()).length;
  const avgDiscount = totalListings > 0
    ? Math.round(
        mergedListings
          .filter((l) => l.city.toLowerCase() === citySlug.toLowerCase() && l.retailPrice)
          .reduce((acc, l) => acc + (1 - l.price / l.retailPrice!), 0)
          / Math.max(1, mergedListings.filter((l) => l.city.toLowerCase() === citySlug.toLowerCase() && l.retailPrice).length)
          * 100
      )
    : 72;

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

        {/* ========== HERO: 分屏布局 ========== */}
        <section className="relative overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50/40 dark:from-emerald-950/20 to-transparent pointer-events-none" />

          <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

              <div className="space-y-6 text-left">
                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span>12 项消毒检测 · 100% 颗粒安全保障</span>
                </div>

                <h1 className="font-headline font-extrabold text-4xl md:text-[56px] tracking-tight leading-[1.1] text-black dark:text-white">
                  让每张床垫<br />
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                    找到新归宿
                  </span>
                </h1>

                <p className="text-gray-500 dark:text-gray-400 text-[15px] md:text-[16px] font-medium leading-relaxed max-w-md">
                  {cityName}同城大牌二手床垫，经过深度紫外真空净化。
                  15 天卫生安心审核，楼宇电梯直配到家。
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#listings"
                    className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold text-[14px] px-7 py-3.5 rounded-full hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-lg shadow-black/10 dark:shadow-white/10"
                  >
                    <span>浏览 {totalListings} 张在售</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="/post"
                    className="inline-flex items-center gap-2 bg-white dark:bg-neutral-800 text-black dark:text-white font-bold text-[14px] px-7 py-3.5 rounded-full border-2 border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>免费发布</span>
                  </a>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {["bg-rose-400", "bg-amber-400", "bg-sky-400", "bg-emerald-400"].map((bg, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-neutral-900 flex items-center justify-center text-white text-[11px] font-bold`}>
                        {["张", "李", "王", "陈"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      {cityName}用户好评率 98%
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative hidden md:block">
                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50">
                  <Image
                    src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80"
                    alt="精选床垫展示"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                <div className="absolute -left-6 top-12 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-4 border border-gray-100 dark:border-neutral-700 animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">消毒认证</span>
                      <span className="block text-[14px] font-bold text-black dark:text-white">{displayVerifiedCount} 张已通过</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-16 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-4 border border-gray-100 dark:border-neutral-700 animate-in slide-in-from-right duration-700 delay-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">平均折扣</span>
                      <span className="block text-[14px] font-bold text-black dark:text-white">低至原价 {100 - avgDiscount}%</span>
                    </div>
                  </div>
                </div>

                <div className="absolute left-8 -bottom-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-4 border border-gray-100 dark:border-neutral-700 animate-in slide-in-from-bottom duration-700 delay-400">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">平均售出</span>
                      <span className="block text-[14px] font-bold text-black dark:text-white">3.2 天</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========== 信任数据条 ========== */}
        <section className="bg-black dark:bg-white text-white dark:text-black py-8 select-none" aria-label="平台数据">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: 2847, suffix: "+", label: "床垫已完成消毒流转" },
                { value: 98, suffix: "%", label: "买家满意度评分" },
                { value: 15, suffix: "天", label: "卫生安心审核期" },
                { value: 42, suffix: "城", label: "已覆盖服务城市" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[12px] md:text-[13px] font-medium text-white/60 dark:text-black/50 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 如何运作 ========== */}
        <section className="py-16 md:py-24 bg-white dark:bg-neutral-950 select-none" aria-label="平台流程">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-14">
              <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
                How It Works
              </span>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white">
                三步完成安心交易
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-neutral-700 to-transparent" />

              {[
                {
                  icon: <ScanSearch className="w-7 h-7" />,
                  step: "01",
                  title: "发现 & 筛选",
                  desc: "按品牌、材质、尺寸筛选同城在售床垫，查看高清实拍与消毒检测报告。",
                  color: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400",
                },
                {
                  icon: <ShieldCheck className="w-7 h-7" />,
                  step: "02",
                  title: "验证 & 下单",
                  desc: "每张床垫附带 12 项卫生检测评分。15 天审核期，不满意可退。",
                  color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
                },
                {
                  icon: <Truck className="w-7 h-7" />,
                  step: "03",
                  title: "直配到家",
                  desc: "同城电梯托运直配，专业搬运团队送进卧室，全程无需动手。",
                  color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
                },
              ].map((item, i) => (
                <div key={i} className="relative text-center group">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110 duration-300`}>
                    {item.icon}
                  </div>
                  <span className="block text-[11px] font-bold text-gray-300 dark:text-gray-600 tracking-[0.2em] uppercase mb-2">
                    Step {item.step}
                  </span>
                  <h3 className="font-headline font-bold text-xl text-black dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 品类快选 ========== */}
        <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900 select-none" aria-label="按材质浏览">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
                  Browse by Material
                </span>
                <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white">
                  按材质探索
                </h2>
              </div>
              <button
                onClick={resetFilters}
                className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
              >
                <span>查看全部</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {MATERIAL_OPTIONS.map((mat) => {
                const count = mergedListings.filter(
                  (l) => l.city.toLowerCase() === citySlug.toLowerCase() && l.material === mat
                ).length;
                return (
                  <button
                    key={mat}
                    onClick={() => {
                      handleMaterialChange(mat);
                      document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`group relative overflow-hidden rounded-2xl p-6 md:p-8 text-left cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      selectedMaterial === mat
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg"
                        : "bg-white dark:bg-neutral-800 text-black dark:text-white border-gray-100 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-500"
                    }`}
                  >
                    <span className="text-3xl md:text-4xl block mb-4 transition-transform group-hover:scale-110 duration-300">
                      {MATERIAL_ICONS[mat]}
                    </span>
                    <h3 className="font-headline font-bold text-lg mb-1">
                      {MATERIAL_LABELS[mat]}
                    </h3>
                    <p className={`text-[12px] font-medium leading-relaxed mb-4 ${
                      selectedMaterial === mat
                        ? "text-white/60 dark:text-black/50"
                        : "text-gray-400 dark:text-gray-500"
                    }`}>
                      {MATERIAL_DESCRIPTIONS[mat]}
                    </p>
                    <span className={`text-[12px] font-bold ${
                      selectedMaterial === mat
                        ? "text-white/80 dark:text-black/70"
                        : "text-gray-400 dark:text-gray-500"
                    }`}>
                      {count} 张在售
                    </span>
                    <ArrowRight className={`absolute bottom-6 right-6 w-5 h-5 transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                      selectedMaterial === mat
                        ? "text-white/60 dark:text-black/50"
                        : "text-gray-300 dark:text-gray-600"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== 热门品牌 ========== */}
        <section className="py-14 md:py-16 bg-white dark:bg-neutral-950 select-none" aria-label="合作品牌">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">
                Trusted Brands
              </span>
              <h2 className="font-headline font-bold text-xl text-black dark:text-white">
                覆盖全球高端寝具品牌
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {BRANDS.map((brand) => {
                const count = mergedListings.filter(
                  (l) => l.city.toLowerCase() === citySlug.toLowerCase() && l.brand.toLowerCase() === brand.name.toLowerCase()
                ).length;
                return (
                  <button
                    key={brand.name}
                    onClick={() => {
                      handleSearchChange(brand.name);
                      document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group flex flex-col items-center gap-2 px-6 py-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:shadow-md transition-all duration-300 cursor-pointer bg-transparent min-w-[120px]"
                  >
                    <span className="font-headline font-bold text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {brand.name}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      {brand.label} · {count} 张
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== 搜索 & 筛选 ========== */}
        <section className="py-10 md:py-14 bg-neutral-50 dark:bg-neutral-900" aria-label="搜索与筛选">
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

        {/* ========== 商品列表 ========== */}
        <section className="py-12 md:py-16 bg-white dark:bg-neutral-950">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div id="listings" className="flex items-center justify-between mb-8 select-none text-left">
              <div>
                <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-black dark:text-white tracking-tight">
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

        {/* ========== 用户评价 ========== */}
        <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900 select-none overflow-hidden" aria-label="用户评价">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
                Testimonials
              </span>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white">
                他们都在用 Restored
              </h2>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[300px] md:w-[340px] bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-gray-100 dark:border-neutral-700 text-left"
                >
                  <Quote className="w-8 h-8 text-gray-100 dark:text-neutral-700 mb-4" />
                  <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6">
                    {t.text}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-neutral-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 flex items-center justify-center text-white dark:text-black text-[13px] font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <span className="block text-[13px] font-bold text-black dark:text-white">{t.name}</span>
                      <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-medium">{t.city}用户</span>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA Banner ========== */}
        <section className="py-16 md:py-20 bg-black dark:bg-white text-white dark:text-black select-none">
          <div className="max-w-[800px] mx-auto px-4 md:px-6 text-center">
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl tracking-tight leading-tight mb-4">
              有闲置大牌床垫？
            </h2>
            <p className="text-white/60 dark:text-black/50 text-[15px] md:text-[16px] font-medium mb-8 max-w-md mx-auto">
              免费发布，平台帮你定价、拍照、消毒检测。平均 3 天售出。
            </p>
            <a
              href="/post"
              className="inline-flex items-center gap-2 bg-white dark:bg-black text-black dark:text-white font-bold text-[15px] px-8 py-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>立即免费发布</span>
            </a>
          </div>
        </section>

      </main>

      <Footer currentCity={citySlug} />

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
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">加载中...</span>
        </div>
      </div>
    }>
      <CityBrowseInner {...props} />
    </Suspense>
  );
}
