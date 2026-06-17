"use client";

import React from "react";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "张女士",
    city: "杭州",
    text: "买了一张 Simmons Black，到手跟新的一样，省了两万多。消毒报告很详细，放心。",
    rating: 5,
    avatar: "Z",
  },
  {
    name: "李先生",
    city: "北京",
    text: "搬家出掉了 Tempur 床垫，平台帮忙定价和拍照，三天就卖掉了，体验很好。",
    rating: 5,
    avatar: "L",
  },
  {
    name: "王同学",
    city: "上海",
    text: "留学生租房神器，花一千多买到乳胶床垫，比买新的划算太多了。",
    rating: 5,
    avatar: "W",
  },
  {
    name: "陈先生",
    city: "深圳",
    text: "电梯直配太方便了，师傅直接送到卧室，全程不用我动手。",
    rating: 5,
    avatar: "C",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900 select-none overflow-hidden" aria-label="用户评价">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">
            Testimonials
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-black dark:text-white">
            他们都在用 Restored
          </h2>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="snap-center shrink-0 w-[300px] md:w-[340px] bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-gray-100 dark:border-neutral-700 text-left"
            >
              <Quote className="w-8 h-8 text-gray-100 dark:text-neutral-700 mb-4" />
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6">
                {t.text}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-neutral-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 flex items-center justify-center text-white dark:text-black text-[13px] font-bold">
                  {t.avatar}
                </div>
                <div>
                  <span className="block text-[13px] font-bold text-black dark:text-white">{t.name}</span>
                  <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    {t.city}用户
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
