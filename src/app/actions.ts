"use server";

import { createClient } from "@/utils/supabase/server";
import { MattressListing } from "@/types";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/utils/db";

const SUPABASE_TIMEOUT_MS = 8000;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function withTimeout(promiseLike: any, ms: number): Promise<any> {
  const promise = Promise.resolve(promiseLike);
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Supabase query timed out after ${ms}ms`)), ms)
    ),
  ]);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * 发布新的床垫商品数据
 */
export async function publishListing(newListing: MattressListing) {
  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const supabase = createClient();

      const { error } = await withTimeout(
        supabase.from("listings").insert([
        {
          id: newListing.id,
          title: newListing.title,
          brand: newListing.brand,
          price: newListing.price,
          retailPrice: newListing.retailPrice, // 如果数据库中是驼峰或下划线，Supabase 会做映射，此处需与表结构匹配
          size: newListing.size,
          dimensionsText: newListing.dimensionsText,
          material: newListing.material,
          thicknessCm: newListing.thicknessCm,
          useDuration: newListing.useDuration,
          condition: newListing.condition,
          hygieneNote: newListing.hygieneNote,
          hasElevator: newListing.hasElevator,
          deliveryOption: newListing.deliveryOption,
          description: newListing.description,
          city: newListing.city,
          district: newListing.district,
          distanceKm: newListing.distanceKm,
          images: newListing.images,
          isVerifiedClean: newListing.isVerifiedClean,
          isHygieneVerified: newListing.isHygieneVerified,
          isCleaned: newListing.isCleaned,
          sellerDeviceId: newListing.sellerDeviceId || null,
          wechatId: newListing.wechatId,
          phone: newListing.phone,
          createdAt: newListing.createdAt,
        },
      ]),
        SUPABASE_TIMEOUT_MS
      );

      if (error) {
        console.error("写入 Supabase listings 出错:", error.message);
        return { success: false, error: error.message };
      }
    } catch (err) {
      console.error("连接 Supabase 失败，数据无法写入数据库:", err);
      return { success: false, error: "Database connection failed" };
    }
  }

  // 无论有没有配置 Supabase，发布新宝贝后，强制刷新该城市的 Next.js 页面缓存
  const citySlug = newListing.city.toLowerCase();
  revalidatePath(`/${citySlug}`);
  
  return { success: true };
}
