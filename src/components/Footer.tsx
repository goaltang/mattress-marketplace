"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-16 bg-[#f3f3f4] dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 mt-auto px-5 md:px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-3">
          <Link
            href="/"
            className="font-headline font-semibold text-2xl tracking-tight text-black dark:text-white hover:opacity-80 transition-all cursor-pointer text-left"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Restored
          </Link>
          <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
            极致洁净，透明流通。让每一张温暖的床垫找到新的旅伴。
          </span>
        </div>

        <nav className="flex gap-10 text-[13px] font-semibold text-gray-600 dark:text-gray-400" aria-label="页脚导航">
          <Link
            href="/about"
            className="hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all"
          >
            关于我们
          </Link>
          <Link
            href="/terms"
            className="hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all"
          >
            使用条款
          </Link>
          <Link
            href="/safety"
            className="hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all"
          >
            安全须知
          </Link>
        </nav>

        <div className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} Restored. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
