"use client";

import React, { useState, useEffect } from "react";

interface TrustStatsProps {
  stats?: { value: number; suffix?: string; label: string }[];
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const DEFAULT_STATS = [
  { value: 2847, suffix: "+", label: "床垫已完成消毒流转" },
  { value: 98, suffix: "%", label: "买家满意度评分" },
  { value: 15, suffix: "天", label: "卫生安心审核期" },
  { value: 42, suffix: "城", label: "已覆盖服务城市" },
];

export default function TrustStats({ stats = DEFAULT_STATS }: TrustStatsProps) {
  return (
    <section className="bg-black dark:bg-white text-white dark:text-black py-8 select-none" aria-label="平台数据">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[12px] md:text-[13px] font-medium text-white/60 dark:text-black/50 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
