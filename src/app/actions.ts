"use server";

import { createClient } from "@/utils/supabase/server";
import { MattressListing } from "@/types";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/utils/db";
import { cookies } from "next/headers";

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
  const cookieStore = cookies();
  const deviceId = cookieStore.get("device_id")?.value || null;

  if (configured) {
    try {
      const supabase = createClient(deviceId || undefined);

      const { error } = await withTimeout(
        supabase.from("listings").insert([
        {
          id: newListing.id,
          title: newListing.title,
          brand: newListing.brand,
          price: newListing.price,
          retailPrice: newListing.retailPrice,
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
          sellerDeviceId: deviceId,
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

export async function updateListing(id: string, updates: Partial<MattressListing>) {
  const configured = isSupabaseConfigured();
  const cookieStore = cookies();
  const deviceId = cookieStore.get("device_id")?.value || null;

  if (configured) {
    try {
      const supabase = createClient(deviceId || undefined);

      const { data: listing, error: fetchError } = await withTimeout(
        supabase.from("listings").select("sellerDeviceId").eq("id", id).maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      if (listing && listing.sellerDeviceId && listing.sellerDeviceId !== deviceId) {
        return { success: false, error: "Forbidden: not the listing owner" };
      }

      const dbUpdates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.wechatId !== undefined) dbUpdates.wechatId = updates.wechatId;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive;
      if (updates.title !== undefined) dbUpdates.title = updates.title;

      const { error } = await withTimeout(
        supabase.from("listings").update(dbUpdates).eq("id", id),
        SUPABASE_TIMEOUT_MS
      );

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err) {
      console.error("更新商品失败:", err);
      return { success: false, error: "Database connection failed" };
    }
  }

  revalidatePath("/me");
  return { success: true };
}

export async function deleteListing(id: string) {
  const configured = isSupabaseConfigured();
  const cookieStore = cookies();
  const deviceId = cookieStore.get("device_id")?.value || null;

  if (configured) {
    try {
      const supabase = createClient(deviceId || undefined);

      const { data: listing, error: fetchError } = await withTimeout(
        supabase.from("listings").select("sellerDeviceId, city").eq("id", id).maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      if (listing && listing.sellerDeviceId && listing.sellerDeviceId !== deviceId) {
        return { success: false, error: "Forbidden: not the listing owner" };
      }

      const { error } = await withTimeout(
        supabase.from("listings").delete().eq("id", id),
        SUPABASE_TIMEOUT_MS
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (listing?.city) {
        revalidatePath(`/${listing.city.toLowerCase()}`);
      }
    } catch (err) {
      console.error("删除商品失败:", err);
      return { success: false, error: "Database connection failed" };
    }
  }

  revalidatePath("/me");
  return { success: true };
}
