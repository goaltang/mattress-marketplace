import React from "react";
import { Search, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="py-20 text-center max-w-lg mx-auto mt-4">
      <div className="relative mx-auto w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-gray-100 rounded-full animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-10 h-10 text-gray-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <h3 className="text-gray-900 font-headline font-bold text-xl mb-2 select-none">
        没有找到符合条件的床垫
      </h3>
      <p className="text-gray-400 text-[14px] mb-8 font-medium max-w-sm mx-auto leading-relaxed select-none">
        可以尝试调整搜索关键词，或放宽尺寸、材质、成色等筛选条件，发现更多优质闲置床垫。
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="bg-black text-white hover:bg-neutral-800 text-[13px] font-bold px-8 py-3 rounded-full select-none cursor-pointer transition-all active:scale-95 border-0"
        >
          清除所有筛选条件
        </button>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100">
        <p className="text-[12px] text-gray-400 font-medium mb-3 select-none">
          热门搜索建议
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Simmons", "Tempur", "1.8m", "乳胶", "全新"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[12px] font-medium rounded-full border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
