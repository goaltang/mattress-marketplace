import React from "react";
import { getListings } from "@/utils/db";
import CityBrowseClient from "./CityBrowseClient";

interface CityPageProps {
  params: {
    city: string;
  };
}

/**
 * Next.js 服务端渲染城市动态页面。
 * 直接在服务端拉取 Supabase 或 fallback 默认数据，解决首屏闪烁及 SEO 缺失问题。
 */
export default async function CityBrowsePage({ params }: CityPageProps) {
  const citySlug = params.city || "beijing";
  const initialListings = await getListings(citySlug);

  return (
    <CityBrowseClient
      citySlug={citySlug}
      initialListings={initialListings}
    />
  );
}
