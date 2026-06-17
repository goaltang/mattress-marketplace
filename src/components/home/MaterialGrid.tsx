"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { MattressMaterial } from "@/types";

const MATERIAL_OPTIONS: MattressMaterial[] = ["Spring", "Latex", "Memory Foam", "Hybrid"];

const MATERIAL_LABELS: Record<MattressMaterial, string> = {
  Spring: "独立袋装弹簧",
  Latex: "天然乳胶",
  "Memory Foam": "慢回弹记忆棉",
  Hybrid: "复合混合",
};

const MATERIAL_ICONS: Record<MattressMaterial, string> = {
  Spring: "🔩",
  Latex: "🌿",
  "Memory Foam": "☁️",
  Hybrid: "⚡",
};

const MATERIAL_DESCRIPTIONS: Record<MattressMaterial, string> = {
  Spring: "精准承托，独立袋装互不干扰",
  Latex: "天然材质，透气抑菌防螨",
  "Memory Foam": "零压感贴合，释放身体压力",
  Hybrid: "弹簧+泡棉，兼顾支撑与舒适",
};

interface MaterialGridProps {
  currentCity: string;
  listingsByMaterial?: Partial<Record<MattressMaterial, number>>;
}

export default function MaterialGrid({ currentCity, listingsByMaterial = {} }: MaterialGridProps) {
  return (
    <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900 select-none" aria-label="按材质浏览">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
              Browse by Material
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white">
              按材质探索
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {MATERIAL_OPTIONS.map((mat) => {
            const count = listingsByMaterial[mat] ?? 0;
            return (
              <a
                key={mat}
                href={`/${currentCity.toLowerCase()}?material=${mat}`}
                className="group relative overflow-hidden rounded-2xl p-6 md:p-8 text-left cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-neutral-800 text-black dark:text-white border-gray-100 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-500"
              >
                <span className="text-3xl md:text-4xl block mb-4 transition-transform group-hover:scale-110 duration-300">
                  {MATERIAL_ICONS[mat]}
                </span>
                <h3 className="font-headline font-bold text-lg mb-1">{MATERIAL_LABELS[mat]}</h3>
                <p className="text-[12px] font-medium leading-relaxed mb-4 text-gray-400 dark:text-gray-500">
                  {MATERIAL_DESCRIPTIONS[mat]}
                </p>
                <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500">
                  {count > 0 ? `${count} 张在售` : "立即探索"}
                </span>
                <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-300 dark:text-gray-600" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
