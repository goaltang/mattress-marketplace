import React from "react";
import { Metadata } from "next";
import { getListingById } from "@/utils/db";
import { getCityName } from "@/config/cities";
import ListingDetailClient from "./ListingDetailClient";

interface ListingDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const listing = await getListingById(params.id);

  if (!listing) {
    return {
      title: "商品未找到 — Restored",
      description: "该二手床垫商品可能已下架或被删除。",
      robots: { index: false, follow: false },
    };
  }

  const cityName = getCityName(listing.city);
  const title = `${listing.title} ¥${listing.price.toLocaleString()} — ${cityName}二手床垫 | Restored`;
  const description = `${cityName}${listing.district} ${listing.brand} ${listing.dimensionsText} ${listing.material} 二手床垫，¥${listing.price.toLocaleString()}。${listing.condition}，经深度消毒净化，楼宇电梯托运直配。`;

  return {
    title,
    description,
    keywords: [
      `${cityName}二手床垫`,
      listing.brand,
      listing.material,
      listing.size,
      "Restored",
      "二手床垫",
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      type: "article",
      locale: "zh_CN",
      images: listing.images?.length ? [listing.images[0]] : undefined,
    },
  };
}

/**
 * Next.js 服务端商品详情页。
 * 优先在服务端获取商品数据，如果数据属于默认内建库，则直接服务器端渲染返回，彻底告别白屏和无内容误报。
 */
export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listingId = params.id;
  const initialListing = await getListingById(listingId);

  return (
    <ListingDetailClient
      listingId={listingId}
      initialListing={initialListing}
    />
  );
}
