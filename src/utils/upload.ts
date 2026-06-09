import { createClient } from "@/utils/supabase/client";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_IMAGE_COUNT = 5;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error" | "fallback";
  error?: string;
}

export type ProgressCallback = (progress: UploadProgress) => void;

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

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `不支持的图片格式: ${file.name}，仅支持 JPG/PNG/WebP/GIF`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `图片过大: ${file.name}，最大允许 5MB`;
  }
  return null;
}

export function validateFiles(files: FileList | File[]): string | null {
  const fileArray = Array.from(files);
  if (fileArray.length > MAX_IMAGE_COUNT) {
    return `最多上传 ${MAX_IMAGE_COUNT} 张图片`;
  }
  for (const file of fileArray) {
    const err = validateFile(file);
    if (err) return err;
  }
  return null;
}

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = URL.createObjectURL(file);
  });
}

function checkLocalStorageQuota(sizeBytes: number): boolean {
  try {
    const testKey = "__quota_test__";
    localStorage.setItem(testKey, "x");
    localStorage.removeItem(testKey);
    const used = Object.keys(localStorage).reduce((acc, key) => {
      return acc + (localStorage.getItem(key)?.length || 0) * 2;
    }, 0);
    const LIMIT = 4 * 1024 * 1024;
    return used + sizeBytes < LIMIT;
  } catch {
    return false;
  }
}

function getPublicUrl(filePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    return `${url}/storage/v1/object/public/listings/${filePath}`;
  }
  return `/supabase-storage/listings/${filePath}`;
}

export async function uploadImage(
  file: File,
  fileIndex: number = 0,
  onProgress?: ProgressCallback
): Promise<string> {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  onProgress?.({
    fileIndex,
    fileName: file.name,
    progress: 0,
    status: "uploading",
  });

  const configured = isSupabaseConfiguredClient();
  if (configured) {
    try {
      const supabase = createClient();

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = fileName;

      onProgress?.({
        fileIndex,
        fileName: file.name,
        progress: 30,
        status: "uploading",
      });

      const { error } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase Storage 上传错误，降级到 Base64:", error.message);
      } else {
        onProgress?.({
          fileIndex,
          fileName: file.name,
          progress: 100,
          status: "success",
        });
        return getPublicUrl(filePath);
      }
    } catch (err) {
      console.error("连接 Supabase 存储服务失败，降级到 Base64:", err);
    }
  }

  onProgress?.({
    fileIndex,
    fileName: file.name,
    progress: 50,
    status: "fallback",
  });

  const compressed = await compressImage(file);
  const sizeBytes = compressed.length * 2;

  if (!checkLocalStorageQuota(sizeBytes)) {
    onProgress?.({
      fileIndex,
      fileName: file.name,
      progress: 100,
      status: "error",
      error: "本地存储空间不足",
    });
    throw new Error("本地存储空间不足，请清理浏览器数据或使用云端存储");
  }

  onProgress?.({
    fileIndex,
    fileName: file.name,
    progress: 100,
    status: "fallback",
  });

  return compressed;
}

export async function uploadMultipleImages(
  files: FileList | File[],
  onProgress?: ProgressCallback
): Promise<string[]> {
  const fileArray = Array.from(files);

  const validationError = validateFiles(fileArray);
  if (validationError) {
    throw new Error(validationError);
  }

  const results: string[] = [];
  for (let i = 0; i < fileArray.length; i++) {
    const url = await uploadImage(fileArray[i], i, onProgress);
    results.push(url);
  }
  return results;
}
