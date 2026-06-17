-- =================================================================
-- RESTORED 床垫循环平台 - 增量迁移 #1
-- 作用：补齐 listings 表缺失的列（isActive / updatedAt / sellerDeviceId）
-- 背景：schema.sql 虽定义了这些列，但生产库实际未建，导致
--       src/utils/db.ts 中的 isActive 过滤被临时注释（见 TODO）。
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴执行（可重复执行，幂等）
-- 执行后：回滚 src/utils/db.ts 中 isActive 过滤的注释即可恢复下架过滤。
-- =================================================================

-- 1. isActive：商品上下架开关，默认 true（兼容历史数据视为上架）
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- 2. updatedAt：商品最后更新时间
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. sellerDeviceId：卖家设备标识，用于 RLS 所有权校验
--    （历史数据无该值时为 NULL，RLS 策略已允许 sellerDeviceId IS NULL 的更新）
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS "sellerDeviceId" TEXT;

-- 4. 索引：加速卖家维度查询（与 schema.sql 保持一致）
CREATE INDEX IF NOT EXISTS idx_listings_seller_device_id
  ON public.listings("sellerDeviceId");

-- 5. 索引：加速按上下架状态过滤（可选，列表查询常用）
CREATE INDEX IF NOT EXISTS idx_listings_is_active
  ON public.listings("isActive");

-- 6. 校验：回显结果
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'listings'
  AND column_name IN ('isActive', 'updatedAt', 'sellerDeviceId')
ORDER BY column_name;
