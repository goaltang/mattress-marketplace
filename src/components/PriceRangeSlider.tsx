"use client";

import React, { useRef, useCallback, useState } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueLow: string;
  valueHigh: string;
  onChangeLow: (value: string) => void;
  onChangeHigh: (value: string) => void;
  step?: number;
}

export default function PriceRangeSlider({
  min,
  max,
  valueLow,
  valueHigh,
  onChangeLow,
  onChangeHigh,
  step = 100,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);

  const lowNum = valueLow ? parseFloat(valueLow) : min;
  const highNum = valueHigh ? parseFloat(valueHigh) : max;

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + percent * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step]
  );

  const handlePointerDown = (which: "low" | "high") => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(which);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const val = getValueFromPosition(e.clientX);
      if (dragging === "low") {
        onChangeLow(String(Math.min(val, highNum - step)));
      } else {
        onChangeHigh(String(Math.max(val, lowNum + step)));
      }
    },
    [dragging, getValueFromPosition, onChangeLow, onChangeHigh, lowNum, highNum, step]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const lowPercent = getPercent(lowNum);
  const highPercent = getPercent(highNum);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-black">
          ¥{lowNum.toLocaleString()}
        </span>
        <span className="text-[13px] font-semibold text-black">
          ¥{highNum.toLocaleString()}
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute h-full bg-black rounded-full"
          style={{
            left: `${lowPercent}%`,
            width: `${highPercent - lowPercent}%`,
          }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-black rounded-full shadow-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg z-10"
          style={{ left: `${lowPercent}%` }}
          onPointerDown={handlePointerDown("low")}
          role="slider"
          aria-label="最低价格"
          aria-valuemin={min}
          aria-valuemax={highNum - step}
          aria-valuenow={lowNum}
          tabIndex={0}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-black rounded-full shadow-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg z-10"
          style={{ left: `${highPercent}%` }}
          onPointerDown={handlePointerDown("high")}
          role="slider"
          aria-label="最高价格"
          aria-valuemin={lowNum + step}
          aria-valuemax={max}
          aria-valuenow={highNum}
          tabIndex={0}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-gray-400">¥{min.toLocaleString()}</span>
        <span className="text-[11px] text-gray-400">¥{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
