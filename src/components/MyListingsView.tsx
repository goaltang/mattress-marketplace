"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MattressListing } from "../types";
import {
  Package,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Plus,
  ExternalLink,
} from "lucide-react";
import { uploadImage } from "@/utils/upload";

interface MyListingsViewProps {
  onCardClick: (id: string) => void;
}

interface EditFormState {
  price: string;
  description: string;
  wechatId: string;
  phone: string;
  images: string[];
}

export default function MyListingsView({ onCardClick }: MyListingsViewProps) {
  const [listings, setListings] = useState<MattressListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    price: "",
    description: "",
    wechatId: "",
    phone: "",
    images: [],
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyListings = useCallback(async () => {
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      if (data.success && Array.isArray(data.listings)) {
        setListings(data.listings);
      }
    } catch {
      showToast("加载商品列表失败", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleOpenEdit = (listing: MattressListing) => {
    setEditingId(listing.id);
    setEditForm({
      price: String(listing.price),
      description: listing.description || "",
      wechatId: listing.wechatId || "",
      phone: listing.phone || "",
      images: listing.images ? [...listing.images] : [],
    });
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setEditForm({ price: "", description: "", wechatId: "", phone: "", images: [] });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploadPromises = Array.from(files).map((file) => uploadImage(file));
      try {
        const urls = await Promise.all(uploadPromises);
        setEditForm((prev) => ({
          ...prev,
          images: [...prev.images, ...urls].slice(0, 5),
        }));
      } catch {
        showToast("图片上传失败", "error");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const priceNum = Number(editForm.price);
    if (!editForm.price || isNaN(priceNum)) {
      showToast("请输入正确的价格", "error");
      return;
    }

    setActionLoadingId(editingId);

    try {
      const res = await fetch(`/api/listings/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: priceNum,
          description: editForm.description,
          wechatId: editForm.wechatId,
          phone: editForm.phone || undefined,
          images: editForm.images.length > 0 ? editForm.images : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === editingId
              ? {
                  ...l,
                  price: priceNum,
                  description: editForm.description,
                  wechatId: editForm.wechatId,
                  phone: editForm.phone || l.phone,
                  images: editForm.images.length > 0 ? editForm.images : l.images,
                }
              : l
          )
        );
        showToast("商品信息已更新");
        handleCloseEdit();
      } else {
        showToast(data.error || "更新失败", "error");
      }
    } catch {
      showToast("网络错误，请重试", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (listing: MattressListing) => {
    const newActive = !listing.isActive;
    setActionLoadingId(listing.id);

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });

      const data = await res.json();
      if (data.success) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === listing.id ? { ...l, isActive: newActive } : l
          )
        );
        showToast(newActive ? "商品已重新上架" : "商品已下架");
      } else {
        showToast(data.error || "操作失败", "error");
      }
    } catch {
      showToast("网络错误，请重试", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoadingId(deletingId);

    try {
      const res = await fetch(`/api/listings/${deletingId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setListings((prev) => prev.filter((l) => l.id !== deletingId));
        showToast("商品已永久删除");
      } else {
        showToast(data.error || "删除失败", "error");
      }
    } catch {
      showToast("网络错误，请重试", "error");
    } finally {
      setDeletingId(null);
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
        <header className="mb-12 border-b border-gray-100 pb-8 text-left">
          <h1 className="font-headline font-bold text-3.5xl md:text-4xl text-neutral-900 mb-3 tracking-tight">
            我的发布 My Listings
          </h1>
          <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-xl">
            管理您发布的所有床垫商品，编辑信息、调整上架状态或删除商品。
          </p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-400 text-[14px] font-medium">正在加载您的商品...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
      <header className="mb-12 border-b border-gray-100 pb-8 text-left">
        <h1 className="font-headline font-bold text-3.5xl md:text-4xl text-neutral-900 mb-3 tracking-tight">
          我的发布 My Listings
        </h1>
        <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-xl">
          管理您发布的所有床垫商品，编辑信息、调整上架状态或删除商品。
        </p>
      </header>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-gray-200 rounded-3xl bg-neutral-50/50 mt-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-headline font-semibold text-lg text-neutral-950 mb-3 select-none">
            暂无发布商品
          </h3>
          <p className="text-gray-400 text-[14px] mb-8 font-medium max-w-sm leading-relaxed">
            您还没有发布任何床垫商品。去发布页面上传您的第一个二手床垫吧。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => {
            const isActive = listing.isActive !== false;
            const isActionLoading = actionLoadingId === listing.id;

            return (
              <div
                key={listing.id}
                className={`border rounded-2xl p-5 md:p-6 bg-white transition-all duration-300 text-left ${
                  isActive
                    ? "border-gray-100 hover:shadow-sm"
                    : "border-gray-200 opacity-70 bg-gray-50/50"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-5">
                  <div
                    className="w-full md:w-32 h-32 md:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
                    onClick={() => onCardClick(listing.id)}
                  >
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3
                        className="text-[15px] font-semibold text-gray-900 line-clamp-2 leading-relaxed cursor-pointer hover:text-black"
                        onClick={() => onCardClick(listing.id)}
                      >
                        {listing.title}
                      </h3>
                      <span
                        className="text-lg font-bold text-black shrink-0"
                        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                      >
                        ¥{listing.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-gray-500 font-medium mb-3">
                      <span>{listing.brand}</span>
                      <span className="text-gray-300">|</span>
                      <span>{listing.size}</span>
                      <span className="text-gray-300">|</span>
                      <span>{listing.material}</span>
                      <span className="text-gray-300">|</span>
                      <span>{listing.condition}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>上架中</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>已下架</span>
                          </>
                        )}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(listing)}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-400 hover:text-black transition-all cursor-pointer disabled:opacity-50 select-none"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>编辑</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(listing)}
                        disabled={isActionLoading}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 select-none border-0 ${
                          isActive
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
                            : "bg-black text-white hover:bg-neutral-800"
                        }`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isActive ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>{isActive ? "下架" : "重新上架"}</span>
                      </button>

                      <button
                        onClick={() => setDeletingId(listing.id)}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50 select-none"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>删除</span>
                      </button>

                      <button
                        onClick={() => onCardClick(listing.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-500 bg-transparent border-0 hover:text-black transition-all cursor-pointer select-none"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>查看</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none overflow-y-auto">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-black">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-headline font-bold text-lg">编辑商品</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-all cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <label className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left">
                  商品图片
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {editForm.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                      <img
                        src={img}
                        alt={`img-${idx}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {editForm.images.length < 5 && (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="aspect-square rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left"
                  htmlFor="edit-price"
                >
                  转让价格 (CNY)
                </label>
                <div className="relative">
                  <span className="absolute left-0 bottom-2.5 text-neutral-800 font-bold text-lg select-none">
                    ¥
                  </span>
                  <input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full pl-6 text-[15px] font-bold text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left"
                  htmlFor="edit-description"
                >
                  商品描述
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors resize-none bg-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left"
                    htmlFor="edit-wechat"
                  >
                    微信号
                  </label>
                  <input
                    id="edit-wechat"
                    type="text"
                    value={editForm.wechatId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, wechatId: e.target.value }))}
                    className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left"
                    htmlFor="edit-phone"
                  >
                    手机号 (选填)
                  </label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer border-0"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={actionLoadingId === editingId}
                className="flex-1 bg-black text-white hover:bg-neutral-800 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 border-0"
              >
                {actionLoadingId === editingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>保存修改</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-headline font-bold text-lg">确认删除</h3>
            </div>

            <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
              此操作为<strong className="text-black">永久硬删除</strong>，商品数据将被彻底移除且无法恢复。确定要删除这件商品吗？
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={actionLoadingId === deletingId}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer border-0 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoadingId === deletingId}
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 border-0"
              >
                {actionLoadingId === deletingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-[13.5px] font-semibold transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success" ? "bg-neutral-900 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
