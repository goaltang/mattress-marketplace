import React from "react";
import { Metadata } from "next";
import { getListings } from "@/utils/db";
import { getCityName, getCityInfo } from "@/config/cities";
import CityBrowseClient from "./CityBrowseClient";

interface CityPageProps {
  params: {
    city: string;
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const citySlug = params.city || "beijing";
  const cityName = getCityName(citySlug);
  const cityInfo = getCityInfo(citySlug);
  const districtLabel = cityInfo?.districtLabel || "全城";

  return {
    title: `${cityName}${districtLabel}二手床垫 — Restored`,
    description: `在 Restored 发现${cityName}${districtLabel}经过深度消毒净化的优质二手大牌床垫，透明定价，15天卫生安心审核。`,
    keywords: [`${cityName}二手床垫`, `${cityName}床垫回收`, `${cityName}床垫交易`, "Restored"],
    openGraph: {
      title: `${cityName}${districtLabel}二手床垫 — Restored`,
      description: `透明、卫生、无摩擦的${cityName}寝具循环体验。`,
      type: "website",
      locale: "zh_CN",
    },
  };
}

export default async function CityBrowsePage({ params }: CityPageProps) {
  const citySlug = params.city || "beijing";
  const initialListings = await getListings(citySlug);
  const verifiedCount = initialListings.filter(
    (l) => l.isHygieneVerified || l.isVerifiedClean
  ).length;

  return (
    <CityBrowseClient
      citySlug={citySlug}
      initialListings={initialListings}
      verifiedCount={verifiedCount}
    />
  );
}
