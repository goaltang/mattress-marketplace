"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MapPin, Plus, Bell, User } from "lucide-react";
import { getCityName } from "@/config/cities";

interface HeaderProps {
  currentCity: string;
  onCityClick: () => void;
  favoritesCount: number;
  unreadNotifCount: number;
}

function HeaderContent({
  currentCity,
  onCityClick,
  favoritesCount,
  unreadNotifCount,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const citySlug = currentCity.toLowerCase();
  const cityZh = getCityName(citySlug) !== "未知城市" ? getCityName(citySlug) : currentCity;

  // 高亮状态判定
  const isFavoritesActive = pathname === "/me" && tab === "favorites";
  const isMessagesActive = pathname === "/me" && tab === "messages";

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-100 h-20 transition-all duration-200">
      <div className="max-w-[1200px] mx-auto h-full px-5 md:px-6 flex justify-between items-center">
        {/* 左侧 Logo 和 导航 */}
        <div className="flex items-center gap-10">
          <Link
            href={`/${currentCity.toLowerCase()}`}
            className="font-headline font-bold text-2xl tracking-tight text-black hover:opacity-80 transition-opacity text-left cursor-pointer"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Restored
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* 城市切换触发 */}
            <button
              onClick={onCityClick}
              className="group flex items-center gap-2 text-[15px] font-medium text-gray-800 hover:text-black transition-colors cursor-pointer border-0 bg-transparent p-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              <span>{cityZh}</span>
              <span className="text-[11px] text-gray-400 group-hover:text-black bg-gray-100 group-hover:bg-gray-200 px-1.5 py-0.5 rounded transition-all select-none">
                切换
              </span>
            </button>

            <Link
              href="/post"
              className={`text-[15px] cursor-pointer transition-all ${
                pathname === "/post"
                  ? "font-semibold text-black border-b-2 border-black pb-1"
                  : "font-medium text-gray-600 hover:text-black"
              }`}
            >
              发布
            </Link>

            <Link
              href="/me?tab=favorites"
              className={`relative text-[15px] cursor-pointer transition-all flex items-center gap-1.5 ${
                isFavoritesActive
                  ? "font-semibold text-black border-b-2 border-black pb-1"
                  : "font-medium text-gray-600 hover:text-black"
              }`}
            >
              我的收藏
              {favoritesCount > 0 && (
                <span className="bg-black text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full select-none">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* 右侧：动作按钮 */}
        <div className="flex items-center gap-5">
          <Link
            href="/post"
            className="font-semibold text-[13px] bg-black text-white px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>发布</span>
          </Link>

          {/* 消息通知 */}
          <Link
            href="/me?tab=messages"
            className={`relative p-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer text-gray-700 ${
              isMessagesActive ? "text-black bg-gray-100" : ""
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </Link>

          {/* 个人页面 */}
          <Link
            href="/me"
            className="p-2 rounded-full hover:bg-gray-50 transition-colors text-black flex items-center justify-center cursor-pointer"
            aria-label="Account details"
          >
            <User className="w-5.5 h-5.5" />
          </Link>
        </div>
      </div>

      {/* 移动端副导航栏 */}
      <div className="md:hidden flex h-11 bg-gray-50 items-center justify-around px-2 border-t border-gray-100 overflow-x-auto text-[13px] font-medium text-gray-600 select-none">
        <button
          onClick={onCityClick}
          className="flex items-center gap-1 cursor-pointer border-0 bg-transparent p-0"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{cityZh}</span>
        </button>
        <Link
          href="/post"
          className={`cursor-pointer ${
            pathname === "/post" ? "text-black font-semibold border-b-2 border-black" : ""
          }`}
        >
          发布
        </Link>
        <Link
          href="/me?tab=favorites"
          className={`cursor-pointer ${
            isFavoritesActive ? "text-black font-semibold border-b-2 border-black" : ""
          }`}
        >
          我的收藏 ({favoritesCount})
        </Link>
        <Link
          href="/me?tab=messages"
          className={`cursor-pointer ${
            isMessagesActive ? "text-black font-semibold border-b-2 border-black" : ""
          }`}
        >
          消息 ({unreadNotifCount})
        </Link>
      </div>
    </header>

  );
}

export default function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-100 h-20" />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}

