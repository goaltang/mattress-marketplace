-- =================================================================
-- RESTORED 床垫循环平台 - SUPABASE 数据库初始化脚本
-- 适用版本: Supabase PostgreSQL
-- =================================================================

-- Helper: 从 PostgREST 请求头中提取 device_id，供 RLS 策略使用
-- API 路由通过 createClient(deviceId) 传入 x-device-id 自定义头
CREATE OR REPLACE FUNCTION public.get_device_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT nullif(current_setting('request.headers', true)::json->>'x-device-id', '');
$$;

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
    "sellerDeviceId" TEXT,
    "wechatId" TEXT NOT NULL,
    phone TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listings_seller_device_id ON public.listings("sellerDeviceId");

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to listings" ON public.listings
    FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert listings" ON public.listings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only listing owner can update" ON public.listings
    FOR UPDATE USING (
        "sellerDeviceId" = public.get_device_id()
        OR "sellerDeviceId" IS NULL
    );


-- 2. 收藏夹关联表 (favorites)
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

CREATE POLICY "Users can read own favorites" ON public.favorites
    FOR SELECT USING (device_id = public.get_device_id());

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (device_id = public.get_device_id());

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (device_id = public.get_device_id());


-- 3. 通知表 (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    detail_url TEXT,
    unread BOOLEAN NOT NULL DEFAULT true,
    action_state TEXT,
    buyer_name TEXT,
    listing_title TEXT,
    listing_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_device_id ON public.notifications(device_id);
CREATE INDEX IF NOT EXISTS idx_notifications_listing_id ON public.notifications(listing_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT USING (device_id = public.get_device_id());

CREATE POLICY "Anyone can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (device_id = public.get_device_id());

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (device_id = public.get_device_id());
