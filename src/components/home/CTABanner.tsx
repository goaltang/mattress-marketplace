"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface CTABannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function CTABanner({
  title = "有闲置大牌床垫？",
  description = "免费发布，平台帮你定价、拍照、消毒检测。平均 3 天售出。",
  buttonText = "立即免费发布",
}: CTABannerProps) {
  return (
    <section className="py-16 md:py-20 bg-black dark:bg-white text-white dark:text-black select-none">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 text-center">
        <h2 className="font-headline font-extrabold text-3xl md:text-5xl tracking-tight leading-tight mb-4">
          {title}
        </h2>
        <p className="text-white/60 dark:text-black/50 text-[15px] md:text-[16px] font-medium mb-8 max-w-md mx-auto">
          {description}
        </p>
        <Link
          href="/post"
          className="inline-flex items-center gap-2 bg-white dark:bg-black text-black dark:text-white font-bold text-[15px] px-8 py-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-all active:scale-95 cursor-pointer shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>{buttonText}</span>
        </Link>
      </div>
    </section>
  );
}
