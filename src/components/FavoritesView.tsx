"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { MattressListing } from "../types";
import { Heart, ArrowRight, Minimize2, MapPin, Layers, Loader2 } from "lucide-react";

interface FavoritesViewProps {
  favListings: MattressListing[];
  onRemoveFavorite: (id: string) => void;
  onCardClick: (id: string) => void;
  onExploreMore: () => void;
  isLoading?: boolean;
}

export default function FavoritesView({
  favListings,
  onRemoveFavorite,
  onCardClick,
  onExploreMore,
  isLoading = false,
}: FavoritesViewProps) {
  const [animatingOutIds, setAnimatingOutIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"default" | "priceAsc" | "priceDesc">("default");

  const sortedListings = useMemo(() => {
    if (sortOrder === "priceAsc") return [...favListings].sort((a, b) => a.price - b.price);
    if (sortOrder === "priceDesc") return [...favListings].sort((a, b) => b.price - a.price);
    return favListings;
  }, [favListings, sortOrder]);

  const handleRemoveClick = (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setAnimatingOutIds((prev) => [...prev, listingId]);

    setTimeout(() => {
      onRemoveFavorite(listingId);
      setAnimatingOutIds((prev) => prev.filter((id) => id !== listingId));
    }, 350);
  };

  // 正在从数据库同步收藏列表的加载态
  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
        <header className="mb-12 border-b border-gray-100 pb-8 text-left">
          <h1 className="font-headline font-bold text-3.5xl md:text-4xl text-neutral-900 mb-3 tracking-tight">
            我的收藏 Favorites
          </h1>
          <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-xl">
            您的专属优选清单。Restored 上的每一间出货都经过严格的在线消毒规范及极简评估标准。
          </p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-400 text-[14px] font-medium">正在同步收藏数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
      {/* 头部标题 */}
      <header className="mb-12 border-b border-gray-100 pb-8 text-left">
        <h1 className="font-headline font-bold text-3.5xl md:text-4xl text-neutral-900 mb-3 tracking-tight">
          我的收藏 Favorites
        </h1>
        <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-xl">
          您的专属优选清单。Restored 上的每一间出货都经过严格的在线消毒规范及极简评估标准。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">排序：</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "default" | "priceAsc" | "priceDesc")}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-800 outline-none focus:border-black cursor-pointer shadow-sm"
          >
            <option value="default">默认（收藏顺序）</option>
            <option value="priceAsc">价格：低到高</option>
            <option value="priceDesc">价格：高到低</option>
          </select>
        </div>
      </header>

      {favListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedListings.map((item) => {
            const isAnimatingOut = animatingOutIds.includes(item.id);

            return (
              <article
                key={item.id}
                onClick={() => onCardClick(item.id)}
                className={`group bg-white rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300 transform cursor-pointer border border-gray-100 ${
                  isAnimatingOut
                    ? "opacity-0 scale-90 translate-y-4"
                    : "opacity-100 scale-100 hover:shadow-md"
                }`}
              >
                {/* 图片 */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    referrerPolicy="no-referrer"
                  />

                  <button
                    onClick={(e) => handleRemoveClick(item.id, e)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 shadow-sm active:scale-95 transition-all cursor-pointer border-0"
                    aria-label="取消收藏"
                  >
                    <Heart className="w-5 h-5 fill-rose-600 text-rose-600 scale-110" />
                  </button>

                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {(item.isVerifiedClean || item.isHygieneVerified) && (
                      <span className="bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded shadow-sm text-black">
                        已验证
                      </span>
                    )}
                    {item.isCleaned && (
                      <span className="bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded shadow-sm text-black">
                        深度清洁
                      </span>
                    )}
                  </div>
                </div>

                {/* 卡片详情 */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-[17px] font-medium text-gray-900 line-clamp-2 leading-relaxed">
                      {item.title}
                    </h2>
                    <span
                      className="text-xl font-bold text-black shrink-0"
                      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                    >
                      ¥{item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-gray-500 font-medium border-t border-gray-100 pt-4 mt-auto">
                    <span className="flex items-center gap-1.5">
                      <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.dimensionsText}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.material}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate max-w-[100px]">{item.district}</span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* 空白状态 */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-gray-200 rounded-3xl bg-neutral-50/50 mt-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-headline font-semibold text-lg text-neutral-950 mb-3 select-none">
            暂无心愿收藏
          </h3>
          <p className="text-gray-400 text-[14px] mb-8 font-medium max-w-sm leading-relaxed">
            您还没有收藏任何床垫物品。去首页挑选那些经过洁净清洁的高品质二手好床垫吧。
          </p>
          <button
            onClick={onExploreMore}
            className="bg-black text-white px-8 py-3.5 text-[13px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-850 active:scale-95 transition-all shadow cursor-pointer flex items-center gap-2 select-none border-0"
          >
            <span>发现床垫 / 探索更多</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
