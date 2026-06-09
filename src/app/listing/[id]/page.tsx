import React from "react";
import { getListingById } from "@/utils/db";
import ListingDetailClient from "./ListingDetailClient";

interface ListingDetailPageProps {
  params: {
    id: string;
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
