/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // 动态提取 Supabase URL 以防未配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co";
    return [
      {
        source: "/supabase-storage/:path*",
        destination: `${supabaseUrl}/storage/v1/object/public/:path*`,
      },
    ];
  },
};

export default nextConfig;

