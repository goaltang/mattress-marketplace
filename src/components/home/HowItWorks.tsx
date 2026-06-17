"use client";

import React from "react";
import { ScanSearch, ShieldCheck, Truck } from "lucide-react";

const STEPS = [
  {
    icon: <ScanSearch className="w-7 h-7" />,
    step: "01",
    title: "发现 & 筛选",
    desc: "按品牌、材质、尺寸筛选同城在售床垫，查看高清实拍与消毒检测报告。",
    color: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400",
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    step: "02",
    title: "验证 & 下单",
    desc: "每张床垫附带 12 项卫生检测评分。15 天审核期，不满意可退。",
    color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: <Truck className="w-7 h-7" />,
    step: "03",
    title: "直配到家",
    desc: "同城电梯托运直配，专业搬运团队送进卧室，全程无需动手。",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950 select-none" aria-label="平台流程">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
            How It Works
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white">
            三步完成安心交易
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-neutral-700 to-transparent" />

          {STEPS.map((item, i) => (
            <div key={i} className="relative text-center group">
              <div
                className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110 duration-300`}
              >
                {item.icon}
              </div>
              <span className="block text-[11px] font-bold text-gray-300 dark:text-gray-600 tracking-[0.2em] uppercase mb-2">
                Step {item.step}
              </span>
              <h3 className="font-headline font-bold text-xl text-black dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
