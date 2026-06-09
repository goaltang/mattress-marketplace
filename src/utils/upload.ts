import { createClient } from "@/utils/supabase/client";

/**
 * 辅助函数：在客户端判断 Supabase 环境变量是否配置（避免引入服务端 db.ts 导致打包包含 next/headers 的错误）
 */
function isSupabaseConfiguredClient(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(
    url && 
    anonKey && 
    !url.includes("your-project-id") && 
    !anonKey.includes("your-anon-public-key")
  );
}

/**
 * 客户端通用图片上传适配器（支持 Supabase 代理上传、阿里云 OSS 预留、本地 Base64 降级）
 * @param file 浏览器选择的 File 对象
 * @returns 经过 CDN 加速或代理后的可访问图片 URL
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. 【生产优化通道】：如果您未来使用阿里云 OSS + 国内备案 CDN，只需在此配置环境变量并解开此插槽即可
  if (
    process.env.NEXT_PUBLIC_ALIYUN_OSS_BUCKET &&
    process.env.NEXT_PUBLIC_ALIYUN_OSS_REGION &&
    process.env.NEXT_PUBLIC_ALIYUN_OSS_CDN_URL
  ) {
    try {
      console.log("使用阿里云 OSS CDN 加速通道（暂未配置 OSS SDK，走备用通道）");
    } catch (err) {
      console.error("阿里云 OSS 上传失败，将降级到 Supabase 代理层:", err);
    }
  }

  // 2. 【默认优化通道】：使用 Supabase Storage + 本地 Next.js 反向代理（避免国内直连 Supabase 域名过慢或阻断）
  const configured = isSupabaseConfiguredClient();
  if (configured) {
    try {
      const supabase = createClient();
      
      // 生成随机且不重复的文件名，避免中文乱码
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      // 上传到公开的 listings 存储桶中
      const { data, error } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase Storage 上传错误，降级到 Base64 存储:", error.message);
      } else if (data) {
        // 重要优化：不使用真实的 supabase.co 域名，而是返回 Next.js 的反向代理相对路径，
        // 自动复用主域名上配好的 CDN，加速中国大陆的图片加载
        return `/supabase-storage/${filePath}`;
      }
    } catch (err) {
      console.error("连接 Supabase 存储服务失败，降级到 Base64 存储:", err);
    }
  }

  // 3. 【离线兼容通道】：如果没有配置数据库，或者上传抛出异常，平滑降级为 Base64 字符流，保证离线测试 100% 可用
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("文件读取失败"));
      }
    };
    reader.onerror = () => reject(new Error("文件读取错误"));
    reader.readAsDataURL(file);
  });
}
