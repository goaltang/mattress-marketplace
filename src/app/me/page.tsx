"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MattressListing, NotificationItem } from "@/types";
import { DEFAULT_LISTINGS } from "@/config/data";
import { useAppContext } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesView from "@/components/FavoritesView";
import MessagesView from "@/components/MessagesView";
import CityChooseModal from "@/components/CityChooseModal";

function MeProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    favorites,
    toggleFavorite,
    unreadNotifCount,
    setUnreadNotifCount,
    currentCity,
    changeCity,
    isLoadingFavorites,
  } = useAppContext();

  // 当前激活的选项卡 (favorites 或 messages)
  const tabParam = searchParams.get("tab") || "favorites";
  const [activeTab, setActiveTab] = useState(tabParam);

  // 同步 URL 参数
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  // Listings 和 Notifications 状态管理
  const [listings, setListings] = useState<MattressListing[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showCityModal, setShowCityModal] = useState(false);

  // 初始化读取本地数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem("restored_listings_v1");
      if (stored) {
        setListings(JSON.parse(stored));
      } else {
        localStorage.setItem("restored_listings_v1", JSON.stringify(DEFAULT_LISTINGS));
        setListings(DEFAULT_LISTINGS);
      }
    } catch {
      setListings(DEFAULT_LISTINGS);
    }
  }, []);

  const updateListingsState = (newListings: MattressListing[]) => {
    setListings(newListings);
    localStorage.setItem("restored_listings_v1", JSON.stringify(newListings));
  };

  const updateNotificationsState = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    setUnreadNotifCount(newNotifs.filter((n) => n.unread).length);
  };

  // 取消收藏
  const handleRemoveFavorite = (id: string) => {
    toggleFavorite(id);
  };

  const handleCityChange = (newCitySlug: string) => {
    setShowCityModal(false);
    changeCity(newCitySlug);
  };

  // 过滤出被收藏的床垫列表 (直接依赖全局 Context 中的 favorites 状态)
  const favoritedListings = useMemo(() => {
    const baseListings = listings.length > 0 ? listings : DEFAULT_LISTINGS;
    return baseListings.filter((item) => favorites.includes(item.id));
  }, [listings, favorites]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      {/* 头部导航 */}
      <Header
        currentCity={currentCity}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      {/* 核心个人中心区域 */}
      <main className="flex-grow pb-24">
        {/* Tab 切换栏 */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 mb-8 flex justify-center gap-6 select-none border-b border-gray-100">
          <button
            onClick={() => {
              setActiveTab("favorites");
              router.push("/me?tab=favorites");
            }}
            className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer bg-transparent border-0 ${
              activeTab === "favorites"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-black"
            }`}
          >
            我的收藏清单
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              router.push("/me?tab=messages");
            }}
            className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer bg-transparent border-0 relative ${
              activeTab === "messages"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-black"
            }`}
          >
            消息盒子通知
            {unreadNotifCount > 0 && (
              <span className="absolute top-[-2px] right-[-14px] w-2 h-2 bg-rose-600 rounded-full" />
            )}
          </button>
        </div>

        {/* 动态视图渲染 */}
        {activeTab === "favorites" ? (
          <FavoritesView
            favListings={favoritedListings}
            onRemoveFavorite={handleRemoveFavorite}
            onCardClick={(id) => router.push(`/listing/${id}`)}
            onExploreMore={() => router.push(`/${currentCity.toLowerCase()}`)}
            isLoading={isLoadingFavorites}
          />
        ) : (
          <MessagesView
            notifications={notifications}
            onUpdateNotifications={updateNotificationsState}
            listings={listings}
            onUpdateListings={updateListingsState}
          />
        )}
      </main>

      {/* 页脚 */}
      <Footer currentCity={currentCity} />

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

export default function MeProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black flex items-center justify-center font-sans">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    }>
      <MeProfileContent />
    </Suspense>
  );
}
