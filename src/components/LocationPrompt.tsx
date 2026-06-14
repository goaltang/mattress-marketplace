"use client";

import React from "react";
import { MapPin, X } from "lucide-react";

interface LocationPromptProps {
  cityName: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function LocationPrompt({
  cityName,
  onConfirm,
  onDismiss,
}: LocationPromptProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="bg-black dark:bg-white text-white dark:text-black rounded-2xl px-4 py-3.5 shadow-2xl shadow-black/20 dark:shadow-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>

        <div className="flex-grow min-w-0">
          <p className="text-[13px] font-semibold leading-snug">
            检测到您可能在 <span className="font-bold">{cityName}</span>
          </p>
          <p className="text-[11px] text-white/70 dark:text-black/60">
            切换到该城市，浏览同城床垫
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 bg-white dark:bg-black text-black dark:text-white text-xs font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer border-0"
          >
            切换
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-white/60 dark:text-black/50 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="忽略定位推荐"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
