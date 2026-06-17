import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AppContextProvider } from "@/context/AppContext";
import Toast from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('restored_theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`antialiased bg-white dark:bg-neutral-950 text-black dark:text-white ${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      >
        <AppContextProvider>
          {children}
          <Toast />
        </AppContextProvider>
      </body>
    </html>
  );
}
