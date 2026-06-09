import type { Metadata } from "next";
import { AppContextProvider } from "@/context/AppContext";
import Toast from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restored — 优质二手床垫循环平台",
  description: "发现经过深度紫外真空净化的优质二手大牌床垫。支持 15 天卫生安心审核，楼宇电梯托运直配。",
  keywords: ["二手床垫", "床垫回收", "床垫交易", "Restored", "寝具循环"],
  openGraph: {
    title: "Restored — 优质二手床垫循环平台",
    description: "透明、卫生、无摩擦的寝具循环体验。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.loli.net/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --font-plus-jakarta-sans: 'Plus Jakarta Sans', var(--font-inter);
            --font-jetbrains-mono: 'JetBrains Mono', 'Fira Code', monospace;
          }
        `}} />
      </head>
      <body className="antialiased">
        <AppContextProvider>
          {children}
          <Toast />
        </AppContextProvider>
      </body>
    </html>
  );
}

