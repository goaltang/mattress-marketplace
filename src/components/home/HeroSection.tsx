"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  ShieldCheck,
  BadgeCheck,
  TrendingDown,
  Clock,
  Star,
} from "lucide-react";

interface HeroSectionProps {
  verifiedCount?: number;
  onCityClick?: () => void;
}

export default function HeroSection({ verifiedCount = 0, onCityClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50/40 dark:from-emerald-950/20 to-transparent pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 animate-fade-in-up">
              <ShieldCheck className="w-4 h-4" />
              <span>12 项消毒检测 · 100% 颗粒安全保障</span>
            </div>

            <h1 className="font-headline font-extrabold text-4xl md:text-[56px] tracking-tight leading-[1.1] text-black dark:text-white animate-fade-in-up animation-delay-200">
              让每张床垫
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                找到新归宿
              </span>
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-[15px] md:text-[16px] font-medium leading-relaxed max-w-md animate-fade-in-up animation-delay-400">
              同城大牌二手床垫，经过深度紫外真空净化。15 天卫生安心审核，楼宇电梯直配到家。
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 animate-fade-in-up animation-delay-400">
              <button
                onClick={onCityClick}
                className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold text-[14px] px-7 py-3.5 rounded-full hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-lg shadow-black/10 dark:shadow-white/10"
              >
                <span>选择城市，开始浏览</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/post"
                className="inline-flex items-center gap-2 bg-white dark:bg-neutral-800 text-black dark:text-white font-bold text-[14px] px-7 py-3.5 rounded-full border-2 border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>免费发布</span>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 animate-fade-in-up animation-delay-400">
              <div className="flex -space-x-2">
                {["bg-rose-400", "bg-amber-400", "bg-sky-400", "bg-emerald-400"].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-neutral-900 flex items-center justify-center text-white text-[11px] font-bold`}
                  >
                    {["张", "李", "王", "陈"][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                  用户好评率 98%
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50">
              <Image
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80"
                alt="精选床垫展示"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-6 top-12 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-4 border border-gray-100 dark:border-neutral-700 animate-slide-in-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    消毒认证
                  </span>
                  <span className="block text-[14px] font-bold text-black dark:text-white">
                    {verifiedCount} 张已通过
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-16 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-4 border border-gray-100 dark:border-neutral-700 animate-slide-in-right animation-delay-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    平均折扣
                  </span>
                  <span className="block text-[14px] font-bold text-black dark:text-white">
                    低至原价 28%
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute left-8 -bottom-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-4 border border-gray-100 dark:border-neutral-700 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    平均售出
                  </span>
                  <span className="block text-[14px] font-bold text-black dark:text-white">
                    3.2 天
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
