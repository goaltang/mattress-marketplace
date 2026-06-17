import { Metadata } from "next";
import HomeClient from "./HomeClient";

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

export default function HomePage() {
  return <HomeClient />;
}
