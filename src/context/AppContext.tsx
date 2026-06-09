"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NotificationItem } from "@/types";
import { ALL_CITIES, getCityName } from "@/config/cities";
import { showToast } from "@/components/Toast";

interface AppContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  unreadNotifCount: number;
  setUnreadNotifCount: React.Dispatch<React.SetStateAction<number>>;
  currentCity: string;
  changeCity: (newCitySlug: string) => void;
  relocalize: () => Promise<void>;
  syncFavorites: () => void;
  isLoadingFavorites: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CITY_SLUG = "beijing";
const FAVORITES_KEY = "restored_favorites_v1";

/**
 * 把太平洋接口返回的中文城市名解析成项目内 slug。
 * 优先级：精准名 > 名包含关系（如 "杭州市" → "杭州"）。命中 ALL_CITIES 即返回 slug。
 * 解析失败返回 null。
 */
function resolveCitySlug(rawCity: string): string | null {
  if (!rawCity) return null;
  const cleaned = rawCity.replace(/市$/, "").trim();
  // 1. 精准匹配（去除「市」后等于配置中的汉字名）
  const exact = ALL_CITIES.find((c) => c.name === cleaned);
  if (exact) return exact.slug;
  // 2. 包含匹配（太平洋可能返回 "杭州市萧山区" 这种带区县的字符串）
  const contains = ALL_CITIES.find(
    (c) => cleaned.includes(c.name) || c.name.includes(cleaned)
  );
  if (contains) return contains.slug;
  return null;
}

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // 状态定义
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [currentCity, setCurrentCity] = useState("Beijing");
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const syncInProgressRef = useRef(false);

  // 从 localStorage 载入初次状态以维持客户端一致性
  const syncFavorites = useCallback(() => {
    try {
      const storedFav = localStorage.getItem(FAVORITES_KEY);
      if (storedFav) {
        setFavorites(JSON.parse(storedFav));
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  // 从 Supabase 加载收藏列表并合并到本地
  const syncFavoritesFromDB = useCallback(async () => {
    if (syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    try {
      const res = await fetch(`/api/favorites`);
      const data = await res.json();

      if (data.success && Array.isArray(data.favorites)) {
        const dbFavorites: string[] = data.favorites;

        // 合并策略：取 localStorage 与 DB 的并集
        setFavorites((prevLocal) => {
          const merged = Array.from(new Set([...prevLocal, ...dbFavorites]));

          // 如果有新增的来自 DB 的收藏项，则更新 localStorage
          if (merged.length !== prevLocal.length) {
            try {
              localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
            } catch { /* ignore */ }
          }

          return merged;
        });
      }
    } catch { /* DB 同步失败时静默使用本地数据 */ }
    finally {
      syncInProgressRef.current = false;
      setIsLoadingFavorites(false);
    }
  }, []);

  // 持久化当前城市（localStorage + cookie 双写）
  const persistCity = useCallback((slug: string) => {
    const lower = slug.toLowerCase();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
    setCurrentCity(capitalized);
    try {
      localStorage.setItem("restored_current_city_v1", capitalized);
    } catch {
      /* localStorage 不可用时静默 */
    }
    document.cookie = `city_slug=${lower}; path=/; max-age=31536000`;
  }, []);

  // 全局更换城市并跳转（用户主动选城市 → push，留历史栈）
  const changeCity = (newCitySlug: string) => {
    const slug = newCitySlug.toLowerCase();
    persistCity(slug);
    router.push(`/${slug}`);
  };

  // 重新根据客户端 IP 定位一次（用于「重新定位」入口）
  const relocalize = useCallback(async () => {
    try {
      const res = await fetch("/api/locate");
      const data = await res.json();
      if (data?.success && data.city) {
        const slug = resolveCitySlug(data.city);
        if (slug) {
          persistCity(slug);
          // 自动定位场景用 replace，避免堆栈污染
          router.replace(`/${slug}`);
          return;
        }
      }
    } catch {
      /* 忽略错误 */
    }
    // 失败/无匹配 → 兜底到默认城市，同样用 replace
    persistCity(DEFAULT_CITY_SLUG);
    router.replace(`/${DEFAULT_CITY_SLUG}`);
  }, [persistCity, router]);

  useEffect(() => {
    syncFavorites();

    syncFavoritesFromDB();

    fetch(`/api/notifications`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notifications)) {
          setUnreadNotifCount(data.notifications.filter((n: NotificationItem) => n.unread).length);
        }
      })
      .catch(() => {});

    // 5. 初始化城市同步与国内 IP 智能定位
    try {
      const storedCity = localStorage.getItem("restored_current_city_v1");
      if (storedCity) {
        const slug = storedCity.toLowerCase();
        setCurrentCity(storedCity.charAt(0).toUpperCase() + slug.slice(1).toLowerCase());
        // 把旧 cookie 同步一遍（兼容早期没有 cookie 的情况）
        document.cookie = `city_slug=${slug}; path=/; max-age=31536000`;
      } else {
        // 首次进入的新用户：调用 IP 定位
        relocalize();
      }
    } catch {
      setCurrentCity("Beijing");
    }
    // syncFavorites / syncFavoritesFromDB / relocalize 均为 useCallback 稳定引用，仅初始化时运行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 收藏与取消收藏切换（乐观更新 + 后台同步到 Supabase）
  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        let next: string[];
        const isFavorited = prev.includes(id);

        if (isFavorited) {
          next = prev.filter((favId) => favId !== id);
          showToast("已移出收藏夹", "error");
        } else {
          next = [...prev, id];
          showToast("已加入收藏夹", "success");
        }

        // 立即持久化到 localStorage
        try {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        } catch { /* ignore */ }

        const endpoint = "/api/favorites";
        fetch(endpoint, {
          method: isFavorited ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_id: id }),
        }).catch(() => { /* DB 写入失败时本地数据仍然有效 */ });

        return next;
      });
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        favorites,
        toggleFavorite,
        unreadNotifCount,
        setUnreadNotifCount,
        currentCity,
        changeCity,
        relocalize,
        syncFavorites,
        isLoadingFavorites,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}

// 暴露给外部按需使用
export { resolveCitySlug, getCityName };
