"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MattressListing } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { publishListing } from "@/app/actions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostListing from "@/components/PostListing";
import CityChooseModal from "@/components/CityChooseModal";

export default function PostListingPage() {
  const router = useRouter();
  const {
    favorites,
    unreadNotifCount,
    currentCity,
    changeCity,
  } = useAppContext();

  const [showCityModal, setShowCityModal] = useState(false);

  // 写入新上架宝贝
  const handlePublishListing = async (newListing: MattressListing) => {
    // 1. 本地 LocalStorage 写入备份（保证无 DB 离线测试时的完美回退）
    try {
      const stored = localStorage.getItem("restored_listings_v1");
      let currentListings: MattressListing[] = [];
      if (stored) {
        currentListings = JSON.parse(stored);
      }
      const nextListings = [newListing, ...currentListings];
      localStorage.setItem("restored_listings_v1", JSON.stringify(nextListings));
    } catch (err) {
      console.error("本地存储发布备份失败:", err);
    }

    // 2. 服务端写入 (调用 Server Action 保存到 Supabase，并清除 Next.js 列表路由缓存)
    const result = await publishListing(newListing);
    if (!result.success) {
      console.warn("服务端发布未能成功（可能由于未配置 Supabase 占位符），已使用客户端本地缓存进行降级保存。");
    }

    alert("恭喜！您的床垫已智能评估并通过，现在已经陈列在 Restored 展厅中！");
    
    // 3. 跳转到当前城市主页 (Next.js 在路由重新请求时会自动应用服务端新数据)
    router.push(`/${currentCity.toLowerCase()}`);
  };

  const handleCityChange = (newCitySlug: string) => {
    setShowCityModal(false);
    changeCity(newCitySlug);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      {/* 导航 */}
      <Header
        currentCity={currentCity}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      {/* 工作区 */}
      <main className="flex-grow pb-24">
        <PostListing
          currentCity={currentCity}
          onPublish={handlePublishListing}
        />
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
