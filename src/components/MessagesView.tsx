"use client";

import React, { useState, useEffect, useCallback } from "react";
import { NotificationItem, MattressListing } from "../types";
import { Bell, Check, X, ShieldCheck, MessageSquare, Tag } from "lucide-react";

interface MessagesViewProps {
  notifications: NotificationItem[];
  onUpdateNotifications: (notifs: NotificationItem[]) => void;
  listings: MattressListing[];
  onUpdateListings: (listings: MattressListing[]) => void;
  deviceId: string;
}

export default function MessagesView({
  notifications,
  onUpdateNotifications,
  listings,
  onUpdateListings,
  deviceId,
}: MessagesViewProps) {
  const [selectedNotifForPrice, setSelectedNotifForPrice] = useState<NotificationItem | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await fetch(`/api/notifications?device_id=${encodeURIComponent(deviceId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        onUpdateNotifications(data.notifications);
      }
    } catch {
      showToast("加载消息失败", "error");
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, onUpdateNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    onUpdateNotifications(updated);

    if (deviceId) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: deviceId, unread: false }),
        });
      } catch {}
    }
  };

  const handleAcceptRequest = async (notifId: string) => {
    let buyerLabel = "买家";
    const updatedNotifs = notifications.map((n) => {
      if (n.id === notifId) {
        buyerLabel = n.buyerName ?? "买家";
        return {
          ...n,
          unread: false,
          actionState: "accepted" as const,
          message: `已向 ${buyerLabel} 分享您的微信，对方将主动联系您。`,
        };
      }
      return n;
    });
    onUpdateNotifications(updatedNotifs);
    showToast("已批准买家联络申请，微信 ID 已分享！");

    if (deviceId) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: notifId,
            device_id: deviceId,
            unread: false,
            action_state: "accepted",
            message: `已向 ${buyerLabel} 分享您的微信，对方将主动联系您。`,
          }),
        });
      } catch {}
    }
  };

  const handleRejectRequest = async (notifId: string) => {
    const updatedNotifs = notifications.map((n) => {
      if (n.id === notifId) {
        return {
          ...n,
          unread: false,
          actionState: "declined" as const,
          message: "Contact request declined.",
        };
      }
      return n;
    });
    onUpdateNotifications(updatedNotifs);

    if (deviceId) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: notifId,
            device_id: deviceId,
            unread: false,
            action_state: "declined",
            message: "Contact request declined.",
          }),
        });
      } catch {}
    }
  };

  const handlePriceAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || isNaN(Number(newPrice))) {
      showToast("请输入正确的价格", "error");
      return;
    }

    const priceNum = Number(newPrice);

    const updatedListings = listings.map((l) =>
      l.id === selectedNotifForPrice?.listingId ? { ...l, price: priceNum } : l
    );

    onUpdateListings(updatedListings);

    const updatedNotifs = notifications.map((n) => {
      if (n.id === selectedNotifForPrice?.id) {
        return {
          ...n,
          unread: false,
          actionState: "accepted" as const,
          message: `Successfully adjusted brand mattress listing price to ¥${priceNum.toLocaleString()}! Watchers have been notified of the drop.`,
        };
      }
      return n;
    });

    onUpdateNotifications(updatedNotifs);
    setSelectedNotifForPrice(null);
    setNewPrice("");
    showToast(`价格已降至 ¥${priceNum.toLocaleString()}，收藏用户已收到降价通知！`);

    if (deviceId && selectedNotifForPrice) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedNotifForPrice.id,
            device_id: deviceId,
            unread: false,
            action_state: "accepted",
            message: `Successfully adjusted brand mattress listing price to ¥${priceNum.toLocaleString()}! Watchers have been notified of the drop.`,
          }),
        });
      } catch {}

      try {
        await fetch("/api/listings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedNotifForPrice.listingId, price: priceNum }),
        });
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8 mb-8 text-left select-none">
        <div>
          <h1 className="font-headline font-bold text-3.5xl md:text-4xl text-neutral-950 mb-2 tracking-tight">
            消息盒子 Inbox
          </h1>
          <p className="text-gray-500 text-[14px] font-medium leading-relaxed">
            极简安全流转：管理意向买家的联络申请，获取认证评测反馈。
          </p>
        </div>

        {notifications.some((n) => n.unread) && (
          <button
            onClick={handleMarkAllRead}
            className="self-start md:self-auto text-[13px] font-bold text-black border-2 border-black hover:bg-black hover:text-white px-5 py-2.5 rounded-full transition-all cursor-pointer bg-transparent"
          >
            全部标为已读
          </button>
        )}
      </div>

      {/* 消息列表 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-[13.5px] font-medium">加载消息中...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-3xl bg-neutral-50/50">
          <Bell className="w-10 h-10 text-gray-300 mb-5" />
          <h3 className="font-semibold text-lg text-neutral-800 mb-2">暂无消息</h3>
          <p className="text-gray-400 text-[13.5px] font-medium">买家的联络申请和系统通知会在这里显示。</p>
        </div>
      ) : (
      <div className="space-y-6">
        {notifications.map((notif) => {
          let NotifIcon = Bell;
          let iconBg = "bg-gray-100 text-gray-700";

          if (notif.type === "contact_request") {
            NotifIcon = MessageSquare;
            iconBg = "bg-neutral-900 text-white";
          } else if (notif.type === "insight") {
            NotifIcon = Tag;
            iconBg = "bg-indigo-50 text-indigo-700 border border-indigo-100";
          } else if (notif.type === "verification") {
            NotifIcon = ShieldCheck;
            iconBg = "bg-emerald-50 text-emerald-700 border border-emerald-100";
          } else if (notif.type === "completed") {
            NotifIcon = Check;
            iconBg = "bg-zinc-100 text-zinc-900";
          }

          return (
            <div
              key={notif.id}
              className={`border border-gray-100 rounded-2xl p-6 bg-white relative transition-all duration-300 ${
                notif.unread ? "shadow-sm ring-1 ring-neutral-950/5" : "opacity-85"
              } text-left`}
            >
              {notif.unread && (
                <span className="absolute top-6 right-6 w-2.5 h-2.5 bg-rose-600 rounded-full" />
              )}

              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${iconBg}`}>
                  <NotifIcon className="w-5 h-5" />
                </div>

                <div className="flex-grow space-y-2">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-headline font-bold text-[15px] text-black">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-[14px] text-gray-600 leading-relaxed font-body">
                    {notif.message}
                  </p>

                  {notif.type === "contact_request" && notif.actionState === "pending" && (
                    <div className="flex gap-3 pt-3 select-none">
                      <button
                        onClick={() => handleAcceptRequest(notif.id)}
                        className="bg-black text-white hover:bg-neutral-800 font-semibold text-[12px] px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 border-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>同意共享</span>
                      </button>

                      <button
                        onClick={() => handleRejectRequest(notif.id)}
                        className="bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200 font-semibold text-[12px] px-6 py-2.5 rounded-lg transition-all cursor-pointer border-0"
                      >
                        <span>拒绝</span>
                      </button>
                    </div>
                  )}

                  {notif.type === "contact_request" && notif.actionState === "accepted" && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[12px] font-semibold px-3 py-1.5 rounded-lg pt-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>已建立联系 / Shared Successfully</span>
                    </div>
                  )}

                  {notif.type === "contact_request" && notif.actionState === "declined" && (
                    <div className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 text-[12px] font-semibold px-3 py-1.5 rounded-lg pt-1">
                      <X className="w-3.5 h-3.5" />
                      <span>已拒绝请求 / Declined</span>
                    </div>
                  )}

                  {notif.type === "insight" && notif.actionState === "pending" && (
                    <div className="pt-3 select-none">
                      <button
                        onClick={() => {
                          setSelectedNotifForPrice(notif);
                          setNewPrice("2900");
                        }}
                        className="bg-black text-white hover:bg-neutral-800 font-semibold text-[12px] px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 border-0"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>一键降价促成交 / Adjust Price</span>
                      </button>
                    </div>
                  )}

                  {notif.type === "insight" && notif.actionState === "accepted" && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[12px] font-semibold px-3 py-1.5 rounded-lg pt-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>已一键降价 / Speed Transfer Done</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* 降价弹窗 */}
      {selectedNotifForPrice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <form
            onSubmit={handlePriceAdjustSubmit}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-2 mb-4 text-black">
              <Tag className="w-5 h-5 text-indigo-600" />
              <h3 className="font-headline font-bold text-lg">快速降价 Adjustment</h3>
            </div>

            <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
              调低 <strong>{selectedNotifForPrice?.listingTitle ?? "该床垫"}</strong> 的转让价。系统将即时向全部收藏了此床垫的 10 位意向买家推送降价通知，极大加速促成交易！
            </p>

            <div className="flex flex-col gap-1.5 mb-6">
              <label
                className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="new-price-input"
              >
                输入新成交价 (CNY)
              </label>
              <div className="relative">
                <span className="absolute left-0 bottom-2 text-lg font-bold text-black">¥</span>
                <input
                  id="new-price-input"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="当前 ¥3,200"
                  className="w-full pl-5 text-[15px] font-bold text-black py-2 border-b border-gray-200 focus:border-black outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedNotifForPrice(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer border-0"
              >
                取消
              </button>

              <button
                type="submit"
                className="flex-1 bg-black text-white hover:bg-neutral-850 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer shadow-sm border-0"
              >
                降价发布
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 内联 Toast 提示 */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-[13.5px] font-semibold transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success"
            ? "bg-neutral-900 text-white"
            : "bg-rose-600 text-white"
        }`}>
          {toast.type === "success"
            ? <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            : <X className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
