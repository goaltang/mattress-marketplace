"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NotificationItem } from "@/types";
import { getCityName } from "@/config/cities";
import { resolveCitySlug } from "@/utils/geo";
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
  suggestedCity: { slug: string; name: string } | null;
  showLocationPrompt: boolean;
  dismissLocationPrompt: () => void;
  syncRouteCity: (slug: string) => void;
  isLocating: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CITY_SLUG = "beijing";
const FAVORITES_KEY = "restored_favorites_v1";

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // 状态定义
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [currentCity, setCurrentCity] = useState(DEFAULT_CITY_SLUG);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const syncInProgressRef = useRef(false);

  // 定位气泡推荐状态
  const [suggestedCity, setSuggestedCity] = useState<{ slug: string; name: string } | null>(null);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);

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
    setCurrentCity(lower);
    try {
      localStorage.setItem("restored_current_city_v1", lower);
    } catch {
      /* localStorage 不可用时静默 */
    }
    document.cookie = `city_slug=${lower}; path=/; max-age=31536000`;
  }, []);

  // 全局更换城市并跳转（用户主动选城市 → push，留历史栈）
  const changeCity = (newCitySlug: string) => {
    const slug = newCitySlug.toLowerCase();
    persistCity(slug);
    // 切换城市后，气泡提醒直接隐退并设为关闭
    setSuggestedCity(null);
    router.push(`/${slug}`);
  };

  // 重新根据客户端 IP 定位一次（用于「重新定位」入口，保留用户主动要求强跳转行为）
  const relocalize = useCallback(async () => {
    setIsLocating(true);
    try {
      const res = await fetch("/api/locate?source=auto");
      const data = await res.json();
      if (data?.success && data.slug) {
        persistCity(data.slug);
        setSuggestedCity(null);
        router.replace(`/${data.slug}`);
        return;
      }
    } catch {
      /* 忽略错误 */
    } finally {
      setIsLocating(false);
    }
    showToast("定位失败，请手动选择城市", "error");
  }, [persistCity, router]);

  // 页面加载或切换路由时，同步当前路由中的实际城市名
  const syncRouteCity = useCallback((slug: string) => {
    const lower = slug.toLowerCase();
    setCurrentCity(lower);
    try {
      localStorage.setItem("restored_current_city_v1", lower);
    } catch { /* ignore */ }
    document.cookie = `city_slug=${lower}; path=/; max-age=31536000`;
  }, []);

  // 气泡忽略处理（7 天过期）
  const dismissLocationPrompt = useCallback(() => {
    setIsPromptDismissed(true);
    try {
      localStorage.setItem("restored_location_prompt_dismissed_v1", String(Date.now()));
    } catch {}
  }, []);

  // 运行时推导属性：是否在页面上激活显示切换城市气泡
  const showLocationPrompt = 
    suggestedCity !== null && 
    suggestedCity.slug.toLowerCase() !== currentCity.toLowerCase() && 
    !isPromptDismissed;

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

    // 初始化气泡忽略记录（7 天内有效）
    try {
      const stored = localStorage.getItem("restored_location_prompt_dismissed_v1");
      if (stored) {
        const ts = Number(stored);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        setIsPromptDismissed(!isNaN(ts) && Date.now() - ts < sevenDays);
      }
    } catch {}

    // 初始化城市同步与国内 IP 智能定位
    try {
      const storedCity = localStorage.getItem("restored_current_city_v1");
      if (storedCity) {
        const slug = storedCity.toLowerCase();
        setCurrentCity(slug);
        document.cookie = `city_slug=${slug}; path=/; max-age=31536000`;
      } else {
        setIsLocating(true);
        fetch("/api/locate?source=auto")
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data.slug) {
              const locatedCityZh = data.name || getCityName(data.slug) || data.slug;
              setSuggestedCity({ slug: data.slug, name: locatedCityZh });
            }
          })
          .catch(() => {})
          .finally(() => setIsLocating(false));
      }
    } catch {
      setCurrentCity(DEFAULT_CITY_SLUG);
    }
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
        suggestedCity,
        showLocationPrompt,
        dismissLocationPrompt,
        syncRouteCity,
        isLocating,
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
