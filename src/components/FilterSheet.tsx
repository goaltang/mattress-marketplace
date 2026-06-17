"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  activeFilterCount?: number;
}

export default function FilterSheet({
  isOpen,
  onClose,
  children,
  onApply,
  onReset,
  activeFilterCount = 0,
}: FilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="筛选面板">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-headline font-bold text-lg">筛选条件</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer"
            aria-label="关闭筛选"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-6 py-5 space-y-5">
          {children}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer"
            >
              重置
            </button>
          )}
          <button
            onClick={() => {
              onApply?.();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
          >
            查看结果 {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
