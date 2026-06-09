import { NextResponse, type NextRequest } from "next/server";

/**
 * 服务端智能 IP 定位接口（代客户端发起请求，规避跨域限制）
 *
 * 关键修复：
 * 1. 永远带客户端真实 IP 去查询（除非是本地回环）。
 *    之前 `!ip.startsWith("172.")` 会把 IANA 公网段 172.16.0.0/12 误判为内网，
 *    导致不传 IP、太平洋 API 退化为查服务器出口 IP（Vercel/Cloud Run 多为海外机房），
 *    表现为「城市永远不对」。
 * 2. 超时从 3s 提升到 5s，并加 1 次重试。
 */
export async function GET(request: NextRequest) {
  // 1. 解析客户端真实 IP（兼容多级代理）
  let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  // 2. 剥掉 IPv6 映射的 IPv4 前缀（例如 ::ffff:1.2.3.4）
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  // 3. 判定是否为本地回环
  const isLoopback =
    !ip || ip === "::1" || ip === "127.0.0.1" || ip === "localhost";

  // 4. 组装查询 URL：本地走无参查询（让太平洋按本机出口 IP 解析，便于本地调试），
  //    其余情况必须显式传用户 IP
  const base = "http://whois.pconline.com.cn/ipJson.jsp";
  const buildUrl = () =>
    isLoopback
      ? `${base}?json=true`
      : `${base}?ip=${encodeURIComponent(ip!)}&json=true`;

  // 5. 最多重试 1 次（总 2 次）
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(buildUrl(), {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      // 太平洋偶发返回 BOM/多余空白
      const clean = text.replace(/^\uFEFF/, "").trim();
      const data = JSON.parse(clean);

      return NextResponse.json({
        success: true,
        city: data.city || "",
        province: data.pro || "",
        ip: isLoopback ? null : ip,
      });
    } catch (err) {
      if (attempt === 1) {
        console.error("太平洋 IP 定位服务请求失败:", err);
        return NextResponse.json({ success: false, city: "", province: "" });
      }
      // 第一次失败时短暂等待再重试
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return NextResponse.json({ success: false, city: "", province: "" });
}
