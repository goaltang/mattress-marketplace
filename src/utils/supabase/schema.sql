-- =================================================================
-- RESTORED 床垫循环平台 - SUPABASE 数据库初始化脚本
-- 适用版本: Supabase PostgreSQL
-- =================================================================

-- 1. 创建床垫商品数据表 (listings)
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "retailPrice" NUMERIC,
    size TEXT NOT NULL,
    "dimensionsText" TEXT NOT NULL,
    material TEXT NOT NULL,
    "thicknessCm" INTEGER NOT NULL,
    "useDuration" TEXT NOT NULL,
    condition TEXT NOT NULL,
    "hygieneNote" TEXT NOT NULL,
    "hasElevator" BOOLEAN NOT NULL,
    "deliveryOption" TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    "distanceKm" NUMERIC,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    "isVerifiedClean" BOOLEAN DEFAULT false,
    "isHygieneVerified" BOOLEAN DEFAULT false,
    "isCleaned" BOOLEAN DEFAULT false,
    "wechatId" TEXT NOT NULL,
    phone TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 启用行级安全机制 (Row Level Security)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 创建安全策略 1: 允许匿名与登录用户随意读取床垫列表 (用于列表和详情页展示)
CREATE POLICY "Allow public read access to listings" ON public.listings
    FOR SELECT USING (true);

-- 创建安全策略 2: 允许随意插入新记录 (用于未登录用户测试发布，实际生产中可绑定 auth.uid() 仅限已登录用户发布)
CREATE POLICY "Allow public write access to listings" ON public.listings
    FOR INSERT WITH CHECK (true);

-- 创建安全策略 3: 允许所有人更新记录 (方便演示降价等逻辑)
CREATE POLICY "Allow public update access to listings" ON public.listings
    FOR UPDATE USING (true);


-- 2. 收藏夹关联表 (favorites) - 基于 device_id 实现无需登录的收藏同步
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(device_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_device_id ON public.favorites(device_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to favorites" ON public.favorites
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to favorites" ON public.favorites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete favorites" ON public.favorites
    FOR DELETE USING (true);
