import { createClient } from "@/utils/supabase/server";
import { MattressListing } from "@/types";
import { DEFAULT_LISTINGS } from "@/config/data";

const SUPABASE_TIMEOUT_MS = 5000;

/**
 * 辅助函数：判断 Supabase 环境变量是否已正确配置（非默认占位符）
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return !!(
    url &&
    anonKey &&
    !url.includes("your-project-id") &&
    !anonKey.includes("your-anon-public-key")
  );
}

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
 * 从数据库（或 fallback 数据源）获取指定城市的床垫列表
 */
export async function getListings(city?: string): Promise<MattressListing[]> {
  const configured = isSupabaseConfigured();
  
  if (configured) {
    try {
      const supabase = createClient();
      let query = supabase.from("listings").select("*");

      if (city) {
        query = query.ilike("city", city);
      }

      // TODO: 取消注释下行，在 Supabase 添加 isActive 布尔列后恢复过滤
      // query = query.or('"isActive".is.null,"isActive".eq.true');

      const { data, error } = await withTimeout(
        query.order("createdAt", { ascending: false }),
        SUPABASE_TIMEOUT_MS
      );
      
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          ...row,
          wechatId: "",
          phone: undefined,
          sellerDeviceId: row.sellerDeviceId || row.seller_device_id || undefined,
        })) as MattressListing[];
      }
      
      if (error) {
        console.error("Supabase 查找 listings 出错，降级到默认数据:", error.message);
      }
    } catch (err) {
      console.error("连接 Supabase 失败，降级到默认数据:", err);
    }
  }

  // 降级 Fallback：使用本地默认 mock 数据
  let list = DEFAULT_LISTINGS.map((item) => ({
    ...item,
    wechatId: "",
    phone: undefined,
  }));
  if (city) {
    list = list.filter((item) => item.city.toLowerCase() === city.toLowerCase());
  }
  return list;
}

/**
 * 根据商品 ID 获取单个床垫详情
 */
export async function getListingById(id: string): Promise<MattressListing | null> {
  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const supabase = createClient();
      const { data, error } = await withTimeout(
        supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .maybeSingle(),
        SUPABASE_TIMEOUT_MS
      );

      if (!error && data) {
        return { 
          ...data, 
          wechatId: "",
          phone: undefined,
          sellerDeviceId: data.sellerDeviceId || data.seller_device_id || undefined 
        } as MattressListing;
      }

      if (error) {
        console.error(`Supabase 查找商品 ${id} 失败，降级到默认数据:`, error.message);
      }
    } catch (err) {
      console.error(`连接 Supabase 失败，降级到默认数据:`, err);
    }
  }

  // 降级 Fallback：从本地数据源匹配
  const found = DEFAULT_LISTINGS.find((item) => item.id === id);
  if (found) {
    return { ...found, wechatId: "", phone: undefined };
  }
  return null;
}
