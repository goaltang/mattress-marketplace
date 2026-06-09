"use client";

import React from "react";
import Link from "next/link";

interface FooterProps {
  currentCity?: string;
}

export default function Footer({ currentCity = "beijing" }: FooterProps) {
  return (
    <footer className="w-full py-16 bg-[#f3f3f4] border-t border-gray-200 mt-auto px-5 md:px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* 品牌与使命 */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <Link
            href={`/${currentCity.toLowerCase()}`}
            className="font-headline font-semibold text-2xl tracking-tight text-black hover:opacity-80 transition-all cursor-pointer text-left"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Restored
          </Link>
          <span className="text-[13px] text-gray-500 font-medium tracking-wide">
            极致洁净，透明流通。让每一张温暖的床垫找到新的旅伴。
          </span>
        </div>

        {/* 导航链接 */}
        <div className="flex gap-10 text-[13px] font-semibold text-gray-600">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "关于我们：Restored 致力于构建全网首家「彻底消毒、透明评估、无摩擦交易」的极简二手床垫循环平台。"
              );
            }}
            className="hover:text-black hover:underline underline-offset-4 transition-all"
          >
            关于我们
          </a>
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "用户条款：本平台的全部床垫均需经过 12 项卫生检查与物理清理程序，确保符合国家寝具安全规范。"
              );
            }}
            className="hover:text-black hover:underline underline-offset-4 transition-all"
          >
            使用条款
          </a>
          <a
            href="#safety"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "安全须知：交易建议通过双方实名认证及快递直达，或在双方认可的小区保安处等开阔场合无接触搬运。"
              );
            }}
            className="hover:text-black hover:underline underline-offset-4 transition-all"
          >
            安全须知
          </a>
        </div>

        {/* 版权信息 */}
        <div className="text-[12px] text-gray-400 font-medium">
          © {new Date().getFullYear()} Restored. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
