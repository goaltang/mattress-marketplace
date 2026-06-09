"use client";

import React, { useState, useRef } from "react";
import { MattressListing, MattressSize, MattressMaterial, MattressCondition, DeliveryType } from "../types";
import { Camera, Plus, MapPin, Search, Check, Sparkles } from "lucide-react";
import { uploadImage } from "@/utils/upload";

interface PostListingProps {
  onPublish: (newListing: MattressListing) => void;
  currentCity: string;
}

export default function PostListing({ onPublish, currentCity }: PostListingProps) {
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thickness, setThickness] = useState(25);
  const [material, setMaterial] = useState<MattressMaterial>("Spring");
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [size, setSize] = useState<MattressSize>("1.8m");
  const [hasElevator, setHasElevator] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryType>("Pick-up Only");

  const [useDuration, setUseDuration] = useState("");
  const [condition, setCondition] = useState<MattressCondition>("Like New");
  const [hygieneNote, setHygieneNote] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [phone, setPhone] = useState("");

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const stockImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAqJPIoDyoIniQ77i7FutozZR3KrErEFg9zMwlkhlu_7_-KsViAfmtF0k9AegKGE5vM3L-xQca8U_XNskb4A4oujD0ftHB3p2nU04HzHp9fmpafhTrAwbbyQKhSRCfvgqNVrVug0iv4GcaJKjClK52Dq4L_8WHXpa2c33H0OzT-hujiDM84DzEhLDa2KJ2ZutEOZUma0RHGhV9MqG9PsCBDfMjyaq2yPGzsWPXxXCpDabjtdMX26sw6i-1t-uBxDEylzu0o8Kd4CvTx",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBNOV7wFfqw5N7sfPrBVwgWcffb63pRpwjMMrYrVzfU1KyA0Ewu7mqxyTbFXA9Zh1gxYMeTygIN5fHVpDWBuPRExo__NBJjhnVPzgUPHn-NjDJtHQczLmqcU0GlXYFEV3m946VWSW5qKJ0F2_HZLUso27J20zL8wU294yoWsHExg3DUJt_PpSnG0hOnehyvYjg4bV6UNyKOeDA-k1M7Me6-PbQAZK1wb0eUqc9zet5ossNqrG6rGgFPF5mz8V94BB87HPekpkpcZgm_",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBX5YRJ-nq15i6nnbrp71gqkg_rT5XNTG7iXBBY1biArt2nYC7VKKB6Nl3KH7ILo6Fh7NXIQAtF8QnUyIgpXw9z2XvEiDeX3PGK1AkIqv1mKC9UrXaPde_oqSPAUr20iDxSdLukQrllUgmHQaB_pUxRJcm8AVcoJX57ubuUGvgK_IQ8mkpEmggVSBk44Q230zoUHWqYrGYVpux1IqCq2aulLtH-SKxGLC8alted5RYRI79GtsHtqHk2FJTPUoUiUUnNkgq25Tho8Y5",
  ];

  const mapPlaceholderUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCF3hwcy4JmaDap_2zTPXZyj1EUTI_t4Nxs0k2pAj8NZNHRKq5AyFrplK16V1CKDnwSmuM7EKUNzqf1K6y8X3eiEHSxs41MExBPrj_Htkul5q0KGss4svDZ-iBn-FyoCsGLbjSoGBt6HfHgC6WHOQfMQQBo0yarPrPsQa39kJo8Hf42RSrxWnSVncNp9k0g3U-t15D9m64O2wRmFPD1witGtpGRQDlOCDmdA5ek3PMQSVdVDnAc6H3Oe3D3fLDKJ3NtECWPLbZ0-Rry";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploadPromises = Array.from(files).map((file) => uploadImage(file));
      try {
        const urls = await Promise.all(uploadPromises);
        setUploadedImages((prev) => [...prev, ...urls].slice(0, 5));
      } catch (err) {
        alert("部分图片上传失败，请重新尝试");
        console.error("图片上传失败:", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert("请填入商品标题");
      return;
    }
    if (!brand) {
      alert("请填入商品品牌");
      return;
    }
    if (!price || isNaN(Number(price))) {
      alert("请输入正确的转让价格（数字）");
      return;
    }
    if (!wechatId) {
      alert("请填入微信号以便买家联系您");
      return;
    }

    const finalImages = uploadedImages.length > 0 ? uploadedImages : [stockImages[0]];

    const newListing: MattressListing = {
      id: `custom-listing-${Date.now()}`,
      title,
      brand,
      price: Number(price),
      retailPrice: Number(price) * 3,
      size,
      dimensionsText:
        size === "1.5m" ? "1.5m x 2.0m" : size === "1.2m" ? "1.2m x 2.0m" : "1.8m x 2.0m",
      material,
      thicknessCm: Number(thickness),
      useDuration: useDuration || "1年左右",
      condition,
      hygieneNote: hygieneNote || "无宠物，无吸烟环境，状态良好。",
      hasElevator,
      deliveryOption,
      description:
        description ||
        `转手一张高档的 ${brand} 弹簧记忆棉床垫。出售原因：搬家/置换更好的床垫。使用非常爱惜，全程配有防水床套，品相极佳，诚心转让协商，有意的买家欢迎联系！`,
      city: currentCity,
      district: locationSearch || "朝阳区",
      distanceKm: parseFloat((Math.random() * 5 + 1).toFixed(1)),
      images: finalImages,
      isVerifiedClean: true,
      isHygieneVerified: Math.random() > 0.5,
      isCleaned: true,
      wechatId,
      phone: phone || "135-2233-4455",
      createdAt: new Date().toISOString().split("T")[0],
    };

    onPublish(newListing);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* 标题 */}
      <div className="mb-12 text-left">
        <h1 className="font-headline font-bold text-3.5xl md:text-4xl text-neutral-950 mb-3 tracking-tight">
          Post a Listing 发布床垫
        </h1>
        <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-xl">
          展现睡感、严守卫生。在 Restored 上架二手寝具需确保无大面积油烟、污垢及弹簧断裂等品质残余。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 图片摄影 */}
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
            <h2 className="font-headline font-bold text-lg text-black">Photography 极致洗净摄影展示</h2>
            <button
              type="button"
              onClick={() => {
                setUploadedImages(stockImages);
              }}
              className="text-[12px] font-bold text-black border-b border-black hover:opacity-75 transition-all flex items-center gap-1 cursor-pointer select-none border-0 bg-transparent p-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>智能渲染：一键载入 stock 床垫图</span>
            </button>
          </div>
          <p className="text-[14px] text-gray-500 font-medium">
            请提供整洁、无光污染的自然光摄影。第一张将被设为上架首图。
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              onClick={() => imageInputRef.current?.click()}
              className="col-span-2 row-span-2 aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group select-none"
            >
              {uploadedImages[0] ? (
                <img
                  src={uploadedImages[0]}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-400 group-hover:text-black transition-colors mb-2" />
                  <span className="block text-[13px] font-semibold text-gray-700 group-hover:text-black transition-colors mb-0.5">
                    Cover Photo
                  </span>
                  <span className="block text-[12px] text-gray-400">点此上传封面图 / 首图</span>
                </div>
              )}
            </div>

            {[1, 2, 3, 4].map((slotIdx) => {
              const image = uploadedImages[slotIdx];
              return (
                <div
                  key={slotIdx}
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black transition-all cursor-pointer flex items-center justify-center relative overflow-hidden group select-none"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`Detail ${slotIdx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-black transition-all" />
                  )}
                </div>
              );
            })}
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

        {/* 基础参数 */}
        <section className="space-y-6 text-left">
          <h3 className="font-headline font-bold text-lg text-black border-b border-gray-100 pb-2">
            Core Details 基础规格
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="brand"
              >
                Brand 品牌厂牌
              </label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="例如：Tempur-Pedic、席梦思等"
                className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="title"
              >
                Listing Title 商品标题
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：Memory Foam Mattress、乳胶护脊硬床等"
                className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
              htmlFor="description"
            >
              Description 爱物详述
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请坦诚说明转手原因（如：出国留学、置换大床）、凹陷程度等。细致诚恳的描述能帮您迅速和意向买家成交哦..."
              className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors resize-none bg-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="thickness"
              >
                Thickness 整体厚度 (cm)
              </label>
              <input
                id="thickness"
                type="number"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                placeholder="厘米，一般为15cm - 35cm"
                className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="material"
              >
                Material 主填充基质
              </label>
              <select
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value as MattressMaterial)}
                className="w-full text-[15px] font-semibold text-black py-2.5 border-b border-gray-200 focus:border-black bg-transparent outline-none transition-colors cursor-pointer"
              >
                <option value="Spring">Spring / 独立袋装弹簧</option>
                <option value="Memory Foam">Memory Foam / 慢回弹记忆棉</option>
                <option value="Latex">Latex / 天然乳胶</option>
                <option value="Hybrid">Hybrid / 复合混和床垫</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-grow flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="price"
              >
                Price 转让价 (CNY)
              </label>
              <div className="relative">
                <span className="absolute left-0 bottom-2.5 text-neutral-800 font-bold text-lg select-none">
                  ¥
                </span>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 text-[15px] font-bold text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 pt-4 select-none">
              <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                Negotiable / 适当小刀
              </span>
              <button
                type="button"
                onClick={() => setIsNegotiable(!isNegotiable)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-0 ${
                  isNegotiable ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    isNegotiable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 规格物流 */}
        <section className="space-y-6 text-left">
          <h3 className="font-headline font-bold text-lg text-black border-b border-gray-100 pb-2">
            Specifications & Logistics 尺寸与电梯物流
          </h3>

          <div className="space-y-3">
            <label className="block text-[12px] text-gray-400 font-bold uppercase tracking-wider">
              Mattress Sizing 床体规格
            </label>
            <div className="flex flex-wrap gap-2 select-none">
              {(["1.2m", "1.5m", "1.8m", "King", "Custom"] as MattressSize[]).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSize(val)}
                  className={`px-5 py-2.5 rounded-full text-[13px] font-semibold border transition-all cursor-pointer ${
                    size === val
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {val === "1.2m"
                    ? "1.2m 单人床"
                    : val === "1.5m"
                    ? "1.5m 标准双人"
                    : val === "1.8m"
                    ? "1.8m 豪华双人"
                    : val === "King"
                    ? "King 欧规大床"
                    : "Custom 异形定制"}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 select-none">
            <div className="flex items-center justify-between py-4">
              <div>
                <span className="block text-[14px] font-semibold text-black">
                  Elevator Available / 有无电梯
                </span>
                <span className="block text-[12px] text-gray-400 mt-0.5">
                  Crucial for heavy items and transport planning.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasElevator(!hasElevator)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-0 ${
                  hasElevator ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    hasElevator ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <span className="block text-[14px] font-semibold text-black">
                  Delivery Options / 托运接驳
                </span>
                <span className="block text-[12px] text-gray-400 mt-0.5">
                  Select how the item can be transferred.
                </span>
              </div>
              <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
                {(["Pick-up Only", "Delivery Available"] as DeliveryType[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDeliveryOption(opt)}
                    className={`px-4 py-2 rounded-md text-[12px] font-bold transition-all cursor-pointer border-0 ${
                      deliveryOption === opt ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {opt === "Pick-up Only" ? "自提货拉拉" : "货代可帮发"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 卫生状况 */}
        <section className="space-y-6 text-left">
          <h3 className="font-headline font-bold text-lg text-black border-b border-gray-100 pb-2">
            Condition & Hygiene 卫生与物理状态
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="duration"
              >
                Use Duration 已用时长
              </label>
              <input
                id="duration"
                type="text"
                value={useDuration}
                onChange={(e) => setUseDuration(e.target.value)}
                placeholder="例如：6个月、1年半左右"
                className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5 select-none animate-in">
              <label className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left">
                Condition 物理品相
              </label>
              <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200 h-11 w-full items-center">
                {(["Brand New", "Like New", "Good"] as MattressCondition[]).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`flex-1 text-center py-2 rounded-md text-[11px] font-bold transition-all cursor-pointer h-full flex items-center justify-center border-0 ${
                      condition === cond ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {cond === "Brand New"
                      ? "全新"
                      : cond === "Like New"
                      ? "极好"
                      : "自用"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
              htmlFor="hygiene"
            >
              Hygiene Note 卫生清白说明
            </label>
            <textarea
              id="hygiene"
              rows={3}
              value={hygieneNote}
              onChange={(e) => setHygieneNote(e.target.value)}
              placeholder="例如：全程佩戴洁净防护罩、家里无小孩或宠物、经常使用紫外除螨仪等..."
              className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors resize-none bg-transparent"
            />
          </div>
        </section>

        {/* 位置 */}
        <section className="space-y-4 text-left">
          <h3 className="font-headline font-bold text-lg text-black border-b border-gray-100 pb-2">
            Location 地理位置
          </h3>
          <p className="text-[14px] text-gray-500 font-medium">
            请标注您的大致出货地点（可以是小区、办公园区，保护隐私）
          </p>

          <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-100 select-none">
            <img
              src={mapPlaceholderUrl}
              alt="Map Background"
              className="w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />

            <div className="absolute top-4 left-4 right-4 flex gap-2">
              <div className="flex-grow bg-white/95 backdrop-blur-md flex items-center px-4 py-2.5 rounded-lg shadow-md border border-neutral-100">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="搜索小区、地铁站、写字楼..."
                  className="bg-transparent text-[14px] font-medium text-black placeholder-gray-400 outline-none w-full p-0 border-0"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocationSearch("下沙 龙湖天街 / 沿江生活区");
                  alert("定位成功：下沙 龙湖天街 / 沿江生活区");
                }}
                className="bg-black text-white px-4 py-2.5 rounded-lg font-semibold text-[13px] flex items-center justify-center cursor-pointer shadow hover:bg-neutral-800 transition-all active:scale-95 border-0"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none animate-bounce">
              <div className="bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded shadow-lg border border-neutral-700/50 mb-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{locationSearch || "北京市 朝阳区 / 上海市 徐汇区"}</span>
              </div>
              <div className="w-3 h-3 bg-black ring-4 ring-white shadow-md rounded-full" />
            </div>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="space-y-6 text-left">
          <h3 className="font-headline font-bold text-lg text-black border-b border-gray-100 pb-2">
            Contact Details 联系方式
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="wechat"
              >
                WeChat ID 卖家微信号
              </label>
              <input
                id="wechat"
                type="text"
                value={wechatId}
                onChange={(e) => setWechatId(e.target.value)}
                placeholder="建议填入，以便买家直接联系与复制"
                className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-gray-400 font-bold uppercase tracking-wider text-left"
                htmlFor="phone"
              >
                Phone Number 卖家电话 (选填)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例如：138-xxxx-xxxx"
                className="w-full text-[15px] font-medium text-black py-2.5 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent"
              />
            </div>
          </div>
        </section>

        {/* 提交发布 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed text-left">
            点击发布即代表您完全认可并同意我们的{" "}
            <a
              href="#laws"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "依据二手流转安全法与寝具消毒检测自律条例，严禁散布虚假描述、受潮污损寝具，Restored 将保留核验与追偿权利。"
                );
              }}
              className="text-black underline underline-offset-2 hover:opacity-100 transition-all"
            >
              用户许可服务条款
            </a>
            。
          </p>

          <button
            type="submit"
            className="w-full md:w-auto bg-black text-white hover:bg-neutral-800 font-semibold text-[14px] px-12 py-4 rounded-xl transition-all active:scale-95 shadow-lg select-none cursor-pointer border-0"
          >
            Publish Listing 发布上架
          </button>
        </div>
      </form>
    </div>
  );
}
