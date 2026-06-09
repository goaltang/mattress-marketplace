"use client";

import React, { useState } from "react";
import { MattressListing } from "../types";
import {
  ChevronLeft,
  Check,
  Copy,
  PhoneCall,
  ShieldCheck,
  Truck,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";

interface ListingDetailProps {
  listing: MattressListing;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string, e: React.MouseEvent) => void;
  onGoBack: () => void;
  deviceId?: string;
}

export default function ListingDetail({
  listing,
  isBookmarked,
  onBookmarkToggle,
  onGoBack,
  deviceId,
}: ListingDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText(listing.wechatId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendContactRequest = async () => {
    if (!buyerName.trim()) return;
    if (!deviceId) {
      setContactSent(true);
      setShowContactModal(false);
      return;
    }

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          type: "contact_request",
          title: "新买家联络申请",
          message: `买家 ${buyerName} 对「${listing.title}」感兴趣，请求获取您的联系方式。`,
          action_state: "pending",
          buyer_name: buyerName,
          listing_title: listing.title,
          listing_id: listing.id,
        }),
      });
      setContactSent(true);
      setShowContactModal(false);
    } catch {
      setContactSent(true);
      setShowContactModal(false);
    }
  };

  const conditionLabels: { [key: string]: string } = {
    "Brand New": "全新寝具",
    "Like New": "准新床垫",
    Excellent: "深层洁净",
    "Very Good": "极优质量",
    Good: "合格睡感",
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
      {/* 头部返回与收藏 */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-black font-semibold text-[14px] transition-all cursor-pointer group border-0 bg-transparent p-0"
        >
          <ChevronLeft className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-0.5" />
          <span>返回浏览</span>
        </button>

        <button
          onClick={(e) => onBookmarkToggle(listing.id, e)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
            isBookmarked
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-white text-gray-600 hover:text-black hover:border-gray-300"
          }`}
        >
          <span className={isBookmarked ? "text-rose-600 font-bold" : ""}>
            {isBookmarked ? "♥ 已在心愿单" : "♡ 加入收藏"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 画廊相册 */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full aspect-[4/3] md:aspect-square bg-gray-50 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100">
            <img
              src={listing.images[activeImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          {listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none snap-x select-none">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden snap-start cursor-pointer transition-all border-2 ${
                    activeImageIndex === idx
                      ? "border-black opacity-100 scale-[1.03] shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品属性参数 */}
        <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-0 text-left">
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.isHygieneVerified && (
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded">
                VERIFIED CLEAN
              </span>
            )}
            <span className="bg-[#f3f3f4] text-neutral-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded">
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          </div>

          <h1 className="font-headline font-bold text-2xl md:text-3.5xl text-black leading-tight tracking-tight mb-4">
            {listing.title}
          </h1>

          <div className="flex items-baseline gap-3 mb-8">
            <span
              className="font-headline font-bold text-3xl text-black"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              ¥{listing.price.toLocaleString()}
            </span>
            {listing.retailPrice && (
              <span
                className="text-[14px] text-gray-400 line-through font-medium"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                ¥{listing.retailPrice.toLocaleString()} Retail 原价
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                睡感品牌
              </span>
              <span className="text-[15px] font-semibold text-black">{listing.brand}</span>
            </div>

            <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                床垫尺寸
              </span>
              <span className="text-[15px] font-semibold text-black">{listing.dimensionsText}</span>
            </div>

            <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                厚度指标
              </span>
              <span className="text-[15px] font-semibold text-black">
                {listing.thicknessCm}cm ({Math.round(listing.thicknessCm / 2.54)}&quot;)
              </span>
            </div>

            <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                填充基材
              </span>
              <span className="text-[15px] font-semibold text-black">{listing.material}</span>
            </div>
          </div>

          <div className="border border-neutral-100 rounded-xl bg-neutral-50/50 p-5 mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              <h3 className="text-[12px] font-bold uppercase tracking-wider">
                卫检指数 & 深度状态说明
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1 border-b border-neutral-100 pb-3 h-auto">
              <div>
                <span className="block text-[11px] text-gray-400 font-medium select-none mb-0.5">
                  使用时长
                </span>
                <span className="text-[13.5px] font-semibold text-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{listing.useDuration}</span>
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 font-medium select-none mb-0.5">
                  卫生备注
                </span>
                <span className="text-[13.5px] font-semibold text-black truncate block">
                  {listing.hygieneNote}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                {listing.hygieneNote ||
                  "本床垫未发现任何肉眼污渍，通过了紫外线真空深层除螨除菌净化作业。"}
              </p>
            </div>
          </div>

          <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 flex items-center gap-4 mb-8">
            <div className="p-2.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                物流运输安排
              </span>
              <span className="text-[14px] font-semibold text-black">
                {listing.deliveryOption}{" "}
                {listing.hasElevator ? "(楼宇有电梯，搬运便利)" : "(楼宇无电梯)"}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8 flex flex-col gap-3">
            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>爱物自述 / Description & Story</span>
            </span>
            <p className="text-[15px] font-body text-gray-700 leading-relaxed max-w-xl">
              {listing.description}
            </p>
          </div>

          {/* 交互操作 */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={() => setShowContactModal(true)}
              disabled={contactSent}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold border transition-all cursor-pointer ${
                contactSent
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-[#f3f3f4] text-black border-transparent hover:bg-neutral-200"
              }`}
            >
              {contactSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>申请已发送</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>联系卖家</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyWeChat}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold border transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-[#f3f3f4] text-black border-transparent hover:bg-neutral-200"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>微信号复制成功</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制卖家微信 ID</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCalling(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl text-[14px] font-semibold hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-95 border-0"
            >
              <PhoneCall className="w-4 h-4" />
              <span>拨打卖家电话</span>
            </button>
          </div>
        </div>
      </div>

      {/* 虚拟呼叫弹窗 */}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center mb-4 animate-bounce">
              <PhoneCall className="w-7 h-7" />
            </div>

            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mb-1 select-none">
              呼叫中... Calling
            </span>
            <h3 className="font-headline font-bold text-xl text-black mb-1">
              {listing.brand} 卖家
            </h3>
            <p className="text-gray-500 text-[14px] mb-6 font-medium">
              {listing.phone || "138-xxxx-xxxx"}
            </p>

            <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 mb-6 text-[13px] text-gray-600 leading-relaxed font-body">
              <strong>呼叫指引：</strong> 本应用目前运行于演示沙箱容器。在实际生产部署中，拨号动作将唤起移动端系统话筒开启直连沟通。卖家预留 WeChat ID 为{" "}
              <code className="text-black font-semibold bg-gray-100 px-1 rounded">
                {listing.wechatId}
              </code>
              。
            </div>

            <button
              onClick={() => setIsCalling(false)}
              className="w-full bg-rose-600 text-white font-semibold text-[14px] py-3 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer border-0"
            >
              挂断 / 取消
            </button>
          </div>
        </div>
      )}

      {/* 联系卖家弹窗 */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-4 text-black">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="font-headline font-bold text-lg">联系卖家</h3>
            </div>

            <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
              留下您的称呼，卖家将收到联络申请。同意后，卖家会分享微信 ID 给您。
            </p>

            <div className="flex flex-col gap-1.5 mb-6">
              <label
                className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="buyer-name-input"
              >
                您的称呼
              </label>
              <input
                id="buyer-name-input"
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="例如：张先生"
                className="w-full text-[15px] font-medium text-black py-2 border-b border-gray-200 focus:border-black outline-none bg-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer border-0"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleSendContactRequest}
                disabled={!buyerName.trim()}
                className="flex-1 bg-black text-white hover:bg-neutral-800 font-semibold text-[13px] py-3 rounded-xl transition-all cursor-pointer shadow-sm border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
