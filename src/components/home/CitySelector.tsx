"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Navigation } from "lucide-react";
import { HOT_CITIES, getCityName } from "@/config/cities";

interface CitySelectorProps {
  currentCity: string;
  onCityClick?: () => void;
  isLocating?: boolean;
}

export default function CitySelector({ currentCity, onCityClick, isLocating = false }: CitySelectorProps) {
  const hotCities = HOT_CITIES.slice(0, 12);

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-neutral-950 select-none" aria-label="选择城市">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
            Select Your City
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white mb-3">
            选择你所在的城市
          </h2>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto">
            同城交易更省心，专业团队上门取送，目前已覆盖全国主要城市。
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {hotCities.map((city) => {
            const isCurrent = city.slug === currentCity.toLowerCase();
            return (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className={`group flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-neutral-800 text-black dark:text-white border-gray-100 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:shadow-md"
                }`}
              >
                <span className="font-headline font-bold text-[15px]">{city.name}</span>
                <span
                  className={`text-[11px] font-medium ${
                    isCurrent ? "text-white/70 dark:text-black/60" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {city.districtLabel}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCityClick}
            disabled={isLocating}
            className="inline-flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 text-black dark:text-white font-semibold text-[14px] px-6 py-3 rounded-full border border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all cursor-pointer disabled:opacity-60"
          >
            {isLocating ? (
              <Navigation className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span>{isLocating ? "定位中..." : "切换或定位城市"}</span>
          </button>

          <Link
            href={`/${currentCity.toLowerCase()}`}
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold text-[14px] px-6 py-3 rounded-full hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all cursor-pointer"
          >
            <span>直接进入 {getCityName(currentCity)}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
