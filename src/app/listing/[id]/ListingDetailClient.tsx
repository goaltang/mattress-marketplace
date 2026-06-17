"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MattressListing } from "@/types";
import { useAppContext } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingDetail from "@/components/ListingDetail";
import CityChooseModal from "@/components/CityChooseModal";

interface ListingDetailClientProps {
  listingId: string;
  initialListing: MattressListing | null;
}

export default function ListingDetailClient({ listingId, initialListing }: ListingDetailClientProps) {
  const router = useRouter();
  const {
    favorites,
    toggleFavorite,
    unreadNotifCount,
    currentCity,
    changeCity,
    syncRouteCity,
  } = useAppContext();

  // 状态维护（如果服务端没获取到，客户端可以通过 useEffect 去 localStorage 尝试加载）
  const [listing, setListing] = useState<MattressListing | null>(initialListing);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    if (!initialListing) {
      // 客户端双重兜底：如果服务端找不到该 ID，尝试从本地 localStorage 中查找（可能为离线发布的床垫）
      try {
        const stored = localStorage.getItem("restored_listings_v1");
        if (stored) {
          const list: MattressListing[] = JSON.parse(stored);
          const found = list.find((item) => item.id === listingId);
          if (found) {
            setListing(found);
          }
        }
      } catch (err) {
        console.error("客户端检索 LocalStorage 失败:", err);
      }
    }
    setIsClientLoaded(true);
  }, [initialListing, listingId]);

  useEffect(() => {
    if (listing?.city) {
      syncRouteCity(listing.city);
    }
  }, [listing?.city, syncRouteCity]);

  const handleCityChange = (newCitySlug: string) => {
    setShowCityModal(false);
    changeCity(newCitySlug);
  };

  const handleGoBack = () => {
    if (listing) {
      router.push(`/${listing.city.toLowerCase()}`);
    } else {
      router.push("/");
    }
  };

  // 在客户端完全加载之前（或者是如果确实没有商品时）的渲染控制
  if (!listing) {
    if (!isClientLoaded) {
      // 客户端挂载中，显示骨架屏，防止短暂白屏或误报“宝贝不存在”
      return (
        <div className="min-h-screen bg-white text-black flex items-center justify-center font-sans">
          <p className="text-gray-400 text-sm">正在加载床垫详情...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28 items-center justify-center">
        <div className="text-center py-20">
          <h2 className="text-lg font-bold mb-2">宝贝不存在或已被卖家下架</h2>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-xs cursor-pointer border-0"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isBookmarked = favorites.includes(listing.id);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      {/* 导航 */}
      <Header
        currentCity={currentCity}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      {/* 详情工作区 */}
      <main className="flex-grow pb-24">
        <ListingDetail
          listing={listing}
          isBookmarked={isBookmarked}
          onBookmarkToggle={(id, e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
          onGoBack={handleGoBack}
        />
      </main>

      {/* 页脚 */}
      <Footer />

      {/* 城市选择 Modal */}
      {showCityModal && (
        <CityChooseModal
          currentCity={currentCity}
          onClose={() => setShowCityModal(false)}
          onSelectCity={handleCityChange}
        />
      )}
    </div>
  );
}
