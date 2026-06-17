import React from "react";

export default function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="relative w-full aspect-[4/3] bg-gray-100" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-16 shrink-0" />
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-3 bg-gray-100 rounded-full w-16" />
            <div className="h-3 bg-gray-100 rounded-full w-20" />
            <div className="h-3 bg-gray-100 rounded-full w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
