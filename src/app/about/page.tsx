import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于我们 — Restored",
  description: "Restored 致力于构建全网首家彻底消毒、透明评估、无摩擦交易的极简二手床垫循环平台。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block text-[13px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-10 transition-colors"
        >
          &larr; 返回首页
        </Link>

        <h1 className="font-headline font-bold text-4xl tracking-tight mb-6">关于 Restored</h1>

        <div className="space-y-6 text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Restored 致力于构建全网首家「彻底消毒、透明评估、无摩擦交易」的极简二手床垫循环平台。
          </p>
          <p>
            我们相信，一张优质的床垫不应因为搬家、升级而被浪费。通过专业的紫外真空净化流程、
            12 项卫生检查标准，以及同城直配的物流网络，Restored 让每一张床垫都能找到新的归宿。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">我们的承诺</h2>
          <ul className="space-y-3 list-none pl-0">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>每一张在售床垫均经过深度紫外真空净化处理</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>15 天卫生安心审核期，不满意可退</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>同城楼宇电梯托运直配，省心省力</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>透明定价，无隐藏费用</span>
            </li>
          </ul>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">联系我们</h2>
          <p>
            如有任何问题或建议，欢迎通过平台内消息系统联系我们。
          </p>
        </div>
      </div>
    </div>
  );
}
