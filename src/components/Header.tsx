"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MapPin, Plus, Bell, User, Sun, Moon, Loader2 } from "lucide-react";
import { getCityName } from "@/config/cities";
import { useAppContext } from "@/context/AppContext";

interface HeaderProps {
  currentCity: string;
  onCityClick: () => void;
  favoritesCount: number;
  unreadNotifCount: number;
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");
    if (next) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    setIsDark(next);
    try {
      localStorage.setItem("restored_theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer border-0 bg-transparent"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

function HeaderContent({
  currentCity,
  onCityClick,
  favoritesCount,
  unreadNotifCount,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLocating } = useAppContext();
  const tab = searchParams.get("tab");

  const citySlug = currentCity.toLowerCase();
  const resolvedName = getCityName(citySlug);
  const cityZh = resolvedName !== "未知城市" ? resolvedName : currentCity;

  const isFavoritesActive = pathname === "/me" && tab === "favorites";
  const isMessagesActive = pathname === "/me" && tab === "messages";

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white dark:bg-neutral-950 border-b border-gray-100 dark:border-neutral-800 h-20 transition-all duration-200">
      <div className="max-w-[1200px] mx-auto h-full px-5 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link
            href={`/${currentCity.toLowerCase()}`}
            className="font-headline font-bold text-2xl tracking-tight text-black dark:text-white hover:opacity-80 transition-opacity text-left cursor-pointer"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            aria-label="Restored 首页"
          >
            Restored
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="主导航">
            <button
              onClick={onCityClick}
              className="group flex items-center gap-2 text-[15px] font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent p-0"
              aria-label={isLocating ? "正在定位城市..." : `当前城市：${cityZh}，点击切换`}
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400 dark:text-gray-500" />
              ) : (
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
              )}
              <span className={isLocating ? "text-gray-400 dark:text-gray-500" : ""}>{isLocating ? "定位中" : cityZh}</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white bg-gray-100 dark:bg-neutral-800 group-hover:bg-gray-200 dark:group-hover:bg-neutral-700 px-1.5 py-0.5 rounded transition-all select-none">
                切换
              </span>
            </button>

            <Link
              href="/post"
              className={`text-[15px] cursor-pointer transition-all ${
                pathname === "/post"
                  ? "font-semibold text-black dark:text-white border-b-2 border-black dark:border-white pb-1"
                  : "font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              发布
            </Link>

            <Link
              href="/me?tab=favorites"
              className={`relative text-[15px] cursor-pointer transition-all flex items-center gap-1.5 ${
                isFavoritesActive
                  ? "font-semibold text-black dark:text-white border-b-2 border-black dark:border-white pb-1"
                  : "font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              我的收藏
              {favoritesCount > 0 && (
                <span className="bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold px-1.5 py-0.5 rounded-full select-none">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/post"
            className="font-semibold text-[13px] bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>发布</span>
          </Link>

          <Link
            href="/me?tab=messages"
            className={`relative p-2 rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-gray-700 dark:text-gray-300 ${
              isMessagesActive ? "text-black dark:text-white bg-gray-100 dark:bg-neutral-800" : ""
            }`}
            aria-label={`消息通知${unreadNotifCount > 0 ? `，${unreadNotifCount} 条未读` : ""}`}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white dark:ring-neutral-950 animate-pulse" />
            )}
          </Link>

          <Link
            href="/me"
            className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-black dark:text-white flex items-center justify-center cursor-pointer"
            aria-label="个人中心"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="md:hidden flex h-11 bg-gray-50 dark:bg-neutral-900 items-center justify-around px-2 border-t border-gray-100 dark:border-neutral-800 overflow-x-auto text-[13px] font-medium text-gray-600 dark:text-gray-400 select-none">
        <button
          onClick={onCityClick}
          className="flex items-center gap-1 cursor-pointer border-0 bg-transparent p-0 text-gray-600 dark:text-gray-400"
          aria-label={isLocating ? "正在定位城市..." : `当前城市：${cityZh}`}
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 dark:text-gray-500" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          )}
          <span>{isLocating ? "定位中" : cityZh}</span>
        </button>
        <Link
          href="/post"
          className={`cursor-pointer ${
            pathname === "/post" ? "text-black dark:text-white font-semibold border-b-2 border-black dark:border-white" : ""
          }`}
        >
          发布
        </Link>
        <Link
          href="/me?tab=favorites"
          className={`cursor-pointer ${
            isFavoritesActive ? "text-black dark:text-white font-semibold border-b-2 border-black dark:border-white" : ""
          }`}
        >
          我的收藏 ({favoritesCount})
        </Link>
        <Link
          href="/me?tab=messages"
          className={`cursor-pointer ${
            isMessagesActive ? "text-black dark:text-white font-semibold border-b-2 border-black dark:border-white" : ""
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
    <Suspense fallback={<header className="fixed top-0 left-0 w-full z-40 bg-white dark:bg-neutral-950 border-b border-gray-100 dark:border-neutral-800 h-20" />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}
