import React from "react";
import { MattressListing } from "../types";
import { Heart, MapPin, Minimize2, Layers, CheckCircle } from "lucide-react";

interface ListingCardProps {
  listing: MattressListing;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string, e: React.MouseEvent) => void;
  onCardClick: (id: string) => void;
}

export default function ListingCard({
  listing,
  isBookmarked,
  onBookmarkToggle,
  onCardClick,
}: ListingCardProps) {
  return (
    <article
      onClick={() => onCardClick(listing.id)}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer select-none border border-gray-100"
    >
      {/* 图片部分 */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />

        {/* 左上角状态徽章 */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span className="bg-white/90 backdrop-blur-md text-black font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            {listing.condition}
          </span>
          {listing.isHygieneVerified && (
            <span className="bg-white/95 backdrop-blur-md text-emerald-800 font-semibold text-[11px] px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              <span>极洁净认证</span>
            </span>
          )}
          {listing.isCleaned && !listing.isHygieneVerified && (
            <span className="bg-white/95 backdrop-blur-md text-gray-800 font-semibold text-[11px] px-3 py-1 rounded-full shadow-sm">
              深层清洁
            </span>
          )}
        </div>

        {/* 右上角收藏按钮 */}
        <button
          onClick={(e) => onBookmarkToggle(listing.id, e)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/70 backdrop-blur-md shadow-sm transition-all hover:bg-white active:scale-90 border-0"
          aria-label={isBookmarked ? "取消收藏" : "加入收藏"}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isBookmarked
                ? "text-rose-600 fill-rose-600 scale-110"
                : "text-gray-600 group-hover:text-black"
            }`}
          />
        </button>
      </div>

      {/* 卡片详情 */}
      <div className="p-6 flex flex-col flex-grow text-left">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h2 className="font-body font-medium text-[17px] text-gray-900 tracking-tight leading-relaxed line-clamp-2 hover:text-black">
            {listing.title}
          </h2>
          <span
            className="font-headline font-bold text-xl text-black shrink-0"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            ¥{listing.price.toLocaleString()}
          </span>
        </div>

        {/* 次要信息 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-500 font-medium border-t border-gray-100 pt-4 mt-auto">
          <span className="flex items-center gap-1">
            <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
            <span>{listing.dimensionsText}</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[120px]">
              {listing.district} {listing.distanceKm !== undefined && `(${listing.distanceKm}km)`}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span>{listing.material}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
