"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MattressListing, MattressSize, MattressMaterial } from "@/types";
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
} from "lucide-react";

interface CityBrowseClientProps {
  citySlug: string;
  initialListings: MattressListing[];
}

export default function CityBrowseClient({ citySlug, initialListings }: CityBrowseClientProps) {
  const router = useRouter();
  const {
    favorites,
    toggleFavorite,
    unreadNotifCount,
    changeCity,
  } = useAppContext();

  // 城市展示大写名称
  const cityKey = citySlug.charAt(0).toUpperCase() + citySlug.slice(1).toLowerCase();

  // 搜索和过滤状态
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState<MattressSize | "All">("All");
  const [selectedMaterial, setSelectedMaterial] = useState<MattressMaterial | "All">("All");
  const [sortBy, setSortBy] = useState<"default" | "priceAsc" | "priceDesc">("default");

  // 城市选择弹窗
  const [showCityModal, setShowCityModal] = useState(false);

  // 写入 Cookie 供 Middleware 识别（仅在挂载时运行一次，保持用户城市喜好）
  useEffect(() => {
    document.cookie = `city_slug=${citySlug.toLowerCase()}; path=/; max-age=31536000`;
  }, [citySlug]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSize("All");
    setSelectedMaterial("All");
    setSortBy("default");
  };

  // 过滤商品列表 (使用 useMemo)
  const currentListings = useMemo(() => {
    // 1. 过滤当前城市商品（服务端虽然已经过滤过，但我们在这里双重保证）
    let list = initialListings.filter(
      (item) => item.city.toLowerCase() === citySlug.toLowerCase()
    );

    // 2. 搜索词匹配
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

    // 3. 尺寸筛选
    if (selectedSize !== "All") {
      list = list.filter((item) => item.size === selectedSize);
    }

    // 4. 材质筛选
    if (selectedMaterial !== "All") {
      list = list.filter((item) => item.material === selectedMaterial);
    }

    // 5. 排序方式
    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [initialListings, citySlug, searchQuery, selectedSize, selectedMaterial, sortBy]);

  // 切换城市跳转，由全局 Context 统一进行跳转和状态更新
  const handleCityChange = (newCitySlug: string) => {
    setShowCityModal(false);
    changeCity(newCitySlug);
  };

  // 商品卡片点击进入详情页
  const handleCardClick = (id: string) => {
    router.push(`/listing/${id}`);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      {/* 头部固定导航 */}
      <Header
        currentCity={cityKey}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      {/* 核心工作流 */}
      <main className="flex-grow pb-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          
          {/* 大 Banner 宣传 */}
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

          {/* 搜索与过滤板块 */}
          <section className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100 flex flex-col gap-5 text-left select-none">
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow bg-white border border-gray-200 focus-within:border-black rounded-xl px-4 py-3 flex items-center transition-all shadow-inner">
                <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="按品牌（席梦思、Tempur...）、材质或尺寸搜索本市闲置床垫"
                  className="w-full text-[14.5px] font-medium text-black bg-transparent outline-none p-0 border-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-black border-0 bg-transparent p-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "priceAsc" | "priceDesc")}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 outline-none focus:border-black cursor-pointer shadow-sm min-w-[140px]"
              >
                <option value="default">默认排序</option>
                <option value="priceAsc">价格：低到高</option>
                <option value="priceDesc">价格：高到低</option>
              </select>
            </div>

            <div className="flex flex-col gap-4 border-t border-gray-200/60 pt-4">
              
              {/* 尺寸过滤 Chips */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-1">
                  床垫尺寸:
                </span>
                <button
                  onClick={() => setSelectedSize("All")}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                    selectedSize === "All"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  全部尺寸
                </button>
                {(["1.2m", "1.5m", "1.8m", "King", "Custom"] as MattressSize[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                      selectedSize === sz
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {sz === "1.2m"
                      ? "1.2m 单人床"
                      : sz === "1.5m"
                      ? "1.5m 双人床"
                      : sz === "1.8m"
                      ? "1.8m 豪华床"
                      : sz}
                  </button>
                ))}
              </div>

              {/* 材质分类 Chips */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-1">
                  材质分类:
                </span>
                <button
                  onClick={() => setSelectedMaterial("All")}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                    selectedMaterial === "All"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  所有材质
                </button>
                {(["Spring", "Memory Foam", "Latex", "Hybrid"] as MattressMaterial[]).map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer select-none transition-all ${
                      selectedMaterial === mat
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {mat === "Spring"
                      ? "独立袋装弹簧"
                      : mat === "Memory Foam"
                      ? "慢回弹记忆棉"
                      : mat === "Latex"
                      ? "天然乳胶"
                      : "复合混合"}
                  </button>
                ))}

                {/* 重置筛选 */}
                {(searchQuery ||
                  selectedSize !== "All" ||
                  selectedMaterial !== "All" ||
                  sortBy !== "default") && (
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

          {/* 商品网格标题 */}
          <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-3 select-none text-left">
            <h2 className="font-headline font-bold text-xl text-black">
              {cityKey === "Hangzhou" ? "杭州滨江与西湖在售" : "北京朝阳与海淀在售"} ({currentListings.length})
            </h2>
            <span className="text-[13px] text-gray-400 font-semibold uppercase">
              实时检测通过
            </span>
          </div>

          {/* 商品网格 */}
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

      {/* 页脚 */}
      <Footer currentCity={citySlug} />

      {/* 城市切换模态框 */}
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
