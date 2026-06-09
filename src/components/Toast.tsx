"use client";

import React, { useEffect, useState } from "react";
import { Heart, XCircle } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastIdCounter = 0;
let externalShowToast: ((message: string, type?: "success" | "error") => void) | null = null;

export function showToast(message: string, type: "success" | "error" = "success") {
  if (externalShowToast) {
    externalShowToast(message, type);
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    externalShowToast = (message: string, type: "success" | "error" = "success") => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2200);
    };

    return () => {
      externalShowToast = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-md text-[14px] font-semibold
            animate-in slide-in-from-bottom-3 fade-in duration-300
            ${toast.type === "success"
              ? "bg-emerald-50/95 text-emerald-800 border border-emerald-200"
              : "bg-rose-50/95 text-rose-800 border border-rose-200"
            }
          `}
        >
          {toast.type === "success" ? (
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}